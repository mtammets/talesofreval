const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
const {
  ensureRuntimeStorageReady,
  runtimeSiteUploadsDir,
  runtimeStoryUploadsDir,
  runtimeSiteSettingsFile,
  runtimeStoryEventsFile,
} = require('./lib/storagePaths');
ensureRuntimeStorageReady();

const uploadStaticOptions = {
  immutable: true,
  maxAge: '365d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
};

const port = process.env.PORT || 3000;
const bindHost = process.env.BIND_HOST;
const previewNoIndex = process.env.PREVIEW_NOINDEX === 'true';
const defaultPublicSiteUrl = 'https://talesofreval.ee';
const adminRoutes = require('./routes/adminRoutes');
const emailRoutes = require('./routes/emailRoutes');
const { isKnownFrontendRoute, renderAppHtml } = require('./lib/seo');
const storyEventsRoutes = require('./routes/storyEventsRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

const resolvePublicSiteUrl = () =>
  (process.env.SITE_URL || process.env.MAIL_WEBSITE || defaultPublicSiteUrl).replace(
    /\/+$/,
    ''
  );

const resolveGuideTipPublicSiteUrl = () =>
  (process.env.PUBLIC_SITE_URL || defaultPublicSiteUrl).replace(/\/+$/, '');

const createCspNonce = () => crypto.randomBytes(16).toString('base64');

const isHttpsRequest = (req) =>
  req.secure || String(req.headers['x-forwarded-proto'] || '').includes('https');

const buildContentSecurityPolicy = (nonce) =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://leplace.leplace-api.com",
    "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

const getLastModified = (filePath) => {
  try {
    return fs.statSync(filePath).mtime;
  } catch (_error) {
    return new Date();
  }
};

const formatSitemapDate = (value) => new Date(value).toISOString();

const buildSitemapXml = () => {
  const siteUrl = resolvePublicSiteUrl();
  const siteSettingsUpdatedAt = getLastModified(runtimeSiteSettingsFile);
  const storyEventsUpdatedAt = getLastModified(runtimeStoryEventsFile);
  const storyPageUpdatedAt =
    siteSettingsUpdatedAt > storyEventsUpdatedAt ? siteSettingsUpdatedAt : storyEventsUpdatedAt;
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly', lastmod: siteSettingsUpdatedAt },
    { path: '/story', priority: '0.8', changefreq: 'monthly', lastmod: storyPageUpdatedAt },
    { path: '/contacts', priority: '0.8', changefreq: 'monthly', lastmod: siteSettingsUpdatedAt },
    { path: '/virtual', priority: '0.7', changefreq: 'monthly', lastmod: siteSettingsUpdatedAt },
    {
      path: '/service/team',
      priority: '0.9',
      changefreq: 'monthly',
      lastmod: siteSettingsUpdatedAt,
    },
    {
      path: '/service/private',
      priority: '0.9',
      changefreq: 'monthly',
      lastmod: siteSettingsUpdatedAt,
    },
    {
      path: '/service/quick',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: siteSettingsUpdatedAt,
    },
    {
      path: '/service/destination',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: siteSettingsUpdatedAt,
    },
    {
      path: '/service/wedding',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: siteSettingsUpdatedAt,
    },
  ];

  const urlEntries = routes
    .map(
      (route) => `  <url>
    <loc>${new URL(route.path, siteUrl).toString()}</loc>
    <lastmod>${formatSitemapDate(route.lastmod)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const cspNonce = createCspNonce();
  res.locals.cspNonce = cspNonce;
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy(cspNonce));
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  if (isHttpsRequest(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

if (previewNoIndex) {
  app.use((_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send('User-agent: *\nDisallow: /\n');
  });

  app.get('/tip/:guideId', (req, res) => {
    const redirectUrl = new URL(req.originalUrl, resolveGuideTipPublicSiteUrl()).toString();
    return res.redirect(302, redirectUrl);
  });
} else {
  app.get('/robots.txt', (_req, res) => {
    const sitemapUrl = new URL('/sitemap.xml', resolvePublicSiteUrl()).toString();
    res
      .type('text/plain')
      .send(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
  });
}

app.use('/email', emailRoutes);
app.use('/uploads/story', express.static(runtimeStoryUploadsDir, uploadStaticOptions));
app.use('/uploads/site', express.static(runtimeSiteUploadsDir, uploadStaticOptions));
app.use('/api/admin', adminRoutes);
app.use('/api/story-events', storyEventsRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml').send(buildSitemapXml());
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/older', express.static(path.join(__dirname, '../../htdocs/old_webste/')));

if (process.env.NODE_ENV === 'production') {
  app.use(
    express.static(path.join(__dirname, '../frontend/build'), {
      index: false,
    })
  );

  app.get('*', async (req, res, next) => {
    const normalizedPath = req.path === '/' ? '/' : req.path.replace(/\/+$/, '');

    if (!isKnownFrontendRoute(normalizedPath)) {
      return res.redirect(302, '/');
    }

    try {
      const html = await renderAppHtml({
        cspNonce: res.locals.cspNonce,
        pathname: normalizedPath,
        siteUrl: resolvePublicSiteUrl(),
      });

      if (!html) {
        return res.redirect(302, '/');
      }

      return res.type('html').send(html);
    } catch (error) {
      return next(error);
    }
  });
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

if (bindHost) {
  app.listen(port, bindHost, () => {
    console.log(`Server listening on http://${bindHost}:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
