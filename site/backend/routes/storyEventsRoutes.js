const path = require('path');
const crypto = require('crypto');

const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const adminAuth = require('../middleware/adminAuth');
const { getPublicStoryEvents, readStoryEvents, writeStoryEvents } = require('../lib/storyEventsStore');

const router = express.Router();

const storyUploadsDir = path.join(__dirname, '..', 'uploads', 'story');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, storyUploadsDir),
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
    fileSize: 8 * 1024 * 1024,
  },
});

const uploadFields = upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'galleryFiles', maxCount: 8 },
]);

const toImageShape = (file) => ({
  src: `/uploads/story/${file.filename}`,
  name: file.originalname,
  width: 1200,
  height: 760,
});

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

const cleanMediaForType = (event, files, existing = {}) => {
  const next = { ...event };
  const singleFile = files?.imageFile?.[0];
  const galleryFiles = files?.galleryFiles || [];

  if (next.mediaType === 0) {
    next.image = singleFile ? toImageShape(singleFile) : existing.image || next.image || null;
    next.images = [];
    next.video = '';
  } else if (next.mediaType === 1) {
    next.images = galleryFiles.length
      ? galleryFiles.map(toImageShape)
      : existing.images || next.images || [];
    next.image = null;
    next.video = '';
  } else if (next.mediaType === 2) {
    next.image = null;
    next.images = [];
  } else {
    next.mediaType = 0;
    next.image = singleFile ? toImageShape(singleFile) : existing.image || null;
    next.images = [];
    next.video = '';
  }

  return next;
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
    const nextEvent = cleanMediaForType(
      {
        ...base,
        _id: crypto.randomUUID(),
      },
      req.files
    );

    const saved = await writeStoryEvents([...events, nextEvent]);
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

    const updated = cleanMediaForType(normalizePayload(req.body, existing), req.files, existing);
    updated._id = existing._id;

    const saved = await writeStoryEvents(
      events.map((event) => (event._id === existing._id ? updated : event))
    );

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

    const saved = await writeStoryEvents(filtered);
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
