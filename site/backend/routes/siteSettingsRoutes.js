const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const adminAuth = require('../middleware/adminAuth');
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
    fileSize: 10 * 1024 * 1024,
  },
});

const heroUpload = upload.fields([{ name: 'imageFile', maxCount: 1 }]);
const servicesUpload = upload.any();
const teamUpload = upload.any();
const reviewUpload = upload.none();
const contactUpload = upload.any();
const footerUpload = upload.fields([{ name: 'gpsImageFile', maxCount: 1 }]);
const servicePageContentUpload = upload.any();
const servicePageKeys = new Set(['team', 'private', 'quick', 'destination', 'wedding']);

const parseJsonField = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
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
  heroUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const imageFile = req.files?.imageFile?.[0];
    const processedHeroImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.hero,
        })
      : null;

    const nextSettings = {
      ...settings,
      homeHero: {
        ...settings.homeHero,
        titleLine1: parseJsonField(req.body.titleLine1, settings.homeHero.titleLine1),
        titleLine2: parseJsonField(req.body.titleLine2, settings.homeHero.titleLine2),
        subtitle: parseJsonField(req.body.subtitle, settings.homeHero.subtitle),
        image: processedHeroImage || settings.homeHero.image,
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
    const processedHeroImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.hero,
        })
      : null;

    const nextSettings = {
      ...settings,
      storyPage: {
        ...settings.storyPage,
        image: processedHeroImage || settings.storyPage.image,
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
    const processedHeroImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.hero,
        })
      : null;

    const nextSettings = {
      ...settings,
      servicePageHeroes: {
        ...settings.servicePageHeroes,
        [serviceKey]: {
          ...settings.servicePageHeroes?.[serviceKey],
          image: processedHeroImage || settings.servicePageHeroes?.[serviceKey]?.image || null,
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
        processedCardImages[index] ||
        card.image ||
        currentContent.cards?.[index]?.image ||
        null,
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
      image: processedImages[index] || item.image || settings.homeServices.items[index]?.image || null,
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
      ...settings.homeTeam.members[index],
      ...member,
      image: processedImages[index] || member.image || settings.homeTeam.members[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      homeTeam: {
        ...settings.homeTeam,
        heading,
        members: nextMembers,
      },
      contactPage: {
        ...settings.contactPage,
        teamHeading: heading,
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
  '/admin/contact-page',
  adminAuth,
  contactUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const teamHeading = parseJsonField(req.body.teamHeading, settings.contactPage.teamHeading);
    const teamMembers = parseJsonField(req.body.teamMembers, settings.contactPage.teamMembers);
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

    const nextTeamMembers = teamMembers.map((member, index) => ({
      ...settings.contactPage.teamMembers[index],
      ...member,
      image: processedTeamImages[index] || member.image || settings.contactPage.teamMembers[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      homeTeam: {
        ...settings.homeTeam,
        heading: teamHeading,
        members: nextTeamMembers,
      },
      contactPage: {
        ...settings.contactPage,
        image: processedHeroImage || settings.contactPage.image,
        teamHeading,
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
  '/admin/footer',
  adminAuth,
  footerUpload,
  asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    const imageFile = req.files?.gpsImageFile?.[0];
    const processedGpsImage = imageFile
      ? await processUploadedImage({
          file: imageFile,
          outputDir: siteUploadsDir,
          publicPathPrefix: '/uploads/site',
          preset: IMAGE_PRESETS.footerGps,
        })
      : null;

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
        gpsImage: processedGpsImage || settings.footer.gpsImage,
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

  res.status(400).json({ message: error.message || 'Site settings request failed.' });
});

module.exports = router;
