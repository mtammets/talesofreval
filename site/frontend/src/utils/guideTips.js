import { getLocalizedSiteText } from '../content/siteSettingsDefaults';
import { normalizePaymentLinks } from '../content/paymentMethods';

const DEFAULT_GUIDE_TIP_ORIGIN = 'https://talesofreval.ee';

const slugifySegment = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getGuideDisplayName = (member = {}, language = null) => {
  const resolvedLanguage =
    language || (typeof localStorage !== 'undefined' ? localStorage.getItem('language') : '') || 'en';
  return getLocalizedSiteText(member?.name, resolvedLanguage, 'Guide') || 'Guide';
};

export const getGuideTipId = (member = {}) => {
  const preferredId = String(member?.key || '').trim();

  if (preferredId) {
    return preferredId;
  }

  return slugifySegment(getGuideDisplayName(member)) || 'guide';
};

export const getGuideTipPath = (member = {}) =>
  `/tip/${encodeURIComponent(getGuideTipId(member))}`;

export const getGuideTipOrigin = () => {
  const configuredOrigin = String(process.env.REACT_APP_PUBLIC_SITE_URL || '').trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, '');
  }

  return DEFAULT_GUIDE_TIP_ORIGIN;
};

export const getGuideTipUrl = (member = {}, origin = getGuideTipOrigin()) => {
  const path = getGuideTipPath(member);

  if (!origin) {
    return path;
  }

  return new URL(path, origin).toString();
};

export const findGuideByTipId = (members = [], guideId = '') => {
  const resolvedGuideId = decodeURIComponent(String(guideId || ''));
  return members.find((member) => getGuideTipId(member) === resolvedGuideId) || null;
};

export const getActiveGuidePaymentLinks = (member = {}) =>
  normalizePaymentLinks(member?.payment_links).filter((entry) => Boolean(entry?.link));

export const getGuideQrFileName = (member = {}, extension = 'png') => {
  const safeExtension = String(extension || 'png').replace(/^\.+/, '') || 'png';
  const safeName = slugifySegment(getGuideDisplayName(member)) || 'guide';
  return `tales-of-reval-tip-${safeName}.${safeExtension}`;
};
