const getSafeString = (value) => (typeof value === 'string' ? value : '');

export const createHomeHeroDraftImageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `hero-draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getRetainedHomeHeroDraftKey = (image, index = 0) => {
  const src = getSafeString(image?.src);
  return src ? `retained:${src}` : `retained-index:${index}`;
};

export const getSelectedHomeHeroDraftKey = (image, index = 0) => {
  const draftId = getSafeString(image?.draftId);
  return draftId ? `new:${draftId}` : `new-index:${index}`;
};

export const getInitialHomeHeroDefaultDraftKey = (images = [], defaultImageSrc = '') => {
  if (!Array.isArray(images) || !images.length) {
    return '';
  }

  const matchingImage = images.find((image) => image?.src === defaultImageSrc) || images[0];
  return getRetainedHomeHeroDraftKey(matchingImage, images.indexOf(matchingImage));
};
