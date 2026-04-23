const fs = require('fs/promises');
const { runtimeSiteSettingsFile } = require('./storagePaths');

const DATA_FILE = runtimeSiteSettingsFile;

const localized = (value = {}, fallbackEn = '', fallbackEe = '') => ({
  en: value.en || fallbackEn,
  ee: value.ee || fallbackEe || fallbackEn,
});

const normalizeImageZoom = (value, fallback = 1) => {
  const resolvedValue = Number(value);

  if (!Number.isFinite(resolvedValue)) {
    return fallback;
  }

  return Math.min(2.5, Math.max(1, Number(resolvedValue.toFixed(2))));
};

const imageVariantShape = (variant = {}, fallbackWidth = 1440, fallbackHeight = 700) => ({
  src: variant.src || '',
  width: Number(variant.width) || fallbackWidth,
  height: Number(variant.height) || fallbackHeight,
  format: variant.format || 'webp',
});

const imageShape = (image = {}, fallbackWidth = 1440, fallbackHeight = 700) => ({
  ...(() => {
    const variants = Array.isArray(image.variants)
      ? image.variants
          .map((variant) => imageVariantShape(variant, fallbackWidth, fallbackHeight))
          .filter((variant) => variant.src)
          .sort((left, right) => left.width - right.width)
      : [];
    const preferredVariant =
      variants.find((variant) => variant.src === image.src) ||
      variants.find((variant) => variant.width >= fallbackWidth) ||
      variants[variants.length - 1] ||
      null;

    return {
      src: image.src || preferredVariant?.src || '',
      name: image.name || '',
      width: Number(image.width) || preferredVariant?.width || fallbackWidth,
      height: Number(image.height) || preferredVariant?.height || fallbackHeight,
      format: image.format || preferredVariant?.format || '',
      pixelRatio:
        Number(image.pixelRatio) ||
        (variants.some((variant) => variant.width >= fallbackWidth * 2) ? 2 : 1),
      focusX: Number(image.focusX) >= 0 ? Number(image.focusX) : 50,
      focusY: Number(image.focusY) >= 0 ? Number(image.focusY) : 50,
      ...(image.zoom != null ? { zoom: normalizeImageZoom(image.zoom, 1) } : {}),
      variants,
    };
  })(),
});

const normalizeImageGallery = (
  images = [],
  fallbackImage = null,
  fallbackWidth = 1440,
  fallbackHeight = 700
) => {
  const normalizedImages = Array.isArray(images)
    ? images
        .map((image) => imageShape(image, fallbackWidth, fallbackHeight))
        .filter((image) => image.src)
    : [];

  if (normalizedImages.length) {
    return normalizedImages;
  }

  if (fallbackImage?.src) {
    return [imageShape(fallbackImage, fallbackWidth, fallbackHeight)];
  }

  return [];
};

const DEFAULT_SERVICE_PAGE_HERO_KEYS = {
  team: 'serviceTeamHero',
  private: 'servicePrivateHero',
  quick: 'serviceQuickHero',
  destination: 'serviceDestinationHero',
  wedding: 'serviceWeddingHero',
};

const normalizeServiceItem = (item = {}, index = 0) => ({
  key: item.key || `service-${index + 1}`,
  link: item.link || item.key || `service-${index + 1}`,
  title: localized(item.title),
  description: localized(item.description),
  imageKey: item.imageKey || '',
  image: item.image ? imageShape(item.image, 640, 520) : null,
});

const normalizeServicePageHero = (hero = {}, serviceKey = '') => ({
  imageKey: hero.imageKey || DEFAULT_SERVICE_PAGE_HERO_KEYS[serviceKey] || '',
  image: hero.image ? imageShape(hero.image) : null,
});

const normalizeServicePageCard = (card = {}, index = 0, serviceKey = '') => ({
  key: card.key || `${serviceKey}-card-${index + 1}`,
  imageKey: card.imageKey || '',
  image: card.image ? imageShape(card.image, 640, 520) : null,
  layout: card.layout === 'image-right' ? 'image-right' : 'image-left',
  title: localized(card.title),
  body: localized(card.body),
});

