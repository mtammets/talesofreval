const DEFAULT_SIGNATURE_NAME = 'Tales of Reval';
const DEFAULT_CONTACT_EMAIL = 'info@talesofreval.ee';
const DEFAULT_SIGNATURE_PHONE = '+372 5560 4421';
const DEFAULT_WEBSITE = 'https://www.talesofreval.ee';

export const FREE_TOUR_EMAIL_TEMPLATE_TOKENS = Object.freeze([
  Object.freeze({ token: '{date_1}', label: 'Booked time' }),
  Object.freeze({ token: '{date_2}', label: 'Date only' }),
  Object.freeze({ token: '{time}', label: 'Time' }),
  Object.freeze({ token: '{name}', label: 'Guest name' }),
  Object.freeze({ token: '{people}', label: 'Group size' }),
  Object.freeze({ token: '{email}', label: 'Guest email' }),
]);

const FREE_TOUR_EMAIL_TOKEN_LOOKUP = new Map(
  FREE_TOUR_EMAIL_TEMPLATE_TOKENS.map((entry) => [entry.token, entry])
);

export const DEFAULT_FREE_TOUR_EMAIL_TEMPLATES = Object.freeze({
  confirmation: Object.freeze({
    subject: 'Free Tour Booking Confirmation',
    body: `<p>Greetings!</p>
<p>Your free tour is booked for <strong>{date_1}</strong>.</p>
<p>I'm glad you're coming to Tallinn and happy that you've found us! We'll gladly take you along to the journey.</p>
<p>We shall go on our beloved lower old town walking tour, where instead of names and numbers we focus on telling a single binding narrative about the Hanseatic Merchants that built Reval - medieval Tallinn. During the 1.5h performance we will bring to life the dream and the vision of the founders of this one of the best preserved medieval towns in the world, and through the magic of storytelling paint you a vivid picture about the values and mindset of these ancestors of ours</p>
<p>Feel free to have a look at the trailer here: <a href="https://youtu.be/uMjk83r54Vg" rel="noopener noreferrer" target="_blank">https://youtu.be/uMjk83r54Vg</a>.</p>
<p>What makes the tour special is our unique combination of guiding, storytelling and street performance. Instead of a dry monologue your guide, dressed in an authentic 15th century merchant's outfit, will involve the audience into the telling of the stories and together you will act through some of the most well known legends and bits of medieval history. The result is an interactive and engaging 90 minutes at the end of which you will be both well entertained and actually be able to remember the stories you hear.</p>
<p>The route of the tour you can see here and the show will be donation based. You can leave the tip in cash - there is an ATM at the end-point, in the Old Town Square - or we've set up virtual payments through PayPal, Revolut and Wise.</p>
<p>Please note that your guide will be on the street in a fully authentic 15th century merchant outfit, so they won't be looking at their phones 20 minutes prior to the show - if you're late, there's no point in writing or calling at the last minute. If you miss the guide, please go to the Tourist Information Centre (Niguliste 2), and ask them to point you in the right direction.</p>
<p>See you on the show!</p>`,
  }),
  cancellation: Object.freeze({
    subject: 'Free Tour Booking Cancellation',
    body: `Greetings!

We are sorry to let you know that the free tour registration below has been cancelled.
Tour date: {date_1}
Name: {name}

If you would like to join another tour, please visit ${DEFAULT_WEBSITE} or contact us at ${DEFAULT_CONTACT_EMAIL}.

With warm regards

${DEFAULT_SIGNATURE_NAME}
${DEFAULT_WEBSITE}
${DEFAULT_CONTACT_EMAIL}
${DEFAULT_SIGNATURE_PHONE}`,
  }),
});

const normalizeTemplateEntry = (entry = {}, fallbackEntry) => ({
  subject:
    typeof entry?.subject === 'string' && entry.subject.trim()
      ? entry.subject
      : fallbackEntry.subject,
  body:
    typeof entry?.body === 'string' && entry.body.trim()
      ? entry.body
      : fallbackEntry.body,
});

export const normalizeFreeTourEmailTemplates = (templates = {}) => ({
  confirmation: normalizeTemplateEntry(
    templates?.confirmation,
    DEFAULT_FREE_TOUR_EMAIL_TEMPLATES.confirmation
  ),
  cancellation: normalizeTemplateEntry(
    templates?.cancellation,
    DEFAULT_FREE_TOUR_EMAIL_TEMPLATES.cancellation
  ),
});

const replaceTemplateTokens = (value, tokens = {}) =>
  Object.entries(tokens).reduce((result, [token, replacement]) => {
    const safeToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return result.replace(new RegExp(`\\{${safeToken}\\}`, 'g'), String(replacement ?? ''));
  }, String(value || ''));

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value) => escapeHtml(value).replace(/`/g, '&#96;');

const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));

const createLinkifiedParagraph = (value) =>
  escapeHtml(value).replace(
    /(https?:\/\/[^\s<]+)/gi,
    (url) => `<a href="${escapeAttribute(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(url)}</a>`
  );

