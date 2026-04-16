const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

const ADMIN_SESSION_USERNAME = 'admin';
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin');
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  (isProduction ? '' : 'dev-only-admin-session-secret-change-me');
const SESSION_COOKIE_NAME = 'tor_admin_session';
const SESSION_TTL_SECONDS = Number.parseInt(
  process.env.ADMIN_SESSION_TTL_SECONDS || `${60 * 60 * 12}`,
  10
);

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(left || '', 'utf8');
  const rightBuffer = Buffer.from(right || '', 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const parseCookieHeader = (header = '') =>
  header.split(';').reduce((cookies, segment) => {
    const trimmed = segment.trim();

    if (!trimmed) {
      return cookies;
    }

    const separatorIndex = trimmed.indexOf('=');
    const name = separatorIndex === -1 ? trimmed : trimmed.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? '' : trimmed.slice(separatorIndex + 1);

    if (!name) {
      return cookies;
    }

    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch (_error) {
      cookies[name] = rawValue;
    }

    return cookies;
  }, {});

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
};

const parseScryptHash = (value = '') => {
  const [algorithm, salt, hash] = value.split('$');

  if (algorithm !== 'scrypt' || !salt || !hash) {
    return null;
  }

  return { salt, hash };
};

const verifyPasswordHash = (password, passwordHash) => {
  const parsed = parseScryptHash(passwordHash);

  if (!parsed) {
    return false;
  }

  const salt = Buffer.from(parsed.salt, 'base64');
  const expected = Buffer.from(parsed.hash, 'base64');
  const actual = crypto.scryptSync(password, salt, expected.length);

  return crypto.timingSafeEqual(actual, expected);
};

const isAdminAuthConfigured = () =>
  Boolean(SESSION_SECRET && (ADMIN_PASSWORD_HASH || ADMIN_PASSWORD));

const verifyAdminCredentials = (password) => {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  if (ADMIN_PASSWORD_HASH) {
    return verifyPasswordHash(password, ADMIN_PASSWORD_HASH);
  }

  return safeCompare(password, ADMIN_PASSWORD);
};

const signSessionPayload = (payload) =>
  crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');

const createAdminSessionValue = () => {
  const payload = Buffer.from(
    JSON.stringify({
      u: ADMIN_SESSION_USERNAME,
      exp: Date.now() + SESSION_TTL_SECONDS * 1000,
      n: crypto.randomBytes(12).toString('base64url'),
    }),
    'utf8'
  ).toString('base64url');

  return `${payload}.${signSessionPayload(payload)}`;
};

const readAdminSession = (cookieHeader = '') => {
  if (!SESSION_SECRET) {
    return {
      ok: false,
      message: 'Story admin is disabled until admin auth is configured.',
      status: 503,
      shouldClearCookie: false,
    };
  }

  const cookies = parseCookieHeader(cookieHeader);
  const cookieValue = cookies[SESSION_COOKIE_NAME];

  if (!cookieValue) {
    return {
      ok: false,
      message: 'Admin authentication required.',
      status: 401,
      shouldClearCookie: false,
    };
  }

  const separatorIndex = cookieValue.indexOf('.');
  const payload = separatorIndex === -1 ? '' : cookieValue.slice(0, separatorIndex);
  const signature = separatorIndex === -1 ? '' : cookieValue.slice(separatorIndex + 1);

  if (!payload || !signature) {
    return {
      ok: false,
      message: 'Admin authentication required.',
      status: 401,
      shouldClearCookie: true,
    };
  }

  const expectedSignature = signSessionPayload(payload);

  if (!safeCompare(signature, expectedSignature)) {
    return {
      ok: false,
      message: 'Admin authentication required.',
      status: 401,
      shouldClearCookie: true,
    };
  }

  let decoded = null;

  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (_error) {
    return {
      ok: false,
      message: 'Admin authentication required.',
      status: 401,
      shouldClearCookie: true,
    };
  }

  if (!decoded?.u || !decoded?.exp) {
    return {
      ok: false,
      message: 'Admin authentication required.',
      status: 401,
      shouldClearCookie: true,
    };
  }

  if (decoded.exp <= Date.now()) {
    return {
      ok: false,
      message: 'Admin session expired.',
      status: 401,
      shouldClearCookie: true,
    };
  }

  return {
    ok: true,
    username: decoded.u,
    expiresAt: decoded.exp,
  };
};

const createAdminSessionCookie = () =>
  serializeCookie(SESSION_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
    sameSite: 'Strict',
    secure: isProduction,
  });

const clearAdminSessionCookie = () =>
  serializeCookie(SESSION_COOKIE_NAME, '', {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'Strict',
    secure: isProduction,
  });

module.exports = {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  isAdminAuthConfigured,
  readAdminSession,
  verifyAdminCredentials,
};
