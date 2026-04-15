const crypto = require('crypto');

const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const adminAuth = require('../middleware/adminAuth');
const { getPublicStoryEvents, readStoryEvents, writeStoryEvents } = require('../lib/storyEventsStore');
const { runtimeStoryUploadsDir } = require('../lib/storagePaths');
const { IMAGE_PRESETS, processUploadedImage } = require('../lib/uploadedImageProcessor');

const router = express.Router();

const storyUploadsDir = runtimeStoryUploadsDir;

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
    fileSize: 8 * 1024 * 1024,
  },
});

const uploadFields = upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'galleryFiles', maxCount: 8 },
]);

const normalizePayload = (body, existing = {}) => {
  const year = Number(body.year);
  const order = Number(body.order);
  const mediaType = Number(body.mediaType);

  return {
    ...existing,
    year: Number.isFinite(year) ? year : existing.year || new Date().getFullYear(),
    order: Number.isFinite(order) ? order : existing.order || 1,
    mediaType: Number.isFinite(mediaType) ? mediaType : existing.mediaType || 0,
    title: (body.title || existing.title || '').trim(),
    title_estonian: (body.title_estonian || existing.title_estonian || '').trim(),
    description: body.description || existing.description || '',
    description_estonian:
      body.description_estonian || existing.description_estonian || '',
    video: (body.video || existing.video || '').trim(),
  };
};

const cleanMediaForType = async (event, files, existing = {}) => {
  const next = { ...event };
  const singleFile = files?.imageFile?.[0];
  const galleryFiles = files?.galleryFiles || [];

  if (next.mediaType === 0) {
    next.image = singleFile
      ? await processUploadedImage({
          file: singleFile,
          outputDir: storyUploadsDir,
          publicPathPrefix: '/uploads/story',
          preset: IMAGE_PRESETS.storyMedia,
        })
      : existing.image || next.image || null;
    next.images = [];
    next.video = '';
  } else if (next.mediaType === 1) {
    next.images = galleryFiles.length
      ? await Promise.all(
          galleryFiles.map((file) =>
            processUploadedImage({
              file,
              outputDir: storyUploadsDir,
              publicPathPrefix: '/uploads/story',
              preset: IMAGE_PRESETS.storyMedia,
            })
          )
        )
      : existing.images || next.images || [];
    next.image = null;
    next.video = '';
  } else if (next.mediaType === 2) {
    next.image = null;
    next.images = [];
  } else {
    next.mediaType = 0;
    next.image = singleFile
      ? await processUploadedImage({
          file: singleFile,
          outputDir: storyUploadsDir,
          publicPathPrefix: '/uploads/story',
          preset: IMAGE_PRESETS.storyMedia,
        })
      : existing.image || null;
    next.images = [];
    next.video = '';
  }

  return next;
};

const reindexYearEvents = (events, candidate, excludedId = null) => {
  const targetYear = Number(candidate.year);
  const targetOrder = Math.max(1, Number(candidate.order) || 1);
  const otherEvents = events.filter((event) => event._id !== excludedId && Number(event.year) !== targetYear);
  const yearEvents = events
    .filter((event) => event._id !== excludedId && Number(event.year) === targetYear)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const nextYearEvents = [];
  let inserted = false;
  let order = 1;

  yearEvents.forEach((event) => {
    if (!inserted && order === targetOrder) {
      nextYearEvents.push({ ...candidate, order });
      inserted = true;
      order += 1;
    }

    nextYearEvents.push({ ...event, order });
    order += 1;
  });

  if (!inserted) {
    nextYearEvents.push({ ...candidate, order });
  }

  return [...otherEvents, ...nextYearEvents];
};

const reindexAllYears = (events) => {
  const yearCounters = new Map();

  return events
    .slice()
    .sort((a, b) => (a.year === b.year ? a.order - b.order : a.year - b.year))
    .map((event) => {
      const year = Number(event.year);
      const nextOrder = (yearCounters.get(year) || 0) + 1;
      yearCounters.set(year, nextOrder);
      return { ...event, order: nextOrder };
    });
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const language = req.query.language === 'ee' ? 'ee' : 'en';
    const events = await getPublicStoryEvents(language);
    res.json(events);
  })
);

router.get(
  '/admin',
  adminAuth,
  asyncHandler(async (_req, res) => {
    const events = await readStoryEvents();
    res.json(events);
  })
);

router.post(
  '/admin',
  adminAuth,
  uploadFields,
  asyncHandler(async (req, res) => {
    const events = await readStoryEvents();
    const base = normalizePayload(req.body);
    const nextEvent = await cleanMediaForType(
      {
        ...base,
        _id: crypto.randomUUID(),
      },
      req.files
    );

    const saved = await writeStoryEvents(reindexYearEvents(events, nextEvent));
    res.status(201).json(saved);
  })
);

router.put(
  '/admin/:id',
  adminAuth,
  uploadFields,
  asyncHandler(async (req, res) => {
    const events = await readStoryEvents();
    const existing = events.find((event) => event._id === req.params.id);

    if (!existing) {
      res.status(404);
      throw new Error('Story event not found.');
    }

    const updated = await cleanMediaForType(normalizePayload(req.body, existing), req.files, existing);
    updated._id = existing._id;

    const saved = await writeStoryEvents(reindexYearEvents(events, updated, existing._id));

    res.json(saved);
  })
);

router.delete(
  '/admin/:id',
  adminAuth,
  asyncHandler(async (req, res) => {
    const events = await readStoryEvents();
    const filtered = events.filter((event) => event._id !== req.params.id);

    if (filtered.length === events.length) {
      res.status(404);
      throw new Error('Story event not found.');
    }

    const saved = await writeStoryEvents(reindexAllYears(filtered));
    res.json(saved);
  })
);

router.use((error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  res.status(400).json({ message: error.message || 'Story event request failed.' });
});

module.exports = router;
