const fs = require('fs/promises');
const { runtimeSiteSettingsFile } = require('./storagePaths');
const { normalizeSiteEmailTemplates } = require('./siteEmailTemplates');
const { getFreeTourBookingStats } = require('./freeTourBookingsStore');
const {
  applyBookingCountsToSchedule,
  normalizeFreeTourSchedule,
} = require('./freeTourSchedule');

const DATA_FILE = runtimeSiteSettingsFile;

const localized = (value = {}, fallbackEn = '', fallbackEe = '') => {
  if (typeof value === 'string') {
    return {
      en: value || fallbackEn,
      ee: fallbackEe || value || fallbackEn,
    };
  }

  return {
    en: value.en || fallbackEn,
    ee: value.ee || fallbackEe || value.en || fallbackEn,
  };
};

const localizedList = (values = [], fallbackValues = []) => {
  const sourceValues = Array.isArray(values) && values.length ? values : fallbackValues;

  return sourceValues.map((value, index) =>
    localized(
      value,
      fallbackValues[index]?.en || '',
      fallbackValues[index]?.ee || fallbackValues[index]?.en || ''
    )
  );
};

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
    const focusX = Number(image.focusX) >= 0 ? Number(image.focusX) : 50;
    const focusY = Number(image.focusY) >= 0 ? Number(image.focusY) : 50;
    const zoom = normalizeImageZoom(image.zoom, 1);

    return {
      src: image.src || preferredVariant?.src || '',
      name: image.name || '',
      width: Number(image.width) || preferredVariant?.width || fallbackWidth,
      height: Number(image.height) || preferredVariant?.height || fallbackHeight,
      format: image.format || preferredVariant?.format || '',
      pixelRatio:
        Number(image.pixelRatio) ||
        (variants.some((variant) => variant.width >= fallbackWidth * 2) ? 2 : 1),
      focusX,
      focusY,
      zoom,
      mobileFocusX: Number(image.mobileFocusX) >= 0 ? Number(image.mobileFocusX) : focusX,
      mobileFocusY: Number(image.mobileFocusY) >= 0 ? Number(image.mobileFocusY) : focusY,
      mobileZoom: normalizeImageZoom(image.mobileZoom, zoom),
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

const resolvePreferredImageSrc = (images = [], preferredSrc = '') =>
  images.find((image) => image?.src === preferredSrc)?.src || images[0]?.src || '';

const resolvePreferredImage = (images = [], preferredSrc = '') =>
  images.find((image) => image?.src === preferredSrc) || images[0] || null;

const DEFAULT_SERVICE_PAGE_HERO_KEYS = {
  team: 'serviceTeamHero',
  private: 'servicePrivateHero',
  quick: 'serviceQuickHero',
  destination: 'serviceDestinationHero',
  wedding: 'serviceWeddingHero',
};
const DEFAULT_GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.leplace.global&pli=1';
const DEFAULT_APP_STORE_URL =
  'https://apps.apple.com/ee/app/leplace-world/id1496776027';
const DEFAULT_PAYMENT_CARD_COPY = {
  buttonLabel: {
    en: 'Tip your guide',
    ee: 'Jäta giidile jootraha',
  },
  title: {
    en: 'Tip your guide',
    ee: 'Jäta giidile jootraha',
  },
  intro: {
    en: 'You enjoyed your tour? Or just wanna hug this guy, send us a tip! None of it goes to charity.',
    ee: 'Kui tuur meeldis või tahad lihtsalt giidile tänu avaldada, saada tipp otse talle. Mitte sentigi ei lähe heategevusse.',
  },
  closeLabel: {
    en: 'Cancel',
    ee: 'Sulge',
  },
};

const PAYMENT_METHODS = ['Wise', 'Apple Pay', 'Google Pay', 'PayPal', 'Revolut'];

const normalizePaymentLinks = (links = []) =>
  PAYMENT_METHODS.map((name) => ({
    name,
    link: Array.isArray(links)
      ? links.find((entry) => entry?.name === name)?.link || ''
      : '',
  }));

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
  name: localized(member.name),
  email: member.email || '',
  phone: member.phone || '',
  payment_links: normalizePaymentLinks(member.payment_links),
  imageKey: member.imageKey || '',
  image: member.image ? imageShape(member.image, 520, 520) : null,
});

const normalizeSocialLinks = (links = {}) => ({
  facebook: links.facebook || '',
  instagram: links.instagram || '',
  tripadvisor: links.tripadvisor || '',
  airbnb: links.airbnb || '',
});