const plainTextToHtml = (value) => {
  const normalizedText = String(value || '').replace(/\r\n/g, '\n').trim();

  if (!normalizedText) {
    return '';
  }

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${createLinkifiedParagraph(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const decodeHtmlEntities = (value) => {
  if (typeof document === 'undefined') {
    return String(value || '');
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = String(value || '');
  return textarea.value;
};

const htmlToEditableText = (value) => {
  const html = String(value || '').trim();

  if (!html) {
    return '';
  }

  const withLinksExpanded = html.replace(
    /<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_, __, href, content) => {
      const linkText = content.replace(/<[^>]+>/g, '').trim();
      return linkText && linkText !== href ? `${linkText} (${href})` : href;
    }
  );

  const withParagraphs = withLinksExpanded
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
    .replace(/<\/li>\s*<li[^>]*>/gi, '\n');

  return decodeHtmlEntities(
    withParagraphs
      .replace(/<\/?(p|div|li|ul|ol|strong|em|span|section|article|body|html)[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const buildTokenChipMarkup = ({ token, label }) =>
  `<span class="free-tour-calendar-editor__merge-token" data-free-tour-token="${escapeAttribute(token)}" contenteditable="false">${escapeHtml(label)}</span>`;

const replaceCanonicalTokensWithChips = (value) =>
  FREE_TOUR_EMAIL_TEMPLATE_TOKENS.reduce(
    (result, entry) => result.split(entry.token).join(buildTokenChipMarkup(entry)),
    String(value || '')
  );

const replaceTokenChipElements = (value, multiline) => {
  if (typeof document === 'undefined') {
    return String(value || '');
  }

  const container = document.createElement('div');
  container.innerHTML = String(value || '');

  container.querySelectorAll('[data-free-tour-token]').forEach((node) => {
    const token = node.getAttribute('data-free-tour-token') || '';
    node.replaceWith(document.createTextNode(token));
  });

  return multiline
    ? container.innerHTML.trim()
    : (container.textContent || '').replace(/\s+/g, ' ').trim();
};

export const toFreeTourEmailEditorSubjectHtml = (value) =>
  replaceCanonicalTokensWithChips(escapeHtml(String(value || '')));

export const toFreeTourEmailEditorBodyHtml = (value) => {
  const source = looksLikeHtml(value) ? String(value || '') : plainTextToHtml(value);
  return replaceCanonicalTokensWithChips(source);
};

export const toStoredFreeTourEmailSubject = (value) =>
  replaceTokenChipElements(value, false);

export const toStoredFreeTourEmailBody = (value) => {
  const normalized = replaceTokenChipElements(value, true);

  if (!normalized) {
    return '';
  }

  return looksLikeHtml(normalized) ? normalized : plainTextToHtml(normalized);
};

export const toFreeTourEmailReadableBody = (value) => {
  const source = looksLikeHtml(value) ? htmlToEditableText(value) : String(value || '').trim();

  return FREE_TOUR_EMAIL_TEMPLATE_TOKENS.reduce((result, entry) => {
    return result.split(entry.token).join(entry.label);
  }, source);
};

export const getFreeTourEmailTemplateToken = (token) =>
  FREE_TOUR_EMAIL_TOKEN_LOOKUP.get(token) || null;

const formatTemplateDate = (dateString, time = '') => {
  const parsed = new Date(dateString);
  const dateLabel = Number.isNaN(parsed.getTime()) ? dateString : parsed.toDateString();
  return time ? `${dateLabel} at ${time}` : dateLabel;
};

export const buildFreeTourEmailPreviewTokens = ({
  date = '2099-06-15',
  time = '13:00',
  name = 'John Doe',
  people = 2,
  email = 'john@example.com',
} = {}) => ({
  date_1: formatTemplateDate(date, time),
  date_2: formatTemplateDate(date),
  time,
  name,
  people,
  email,
});

export const renderFreeTourEmailTemplatePreview = (
  templateEntry,
  tokens = {},
  fallbackEntry = DEFAULT_FREE_TOUR_EMAIL_TEMPLATES.confirmation
) => {
  const normalized = normalizeTemplateEntry(templateEntry, fallbackEntry);
  const renderedSubject = replaceTemplateTokens(normalized.subject, tokens);
  const renderedBodySource = replaceTemplateTokens(normalized.body, tokens);

  return {
    subject: renderedSubject,
    html: looksLikeHtml(renderedBodySource)
      ? renderedBodySource
      : plainTextToHtml(renderedBodySource),
  };
};
