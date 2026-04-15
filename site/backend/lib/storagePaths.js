const fs = require('fs');
const path = require('path');

const backendRoot = path.join(__dirname, '..');
const bundledDataDir = path.join(backendRoot, 'data');
const bundledUploadsDir = path.join(backendRoot, 'uploads');

const runtimeRoot = process.env.APP_STORAGE_DIR
  ? path.resolve(process.env.APP_STORAGE_DIR)
  : backendRoot;

const runtimeDataDir = path.join(runtimeRoot, 'data');
const runtimeUploadsDir = path.join(runtimeRoot, 'uploads');
const runtimeStoryUploadsDir = path.join(runtimeUploadsDir, 'story');
const runtimeSiteUploadsDir = path.join(runtimeUploadsDir, 'site');

const runtimeSiteSettingsFile = path.join(runtimeDataDir, 'site-settings.json');
const runtimeStoryEventsFile = path.join(runtimeDataDir, 'story-events.json');

const seedFileIfMissing = (targetFile, sourceFile) => {
  if (fs.existsSync(targetFile)) {
    return;
  }

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
  }
};

const ensureRuntimeStorageReady = () => {
  fs.mkdirSync(runtimeDataDir, { recursive: true });
  fs.mkdirSync(runtimeStoryUploadsDir, { recursive: true });
  fs.mkdirSync(runtimeSiteUploadsDir, { recursive: true });

  seedFileIfMissing(runtimeSiteSettingsFile, path.join(bundledDataDir, 'site-settings.json'));
  seedFileIfMissing(runtimeStoryEventsFile, path.join(bundledDataDir, 'story-events.json'));
};

module.exports = {
  backendRoot,
  runtimeRoot,
  runtimeDataDir,
  runtimeStoryUploadsDir,
  runtimeSiteUploadsDir,
  runtimeSiteSettingsFile,
  runtimeStoryEventsFile,
  ensureRuntimeStorageReady,
  usingExternalStorage: runtimeRoot !== backendRoot,
  bundledUploadsDir,
  bundledDataDir,
};
