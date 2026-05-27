const fs = require('fs');
const path = require('path');

const { getLocalizedImageAlt } = require('./localizedImageAlt');
const { readSiteSettings } = require('./siteSettingsStore');

const SITE_NAME = 'Tales of Reval';
const DEFAULT_DESCRIPTION =
  'Medieval tours, storytelling experiences and private events in Tallinn by Tales of Reval.';
const DEFAULT_THEME_COLOR = '#202533';
const DEFAULT_ROBOTS =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex,nofollow,noarchive';
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_LOCALE = 'en_US';
const DEFAULT_OG_IMAGE_PATH = '/logo512.png';
const DEFAULT_STATUS_BAR_STYLE = 'black-translucent';
const FRONTEND_BUILD_DIR = path.join(__dirname, '../../frontend/build');
const INDEX_HTML_PATH = path.join(FRONTEND_BUILD_DIR, 'index.html');
const ASSET_MANIFEST_PATH = path.join(FRONTEND_BUILD_DIR, 'asset-manifest.json');

const STATIC_ASSET_KEYS = {
  contactBg: 'static/media/bgcontact.webp',
  homeBg: 'static/media/home-bg.webp',
  storyBg: 'static/media/storybg.webp',
  serviceDestinationHero: 'static/media/destinationbg.webp',
  servicePrivateHero: 'static/media/privatebg.webp',
  serviceQuickHero: 'static/media/quickbg.webp',
  serviceTeamHero: 'static/media/team-background.webp',
  serviceWeddingHero: 'static/media/weddingbg.webp',
  virtualTourPhones: 'static/media/phones-transparent-background.png',
};

const HOME_META = {
  title: 'Medieval Tours and Storytelling Experiences in Tallinn | Tales of Reval',
  description:
    'Experience the most authentic medieval tours in Tallinn. Discover unique live experiences and historical adventures with Tales of Reval.',
  keywords:
    'Medieval Tours in Tallinn, Historical Experiences in Estonia, Interactive Medieval Experiences, Tallinn Guided Tours, Live Medieval Shows, Top Rated Tallinn Tours, Unique Tallinn Experiences, Authentic Tallinn Tours, Best Tallinn Attractions, Tallinn Tour Company',
};

const STORY_META_DESCRIPTION =
  'Explore the journey of Tales of Reval, from its inception to the present day, through immersive storytelling experiences and medieval themed events.';
const CONTACT_META = {
  title: 'Contact Tales of Reval | Medieval Tours in Tallinn',
  description:
    'Get in touch with Tales of Reval for inquiries about our medieval tours, private tours, team events, and more. Contact us today to book your unique Tallinn experience.',
};
const VIRTUAL_META_TITLE = 'Self-Guided Medieval Tour App in Tallinn | Tales of Reval';

