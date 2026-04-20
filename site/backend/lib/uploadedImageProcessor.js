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
    variantWidths: [768, 1024, 1280, 1440, 1920, 2560, 2880],
    maxWidth: 2880,
    resizeMode: 'preserve',
  },
  serviceCard: {
    label: 'Service card',
    width: 640,
    height: 520,
    quality: 80,
    variantWidths: [320, 480, 640, 960, 1280],
  },
  teamMember: {
    label: 'Team image',
    width: 520,
    height: 520,
    quality: 80,
    variantWidths: [260, 520, 780, 1040],
  },
  contactTeamMember: {
    label: 'Contact team image',
    width: 520,
    height: 420,
    quality: 80,
    variantWidths: [260, 520, 780, 1040],
  },
  footerGps: {
    label: 'GPS image',
    width: 800,
    height: 560,
    quality: 80,
    variantWidths: [400, 800, 1200, 1600],
  },
  storyMedia: {
    label: 'Story image',
    width: 1200,
    height: 760,
    quality: 82,
    variantWidths: [600, 900, 1200, 1800, 2400],
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

const shouldPreserveAspectRatio = (preset) => preset?.resizeMode === 'preserve';

const readUploadedFileInput = async (file) => {
  if (file?.buffer) {
    return file.buffer;
  }

  if (file?.path) {
    return fs.readFile(file.path);
  }

  throw new Error('Could not read uploaded image file.');
};

const buildVariantWidths = (preset, maxWidth) => {
  const configuredWidths = Array.isArray(preset.variantWidths) ? preset.variantWidths : [];
  const candidateWidths = [...configuredWidths, preset.width, maxWidth]
    .filter((width) => Number(width) > 0 && Number(width) <= maxWidth)
    .map((width) => Math.round(width));

  return [...new Set(candidateWidths)].sort((left, right) => left - right);
};

const pickDefaultVariant = (variants, preset) => {
  if (!variants.length) {
    return null;
  }

  if (shouldPreserveAspectRatio(preset)) {
    return (
      variants.find((variant) => canCover(variant.width, variant.height, preset.width, preset.height)) ||
      variants[variants.length - 1] ||
      null
    );
  }

  return (
    variants.find((variant) => variant.width === preset.width) ||
    variants.find((variant) => variant.width >= preset.width) ||
    variants[variants.length - 1] ||
    null
  );
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

  const input = await readUploadedFileInput(file);
  const metadata = await sharp(input).rotate().metadata();
  const outputSize = resolveOutputSize(metadata, preset);
  const sourceWidth = Number(metadata.width) || 0;
  const sourceHeight = Number(metadata.height) || 0;
  const maxVariantWidth = Math.min(
    sourceWidth,
    Number(preset.maxWidth) > 0 ? Number(preset.maxWidth) : sourceWidth
  );
  const variantWidths = buildVariantWidths(
    preset,
    shouldPreserveAspectRatio(preset) ? maxVariantWidth : outputSize.width
  );
  const assetId = `${Date.now()}-${crypto.randomUUID()}`;

  await fs.mkdir(outputDir, { recursive: true });

  const variants = [];

  for (const width of variantWidths) {
    const height = shouldPreserveAspectRatio(preset)
      ? Math.max(1, Math.round((width / sourceWidth) * sourceHeight))
      : Math.round((width / preset.width) * preset.height);
    const filename = `${assetId}-${width}w.webp`;
    const outputPath = path.join(outputDir, filename);

    const transform = sharp(input).rotate();

    if (shouldPreserveAspectRatio(preset)) {
      transform.resize({
        width,
        withoutEnlargement: true,
      });
    } else {
      transform.resize({
        width,
        height,
        fit: 'cover',
        position: sharp.strategy.attention,
      });
    }

    await transform
      .webp({
        quality: preset.quality,
        effort: WEBP_EFFORT,
      })
      .toFile(outputPath);

    variants.push({
      src: `${publicPathPrefix}/${filename}`,
      width,
      height,
      format: 'webp',
    });
  }

  const originalBaseName = file.originalname.replace(/\.[^.]+$/, '') || 'image';
  const defaultVariant = pickDefaultVariant(variants, preset);

  return {
    src: defaultVariant?.src || '',
    name: `${originalBaseName}.webp`,
    width: defaultVariant?.width || preset.width,
    height: defaultVariant?.height || preset.height,
    format: 'webp',
    pixelRatio: outputSize.pixelRatio,
    variants,
  };
};

module.exports = {
  IMAGE_PRESETS,
  processUploadedImage,
};
