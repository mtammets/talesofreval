export const encodeBasicToken = (username, password) =>
  window.btoa(`${username}:${password}`);

export const htmlToEditorText = (html = '') =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/^<p>/i, '')
    .replace(/<\/p>$/i, '')
    .replace(/<[^>]+>/g, '')
    .trim();

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const editorTextToHtml = (text = '') => {
  const trimmed = text.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

export const createEmptyStoryEventForm = (year = new Date().getFullYear()) => ({
  _id: '',
  year,
  order: 1,
  mediaType: 0,
  title: '',
  title_estonian: '',
  description: '',
  description_estonian: '',
  video: '',
  image: null,
  images: [],
});

export const mapStoryEventToForm = (event) => ({
  _id: event._id,
  year: event.year,
  order: event.order,
  mediaType: Number(event.mediaType) || 0,
  title: event.title || '',
  title_estonian: event.title_estonian || '',
  description: htmlToEditorText(event.description || ''),
  description_estonian: htmlToEditorText(event.description_estonian || ''),
  video: event.video || '',
  image: event.image || null,
  images: Array.isArray(event.images) ? event.images : [],
});

export const applyStoryEventLanguage = (event, language = 'en') => ({
  ...event,
  title: language === 'ee' ? event.title_estonian || event.title : event.title,
  description:
    language === 'ee'
      ? event.description_estonian || event.description
      : event.description,
});