const SERVICE_SEO = {
  destination: {
    description:
      'Tailored destination management services in Tallinn by Tales of Reval. We craft unique itineraries, group experiences, and memorable cultural programs.',
    heroKey: 'serviceDestinationHero',
    keywords:
      'Destination Management Tallinn, Group Travel Planning Estonia, Corporate Incentives Tallinn, Cultural Programs Estonia, Group Event Coordination, Local Experience Design, Tallinn Event Logistics, Travel Experience Planning, Destination Services Estonia, Hosted Tallinn Programs',
    pageTitle: 'Destination management',
    title: 'Destination Management Services in Tallinn | Tales of Reval',
  },
  private: {
    description:
      'Book a private medieval tour in Tallinn with Tales of Reval. Personalized experiences for couples, families, delegations and special occasions.',
    heroKey: 'servicePrivateHero',
    keywords:
      'Private Tallinn Tour, Personalized Medieval Tour, Family Tours Tallinn, Couples Tour Estonia, Custom Guided Tour, Exclusive Tallinn Experience, Private Historical Tour, Special Occasion Tour, Tailored Tallinn Itinerary, VIP Tour Tallinn',
    pageTitle: 'Private tour',
    title: 'Private Medieval Tours in Tallinn | Tales of Reval',
  },
  quick: {
    description:
      'Quick and immersive tours in Tallinn by Tales of Reval. Perfect for those with limited time who want to experience the medieval charm.',
    heroKey: 'serviceQuickHero',
    keywords:
      'Quick Tallinn Tours, Short Guided Tours, Express Medieval Tours, Quick Historical Tours, 30-Minute Tallinn Tours, Fast Tour Service, Short Medieval Experiences, Quick Visit Tallinn, Express Tour Booking, Short Tour Experiences',
    pageTitle: '"We Only Have 30 Minutes!"',
    title: 'Short Medieval Tours in Tallinn | Tales of Reval',
  },
  team: {
    description:
      'Medieval team events in Tallinn by Tales of Reval. Immersive storytelling, live performance and memorable group experiences for companies and teams.',
    heroKey: 'serviceTeamHero',
    keywords:
      'Team Building Tallinn, Medieval Team Events, Corporate Events Tallinn, Interactive Group Activities, Company Outings Estonia, Tallinn Incentive Events, Storytelling Team Experience, Corporate Entertainment Tallinn, Group Experience Estonia, Team Bonding Tallinn',
    pageTitle: 'Team events',
    title: 'Team Building Medieval Events in Tallinn | Tales of Reval',
  },
  wedding: {
    description:
      'Experience a fairytale wedding in Tallinn with Tales of Reval. We offer unique medieval themed wedding planning and hosting services.',
    heroKey: 'serviceWeddingHero',
    keywords:
      'Medieval Wedding Planner, Tallinn Wedding Services, Unique Wedding Events, Historical Wedding Venues, Wedding Coordination Tallinn, Custom Wedding Planning, Medieval Themed Weddings, Tallinn Wedding Organizer, Authentic Wedding Experiences, Personalized Wedding Services',
    pageTitle: 'Fantasy Weddings',
    title: 'Fantasy Weddings and Themed Celebrations | Tales of Reval',
  },
};

let indexHtmlCache = {
  html: '',
  mtimeMs: 0,
};

let assetManifestCache = {
  data: null,
  mtimeMs: 0,
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeAttribute = (value = '') =>
  escapeHtml(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toPlainText = (value = '') =>
  String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const localizedEn = (value = {}, fallback = '') => {
  if (typeof value === 'string') {
    return value || fallback;
  }

  return value?.en || fallback;
};

const withOptionalFields = (value = {}) =>
  Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));

const normalizePathname = (pathname = '/') => {
  const resolved = String(pathname || '/').trim() || '/';
  return resolved === '/' ? '/' : resolved.replace(/\/+$/, '') || '/';
};

const buildAbsoluteUrl = (value = '/', siteUrl) => {
  try {
    return new URL(value, siteUrl).toString();
  } catch (_error) {
    return siteUrl;
  }
};

const buildWebsiteSchema = ({ description = '', siteUrl }) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: toPlainText(description) || undefined,
    inLanguage: DEFAULT_LANGUAGE,
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  });

const buildWebPageSchema = ({
  title = SITE_NAME,
  description = '',
  path: pagePath = '/',
  image = '',
  siteUrl,
  type = 'WebPage',
}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description: toPlainText(description) || undefined,
    url: buildAbsoluteUrl(pagePath, siteUrl),
    inLanguage: DEFAULT_LANGUAGE,
    image: image ? buildAbsoluteUrl(image, siteUrl) : undefined,
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
    about: {
      '@id': `${siteUrl}/#organization`,
    },
  });

const buildTravelAgencySchema = ({
  address = '',
  description = '',
  email = '',
  image = '',
  phone = '',
  sameAs = [],
  siteUrl,
}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: siteUrl,
    description: toPlainText(description) || undefined,
    image: buildAbsoluteUrl(image || DEFAULT_OG_IMAGE_PATH, siteUrl),
    email: email || undefined,
    telephone: phone || undefined,
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressCountry: 'EE',
        }
      : undefined,
    sameAs: Array.isArray(sameAs) && sameAs.length ? sameAs.filter(Boolean) : undefined,
  });