const normalizePaymentCardCopy = (copy = {}) => ({
  buttonLabel: localized(
    copy.buttonLabel,
    DEFAULT_PAYMENT_CARD_COPY.buttonLabel.en,
    DEFAULT_PAYMENT_CARD_COPY.buttonLabel.ee
  ),
  title: localized(
    copy.title,
    DEFAULT_PAYMENT_CARD_COPY.title.en,
    DEFAULT_PAYMENT_CARD_COPY.title.ee
  ),
  intro: localized(
    copy.intro,
    DEFAULT_PAYMENT_CARD_COPY.intro.en,
    DEFAULT_PAYMENT_CARD_COPY.intro.ee
  ),
  closeLabel: localized(
    copy.closeLabel,
    DEFAULT_PAYMENT_CARD_COPY.closeLabel.en,
    DEFAULT_PAYMENT_CARD_COPY.closeLabel.ee
  ),
});

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
      defaultImageSrc: resolvePreferredImageSrc(
        homeHeroImages,
        settings.homeHero?.defaultImageSrc
      ),
      images: homeHeroImages,
      image: resolvePreferredImage(homeHeroImages, settings.homeHero?.defaultImageSrc),
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
      const sharedPaymentCard = settings.contactPage?.paymentCard || settings.homeTeam?.paymentCard;
      const normalizedTeamHeading = localized(sharedTeamHeading);
      const normalizedTeamMembers = Array.isArray(sharedTeamMembers)
        ? sharedTeamMembers.map(normalizeTeamMember)
        : [];
      const normalizedPaymentCard = normalizePaymentCardCopy(sharedPaymentCard);

      return {
        homeTeam: {
          heading: normalizedTeamHeading,
          paymentCard: normalizedPaymentCard,
          members: normalizedTeamMembers,
        },
        contactPage: {
          imageKey: settings.contactPage?.imageKey || 'contactBg',
          image: settings.contactPage?.image ? imageShape(settings.contactPage.image) : null,
          teamHeading: normalizedTeamHeading,
          paymentCard: normalizedPaymentCard,
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
    homeExploreBanner: {
      titleLine1: localized(
        settings.homeExploreBanner?.titleLine1,
        'Explore Alone,',
        'Avasta omas tempos,'
      ),
      titleLine2: localized(
        settings.homeExploreBanner?.titleLine2,
        'Discover More!',
        'avasta rohkem!'
      ),
      subtitle: localized(
        settings.homeExploreBanner?.subtitle,
        'Medieval adventure at your fingertips',
        'Keskaegne seiklus sinu käeulatuses'
      ),
      readMoreLabel: localized(
        settings.homeExploreBanner?.readMoreLabel,
        'Read more',
        'Loe lähemalt'
      ),
      googlePlayUrl:
        settings.homeExploreBanner?.googlePlayUrl || DEFAULT_GOOGLE_PLAY_URL,
      appStoreUrl:
        settings.homeExploreBanner?.appStoreUrl || DEFAULT_APP_STORE_URL,
    },
    virtualTourPage: {
      titleLine1: localized(
        settings.virtualTourPage?.titleLine1,
        'Explore Alone,',
        'Avasta omas tempos,'
      ),
      titleLine2: localized(
        settings.virtualTourPage?.titleLine2,
        'Discover More!',
        'avasta rohkem!'
      ),
      subtitle: localized(
        settings.virtualTourPage?.subtitle,
        'Location based app guided tours',
        'Asukohapõhised äpijuhitud tuurid'
      ),
      contentTitle: localized(
        settings.virtualTourPage?.contentTitle,
        'Medieval adventure at your fingertips',
        'Keskaegne seiklus sinu käeulatuses'
      ),
      featureItems: localizedList(settings.virtualTourPage?.featureItems, [
        { en: 'Your time, your pace!', ee: 'Sinu aeg, sinu tempo!' },
        { en: 'Interactive quizzes', ee: 'Interaktiivsed viktoriinid' },
        { en: 'Photo challenges', ee: 'Fotoväljakutsed' },
        {
          en: 'In-depth tour with storytelling',
          ee: 'Põhjalik jutustav tuur',
        },
      ]),
      priceLabel: settings.virtualTourPage?.priceLabel || '3.99 €',
      payNowLabel: localized(
        settings.virtualTourPage?.payNowLabel,
        'Pay now',
        'Maksa nüüd'
      ),
      googlePlayUrl:
        settings.virtualTourPage?.googlePlayUrl || DEFAULT_GOOGLE_PLAY_URL,
      appStoreUrl:
        settings.virtualTourPage?.appStoreUrl || DEFAULT_APP_STORE_URL,
      aboutTitle: localized(
        settings.virtualTourPage?.aboutTitle,
        'What is LePlace',
        'Mis on LePlace'
      ),
      aboutCopy: localized(
        settings.virtualTourPage?.aboutCopy,
        'LePlace transforms local tourism with interactive outdoor exploration games on your mobile phone and connects creators and organizations with people and places worldwide.',
        'LePlace muudab kohaliku turismi mobiilis mängitavate interaktiivsete avastusmängudega ning ühendab loojad ja organisatsioonid inimeste ja paikadega üle kogu maailma.'
      ),
      readMoreLabel: localized(
        settings.virtualTourPage?.readMoreLabel,
        'Read more',
        'Loe lähemalt'
      ),
      readMoreUrl:
        settings.virtualTourPage?.readMoreUrl ||
        'https://connect.leplace.online/storyline-talesofreval',
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
    emailTemplates: normalizeSiteEmailTemplates(
      settings.emailTemplates,
      settings.freeTourEmails
    ),
  };
};

const withFreeTourBookingCounts = async (settings) => {
  const bookingStats = await getFreeTourBookingStats();

  return {
    ...settings,
    freeTourSchedule: applyBookingCountsToSchedule(settings.freeTourSchedule, bookingStats),
  };
};

const readSiteSettings = async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const settings = JSON.parse(raw);
    return withFreeTourBookingCounts(normalizeSiteSettings(settings));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return withFreeTourBookingCounts(normalizeSiteSettings());
    }

    throw error;
  }
};

const writeSiteSettings = async (settings) => {
  const normalized = normalizeSiteSettings(settings);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return readSiteSettings();
};

module.exports = {
  readSiteSettings,
  writeSiteSettings,
};
