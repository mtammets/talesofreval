const LEGACY_ROUTE_REDIRECTS = new Map([
  ['/contact', '/contacts'],
  ['/contact-us', '/contacts'],
  ['/contacts-us', '/contacts'],
  ['/our-story', '/story'],
  ['/history', '/story'],
  ['/timeline', '/story'],
  ['/product', '/services'],
  ['/products', '/services'],
  ['/service', '/services'],
  ['/our-services', '/services'],
  ['/virtual-tour', '/virtual'],
  ['/self-guided-tour', '/virtual'],
  ['/private-tour', '/service/private'],
  ['/private-tours', '/service/private'],
  ['/team-event', '/service/team'],
  ['/team-events', '/service/team'],
  ['/team-building', '/service/team'],
  ['/quick-tour', '/service/quick'],
  ['/we-only-have-30-minutes', '/service/quick'],
  ['/30-minutes', '/service/quick'],
  ['/destination-management', '/service/destination'],
  ['/destination-management-services', '/service/destination'],
  ['/wedding-services', '/service/wedding'],
  ['/weddings', '/service/wedding'],
  ['/fantasy-weddings', '/service/wedding'],
]);

const CURRENT_CANONICAL_PATHS = new Set([
  '/',
  '/services',
  '/story',
  '/contacts',
  '/virtual',
  '/service/team',
  '/service/private',
  '/service/quick',
  '/service/destination',
  '/service/wedding',
]);

const normalizePathname = (pathname = '/') => {
  const value = String(pathname || '/').trim() || '/';
  const withoutTrailingSlash = value === '/' ? '/' : value.replace(/\/+$/, '') || '/';

  return withoutTrailingSlash.toLowerCase();
};

const getCandidatePaths = (pathname = '/') => {
  const normalizedPath = normalizePathname(pathname);
  const candidates = [normalizedPath];

  if (normalizedPath.endsWith('/index.html')) {
    candidates.push(normalizedPath.slice(0, -'/index.html'.length) || '/');
  }

  if (normalizedPath.endsWith('.html')) {
    candidates.push(normalizedPath.slice(0, -'.html'.length) || '/');
  }

  return [...new Set(candidates)];
};

const resolveLegacyRedirect = (pathname = '/') => {
  for (const candidate of getCandidatePaths(pathname)) {
    const directMatch = LEGACY_ROUTE_REDIRECTS.get(candidate);
    if (directMatch) {
      return directMatch;
    }

    if (candidate === '/older') {
      return '/';
    }

    if (candidate.startsWith('/older/')) {
      const nestedPath = candidate.slice('/older'.length) || '/';
      if (CURRENT_CANONICAL_PATHS.has(nestedPath)) {
        return nestedPath;
      }

      const nestedMatch = resolveLegacyRedirect(nestedPath);
      return nestedMatch || '/';
    }
  }

  return null;
};

module.exports = {
  resolveLegacyRedirect,
};
