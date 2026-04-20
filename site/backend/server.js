const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.set('trust proxy', 1);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
const {
  ensureRuntimeStorageReady,
  runtimeSiteUploadsDir,
  runtimeStoryUploadsDir,
} = require('./lib/storagePaths');
ensureRuntimeStorageReady();

const uploadStaticOptions = {
  immutable: true,
  maxAge: '365d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
};

const port = process.env.PORT || 3000;
const adminRoutes = require('./routes/adminRoutes');
const emailRoutes = require('./routes/emailRoutes');
const storyEventsRoutes = require('./routes/storyEventsRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/email', emailRoutes);
app.use('/uploads/story', express.static(runtimeStoryUploadsDir, uploadStaticOptions));
app.use('/uploads/site', express.static(runtimeSiteUploadsDir, uploadStaticOptions));
app.use('/api/admin', adminRoutes);
app.use('/api/story-events', storyEventsRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'sitemap.xml'));
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/older', express.static(path.join(__dirname, '../../htdocs/old_webste/')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
