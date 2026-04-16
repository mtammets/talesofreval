const decodeHtml = (text = '') =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripTags = (text = '') => decodeHtml(text.replace(/<[^>]+>/g, ''));

const sanitizeLinkUrl = (url = '') => {
  const trimmed = url.trim();

  if (!trimmed) {
    return '';
  }

  return /^(https?:\/\/|mailto:|tel:)/i.test(trimmed) ? trimmed : '';
};

const renderInlineText = (text = '') => {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let html = '';
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    html += escapeHtml(text.slice(cursor, match.index));

    const label = match[1].trim();
    const href = sanitizeLinkUrl(match[2]);

    if (label && href) {
      html += `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(label)}</a>`;
    } else {
      html += escapeHtml(match[0]);
    }

    cursor = match.index + match[0].length;
  }

  html += escapeHtml(text.slice(cursor));

  return html.replace(/\n/g, '<br />');
};

export const htmlToEditorText = (html = '') =>
  decodeHtml(
    html
      .replace(
        /<a\b[^>]*href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi,
        (_, __, href, label) => `[${stripTags(label).trim()}](${decodeHtml(href).trim()})`
      )
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/^<p>/i, '')
      .replace(/<\/p>$/i, '')
      .replace(/<[^>]+>/g, '')
      .trim()
  );

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
    .map((paragraph) => `<p>${renderInlineText(paragraph)}</p>`)
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
