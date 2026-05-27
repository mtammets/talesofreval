const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const adminAuth = require('../middleware/adminAuth');
const { sendFreeTourCancellationEmails } = require('../controllers/emailController');
const { normalizeSiteEmailTemplates } = require('../lib/siteEmailTemplates');
const { cancelFreeTourBookingsForSlotIds } = require('../lib/freeTourBookingsStore');
const { getEffectiveFreeTourSlots, normalizeFreeTourSchedule } = require('../lib/freeTourSchedule');
const { normalizeLocalizedImageAlt } = require('../lib/localizedImageAlt');
const { readSiteSettings, writeSiteSettings } = require('../lib/siteSettingsStore');
const { runtimeSiteUploadsDir } = require('../lib/storagePaths');
const { IMAGE_PRESETS, processUploadedImage } = require('../lib/uploadedImageProcessor');

const router = express.Router();

const siteUploadsDir = runtimeSiteUploadsDir;

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image uploads are allowed.'));
  },
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

const MAX_HOME_HERO_IMAGES = 6;
const homeHeroUpload = upload.fields([{ name: 'imageFile', maxCount: MAX_HOME_HERO_IMAGES }]);
const heroUpload = upload.fields([{ name: 'imageFile', maxCount: 1 }]);
const servicesUpload = upload.any();
const teamUpload = upload.any();
const reviewUpload = upload.none();
const contactUpload = upload.any();
const footerUpload = upload.fields([{ name: 'gpsImageFile', maxCount: 1 }]);
const servicePageContentUpload = upload.any();
const servicePageKeys = new Set(['team', 'private', 'quick', 'destination', 'wedding']);

const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

const normalizeImageZoom = (value, fallback = 1) => {
  const resolvedValue = Number(value);

  if (!Number.isFinite(resolvedValue)) {
    return fallback;
  }

  return Math.min(2.5, Math.max(1, Number(resolvedValue.toFixed(2))));
};

const resolveImageAlt = (providedImage = null, fallbackImage = null) =>
  normalizeLocalizedImageAlt(providedImage?.alt) ||
  normalizeLocalizedImageAlt(fallbackImage?.alt);

const mergeImageMetadata = (processedImage, fallbackImage = null, providedImage = null) => {
  const focusX =
    Number(providedImage?.focusX) >= 0
      ? Number(providedImage.focusX)
      : Number(fallbackImage?.focusX) >= 0
        ? Number(fallbackImage.focusX)
        : 50;
  const focusY =
    Number(providedImage?.focusY) >= 0
      ? Number(providedImage.focusY)
      : Number(fallbackImage?.focusY) >= 0
        ? Number(fallbackImage.focusY)
        : 50;
  const zoom = normalizeImageZoom(
    providedImage?.zoom,
    normalizeImageZoom(fallbackImage?.zoom, 1)
  );

  return {
    ...(processedImage || fallbackImage || null),
    alt: resolveImageAlt(providedImage, fallbackImage),
    focusX,
    focusY,
    zoom,
    mobileFocusX:
      Number(providedImage?.mobileFocusX) >= 0
        ? Number(providedImage.mobileFocusX)
        : Number(fallbackImage?.mobileFocusX) >= 0
          ? Number(fallbackImage.mobileFocusX)
          : focusX,
    mobileFocusY:
      Number(providedImage?.mobileFocusY) >= 0
        ? Number(providedImage.mobileFocusY)
        : Number(fallbackImage?.mobileFocusY) >= 0
          ? Number(fallbackImage.mobileFocusY)
          : focusY,
    mobileZoom: normalizeImageZoom(
      providedImage?.mobileZoom,
      normalizeImageZoom(fallbackImage?.mobileZoom, zoom)
    ),
  };
};

