const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

const {
  DEFAULT_SITE_EMAIL_TEMPLATES,
  renderSiteEmailTemplate,
} = require('../lib/siteEmailTemplates');
const { upsertFreeTourBooking } = require('../lib/freeTourBookingsStore');
const { createFreeTourSlotId, getEffectiveFreeTourSlots } = require('../lib/freeTourSchedule');
const { readSiteSettings } = require('../lib/siteSettingsStore');

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return String(value).toLowerCase() === 'true';
};

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = Number(process.env.SMTP_PORT || 25);
const SMTP_SECURE = parseBoolean(process.env.SMTP_SECURE, false);
const SMTP_REJECT_UNAUTHORIZED = parseBoolean(process.env.SMTP_REJECT_UNAUTHORIZED, false);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const DEFAULT_MAIL_FROM = 'info@talesofreval.ee';
const MAIL_FROM_VALUE = process.env.MAIL_FROM || DEFAULT_MAIL_FROM;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || process.env.MAIL_SIGNATURE_NAME || 'Tales of Reval';
const MAIL_TO = process.env.MAIL_TO || 'info@talesofreval.ee';
const MAIL_BCC = String(process.env.MAIL_BCC || '').trim();

const resolveMailFrom = (value, name) => {
  const normalizedValue = String(value || '').trim() || DEFAULT_MAIL_FROM;

  if (normalizedValue.includes('<') && normalizedValue.includes('>')) {
    return normalizedValue;
  }

  const normalizedName = String(name || '').trim();

  if (!normalizedName) {
    return normalizedValue;
  }

  return {
    address: normalizedValue,
    name: normalizedName,
  };
};

const MAIL_FROM = resolveMailFrom(MAIL_FROM_VALUE, MAIL_FROM_NAME);

const withDefaultBcc = (message = {}) => {
  if (!MAIL_BCC) {
    return message;
  }

  const existingBcc = String(message.bcc || '').trim();

  return {
    ...message,
    bcc: existingBcc ? `${existingBcc}, ${MAIL_BCC}` : MAIL_BCC,
  };
};

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
  tls: {
    rejectUnauthorized: SMTP_REJECT_UNAUTHORIZED,
  },
});

const safeConsoleWrite = (method, ...args) => {
  try {
    if (typeof console?.[method] === 'function') {
      console[method](...args);
    }
  } catch (_error) {
    // Ignore logging transport errors so a successful mail send cannot crash the request.
  }
};

const sendNodeEmail = async (msg) => {
  try {
    const info = await transporter.sendMail(withDefaultBcc(msg));
    safeConsoleWrite('log', 'Email sent successfully', info);
    return 1;
  } catch (error) {
    safeConsoleWrite('error', 'Error sending email:', error);
    return 0;
  }
};

const formatBookingDate = (dateString, time = '') => {
  const parsed = new Date(dateString);
  const dateLabel = Number.isNaN(parsed.getTime()) ? dateString : parsed.toDateString();
  return time ? `${dateLabel} at ${time}` : dateLabel;
};

const wrapSiteEmailHtml = (content, minHeight = 220) => `
  <div style="width: 500px; min-height: ${minHeight}px; font-family: Arial, sans-serif; color:black !important;">
    ${content}
  </div>
`;

const resolveFreeTourSlot = (settings, date, time) => {
  const slotId = createFreeTourSlotId(String(date || '').trim(), String(time || '').trim());

  return getEffectiveFreeTourSlots(settings.freeTourSchedule).find((slot) => slot.id === slotId) || null;
};

const normalizeFreeTourPeople = (value) => {
  const resolved = Number.parseInt(value, 10);

  if (!Number.isFinite(resolved)) {
    return 1;
  }

  return Math.min(99, Math.max(1, resolved));
};

const buildFreeTourMailData = (mailData = {}, slot = {}) => ({
  ...mailData,
  date: slot.date,
  time: slot.time,
  people: normalizeFreeTourPeople(mailData.people),
  name: String(mailData.name || '').trim(),
  email: String(mailData.email || '').trim(),
  dateObject: {
    date: slot.date,
    time: slot.time,
  },
});

const buildSiteEmailTokens = (mailData = {}) => ({
  event_type: String(mailData.eventType || '').trim(),
  date_1: formatBookingDate(mailData.dateObject?.date || mailData.date, mailData.time),
  date_2: formatBookingDate(mailData.dateObject?.date || mailData.date),
  time: String(mailData.time || '').trim(),
  people: normalizeFreeTourPeople(mailData.people),
  name: String(mailData.name || '').trim(),
  email: String(mailData.email || '').trim(),
  message: String(mailData.message || '').trim(),
  cancelled_list: String(mailData.cancelled_list || '').trim(),
});

const renderEmailMessage = (templateEntry, tokens, fallbackEntry) =>
  renderSiteEmailTemplate(templateEntry, tokens, fallbackEntry);