const buildServiceSchema = ({
  description = '',
  image = '',
  path: pagePath = '/',
  siteUrl,
  title = '',
}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title || undefined,
    serviceType: title || undefined,
    description: toPlainText(description) || undefined,
    url: buildAbsoluteUrl(pagePath, siteUrl),
    image: image ? buildAbsoluteUrl(image, siteUrl) : undefined,
    provider: {
      '@id': `${siteUrl}/#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Tallinn',
    },
    availableLanguage: ['English', 'Estonian'],
  });

const buildBreadcrumbSchema = (items = [], siteUrl) => {
  const breadcrumbItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (!breadcrumbItems.length) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path || '/', siteUrl),
    })),
  };
};

const getIndexHtml = () => {
  const stats = fs.statSync(INDEX_HTML_PATH);

  if (!indexHtmlCache.html || indexHtmlCache.mtimeMs !== stats.mtimeMs) {
    indexHtmlCache = {
      html: fs.readFileSync(INDEX_HTML_PATH, 'utf8'),
      mtimeMs: stats.mtimeMs,
    };
  }

  return indexHtmlCache.html;
};

const getAssetManifest = () => {
  const stats = fs.statSync(ASSET_MANIFEST_PATH);

  if (!assetManifestCache.data || assetManifestCache.mtimeMs !== stats.mtimeMs) {
    assetManifestCache = {
      data: JSON.parse(fs.readFileSync(ASSET_MANIFEST_PATH, 'utf8')),
      mtimeMs: stats.mtimeMs,
    };
  }

  return assetManifestCache.data;
};

const getStaticAssetPath = (assetKey) => {
  const manifest = getAssetManifest();
  return manifest?.files?.[STATIC_ASSET_KEYS[assetKey]] || null;
};

const resolveImageSource = (preferredSrc = '', fallbackAssetKey = '') => {
  if (preferredSrc) {
    return preferredSrc;
  }

  if (fallbackAssetKey) {
    return getStaticAssetPath(fallbackAssetKey) || DEFAULT_OG_IMAGE_PATH;
  }

  return DEFAULT_OG_IMAGE_PATH;
};

const resolveSeoImageAlt = (image = null, fallback = '') =>
  getLocalizedImageAlt(image?.alt, DEFAULT_LANGUAGE, fallback);

const buildBaseSeo = (siteUrl, pagePath, overrides = {}) => ({
  canonicalUrl: buildAbsoluteUrl(pagePath, siteUrl),
  description: HOME_META.description,
  image: buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH, siteUrl),
  imageAlt: SITE_NAME,
  keywords: '',
  noindex: false,
  path: pagePath,
  schema: [],
  statusBarStyle: DEFAULT_STATUS_BAR_STYLE,
  themeColor: DEFAULT_THEME_COLOR,
  title: HOME_META.title,
  type: 'website',
  ...overrides,
});

const getServicePageTitle = (siteSettings, serviceKey) =>
  localizedEn(siteSettings.servicePageContent?.[serviceKey]?.title, SERVICE_SEO[serviceKey]?.pageTitle);

const getServicePageIntro = (siteSettings, serviceKey) =>
  localizedEn(siteSettings.servicePageContent?.[serviceKey]?.intro, SERVICE_SEO[serviceKey]?.description);

const buildHomeSeo = (siteSettings, siteUrl) => {
  const imageSrc = resolveImageSource(siteSettings.homeHero?.image?.src, 'homeBg');
  const address = localizedEn(siteSettings.footer?.address);
  const sameAs = Object.values(siteSettings.footer?.socialLinks || {}).filter(Boolean);
  const imageAlt = resolveSeoImageAlt(siteSettings.homeHero?.image, HOME_META.title);

  return buildBaseSeo(siteUrl, '/', {
    description: HOME_META.description,
    image: buildAbsoluteUrl(imageSrc, siteUrl),
    imageAlt,
    keywords: HOME_META.keywords,
    schema: [
      buildWebsiteSchema({
        description: HOME_META.description,
        siteUrl,
      }),
      buildTravelAgencySchema({
        address,
        description: HOME_META.description,
        email: siteSettings.footer?.email,
        image: imageSrc,
        phone: siteSettings.footer?.phone,
        sameAs,
        siteUrl,
      }),
      buildWebPageSchema({
        title: HOME_META.title,
        description: HOME_META.description,
        path: '/',
        image: imageSrc,
        siteUrl,
      }),
    ],
    title: HOME_META.title,
  });
};

const buildStorySeo = (siteSettings, siteUrl) => {
  const imageSrc = resolveImageSource(siteSettings.storyPage?.image?.src, 'storyBg');
  const title = `Our story | ${SITE_NAME}`;
  const imageAlt = resolveSeoImageAlt(siteSettings.storyPage?.image, 'Our story');

  return buildBaseSeo(siteUrl, '/story', {
    description: STORY_META_DESCRIPTION,
    image: buildAbsoluteUrl(imageSrc, siteUrl),
    imageAlt,
    schema: [
      buildWebPageSchema({
        title,
        description: STORY_META_DESCRIPTION,
        path: '/story',
        image: imageSrc,
        siteUrl,
        type: 'AboutPage',
      }),
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Our story', path: '/story' },
        ],
        siteUrl
      ),
    ],
    title,
  });
};

const buildContactSeo = (siteSettings, siteUrl) => {
  const imageSrc = resolveImageSource(siteSettings.contactPage?.image?.src, 'contactBg');
  const address = localizedEn(siteSettings.footer?.address || siteSettings.contactPage?.address);
  const sameAs = Object.values(siteSettings.footer?.socialLinks || {}).filter(Boolean);
  const imageAlt = resolveSeoImageAlt(siteSettings.contactPage?.image, CONTACT_META.title);

  return buildBaseSeo(siteUrl, '/contacts', {
    description: CONTACT_META.description,
    image: buildAbsoluteUrl(imageSrc, siteUrl),
    imageAlt,
    schema: [
      buildWebPageSchema({
        title: CONTACT_META.title,
        description: CONTACT_META.description,
        path: '/contacts',
        image: imageSrc,
        siteUrl,
        type: 'ContactPage',
      }),
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Contact us', path: '/contacts' },
        ],
        siteUrl
      ),
      buildTravelAgencySchema({
        address,
        description: CONTACT_META.description,
        email: siteSettings.footer?.email || siteSettings.contactPage?.email,
        image: imageSrc,
        phone: siteSettings.footer?.phone || siteSettings.contactPage?.phone,
        sameAs,
        siteUrl,
      }),
    ],
    title: CONTACT_META.title,
  });
};

const buildVirtualSeo = (siteSettings, siteUrl) => {
  const pageTitle =
    `${localizedEn(siteSettings.virtualTourPage?.titleLine1)} ${localizedEn(
      siteSettings.virtualTourPage?.titleLine2
    )}`.trim() || 'Explore Alone, Discover More!';
  const description = `${localizedEn(siteSettings.virtualTourPage?.contentTitle)}. ${localizedEn(
    siteSettings.virtualTourPage?.subtitle
  )}`
    .replace(/\s+/g, ' ')
    .trim();
  const imageSrc = resolveImageSource('', 'virtualTourPhones');

  return buildBaseSeo(siteUrl, '/virtual', {
    description: description || DEFAULT_DESCRIPTION,
    image: buildAbsoluteUrl(imageSrc, siteUrl),
    imageAlt: pageTitle,
    schema: [
      buildWebPageSchema({
        title: VIRTUAL_META_TITLE,
        description: description || DEFAULT_DESCRIPTION,
        path: '/virtual',
        image: imageSrc,
        siteUrl,
      }),
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: pageTitle, path: '/virtual' },
        ],
        siteUrl
      ),
    ],
    title: VIRTUAL_META_TITLE,
  });
};

const buildServiceSeo = (siteSettings, siteUrl, serviceKey) => {
  const seoConfig = SERVICE_SEO[serviceKey];
  const pageTitle = getServicePageTitle(siteSettings, serviceKey);
  const description = seoConfig.description || getServicePageIntro(siteSettings, serviceKey);
  const imageSrc = resolveImageSource(
    siteSettings.servicePageHeroes?.[serviceKey]?.image?.src,
    seoConfig.heroKey
  );
  const imageAlt = resolveSeoImageAlt(
    siteSettings.servicePageHeroes?.[serviceKey]?.image,
    pageTitle
  );
  const pathName = `/service/${serviceKey}`;

  return buildBaseSeo(siteUrl, pathName, {
    description,
    image: buildAbsoluteUrl(imageSrc, siteUrl),
    imageAlt,
    keywords: seoConfig.keywords,
    schema: [
      buildWebPageSchema({
        title: seoConfig.title,
        description,
        path: pathName,
        image: imageSrc,
        siteUrl,
      }),
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: pageTitle, path: pathName },
        ],
        siteUrl
      ),
      buildServiceSchema({
        title: pageTitle,
        description,
        path: pathName,
        image: imageSrc,
        siteUrl,
      }),
    ],
    title: seoConfig.title,
  });
};

const buildNoindexPageSeo = (siteUrl, pagePath, title, description) =>
  buildBaseSeo(siteUrl, pagePath, {
    description,
    noindex: true,
    title,
  });

const resolveSeoForPath = (siteSettings, siteUrl, pathname) => {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === '/') {
    return buildHomeSeo(siteSettings, siteUrl);
  }

  if (normalizedPath === '/story') {
    return buildStorySeo(siteSettings, siteUrl);
  }

  if (normalizedPath === '/contacts') {
    return buildContactSeo(siteSettings, siteUrl);
  }

  if (normalizedPath === '/virtual') {
    return buildVirtualSeo(siteSettings, siteUrl);
  }

  if (normalizedPath === '/login') {
    return buildNoindexPageSeo(
      siteUrl,
      normalizedPath,
      `Admin Login | ${SITE_NAME}`,
      'Admin login for Tales of Reval content management.'
    );
  }

  if (normalizedPath === '/styles') {
    return buildNoindexPageSeo(
      siteUrl,
      normalizedPath,
      `Style Guide | ${SITE_NAME}`,
      'Internal style guide for Tales of Reval.'
    );
  }

  if (normalizedPath.startsWith('/tip/')) {
    return buildNoindexPageSeo(
      siteUrl,
      normalizedPath,
      `Guide tip page | ${SITE_NAME}`,
      'Direct tip page for Tales of Reval guides.'
    );
  }

  const serviceMatch = normalizedPath.match(/^\/service\/([^/]+)$/);
  if (serviceMatch && SERVICE_SEO[serviceMatch[1]]) {
    return buildServiceSeo(siteSettings, siteUrl, serviceMatch[1]);
  }

  return null;
};

const stripExistingSeoTags = (html) =>
  html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*name=["']csp-nonce["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*name=["']keywords["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*name=["']robots["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

const injectHtmlLanguage = (html, language = DEFAULT_LANGUAGE) =>
  html.replace(/<html\b([^>]*)>/i, (_match, attrs = '') => {
    const cleanedAttrs = attrs
      .replace(/\sdata-react-helmet=(['"]).*?\1/gi, '')
      .replace(/\slang=(['"]).*?\1/gi, '');

    return `<html${cleanedAttrs} lang="${escapeAttribute(
      language
    )}" data-react-helmet="lang">`;
  });