const resolveHomeHeroDefaultImageSrc = (
  nextHeroImages,
  retainedImages,
  defaultImageGroup,
  defaultImageIndex,
  fallbackDefaultImageSrc = ''
) => {
  if (!Array.isArray(nextHeroImages) || !nextHeroImages.length) {
    return '';
  }

  const parsedIndex = Number.parseInt(defaultImageIndex, 10);

  if (defaultImageGroup === 'new' && Number.isInteger(parsedIndex)) {
    return nextHeroImages[parsedIndex]?.src || nextHeroImages[0]?.src || '';
  }

  if (defaultImageGroup === 'retained' && Number.isInteger(parsedIndex)) {
    const retainedImageSrc = retainedImages?.[parsedIndex]?.src;

    if (retainedImageSrc) {
      return (
        nextHeroImages.find((image) => image?.src === retainedImageSrc)?.src ||
        nextHeroImages[0]?.src ||
        ''
      );
    }
  }

  const matchingFallbackSrc = nextHeroImages.find(
    (image) => image?.src === fallbackDefaultImageSrc
  )?.src;

  return matchingFallbackSrc || nextHeroImages[0]?.src || '';
};

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = await readSiteSettings();
    res.json(settings);
  })
);

router.get(
  '/admin',
  adminAuth,
  asyncHandler(async (_req, res) => {
    const settings = await readSiteSettings();
    res.json(settings);
  })
);

