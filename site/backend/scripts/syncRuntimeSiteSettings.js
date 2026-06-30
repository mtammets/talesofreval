const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const {
  runtimeSiteSettingsFile,
} = require('../lib/storagePaths');
const { normalizeLocalizedImageAlt } = require('../lib/localizedImageAlt');

const bundledSiteSettingsFile = path.join(__dirname, '..', 'data', 'site-settings.json');

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const syncHomeServiceImageAlt = (runtimeSettings = {}, bundledSettings = {}) => {
  const runtimeItems = Array.isArray(runtimeSettings.homeServices?.items)
    ? runtimeSettings.homeServices.items
    : [];
  const bundledItems = Array.isArray(bundledSettings.homeServices?.items)
    ? bundledSettings.homeServices.items
    : [];
  const bundledMap = new Map(
    bundledItems
      .filter((item) => item?.key)
      .map((item) => [item.key, item])
  );

  let changed = 0;

  for (const runtimeItem of runtimeItems) {
    if (!runtimeItem?.key) {
      continue;
    }

    const bundledItem = bundledMap.get(runtimeItem.key);
    const bundledAlt = normalizeLocalizedImageAlt(bundledItem?.image?.alt);

    if (!bundledAlt) {
      continue;
    }

    if (!runtimeItem.image || typeof runtimeItem.image !== 'object') {
      runtimeItem.image = { ...bundledItem.image };
      changed += 1;
      continue;
    }

    const runtimeAlt = normalizeLocalizedImageAlt(runtimeItem.image.alt);

    if (runtimeAlt) {
      continue;
    }

    runtimeItem.image.alt = bundledAlt;
    changed += 1;
  }

  return changed;
};

const hasBlankTemplateValues = (template = {}) =>
  !String(template?.subject || '').trim() || !String(template?.body || '').trim();

const isLegacyBookingClientTemplate = (template = {}) => {
  const subject = String(template?.subject || '').trim();
  const body = String(template?.body || '').trim();

  return (
    subject === 'Copy of Booking Email' &&
    body.includes('received your booking request') &&
    body.includes('confirm the details of your booking')
  );
};

const syncBookingClientEmailTemplate = (runtimeSettings = {}, bundledSettings = {}) => {
  const bundledTemplate = bundledSettings.emailTemplates?.bookingClient;

  if (!bundledTemplate?.subject || !bundledTemplate?.body) {
    return 0;
  }

  if (!runtimeSettings.emailTemplates || typeof runtimeSettings.emailTemplates !== 'object') {
    runtimeSettings.emailTemplates = {};
  }

  const runtimeTemplate = runtimeSettings.emailTemplates.bookingClient;
  const shouldSync =
    !runtimeTemplate ||
    hasBlankTemplateValues(runtimeTemplate) ||
    isLegacyBookingClientTemplate(runtimeTemplate);

  if (!shouldSync) {
    return 0;
  }

  if (
    runtimeTemplate?.subject === bundledTemplate.subject &&
    runtimeTemplate?.body === bundledTemplate.body
  ) {
    return 0;
  }

  runtimeSettings.emailTemplates.bookingClient = { ...bundledTemplate };
  return 1;
};

const main = async () => {
  const [runtimeSettings, bundledSettings] = await Promise.all([
    readJson(runtimeSiteSettingsFile),
    readJson(bundledSiteSettingsFile),
  ]);

  const syncedServiceImageAltCount = syncHomeServiceImageAlt(runtimeSettings, bundledSettings);
  const syncedBookingClientTemplateCount = syncBookingClientEmailTemplate(
    runtimeSettings,
    bundledSettings
  );
  const changed = syncedServiceImageAltCount + syncedBookingClientTemplateCount;

  if (!changed) {
    console.log('No runtime site settings changes were needed.');
    return;
  }

  await fs.writeFile(runtimeSiteSettingsFile, `${JSON.stringify(runtimeSettings, null, 2)}\n`, 'utf8');
  const changeSummary = [];

  if (syncedServiceImageAltCount > 0) {
    changeSummary.push(
      `${syncedServiceImageAltCount} service image alt text entr${
        syncedServiceImageAltCount === 1 ? 'y' : 'ies'
      }`
    );
  }

  if (syncedBookingClientTemplateCount > 0) {
    changeSummary.push(
      `${syncedBookingClientTemplateCount} booking client email template entr${
        syncedBookingClientTemplateCount === 1 ? 'y' : 'ies'
      }`
    );
  }

  console.log(`Synced ${changeSummary.join(' and ')} into runtime site settings.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