const normalizeServicePageContent = (content = {}, serviceKey = '') => ({
  isCustomized: content.isCustomized === true,
  title: localized(content.title),
  intro: localized(content.intro),
  cards: Array.isArray(content.cards)
    ? content.cards.map((card, index) => normalizeServicePageCard(card, index, serviceKey))
    : [],
  review: localized(content.review),
  reviewAuthor: localized(content.reviewAuthor),
  destinationHeading: localized(content.destinationHeading),
  destinationDescription: localized(content.destinationDescription),
  destinationButtonLabel: localized(content.destinationButtonLabel),
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

const TOUR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TOUR_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const normalizeFreeTourSlots = (slots = []) => {
  const seen = new Set();

  return (Array.isArray(slots) ? slots : [])
    .map((slot) => {
      const date = String(slot?.date || '').trim();
      const time = String(slot?.time || '').trim();

      if (!TOUR_DATE_PATTERN.test(date) || !TOUR_TIME_PATTERN.test(time)) {
        return null;
      }

      const id = `${date}-${time}`;

      if (seen.has(id)) {
        return null;
      }

      seen.add(id);

      return {
        id,
        date,
        time,
        bookings: Number.isFinite(Number(slot?.bookings)) ? Number(slot.bookings) : 0,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.date === right.date) {
        return left.time.localeCompare(right.time);
      }

      return left.date.localeCompare(right.date);
    });
};

const normalizeFreeTourSchedule = (schedule = {}) => {
  if (Array.isArray(schedule)) {
    return {
      isCustomized: true,
      slots: normalizeFreeTourSlots(schedule),
    };
  }

  return {
    isCustomized: schedule?.isCustomized === true,
    slots: normalizeFreeTourSlots(schedule?.slots),
  };
};

const normalizeSiteSettings = (settings = {}) => {
  const homeHeroImages = normalizeImageGallery(
    settings.homeHero?.images,
    settings.homeHero?.image
  );

  return {
    homeHero: {
      titleLine1: localized(settings.homeHero?.titleLine1),
      titleLine2: localized(settings.homeHero?.titleLine2),
      subtitle: localized(settings.homeHero?.subtitle),
      imageKey: settings.homeHero?.imageKey || '',
      images: homeHeroImages,
      image: homeHeroImages[0] || null,
    },
    storyPage: {
      imageKey: settings.storyPage?.imageKey || 'storyBg',
      image: settings.storyPage?.image ? imageShape(settings.storyPage.image) : null,
    },
    servicePageHeroes: Object.keys(DEFAULT_SERVICE_PAGE_HERO_KEYS).reduce((accumulator, serviceKey) => {
      accumulator[serviceKey] = normalizeServicePageHero(
        settings.servicePageHeroes?.[serviceKey],
        serviceKey
      );
      return accumulator;
    }, {}),
    servicePageContent: Object.keys(DEFAULT_SERVICE_PAGE_HERO_KEYS).reduce((accumulator, serviceKey) => {
      accumulator[serviceKey] = normalizeServicePageContent(
        settings.servicePageContent?.[serviceKey],
        serviceKey
      );
      return accumulator;
    }, {}),
    homeServices: {
      heading: localized(settings.homeServices?.heading),
      items: Array.isArray(settings.homeServices?.items)
        ? settings.homeServices.items.map(normalizeServiceItem)
        : [],
    },
    ...(() => {
      const sharedTeamHeading = settings.contactPage?.teamHeading || settings.homeTeam?.heading;
      const sharedTeamMembers = Array.isArray(settings.contactPage?.teamMembers) && settings.contactPage.teamMembers.length
        ? settings.contactPage.teamMembers
        : settings.homeTeam?.members;
      const normalizedTeamHeading = localized(sharedTeamHeading);
      const normalizedTeamMembers = Array.isArray(sharedTeamMembers)
        ? sharedTeamMembers.map(normalizeTeamMember)
        : [];

      return {
        homeTeam: {
          heading: normalizedTeamHeading,
          members: normalizedTeamMembers,
        },
        contactPage: {
          imageKey: settings.contactPage?.imageKey || 'contactBg',
          image: settings.contactPage?.image ? imageShape(settings.contactPage.image) : null,
          teamHeading: normalizedTeamHeading,
          teamMembers: normalizedTeamMembers,
          formTitle: localized(settings.contactPage?.formTitle),
          nameLabel: localized(settings.contactPage?.nameLabel),
          emailLabel: localized(settings.contactPage?.emailLabel),
          messageLabel: localized(settings.contactPage?.messageLabel),
          submitLabel: localized(settings.contactPage?.submitLabel),
          companyName: settings.contactPage?.companyName || '',
          companyReg: settings.contactPage?.companyReg || '',
          address: localized(settings.contactPage?.address),
          bankLine1: settings.contactPage?.bankLine1 || '',
          bankLine2: settings.contactPage?.bankLine2 || '',
          email: settings.contactPage?.email || '',
          phone: settings.contactPage?.phone || '',
        },
      };
    })(),
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
    freeTourSchedule: normalizeFreeTourSchedule(settings.freeTourSchedule),
  };
};

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
