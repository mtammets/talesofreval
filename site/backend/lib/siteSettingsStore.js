const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'site-settings.json');

const localized = (value = {}, fallbackEn = '', fallbackEe = '') => ({
  en: value.en || fallbackEn,
  ee: value.ee || fallbackEe || fallbackEn,
});

const imageShape = (image = {}, fallbackWidth = 1440, fallbackHeight = 700) => ({
  src: image.src || '',
  name: image.name || '',
  width: Number(image.width) || fallbackWidth,
  height: Number(image.height) || fallbackHeight,
});

const normalizeServiceItem = (item = {}, index = 0) => ({
  key: item.key || `service-${index + 1}`,
  link: item.link || item.key || `service-${index + 1}`,
  title: localized(item.title),
  description: localized(item.description),
  imageKey: item.imageKey || '',
  image: item.image ? imageShape(item.image, 640, 520) : null,
});

const normalizeTeamMember = (member = {}, index = 0) => ({
  key: member.key || `member-${index + 1}`,
  name: member.name || '',
  email: member.email || '',
  phone: member.phone || '',
  imageKey: member.imageKey || '',
  image: member.image ? imageShape(member.image, 520, 520) : null,
});

const normalizeSocialLinks = (links = {}) => ({
  facebook: links.facebook || '',
  instagram: links.instagram || '',
  tripadvisor: links.tripadvisor || '',
  airbnb: links.airbnb || '',
});

const normalizeSiteSettings = (settings = {}) => ({
  homeHero: {
    titleLine1: localized(settings.homeHero?.titleLine1),
    titleLine2: localized(settings.homeHero?.titleLine2),
    subtitle: localized(settings.homeHero?.subtitle),
    imageKey: settings.homeHero?.imageKey || '',
    image: settings.homeHero?.image ? imageShape(settings.homeHero.image) : null,
  },
  homeServices: {
    heading: localized(settings.homeServices?.heading),
    items: Array.isArray(settings.homeServices?.items)
      ? settings.homeServices.items.map(normalizeServiceItem)
      : [],
  },
  homeTeam: {
    heading: localized(settings.homeTeam?.heading),
    members: Array.isArray(settings.homeTeam?.members)
      ? settings.homeTeam.members.map(normalizeTeamMember)
      : [],
  },
  homeReview: {
    heading: localized(settings.homeReview?.heading),
    text: localized(settings.homeReview?.text),
    reviewer: localized(settings.homeReview?.reviewer),
  },
  footer: {
    freeTourHeading: localized(settings.footer?.freeTourHeading),
    firstTime: localized(settings.footer?.firstTime),
    secondTime: localized(settings.footer?.secondTime),
    languageLine: localized(settings.footer?.languageLine),
    durationLine: localized(settings.footer?.durationLine),
    distanceLine: localized(settings.footer?.distanceLine),
    startingPointLine: localized(settings.footer?.startingPointLine),
    openMapLabel: localized(settings.footer?.openMapLabel),
    openMapUrl: settings.footer?.openMapUrl || '',
    gpsHeading: localized(settings.footer?.gpsHeading),
    gpsCopy: localized(settings.footer?.gpsCopy),
    gpsButtonLabel: localized(settings.footer?.gpsButtonLabel),
    gpsUrl: settings.footer?.gpsUrl || '',
    gpsImageKey: settings.footer?.gpsImageKey || '',
    gpsImage: settings.footer?.gpsImage ? imageShape(settings.footer.gpsImage, 800, 560) : null,
    followUsHeading: localized(settings.footer?.followUsHeading),
    contactHeading: localized(settings.footer?.contactHeading),
    companyName: settings.footer?.companyName || '',
    companyReg: settings.footer?.companyReg || '',
    email: settings.footer?.email || '',
    phone: settings.footer?.phone || '',
    address: localized(settings.footer?.address),
    socialLinks: normalizeSocialLinks(settings.footer?.socialLinks),
  },
});

const readSiteSettings = async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const settings = JSON.parse(raw);
    return normalizeSiteSettings(settings);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return normalizeSiteSettings();
    }

    throw error;
  }
};

const writeSiteSettings = async (settings) => {
  const normalized = normalizeSiteSettings(settings);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
};

module.exports = {
  readSiteSettings,
  writeSiteSettings,
};
