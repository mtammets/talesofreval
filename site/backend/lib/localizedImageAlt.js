const trimText = (value = '') => String(value || '').trim();

const normalizeLocalizedImageAlt = (value) => {
  if (typeof value === 'string') {
    const trimmed = trimText(value);

    return trimmed
      ? {
          en: trimmed,
          ee: trimmed,
        }
      : undefined;
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const fallback = trimText(value.en || value.ee || '');
  const en = trimText(value.en || fallback);
  const ee = trimText(value.ee || fallback);

  if (!en && !ee) {
    return undefined;
  }

  return { en, ee };
};

const getLocalizedImageAlt = (value, language = 'en', fallback = '') => {
  const normalized = normalizeLocalizedImageAlt(value);

  if (!normalized) {
    return fallback;
  }

  if (language === 'ee') {
    return normalized.ee || normalized.en || fallback;
  }

  return normalized.en || normalized.ee || fallback;
};

module.exports = {
  getLocalizedImageAlt,
  normalizeLocalizedImageAlt,
};