const buildSeoTags = (seo, cspNonce = '') => {
  const robotsValue = seo.noindex ? NOINDEX_ROBOTS : DEFAULT_ROBOTS;
  const tags = [
    `<title data-react-helmet="true">${escapeHtml(seo.title)}</title>`,
    `<meta data-react-helmet="true" name="description" content="${escapeAttribute(
      seo.description
    )}"/>`,
  ];

  if (cspNonce) {
    tags.push(
      `<meta data-react-helmet="true" name="csp-nonce" content="${escapeAttribute(cspNonce)}"/>`
    );
  }

  if (seo.keywords) {
    tags.push(
      `<meta data-react-helmet="true" name="keywords" content="${escapeAttribute(
        seo.keywords
      )}"/>`
    );
  }

  tags.push(
    `<meta data-react-helmet="true" name="robots" content="${escapeAttribute(robotsValue)}"/>`,
    `<meta data-react-helmet="true" property="og:site_name" content="${escapeAttribute(
      SITE_NAME
    )}"/>`,
    `<meta data-react-helmet="true" property="og:locale" content="${DEFAULT_LOCALE}"/>`,
    `<meta data-react-helmet="true" property="og:type" content="${escapeAttribute(
      seo.type
    )}"/>`,
    `<meta data-react-helmet="true" property="og:title" content="${escapeAttribute(
      seo.title
    )}"/>`,
    `<meta data-react-helmet="true" property="og:description" content="${escapeAttribute(
      seo.description
    )}"/>`,
    `<meta data-react-helmet="true" property="og:url" content="${escapeAttribute(
      seo.canonicalUrl
    )}"/>`,
    `<meta data-react-helmet="true" property="og:image" content="${escapeAttribute(
      seo.image
    )}"/>`,
    `<meta data-react-helmet="true" property="og:image:alt" content="${escapeAttribute(
      seo.imageAlt
    )}"/>`,
    `<meta data-react-helmet="true" name="twitter:card" content="summary_large_image"/>`,
    `<meta data-react-helmet="true" name="twitter:title" content="${escapeAttribute(
      seo.title
    )}"/>`,
    `<meta data-react-helmet="true" name="twitter:description" content="${escapeAttribute(
      seo.description
    )}"/>`,
    `<meta data-react-helmet="true" name="twitter:image" content="${escapeAttribute(
      seo.image
    )}"/>`,
    `<link data-react-helmet="true" rel="canonical" href="${escapeAttribute(
      seo.canonicalUrl
    )}"/>`
  );

  for (const schemaEntry of seo.schema || []) {
    if (!schemaEntry) {
      continue;
    }

    tags.push(
      `<script data-react-helmet="true" type="application/ld+json"${
        cspNonce ? ` nonce="${escapeAttribute(cspNonce)}"` : ''
      }>${escapeHtml(JSON.stringify(schemaEntry))}</script>`
    );
  }

  return tags.join('');
};

const renderSeoHtml = (html, seo, cspNonce = '') =>
  injectHtmlLanguage(stripExistingSeoTags(html), DEFAULT_LANGUAGE).replace(
    /<\/head>/i,
    `${buildSeoTags(seo, cspNonce)}</head>`
  );

const isKnownFrontendRoute = (pathname = '/') =>
  resolveSeoForPath(
    {
      contactPage: {},
      footer: {},
      homeHero: {},
      servicePageContent: {},
      servicePageHeroes: {},
      storyPage: {},
      virtualTourPage: {},
    },
    'https://example.com',
    pathname
  ) !== null;

const renderAppHtml = async ({ cspNonce = '', pathname = '/', siteUrl }) => {
  const template = getIndexHtml();
  const siteSettings = await readSiteSettings();
  const seo = resolveSeoForPath(siteSettings, siteUrl, pathname);

  if (!seo) {
    return null;
  }

  return renderSeoHtml(template, seo, cspNonce);
};

module.exports = {
  isKnownFrontendRoute,
  renderAppHtml,
};
