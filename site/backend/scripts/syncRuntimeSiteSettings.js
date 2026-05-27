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

const main = async () => {
  const [runtimeSettings, bundledSettings] = await Promise.all([
    readJson(runtimeSiteSettingsFile),
    readJson(bundledSiteSettingsFile),
  ]);

  const changed = syncHomeServiceImageAlt(runtimeSettings, bundledSettings);

  if (!changed) {
    console.log('No runtime site settings changes were needed.');
    return;
  }

  await fs.writeFile(runtimeSiteSettingsFile, `${JSON.stringify(runtimeSettings, null, 2)}\n`, 'utf8');
  console.log(`Synced ${changed} service image alt text entr${changed === 1 ? 'y' : 'ies'} into runtime site settings.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
