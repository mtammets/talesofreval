const path = require('path');
const crypto = require('crypto');

const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const adminAuth = require('../middleware/adminAuth');
const { readSiteSettings, writeSiteSettings } = require('../lib/siteSettingsStore');
const { runtimeSiteUploadsDir } = require('../lib/storagePaths');

const router = express.Router();

const siteUploadsDir = runtimeSiteUploadsDir;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, siteUploadsDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = extension || '.bin';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
  },
});

const upload = multer({
  storage,
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

const toImageShape = (file, width = 1440, height = 700) => ({
  src: `/uploads/site/${file.filename}`,
  name: file.originalname,
  width,
  height,
});

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

    const nextSettings = {
      ...settings,
      homeHero: {
        ...settings.homeHero,
        titleLine1: parseJsonField(req.body.titleLine1, settings.homeHero.titleLine1),
        titleLine2: parseJsonField(req.body.titleLine2, settings.homeHero.titleLine2),
        subtitle: parseJsonField(req.body.subtitle, settings.homeHero.subtitle),
        image: imageFile ? toImageShape(imageFile) : settings.homeHero.image,
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

    const nextItems = items.map((item, index) => ({
      ...settings.homeServices.items[index],
      ...item,
      image: fileMap.get(`serviceImage_${index}`)
        ? toImageShape(fileMap.get(`serviceImage_${index}`), 640, 520)
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

    const fileMap = new Map((req.files || []).map((file) => [file.fieldname, file]));

    const nextMembers = members.map((member, index) => ({
      ...settings.homeTeam.members[index],
      ...member,
      image: fileMap.get(`teamImage_${index}`)
        ? toImageShape(fileMap.get(`teamImage_${index}`), 520, 520)
        : member.image || settings.homeTeam.members[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      homeTeam: {
        ...settings.homeTeam,
        heading,
        members: nextMembers,
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

    const nextTeamMembers = teamMembers.map((member, index) => ({
      ...settings.contactPage.teamMembers[index],
      ...member,
      image: fileMap.get(`contactTeamImage_${index}`)
        ? toImageShape(fileMap.get(`contactTeamImage_${index}`), 520, 420)
        : member.image || settings.contactPage.teamMembers[index]?.image || null,
    }));

    const nextSettings = {
      ...settings,
      contactPage: {
        ...settings.contactPage,
        image: fileMap.get('contactHeroImage')
          ? toImageShape(fileMap.get('contactHeroImage'))
          : settings.contactPage.image,
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
        gpsImage: imageFile ? toImageShape(imageFile, 800, 560) : settings.footer.gpsImage,
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
