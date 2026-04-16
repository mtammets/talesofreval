const ATTEMPT_WINDOW_MS = Number.parseInt(
  process.env.ADMIN_LOGIN_WINDOW_MS || `${15 * 60 * 1000}`,
  10
);
const MAX_ATTEMPTS = Number.parseInt(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || '5', 10);

const attemptsByIp = new Map();

const getAttemptEntry = (ipAddress) => {
  const now = Date.now();
  const key = ipAddress || 'unknown';
  const existing = attemptsByIp.get(key);

  if (!existing || existing.windowStartedAt + ATTEMPT_WINDOW_MS <= now) {
    const next = {
      count: 0,
      windowStartedAt: now,
      lockedUntil: 0,
    };
    attemptsByIp.set(key, next);
    return next;
  }

  return existing;
};

const getAdminLoginRateLimit = (ipAddress) => {
  const entry = getAttemptEntry(ipAddress);
  const now = Date.now();

  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
};

const registerFailedAdminLogin = (ipAddress) => {
  const entry = getAttemptEntry(ipAddress);
  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + ATTEMPT_WINDOW_MS;
  }
};

const resetAdminLoginRateLimit = (ipAddress) => {
  attemptsByIp.delete(ipAddress || 'unknown');
};

module.exports = {
  getAdminLoginRateLimit,
  registerFailedAdminLogin,
  resetAdminLoginRateLimit,
};
