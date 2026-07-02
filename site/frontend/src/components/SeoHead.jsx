import React from 'react';
import { Helmet } from 'react-helmet';

export const SITE_NAME = 'Tales of Reval';
const resolveSiteUrl = () => {
  if (process.env.REACT_APP_SITE_URL) {
    return process.env.REACT_APP_SITE_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'https://talesofreval.ee';
};

export const SITE_URL = resolveSiteUrl();
const DEFAULT_OG_IMAGE_PATH = '/logo512.png';
const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex,nofollow,noarchive';
const resolveCspNonce = () =>
  typeof document === 'undefined'
    ? undefined
    : document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content') || undefined;

const resolveLanguageCode = (language = 'en') => (language === 'ee' ? 'et' : 'en');
const resolveLocale = (language = 'en') => (language === 'ee' ? 'et_EE' : 'en_US');
const CLARITY_PROJECT_ID = 'x6v3bdy9l7';
const CLARITY_SNIPPET = `(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;

export const buildAbsoluteUrl = (value = '/', baseUrl = SITE_URL) => {
  try {
    return new URL(value, baseUrl).toString();
  } catch (_error) {
    return baseUrl;
  }
};

export const resolveAbsoluteUrl = (value = DEFAULT_OG_IMAGE_PATH, baseUrl = SITE_URL) =>
  buildAbsoluteUrl(value || DEFAULT_OG_IMAGE_PATH, baseUrl);

export const toPlainText = (value = '') =>
  String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const withOptionalFields = (value = {}) =>
  Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));

export const buildWebsiteSchema = ({ description = '', language = 'en' } = {}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: toPlainText(description) || undefined,
    inLanguage: resolveLanguageCode(language),
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  });

export const buildWebPageSchema = ({
  title = SITE_NAME,
  description = '',
  path = '/',
  image = '',
  type = 'WebPage',
  language = 'en',
} = {}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description: toPlainText(description) || undefined,
    url: buildAbsoluteUrl(path),
    inLanguage: resolveLanguageCode(language),
    image: image ? resolveAbsoluteUrl(image) : undefined,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
  });

export const buildTravelAgencySchema = ({
  description = '',
  image = '',
  email = '',
  phone = '',
  address = '',
  sameAs = [],
} = {}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: toPlainText(description) || undefined,
    image: resolveAbsoluteUrl(image || DEFAULT_OG_IMAGE_PATH),
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

export const buildServiceSchema = ({
  title = '',
  description = '',
  path = '/',
  image = '',
} = {}) =>
  withOptionalFields({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title || undefined,
    serviceType: title || undefined,
    description: toPlainText(description) || undefined,
    url: buildAbsoluteUrl(path),
    image: image ? resolveAbsoluteUrl(image) : undefined,
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Tallinn',
    },
    availableLanguage: ['English', 'Estonian'],
  });

export const buildBreadcrumbSchema = (items = []) => {
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
      item: buildAbsoluteUrl(item.path || '/'),
    })),
  };
};

const stripFaqIndex = (value = '') => String(value).replace(/^\d+\.\s*/, '').trim();

export const buildFAQSchema = ({ items = [] } = {}) => {
  const faqItems = Array.isArray(items)
    ? items.filter((item) => item?.question && item?.answer)
    : [];

  if (!faqItems.length) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: stripFaqIndex(toPlainText(item.question)),
      acceptedAnswer: {
        '@type': 'Answer',
        text: toPlainText(item.answer),
      },
    })),
  };
};

function SeoHead({
  title = SITE_NAME,
  description = '',
  path = '/',
  image = '',
  imageAlt = SITE_NAME,
  keywords = '',
  language = 'en',
  type = 'website',
  noindex = false,
  themeColor = '',
  statusBarStyle = '',
  schema = [],
  children = null,
}) {
  const canonicalUrl = buildAbsoluteUrl(path);
  const imageUrl = resolveAbsoluteUrl(image || DEFAULT_OG_IMAGE_PATH);
  const robotsContent = noindex ? NOINDEX_ROBOTS : DEFAULT_ROBOTS;
  const schemaItems = Array.isArray(schema) ? schema.filter(Boolean) : [schema].filter(Boolean);
  const cleanedDescription = toPlainText(description);
  const cspNonce = resolveCspNonce();

  return (
    <Helmet>
      <html lang={resolveLanguageCode(language)} />
      <title>{title}</title>
      <meta name="description" content={cleanedDescription} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robotsContent} />
      {themeColor ? <meta name="theme-color" content={themeColor} /> : null}
      {statusBarStyle ? (
        <meta name="apple-mobile-web-app-status-bar-style" content={statusBarStyle} />
      ) : null}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={resolveLocale(language)} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={cleanedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={cleanedDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <script nonce={cspNonce} type="text/javascript">{CLARITY_SNIPPET}</script>
      {children}
      {schemaItems.map((entry, index) => (
        <script key={`structured-data-${index}`} nonce={cspNonce} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
}

export default SeoHead;
