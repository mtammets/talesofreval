const fs = require('fs/promises');
const { runtimeStoryEventsFile } = require('./storagePaths');

const DATA_FILE = runtimeStoryEventsFile;

const normalizeImageZoom = (value, fallback = 1) => {
  const resolvedValue = Number(value);

  if (!Number.isFinite(resolvedValue)) {
    return fallback;
  }

  return Math.min(2.5, Math.max(1, Number(resolvedValue.toFixed(2))));
};

const imageVariantShape = (variant = {}) => ({
  src: variant.src || '',
  width: Number(variant.width) || 1200,
  height: Number(variant.height) || 760,
  format: variant.format || 'webp',
});

const defaultImageShape = (image = {}) => ({
  ...(() => {
    const variants = Array.isArray(image.variants)
      ? image.variants
          .map(imageVariantShape)
          .filter((variant) => variant.src)
          .sort((left, right) => left.width - right.width)
      : [];
    const preferredVariant =
      variants.find((variant) => variant.src === image.src) ||
      variants.find((variant) => variant.width >= 1200) ||
      variants[variants.length - 1] ||
      null;

    return {
      src: image.src || preferredVariant?.src || '',
      name: image.name || '',
      width: Number(image.width) || preferredVariant?.width || 1200,
      height: Number(image.height) || preferredVariant?.height || 760,
      format: image.format || preferredVariant?.format || '',
      pixelRatio:
        Number(image.pixelRatio) ||
        (variants.some((variant) => variant.width >= 2400) ? 2 : 1),
      focusX: Number(image.focusX) >= 0 ? Number(image.focusX) : 50,
      focusY: Number(image.focusY) >= 0 ? Number(image.focusY) : 50,
      zoom: normalizeImageZoom(image.zoom, 1),
      variants,
    };
  })(),
});

const normalizeEventShape = (event) => ({
  _id: event._id,
  year: Number(event.year) || new Date().getFullYear(),
  order: Number(event.order) || 1,
  mediaType: Number(event.mediaType) || 0,
  image: event.image ? defaultImageShape(event.image) : null,
  images: Array.isArray(event.images) ? event.images.map(defaultImageShape) : [],
  video: event.video || '',
  title: event.title || '',
  title_estonian: event.title_estonian || '',
  description: event.description || '',
  description_estonian: event.description_estonian || '',
});

const sortEvents = (events) =>
  events
    .slice()
    .sort((a, b) => (a.year === b.year ? a.order - b.order : a.year - b.year));

const readStoryEvents = async () => {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const events = JSON.parse(raw);
  return sortEvents(events.map(normalizeEventShape));
};

const writeStoryEvents = async (events) => {
  const normalized = sortEvents(events.map(normalizeEventShape));
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
};

const applyLanguage = (event, language = 'en') => {
  if (language !== 'ee') {
    return event;
  }

  return {
    ...event,
    title: event.title_estonian || event.title,
    title_estonian: event.title,
    description: event.description_estonian || event.description,
    description_estonian: event.description,
  };
};

const getPublicStoryEvents = async (language = 'en') => {
  const events = await readStoryEvents();
  return events.map((event) => applyLanguage(event, language));
};

module.exports = {
  readStoryEvents,
  writeStoryEvents,
  getPublicStoryEvents,
};
