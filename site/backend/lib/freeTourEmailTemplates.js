const MAIL_TO = process.env.MAIL_TO || 'info@talesofreval.ee';
const MAIL_SIGNATURE_NAME = process.env.MAIL_SIGNATURE_NAME || 'Tales of Reval';
const MAIL_SIGNATURE_PHONE = process.env.MAIL_SIGNATURE_PHONE || '+372 5560 4421';
const MAIL_WEBSITE = process.env.MAIL_WEBSITE || 'https://www.talesofreval.ee';

const DEFAULT_FREE_TOUR_EMAIL_TEMPLATES = Object.freeze({
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

If you would like to join another tour, please visit ${MAIL_WEBSITE} or contact us at ${MAIL_TO}.

With warm regards

${MAIL_SIGNATURE_NAME}
${MAIL_WEBSITE}
${MAIL_TO}
${MAIL_SIGNATURE_PHONE}`,
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

const normalizeFreeTourEmailTemplates = (templates = {}) => ({
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

const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));

const plainTextToHtml = (value) => {
  const normalizedText = String(value || '').replace(/\r\n/g, '\n').trim();

  if (!normalizedText) {
    return '';
  }

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const renderFreeTourEmailTemplate = (templateEntry, tokens = {}, fallbackEntry) => {
  const fallback =
    fallbackEntry ||
    DEFAULT_FREE_TOUR_EMAIL_TEMPLATES.confirmation;
  const normalized = normalizeTemplateEntry(templateEntry, fallback);
  const renderedSubject = replaceTemplateTokens(normalized.subject, tokens);
  const renderedBodySource = replaceTemplateTokens(normalized.body, tokens);

  return {
    subject: renderedSubject,
    html: looksLikeHtml(renderedBodySource)
      ? renderedBodySource
      : plainTextToHtml(renderedBodySource),
  };
};

module.exports = {
  DEFAULT_FREE_TOUR_EMAIL_TEMPLATES,
  normalizeFreeTourEmailTemplates,
  renderFreeTourEmailTemplate,
};
