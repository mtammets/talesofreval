const express = require('express');

const {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  isAdminAuthConfigured,
  readAdminSession,
  verifyAdminCredentials,
} = require('../lib/adminSession');
const {
  getAdminLoginRateLimit,
  registerFailedAdminLogin,
  resetAdminLoginRateLimit,
} = require('../lib/adminLoginRateLimit');

const router = express.Router();

router.post('/login', (req, res) => {
  if (!isAdminAuthConfigured()) {
    return res.status(503).json({
      message: 'Story admin is disabled until admin auth is configured.',
    });
  }

  const rateLimit = getAdminLoginRateLimit(req.ip);

  if (!rateLimit.allowed) {
    res.set('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      message: 'Too many login attempts. Please wait and try again.',
    });
  }

  const password = req.body?.password || '';

  if (!verifyAdminCredentials(password)) {
    registerFailedAdminLogin(req.ip);
    res.setHeader('Set-Cookie', clearAdminSessionCookie());
    return res.status(401).json({ message: 'Invalid admin password.' });
  }

  resetAdminLoginRateLimit(req.ip);
  res.setHeader('Set-Cookie', createAdminSessionCookie());
  return res.json({
    authenticated: true,
  });
});

router.post('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearAdminSessionCookie());
  return res.json({ authenticated: false });
});

router.get('/me', (req, res) => {
  const session = readAdminSession(req.headers.cookie || '');

  if (!session.ok) {
    if (session.shouldClearCookie) {
      res.setHeader('Set-Cookie', clearAdminSessionCookie());
    }

    return res.status(session.status).json({ message: session.message });
  }

  return res.json({
    authenticated: true,
    expiresAt: session.expiresAt,
  });
});

module.exports = router;