router.put(
  '/admin/hero',
  adminAuth,
  homeHeroUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const imageFiles = req.files?.imageFile || [];
    const providedNewImages = parseJsonField(req.body.newImages, []);
    const processedHeroImages = await Promise.all(
      imageFiles.map(async (file, index) =>
        mergeImageMetadata(
          await processUploadedImage({
            file,
            outputDir: siteUploadsDir,
            publicPathPrefix: '/uploads/site',
            preset: IMAGE_PRESETS.hero,
          }),
          null,
          providedNewImages[index]
        )
      )
    );
    const currentImages = Array.isArray(settings.homeHero.images)
      ? settings.homeHero.images
      : settings.homeHero.image
        ? [settings.homeHero.image]
        : [];
    const hasRetainedImages = Object.prototype.hasOwnProperty.call(req.body, 'retainedImages');
    const retainedImages = hasRetainedImages
      ? parseJsonField(req.body.retainedImages, currentImages)
      : currentImages;
    const nextHeroImages = hasRetainedImages
      ? [
          ...processedHeroImages.filter(Boolean),
          ...(Array.isArray(retainedImages) ? retainedImages : currentImages).filter(
            (image) => image?.src
          ),
        ]
      : processedHeroImages.length
        ? [processedHeroImages[0]]
        : currentImages;

    if (nextHeroImages.length > MAX_HOME_HERO_IMAGES) {
      throw new Error(`Homepage hero supports up to ${MAX_HOME_HERO_IMAGES} images.`);
    }

    const defaultImageSrc = resolveHomeHeroDefaultImageSrc(
      nextHeroImages,
      Array.isArray(retainedImages) ? retainedImages : currentImages,
      req.body.defaultImageGroup,
      req.body.defaultImageIndex,
      req.body.defaultImageSrc || settings.homeHero.defaultImageSrc
    );

    const nextSettings = {
      ...settings,
      homeHero: {
        ...settings.homeHero,
        titleLine1: parseJsonField(req.body.titleLine1, settings.homeHero.titleLine1),
        titleLine2: parseJsonField(req.body.titleLine2, settings.homeHero.titleLine2),
        subtitle: parseJsonField(req.body.subtitle, settings.homeHero.subtitle),
        bookNowLabel: parseJsonField(
          req.body.bookNowLabel,
          settings.homeHero.bookNowLabel
        ),
        defaultImageSrc,
        images: nextHeroImages,
        image: nextHeroImages.find((image) => image?.src === defaultImageSrc) || nextHeroImages[0] || null,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/story-hero',
  adminAuth,
  heroUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const imageFile = req.files?.imageFile?.[0];
    const providedImage = parseJsonField(req.body.image, settings.storyPage.image);
    const processedHeroImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.hero,
        })
      : null;
    const nextHeroImage = processedHeroImage
      ? mergeImageMetadata(processedHeroImage, settings.storyPage.image, providedImage)
      : providedImage
        ? mergeImageMetadata(null, settings.storyPage.image, providedImage)
        : settings.storyPage.image;

    const nextSettings = {
      ...settings,
      storyPage: {
        ...settings.storyPage,
        image: nextHeroImage,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/service-page-hero/:serviceKey',
  adminAuth,
  heroUpload,
  asyncHandler(async (req, res) => {
    const { serviceKey } = req.params;

    if (!servicePageKeys.has(serviceKey)) {
      res.status(400);
      throw new Error('Unknown service page hero.');
    }

    const settings = await readSiteSettings();
    const imageFile = req.files?.imageFile?.[0];
    const currentHeroImage = settings.servicePageHeroes?.[serviceKey]?.image || null;
    const providedImage = parseJsonField(req.body.image, currentHeroImage);
    const processedHeroImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.hero,
        })
      : null;
    const nextHeroImage = processedHeroImage
      ? mergeImageMetadata(processedHeroImage, currentHeroImage, providedImage)
      : providedImage
        ? mergeImageMetadata(null, currentHeroImage, providedImage)
        : currentHeroImage;

    const nextSettings = {
      ...settings,
      servicePageHeroes: {
        ...settings.servicePageHeroes,
        [serviceKey]: {
          ...settings.servicePageHeroes?.[serviceKey],
          image: nextHeroImage,
        },
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/service-page-content/:serviceKey',
  adminAuth,
  servicePageContentUpload,
  asyncHandler(async (req, res) => {
    const { serviceKey } = req.params;

    if (!servicePageKeys.has(serviceKey)) {
      res.status(400);
      throw new Error('Unknown service page content.');
    }

    const settings = await readSiteSettings();
    const currentContent = settings.servicePageContent?.[serviceKey] || {};
    const parsedCards = parseJsonField(req.body.cards, currentContent.cards);
    const cards = Array.isArray(parsedCards) ? parsedCards : [];
    const fileMap = new Map((req.files || []).map((file) => [file.fieldname, file]));
    const processedCardImages = await Promise.all(
      cards.map(async (_card, index) => {
        const file = fileMap.get(`cardImage_${index}`);
        if (!file) {
          return null;
        }

        return processUploadedImage({
          file,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.serviceCard,
        });
      })
    );
    const nextCards = cards.map((card, index) => ({
      ...currentContent.cards?.[index],
      ...card,
      image:
        processedCardImages[index]
          ? mergeImageMetadata(
              processedCardImages[index],
              currentContent.cards?.[index]?.image,
              card.image
            )
          : card.image || currentContent.cards?.[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      servicePageContent: {
        ...settings.servicePageContent,
        [serviceKey]: {
          ...currentContent,
          isCustomized: true,
          title: parseJsonField(req.body.title, currentContent.title),
          intro: parseJsonField(req.body.intro, currentContent.intro),
          cards: nextCards,
          review: parseJsonField(req.body.review, currentContent.review),
          reviewAuthor: parseJsonField(req.body.reviewAuthor, currentContent.reviewAuthor),
          destinationHeading: parseJsonField(
            req.body.destinationHeading,
            currentContent.destinationHeading
          ),
          destinationDescription: parseJsonField(
            req.body.destinationDescription,
            currentContent.destinationDescription
          ),
          destinationButtonLabel: parseJsonField(
            req.body.destinationButtonLabel,
            currentContent.destinationButtonLabel
          ),
        },
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/services',
  adminAuth,
  servicesUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const items = parseJsonField(req.body.items, settings.homeServices.items);
    const heading = parseJsonField(req.body.heading, settings.homeServices.heading);

    const fileMap = new Map((req.files || []).map((file) => [file.fieldname, file]));
    const processedImages = await Promise.all(
      items.map(async (_item, index) => {
        const file = fileMap.get(`serviceImage_${index}`);
        if (!file) {
          return null;
        }

        return processUploadedImage({
          file,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.serviceCard,
        });
      })
    );

    const nextItems = items.map((item, index) => ({
      ...settings.homeServices.items[index],
      ...item,
      image: processedImages[index]
        ? mergeImageMetadata(
            processedImages[index],
            settings.homeServices.items[index]?.image,
            item.image
          )
        : item.image || settings.homeServices.items[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      homeServices: {
        ...settings.homeServices,
        heading,
        items: nextItems,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/team',
  adminAuth,
  teamUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const members = parseJsonField(req.body.members, settings.homeTeam.members);
    const heading = parseJsonField(req.body.heading, settings.homeTeam.heading);
    const paymentCard = parseJsonField(req.body.paymentCard, settings.homeTeam.paymentCard);

    const fileMap = new Map((req.files || []).map((file) => [file.fieldname, file]));
    const processedImages = await Promise.all(
      members.map(async (_member, index) => {
        const file = fileMap.get(`teamImage_${index}`);
        if (!file) {
          return null;
        }

        return processUploadedImage({
          file,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.teamMember,
        });
      })
    );

    const nextMembers = members.map((member, index) => ({
      ...(settings.homeTeam.members[index] || {}),
      ...member,
      image: processedImages[index]
        ? mergeImageMetadata(
            processedImages[index],
            settings.homeTeam.members[index]?.image,
            member.image
          )
        : member.image || settings.homeTeam.members[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      homeTeam: {
        ...settings.homeTeam,
        heading,
        paymentCard,
        members: nextMembers,
      },
      contactPage: {
        ...settings.contactPage,
        teamHeading: heading,
        paymentCard,
        teamMembers: nextMembers,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/review',
  adminAuth,
  reviewUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();

    const nextSettings = {
      ...settings,
      homeReview: {
        ...settings.homeReview,
        heading: parseJsonField(req.body.heading, settings.homeReview.heading),
        text: parseJsonField(req.body.text, settings.homeReview.text),
        reviewer: parseJsonField(req.body.reviewer, settings.homeReview.reviewer),
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/home-explore-banner',
  adminAuth,
  reviewUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const currentBanner = settings.homeExploreBanner || {};

    const nextSettings = {
      ...settings,
      homeExploreBanner: {
        ...currentBanner,
        titleLine1: parseJsonField(req.body.titleLine1, currentBanner.titleLine1),
        titleLine2: parseJsonField(req.body.titleLine2, currentBanner.titleLine2),
        subtitle: parseJsonField(req.body.subtitle, currentBanner.subtitle),
        readMoreLabel: parseJsonField(
          req.body.readMoreLabel,
          currentBanner.readMoreLabel
        ),
        googlePlayUrl:
          typeof req.body.googlePlayUrl === 'string'
            ? req.body.googlePlayUrl
            : currentBanner.googlePlayUrl,
        appStoreUrl:
          typeof req.body.appStoreUrl === 'string'
            ? req.body.appStoreUrl
            : currentBanner.appStoreUrl,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/virtual-tour-page',
  adminAuth,
  reviewUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const currentPage = settings.virtualTourPage || {};

    const nextSettings = {
      ...settings,
      virtualTourPage: {
        ...currentPage,
        titleLine1: parseJsonField(req.body.titleLine1, currentPage.titleLine1),
        titleLine2: parseJsonField(req.body.titleLine2, currentPage.titleLine2),
        subtitle: parseJsonField(req.body.subtitle, currentPage.subtitle),
        contentTitle: parseJsonField(req.body.contentTitle, currentPage.contentTitle),
        featureItems: parseJsonField(req.body.featureItems, currentPage.featureItems),
        priceLabel:
          typeof req.body.priceLabel === 'string'
            ? req.body.priceLabel
            : currentPage.priceLabel,
        payNowLabel: parseJsonField(req.body.payNowLabel, currentPage.payNowLabel),
        googlePlayUrl:
          typeof req.body.googlePlayUrl === 'string'
            ? req.body.googlePlayUrl
            : currentPage.googlePlayUrl,
        appStoreUrl:
          typeof req.body.appStoreUrl === 'string'
            ? req.body.appStoreUrl
            : currentPage.appStoreUrl,
        aboutTitle: parseJsonField(req.body.aboutTitle, currentPage.aboutTitle),
        aboutCopy: parseJsonField(req.body.aboutCopy, currentPage.aboutCopy),
        readMoreLabel: parseJsonField(
          req.body.readMoreLabel,
          currentPage.readMoreLabel
        ),
        readMoreUrl:
          typeof req.body.readMoreUrl === 'string'
            ? req.body.readMoreUrl
            : currentPage.readMoreUrl,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/contact-page',
  adminAuth,
  contactUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const teamHeading = parseJsonField(req.body.teamHeading, settings.contactPage.teamHeading);
    const teamMembers = parseJsonField(req.body.teamMembers, settings.contactPage.teamMembers);
    const paymentCard = parseJsonField(
      req.body.paymentCard,
      settings.contactPage.paymentCard || settings.homeTeam.paymentCard
    );
    const providedHeroImage = parseJsonField(req.body.image, settings.contactPage.image);
    const fileMap = new Map((req.files || []).map((file) => [file.fieldname, file]));
    const processedTeamImages = await Promise.all(
      teamMembers.map(async (_member, index) => {
        const file = fileMap.get(`contactTeamImage_${index}`);
        if (!file) {
          return null;
        }

        return processUploadedImage({
          file,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.contactTeamMember,
        });
      })
    );
    const processedHeroImage = fileMap.get('contactHeroImage')
      ? await processUploadedImage({
          file: fileMap.get('contactHeroImage'),
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.hero,
        })
      : null;
    const nextHeroImage = processedHeroImage
      ? mergeImageMetadata(processedHeroImage, settings.contactPage.image, providedHeroImage)
      : providedHeroImage
        ? mergeImageMetadata(null, settings.contactPage.image, providedHeroImage)
        : settings.contactPage.image;

    const nextTeamMembers = teamMembers.map((member, index) => ({
      ...(settings.contactPage.teamMembers[index] || {}),
      ...member,
      image: processedTeamImages[index]
        ? mergeImageMetadata(
            processedTeamImages[index],
            settings.contactPage.teamMembers[index]?.image,
            member.image
          )
        : member.image || settings.contactPage.teamMembers[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      homeTeam: {
        ...settings.homeTeam,
        heading: teamHeading,
        paymentCard,
        members: nextTeamMembers,
      },
      contactPage: {
        ...settings.contactPage,
        image: nextHeroImage,
        teamHeading,
        paymentCard,
        teamMembers: nextTeamMembers,
        formTitle: parseJsonField(req.body.formTitle, settings.contactPage.formTitle),
        nameLabel: parseJsonField(req.body.nameLabel, settings.contactPage.nameLabel),
        emailLabel: parseJsonField(req.body.emailLabel, settings.contactPage.emailLabel),
        messageLabel: parseJsonField(req.body.messageLabel, settings.contactPage.messageLabel),
        submitLabel: parseJsonField(req.body.submitLabel, settings.contactPage.submitLabel),
        companyName: req.body.companyName || settings.contactPage.companyName,
        companyReg: req.body.companyReg || settings.contactPage.companyReg,
        address: parseJsonField(req.body.address, settings.contactPage.address),
        bankLine1: req.body.bankLine1 || settings.contactPage.bankLine1,
        bankLine2: req.body.bankLine2 || settings.contactPage.bankLine2,
        email: req.body.email || settings.contactPage.email,
        phone: req.body.phone || settings.contactPage.phone,
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.put(
  '/admin/free-tour-schedule',
  adminAuth,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const currentEffectiveSlots = getEffectiveFreeTourSlots(settings.freeTourSchedule);
    const cancellationReason = String(req.body.cancellationReason || '')
      .trim()
      .slice(0, 2000);
    const nextSchedule = normalizeFreeTourSchedule(
      parseJsonField(req.body.freeTourSchedule, settings.freeTourSchedule)
    );
    const requestedEmailTemplates = parseJsonField(req.body.emailTemplates, null);
    const legacyFreeTourEmails = parseJsonField(req.body.freeTourEmails, null);
    const nextEmails = normalizeSiteEmailTemplates(
      requestedEmailTemplates || {
        ...settings.emailTemplates,
        ...(legacyFreeTourEmails
          ? {
              freeTourConfirmation: legacyFreeTourEmails.confirmation,
              freeTourCancellation: legacyFreeTourEmails.cancellation,
            }
          : {}),
      },
      legacyFreeTourEmails
    );
    const nextEffectiveSlots = getEffectiveFreeTourSlots(nextSchedule);
    const nextSlotIds = new Set(nextEffectiveSlots.map((slot) => slot.id));
    const removedSlots = currentEffectiveSlots.filter((slot) => !nextSlotIds.has(slot.id));
    const removedSlotIds = removedSlots.map((slot) => slot.id);
    const removedBookingCount = removedSlots.reduce(
      (total, slot) => total + Math.max(0, Number(slot.bookings) || 0),
      0
    );

    if (removedBookingCount > 0 && !cancellationReason) {
      res.status(400).json({
        message: 'Please enter a cancellation reason before saving changes that cancel bookings.',
      });
      return;
    }

    const nextSettings = {
      ...settings,
      freeTourSchedule: nextSchedule,
      emailTemplates: nextEmails,
    };

    await writeSiteSettings(nextSettings);

    const cancelledBookings = await cancelFreeTourBookingsForSlotIds(removedSlotIds);

    if (cancelledBookings.length > 0) {
      await sendFreeTourCancellationEmails(cancelledBookings, { cancellationReason });
    }

    res.json(await readSiteSettings());
  })
);

router.put(
  '/admin/footer',
  adminAuth,
  footerUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const imageFile = req.files?.gpsImageFile?.[0];
    const providedGpsImage = parseJsonField(req.body.gpsImage, settings.footer.gpsImage);
    const processedGpsImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.footerGps,
        })
      : null;
    const nextGpsImage = processedGpsImage
      ? mergeImageMetadata(processedGpsImage, settings.footer.gpsImage, providedGpsImage)
      : providedGpsImage
        ? mergeImageMetadata(null, settings.footer.gpsImage, providedGpsImage)
        : settings.footer.gpsImage;

    const nextSettings = {
      ...settings,
      footer: {
        ...settings.footer,
        freeTourHeading: parseJsonField(req.body.freeTourHeading, settings.footer.freeTourHeading),
        firstTime: parseJsonField(req.body.firstTime, settings.footer.firstTime),
        secondTime: parseJsonField(req.body.secondTime, settings.footer.secondTime),
        languageLine: parseJsonField(req.body.languageLine, settings.footer.languageLine),
        durationLine: parseJsonField(req.body.durationLine, settings.footer.durationLine),
        distanceLine: parseJsonField(req.body.distanceLine, settings.footer.distanceLine),
        startingPointLine: parseJsonField(
          req.body.startingPointLine,
          settings.footer.startingPointLine
        ),
        openMapLabel: parseJsonField(req.body.openMapLabel, settings.footer.openMapLabel),
        openMapUrl: req.body.openMapUrl || settings.footer.openMapUrl,
        gpsHeading: parseJsonField(req.body.gpsHeading, settings.footer.gpsHeading),
        gpsCopy: parseJsonField(req.body.gpsCopy, settings.footer.gpsCopy),
        gpsButtonLabel: parseJsonField(req.body.gpsButtonLabel, settings.footer.gpsButtonLabel),
        gpsUrl: req.body.gpsUrl || settings.footer.gpsUrl,
        gpsImage: nextGpsImage,
        followUsHeading: parseJsonField(req.body.followUsHeading, settings.footer.followUsHeading),
        contactHeading: parseJsonField(req.body.contactHeading, settings.footer.contactHeading),
        companyName: req.body.companyName || settings.footer.companyName,
        companyReg: req.body.companyReg || settings.footer.companyReg,
        email: req.body.email || settings.footer.email,
        phone: req.body.phone || settings.footer.phone,
        address: parseJsonField(req.body.address, settings.footer.address),
        socialLinks: parseJsonField(req.body.socialLinks, settings.footer.socialLinks),
      },
    };

    const saved = await writeSiteSettings(nextSettings);
    res.json(saved);
  })
);

router.use((error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error?.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      message: 'Image file is too large. Maximum raw upload size is 25 MB before optimization.',
    });
    return;
  }

  res.status(400).json({ message: error.message || 'Site settings request failed.' });
});

module.exports = router;
