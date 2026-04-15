const fs = require('fs/promises');
const { runtimeStoryEventsFile } = require('./storagePaths');

const DATA_FILE = runtimeStoryEventsFile;

const defaultImageShape = (image = {}) => ({
  src: image.src || '',
  name: image.name || '',
  width: Number(image.width) || 1200,
  height: Number(image.height) || 760,
  format: image.format || '',
  pixelRatio: Number(image.pixelRatio) || 1,
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
