const {
  clearAdminSessionCookie,
  isAdminAuthConfigured,
  readAdminSession,
} = require('../lib/adminSession');

const adminAuth = (req, res, next) => {
  if (!isAdminAuthConfigured()) {
    return res.status(503).json({
      message: 'Story admin is disabled until admin auth is configured.',
    });
  }

  const session = readAdminSession(req.headers.cookie || '');

  if (!session.ok) {
    if (session.shouldClearCookie) {
      res.setHeader('Set-Cookie', clearAdminSessionCookie());
    }

    return res.status(session.status).json({ message: session.message });
  }

  req.adminUser = { role: 'admin' };
  return next();
};

module.exports = adminAuth;
