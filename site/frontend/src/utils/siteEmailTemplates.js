const DEFAULT_SIGNATURE_NAME = 'Tales of Reval';
const DEFAULT_CONTACT_EMAIL = 'info@talesofreval.ee';
const DEFAULT_SIGNATURE_PHONE = '+372 5560 4421';
const DEFAULT_WEBSITE = 'https://www.talesofreval.ee';

export const SITE_EMAIL_TEMPLATE_TOKENS = Object.freeze([
  Object.freeze({ key: 'event_type', token: '{event_type}', label: 'Service type' }),
  Object.freeze({ key: 'date_1', token: '{date_1}', label: 'Booked time' }),
  Object.freeze({ key: 'date_2', token: '{date_2}', label: 'Date only' }),
  Object.freeze({ key: 'time', token: '{time}', label: 'Time' }),
  Object.freeze({ key: 'name', token: '{name}', label: 'Guest name' }),
  Object.freeze({ key: 'people', token: '{people}', label: 'Group size' }),
  Object.freeze({ key: 'email', token: '{email}', label: 'Guest email' }),
  Object.freeze({ key: 'message', token: '{message}', label: 'Message' }),
  Object.freeze({ key: 'cancelled_list', token: '{cancelled_list}', label: 'Cancelled bookings list' }),
]);

const SITE_EMAIL_TOKEN_LOOKUP = new Map(
  SITE_EMAIL_TEMPLATE_TOKENS.map((entry) => [entry.token, entry])
);

