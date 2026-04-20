const DEFAULT_QUALITY_STEPS = [0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode optimized image.'));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read image "${file.name}".`));
    };

    image.src = objectUrl;
  });

const replaceExtension = (filename = '', extension = '.webp') => {
  const baseName = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${baseName}${extension}`;
};

const fitWithin = (width, height, maxWidth, maxHeight) => {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const shouldTransformImage = ({ file, width, height, maxInputBytes, maxWidth, maxHeight }) =>
  file.size > maxInputBytes ||
  width > maxWidth ||
  height > maxHeight ||
  !/^image\/(jpeg|jpg|png|webp)$/i.test(file.type || '');

const buildCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const HERO_IMAGE_PREPARATION_OPTIONS = {
  maxInputBytes: 8 * 1024 * 1024,
  targetBytes: 6 * 1024 * 1024,
  maxUploadBytes: 24 * 1024 * 1024,
  maxWidth: 3200,
  maxHeight: 3200,
  outputType: 'image/webp',
  qualitySteps: DEFAULT_QUALITY_STEPS,
};

export const prepareImageFileForUpload = async (file, options = {}) => {
  if (!file) {
    return null;
  }

  const settings = {
    ...HERO_IMAGE_PREPARATION_OPTIONS,
    ...options,
  };
  const image = await loadImageElement(file);
  const targetDimensions = fitWithin(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    settings.maxWidth,
    settings.maxHeight
  );
  const needsTransform = shouldTransformImage({
    file,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    maxInputBytes: settings.maxInputBytes,
    maxWidth: settings.maxWidth,
    maxHeight: settings.maxHeight,
  });

  if (!needsTransform && file.size <= settings.maxUploadBytes) {
    return file;
  }

  const canvas = buildCanvas(targetDimensions.width, targetDimensions.height);
  const context = canvas.getContext('2d', { alpha: false });

  if (!context) {
    throw new Error('Could not open browser image processor.');
  }

  context.drawImage(image, 0, 0, targetDimensions.width, targetDimensions.height);

  let bestBlob = null;

  for (const quality of settings.qualitySteps) {
    const blob = await canvasToBlob(canvas, settings.outputType, quality);

    if (!bestBlob || blob.size < bestBlob.size) {
      bestBlob = blob;
    }

    if (blob.size <= settings.targetBytes) {
      bestBlob = blob;
      break;
    }
  }

  if (!bestBlob) {
    throw new Error('Could not optimize image for upload.');
  }

  if (bestBlob.size > settings.maxUploadBytes) {
    throw new Error(
      `Image "${file.name}" is still too large after optimization. Try a different source image.`
    );
  }

  return new File([bestBlob], replaceExtension(file.name, '.webp'), {
    type: bestBlob.type || settings.outputType,
    lastModified: Date.now(),
  });
};

export const prepareImageFilesForUpload = async (files = [], options = {}) => {
  const preparedFiles = [];

  for (const file of files) {
    const preparedFile = await prepareImageFileForUpload(file, options);

    if (preparedFile) {
      preparedFiles.push(preparedFile);
    }
  }

  return preparedFiles;
};
