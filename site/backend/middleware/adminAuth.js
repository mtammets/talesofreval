const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin');

const unauthorized = (res, message = 'Authentication required') => {
  res.set('WWW-Authenticate', 'Basic realm="Tales Of Reval Story Admin"');
  return res.status(401).json({ message });
};

const adminAuth = (req, res, next) => {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({
      message: 'Story admin is disabled until ADMIN_PASSWORD is configured.',
    });
  }

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    return unauthorized(res);
  }

  let credentials = '';

  try {
    credentials = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch (_error) {
    return unauthorized(res, 'Invalid authorization header.');
  }

  const separatorIndex = credentials.indexOf(':');
  const username =
    separatorIndex === -1 ? credentials : credentials.slice(0, separatorIndex);
  const password =
    separatorIndex === -1 ? '' : credentials.slice(separatorIndex + 1);

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return unauthorized(res, 'Invalid admin credentials.');
  }

  return next();
};

module.exports = adminAuth;