export const DEFAULT_SITE_EMAIL_TEMPLATES = Object.freeze({
  freeTourConfirmation: Object.freeze({
    subject: 'Free Tour Booking Confirmation',
    body: `<p>Greetings!</p>
<p>Your free tour is booked for <strong>{date_1}</strong>.</p>
<p>I'm glad you're coming to Tallinn and happy that you've found us! We'll gladly take you along to the journey.</p>
<p>We shall go on our beloved lower old town walking tour, where instead of names and numbers we focus on telling a single binding narrative about the Hanseatic Merchants that built Reval - medieval Tallinn. During the 1.5h performance we will bring to life the dream and the vision of the founders of this one of the best preserved medieval towns in the world, and through the magic of storytelling paint you a vivid picture about the values and mindset of these ancestors of ours</p>
<p>Feel free to have a look at the trailer here: <a href="https://youtu.be/uMjk83r54Vg" rel="noopener noreferrer" target="_blank">https://youtu.be/uMjk83r54Vg</a>.</p>
<p>What makes the tour special is our unique combination of guiding, storytelling and street performance. Instead of a dry monologue your guide, dressed in an authentic 15th century merchant's outfit, will involve the audience into the telling of the stories and together you will act through some of the most well known legends and bits of medieval history. The result is an interactive and engaging 90 minutes at the end of which you will be both well entertained and actually be able to remember the stories you hear.</p>
<p>The route of the tour you can see here and the show will be donation based. You can leave the tip in cash - there is an ATM at the end-point, in the Old Town Square - or we've set up virtual payments through PayPal, Revolut and Wise.</p>
<p>Please note that your guide will be on the street in a fully authentic 15th century merchant's outfit, so they won't be looking at their phones 20 minutes prior to the show - if you're late, there's no point in writing or calling at the last minute. If you miss the guide, please go to the Tourist Information Centre (Niguliste 2), and ask them to point you in the right direction.</p>
<p>See you on the show!</p>`,
  }),
  freeTourCancellation: Object.freeze({
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
  freeTourAdmin: Object.freeze({
    subject: 'Free Tour Booking',
    body: `New free tour booking!

Email: {email}
Name: {name}
Booked time: {date_1}
Number of people: {people}`,
  }),
  freeTourCancellationSummary: Object.freeze({
    subject: 'Free Tour Booking Cancellation Summary',
    body: `The following free tour registrations were cancelled because their slot was removed:

{cancelled_list}`,
  }),
  bookingClient: Object.freeze({
    subject: 'Copy of Booking Email',
    body: `Greetings!

This is a confirmation that we have received your booking request.
We will get back to you as soon as possible to confirm the details of your booking.

Service type: {event_type}

With warm regards

${DEFAULT_SIGNATURE_NAME}
${DEFAULT_WEBSITE}
${DEFAULT_CONTACT_EMAIL}
${DEFAULT_SIGNATURE_PHONE}`,
  }),
  bookingAdmin: Object.freeze({
    subject: 'Tor Booking',
    body: `New booking inquiry.

Service type: {event_type}
Client name: {name}
Client email: {email}

Message:
{message}`,
  }),
  contactClient: Object.freeze({
    subject: 'Copy of Contact Us Email',
    body: `Greetings!

This message includes a copy of the email sent to ${DEFAULT_CONTACT_EMAIL} regarding your most recent contact us message.

Name: {name}
Email: {email}

Message:
{message}`,
  }),
  contactAdmin: Object.freeze({
    subject: 'Contact Us',
    body: `New contact request.

Name: {name}
Email: {email}

Message:
{message}`,
  }),
});

export const SITE_EMAIL_TEMPLATE_OPTIONS = Object.freeze([
  Object.freeze({
    key: 'freeTourConfirmation',
    label: 'Free tour confirmation',
    tabLabel: 'Confirmation',
    groupKey: 'freeTour',
    groupLabel: 'Free tour',
    audienceLabel: 'Client confirmation',
    subjectLabel: 'Free tour confirmation subject',
    bodyLabel: 'Free tour confirmation body',
    ariaLabel: 'Edit Free tour confirmation email',
    tokenKeys: ['date_1', 'date_2', 'time', 'name', 'people', 'email'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.freeTourConfirmation,
  }),
  Object.freeze({
    key: 'freeTourCancellation',
    label: 'Free tour cancellation',
    tabLabel: 'Cancellation',
    groupKey: 'freeTour',
    groupLabel: 'Free tour',
    audienceLabel: 'Client cancellation',
    subjectLabel: 'Free tour cancellation subject',
    bodyLabel: 'Free tour cancellation body',
    ariaLabel: 'Edit Free tour cancellation email',
    tokenKeys: ['date_1', 'date_2', 'time', 'name', 'people', 'email'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.freeTourCancellation,
  }),
  Object.freeze({
    key: 'freeTourAdmin',
    label: 'Free tour admin notice',
    tabLabel: 'Admin notice',
    groupKey: 'freeTour',
    groupLabel: 'Free tour',
    audienceLabel: 'Admin notification',
    subjectLabel: 'Free tour admin subject',
    bodyLabel: 'Free tour admin body',
    ariaLabel: 'Edit Free tour admin email',
    tokenKeys: ['date_1', 'date_2', 'time', 'name', 'people', 'email'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.freeTourAdmin,
  }),
  Object.freeze({
    key: 'freeTourCancellationSummary',
    label: 'Free tour cancellation summary',
    tabLabel: 'Cancelled slots',
    groupKey: 'freeTour',
    groupLabel: 'Free tour',
    audienceLabel: 'Admin summary',
    subjectLabel: 'Free tour cancellation summary subject',
    bodyLabel: 'Free tour cancellation summary body',
    ariaLabel: 'Edit Free tour cancellation summary email',
    tokenKeys: ['cancelled_list'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.freeTourCancellationSummary,
  }),
  Object.freeze({
    key: 'bookingClient',
    label: 'Book now client confirmation',
    tabLabel: 'Client confirmation',
    groupKey: 'booking',
    groupLabel: 'Book now',
    audienceLabel: 'Client confirmation',
    subjectLabel: 'Book now client subject',
    bodyLabel: 'Book now client body',
    ariaLabel: 'Edit Book now client email',
    tokenKeys: ['event_type', 'name', 'email', 'message'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.bookingClient,
  }),
  Object.freeze({
    key: 'bookingAdmin',
    label: 'Book now admin notice',
    tabLabel: 'Admin notice',
    groupKey: 'booking',
    groupLabel: 'Book now',
    audienceLabel: 'Admin notification',
    subjectLabel: 'Book now admin subject',
    bodyLabel: 'Book now admin body',
    ariaLabel: 'Edit Book now admin email',
    tokenKeys: ['event_type', 'name', 'email', 'message'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.bookingAdmin,
  }),
  Object.freeze({
    key: 'contactClient',
    label: 'Contact us client copy',
    tabLabel: 'Client copy',
    groupKey: 'contact',
    groupLabel: 'Contact us',
    audienceLabel: 'Client copy',
    subjectLabel: 'Contact us client subject',
    bodyLabel: 'Contact us client body',
    ariaLabel: 'Edit Contact us client email',
    tokenKeys: ['name', 'email', 'message'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.contactClient,
  }),
  Object.freeze({
    key: 'contactAdmin',
    label: 'Contact us admin notice',
    tabLabel: 'Admin notice',
    groupKey: 'contact',
    groupLabel: 'Contact us',
    audienceLabel: 'Admin notification',
    subjectLabel: 'Contact us admin subject',
    bodyLabel: 'Contact us admin body',
    ariaLabel: 'Edit Contact us admin email',
    tokenKeys: ['name', 'email', 'message'],
    fallback: DEFAULT_SITE_EMAIL_TEMPLATES.contactAdmin,
  }),
]);

export const SITE_EMAIL_TEMPLATE_GROUPS = Object.freeze([
  Object.freeze({
    key: 'freeTour',
    label: 'Free tour',
    templateKeys: Object.freeze([
      'freeTourConfirmation',
      'freeTourCancellation',
      'freeTourAdmin',
      'freeTourCancellationSummary',
    ]),
  }),
  Object.freeze({
    key: 'booking',
    label: 'Book now',
    templateKeys: Object.freeze([
      'bookingClient',
      'bookingAdmin',
    ]),
  }),
  Object.freeze({
    key: 'contact',
    label: 'Contact us',
    templateKeys: Object.freeze([
      'contactClient',
      'contactAdmin',
    ]),
  }),
]);

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

export const normalizeSiteEmailTemplates = (templates = {}, legacyFreeTourTemplates = {}) => ({
  freeTourConfirmation: normalizeTemplateEntry(
    templates?.freeTourConfirmation || legacyFreeTourTemplates?.confirmation,
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourConfirmation
  ),
  freeTourCancellation: normalizeTemplateEntry(
    templates?.freeTourCancellation || legacyFreeTourTemplates?.cancellation,
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourCancellation
  ),
  freeTourAdmin: normalizeTemplateEntry(
    templates?.freeTourAdmin,
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourAdmin
  ),
  freeTourCancellationSummary: normalizeTemplateEntry(
    templates?.freeTourCancellationSummary,
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourCancellationSummary
  ),
  bookingClient: normalizeTemplateEntry(
    templates?.bookingClient,
    DEFAULT_SITE_EMAIL_TEMPLATES.bookingClient
  ),
  bookingAdmin: normalizeTemplateEntry(
    templates?.bookingAdmin,
    DEFAULT_SITE_EMAIL_TEMPLATES.bookingAdmin
  ),
  contactClient: normalizeTemplateEntry(
    templates?.contactClient,
    DEFAULT_SITE_EMAIL_TEMPLATES.contactClient
  ),
  contactAdmin: normalizeTemplateEntry(
    templates?.contactAdmin,
    DEFAULT_SITE_EMAIL_TEMPLATES.contactAdmin
  ),
});

const replaceTemplateTokens = (value, tokens = {}, formatter = (tokenValue) => String(tokenValue ?? '')) =>
  Object.entries(tokens).reduce((result, [token, replacement]) => {
    const safeToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return result.replace(new RegExp(`\\{${safeToken}\\}`, 'g'), formatter(replacement));
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

const buildTokenChipMarkup = ({ token, label }) =>
  `<span class="free-tour-calendar-editor__merge-token" data-free-tour-token="${escapeAttribute(token)}" contenteditable="false">${escapeHtml(label)}</span>`;

const replaceCanonicalTokensWithChips = (value) =>
  SITE_EMAIL_TEMPLATE_TOKENS.reduce(
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

export const toSiteEmailEditorSubjectHtml = (value) =>
  replaceCanonicalTokensWithChips(escapeHtml(String(value || '')));

export const toSiteEmailEditorBodyHtml = (value) => {
  const source = looksLikeHtml(value) ? String(value || '') : plainTextToHtml(value);
  return replaceCanonicalTokensWithChips(source);
};

export const toStoredSiteEmailSubject = (value) =>
  replaceTokenChipElements(value, false);

export const toStoredSiteEmailBody = (value) => {
  const normalized = replaceTokenChipElements(value, true);

  if (!normalized) {
    return '';
  }

  return looksLikeHtml(normalized) ? normalized : plainTextToHtml(normalized);
};

export const getSiteEmailTemplateToken = (token) =>
  SITE_EMAIL_TOKEN_LOOKUP.get(token) || null;

export const getSiteEmailTemplateOption = (templateKey) =>
  SITE_EMAIL_TEMPLATE_OPTIONS.find((entry) => entry.key === templateKey) || null;

const formatTemplateDate = (dateString, time = '') => {
  const parsed = new Date(dateString);
  const dateLabel = Number.isNaN(parsed.getTime()) ? dateString : parsed.toDateString();
  return time ? `${dateLabel} at ${time}` : dateLabel;
};

export const buildSiteEmailPreviewTokens = ({
  event_type = 'Private tour',
  date = '2099-06-15',
  time = '13:00',
  name = 'John Doe',
  people = 2,
  email = 'john@example.com',
  message = 'I would like to book a tour for Friday.\nPlease let me know the available options.',
  cancelled_list = 'Sun Jun 15 2099 at 13:00 - John Doe (john@example.com)\nMon Jun 16 2099 at 10:00 - Jane Doe (jane@example.com)',
} = {}) => ({
  event_type,
  date_1: formatTemplateDate(date, time),
  date_2: formatTemplateDate(date),
  time,
  name,
  people,
  email,
  message,
  cancelled_list,
});

export const renderSiteEmailTemplatePreview = (
  templateEntry,
  tokens = {},
  fallbackEntry = DEFAULT_SITE_EMAIL_TEMPLATES.freeTourConfirmation
) => {
  const normalized = normalizeTemplateEntry(templateEntry, fallbackEntry);
  const renderedSubject = replaceTemplateTokens(normalized.subject, tokens);
  const hasHtmlBody = looksLikeHtml(normalized.body);
  const renderedBodySource = replaceTemplateTokens(
    normalized.body,
    tokens,
    hasHtmlBody ? escapeHtml : (tokenValue) => String(tokenValue ?? '')
  );

  return {
    subject: renderedSubject,
    html: hasHtmlBody ? renderedBodySource : plainTextToHtml(renderedBodySource),
  };
};
