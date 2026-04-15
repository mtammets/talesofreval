const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const WEBP_EFFORT = 6;

const IMAGE_PRESETS = {
  hero: {
    label: 'Hero',
    width: 1440,
    height: 700,
    quality: 82,
  },
  serviceCard: {
    label: 'Service card',
    width: 640,
    height: 520,
    quality: 80,
  },
  teamMember: {
    label: 'Team image',
    width: 520,
    height: 520,
    quality: 80,
  },
  contactTeamMember: {
    label: 'Contact team image',
    width: 520,
    height: 420,
    quality: 80,
  },
  footerGps: {
    label: 'GPS image',
    width: 800,
    height: 560,
    quality: 80,
  },
  storyMedia: {
    label: 'Story image',
    width: 1200,
    height: 760,
    quality: 82,
  },
};

const canCover = (sourceWidth, sourceHeight, targetWidth, targetHeight) =>
  Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight) <= 1;

const buildTooSmallMessage = (preset) =>
  `${preset.label} image is too small. Upload at least ${preset.width}x${preset.height}px. For retina sharpness, use at least ${preset.width * 2}x${preset.height * 2}px.`;

const resolveOutputSize = (metadata, preset) => {
  const sourceWidth = Number(metadata.width) || 0;
  const sourceHeight = Number(metadata.height) || 0;
  const retinaWidth = preset.width * 2;
  const retinaHeight = preset.height * 2;

  if (!sourceWidth || !sourceHeight) {
    throw new Error(`Could not read ${preset.label.toLowerCase()} image dimensions.`);
  }

  if (canCover(sourceWidth, sourceHeight, retinaWidth, retinaHeight)) {
    return {
      width: retinaWidth,
      height: retinaHeight,
      pixelRatio: 2,
    };
  }

  if (canCover(sourceWidth, sourceHeight, preset.width, preset.height)) {
    return {
      width: preset.width,
      height: preset.height,
      pixelRatio: 1,
    };
  }

  throw new Error(buildTooSmallMessage(preset));
};

const processUploadedImage = async ({
  file,
  outputDir,
  publicPathPrefix,
  preset,
}) => {
  if (!file) {
    return null;
  }

  const metadata = await sharp(file.buffer).rotate().metadata();
  const outputSize = resolveOutputSize(metadata, preset);
  const filename = `${Date.now()}-${crypto.randomUUID()}.webp`;
  const outputPath = path.join(outputDir, filename);

  await fs.mkdir(outputDir, { recursive: true });
  await sharp(file.buffer)
    .rotate()
    .resize({
      width: outputSize.width,
      height: outputSize.height,
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    .webp({
      quality: preset.quality,
      effort: WEBP_EFFORT,
    })
    .toFile(outputPath);

  const originalBaseName = file.originalname.replace(/\.[^.]+$/, '') || 'image';

  return {
    src: `${publicPathPrefix}/${filename}`,
    name: `${originalBaseName}.webp`,
    width: outputSize.width,
    height: outputSize.height,
    format: 'webp',
    pixelRatio: outputSize.pixelRatio,
  };
};

module.exports = {
  IMAGE_PRESETS,
  processUploadedImage,
};