const sendBookingTor = async (mailData, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(mailData),
    DEFAULT_SITE_EMAIL_TEMPLATES.bookingAdmin
  );

  return sendNodeEmail({
    to: MAIL_TO,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 300),
    replyTo: mailData.email,
  });
};

const sendBookingClient = async (mailData, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(mailData),
    DEFAULT_SITE_EMAIL_TEMPLATES.bookingClient
  );

  return sendNodeEmail({
    to: mailData.email,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 300),
  });
};

const sendBookingEmail = asyncHandler(async (req, res) => {
  const settings = await readSiteSettings();
  const info = await sendBookingTor(req.body, settings.emailTemplates?.bookingAdmin);
  const clientInfo = await sendBookingClient(req.body, settings.emailTemplates?.bookingClient);

  if (info === 1 && clientInfo === 1) {
    res.status(200).json(info);
  } else {
    res.status(400).json(info < clientInfo ? info : clientInfo);
  }
});

const sendContactTor = async (mailData, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(mailData),
    DEFAULT_SITE_EMAIL_TEMPLATES.contactAdmin
  );

  return sendNodeEmail({
    to: MAIL_TO,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 240),
    replyTo: mailData.email,
  });
};

const sendContactClient = async (mailData, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(mailData),
    DEFAULT_SITE_EMAIL_TEMPLATES.contactClient
  );

  return sendNodeEmail({
    to: mailData.email,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 240),
  });
};

const sendContactEmail = asyncHandler(async (req, res) => {
  const settings = await readSiteSettings();
  const info = await sendContactTor(req.body, settings.emailTemplates?.contactAdmin);
  const clientInfo = await sendContactClient(req.body, settings.emailTemplates?.contactClient);

  if (info === 1 && clientInfo === 1) {
    res.status(200).json(info);
  } else {
    res.status(400).json(info < clientInfo ? info : clientInfo);
  }
});

const sendFreeTourTor = async (mailData, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(mailData),
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourAdmin
  );

  return sendNodeEmail({
    to: MAIL_TO,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 180),
    replyTo: mailData.email,
  });
};

const sendFreeTourClient = async (mailData, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(mailData),
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourConfirmation
  );

  return sendNodeEmail({
    to: mailData.email,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 280),
  });
};

const sendFreeTourCancellationClient = async (booking, templateEntry) => {
  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens(booking),
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourCancellation
  );

  return sendNodeEmail({
    to: booking.email,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 240),
  });
};

const sendFreeTourCancellationAdminSummary = async (cancelledBookings, templateEntry) => {
  if (!Array.isArray(cancelledBookings) || cancelledBookings.length === 0) {
    return 1;
  }

  const cancelledList = cancelledBookings
    .map(
      (booking) =>
        `${formatBookingDate(booking.date, booking.time)} - ${booking.name || 'Unnamed guest'} (${booking.email})`
    )
    .join('\n');

  const renderedTemplate = renderEmailMessage(
    templateEntry,
    buildSiteEmailTokens({ cancelled_list: cancelledList }),
    DEFAULT_SITE_EMAIL_TEMPLATES.freeTourCancellationSummary
  );

  return sendNodeEmail({
    to: MAIL_TO,
    from: MAIL_FROM,
    subject: renderedTemplate.subject,
    html: wrapSiteEmailHtml(renderedTemplate.html, 220),
  });
};

const sendFreeTourEmail = asyncHandler(async (req, res) => {
  const settings = await readSiteSettings();
  const slot = resolveFreeTourSlot(settings, req.body?.date, req.body?.time);

  if (!slot) {
    res.status(409).json({
      message: 'The selected free tour slot is no longer available.',
    });
    return;
  }

  const bookingResult = await upsertFreeTourBooking({
    date: slot.date,
    time: slot.time,
    email: req.body?.email,
    name: req.body?.name,
    people: req.body?.people,
  });
  const freeTourMailData = buildFreeTourMailData(req.body, slot);

  if (bookingResult.created) {
    await sendFreeTourTor(freeTourMailData, settings.emailTemplates?.freeTourAdmin);
  }

  await sendFreeTourClient(freeTourMailData, settings.emailTemplates?.freeTourConfirmation);
  res.status(200).json(1);
});

const sendFreeTourCancellationEmails = async (cancelledBookings = []) => {
  if (!Array.isArray(cancelledBookings) || cancelledBookings.length === 0) {
    return 1;
  }

  const settings = await readSiteSettings();

  for (const booking of cancelledBookings) {
    await sendFreeTourCancellationClient(booking, settings.emailTemplates?.freeTourCancellation);
  }

  await sendFreeTourCancellationAdminSummary(
    cancelledBookings,
    settings.emailTemplates?.freeTourCancellationSummary
  );
  return 1;
};

module.exports = {
  sendBookingEmail,
  sendContactEmail,
  sendFreeTourEmail,
  sendFreeTourCancellationEmails,
};
