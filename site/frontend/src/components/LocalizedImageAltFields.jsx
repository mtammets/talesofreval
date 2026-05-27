import { normalizeLocalizedSiteTextValue } from '../content/siteSettingsDefaults';

function LocalizedImageAltFields({
  image = null,
  onChange = null,
  helperText = 'Describe what is visible in the image for SEO and screen readers.',
}) {
  const alt = normalizeLocalizedSiteTextValue(image?.alt);

  const updateAlt = (language, value) => {
    onChange?.({
      alt: {
        ...alt,
        [language]: value,
      },
    });
  };

  return (
    <>
      <div className="story-admin-grid two">
        <label>
          Alt text (EN)
          <input
            type="text"
            maxLength={180}
            value={alt.en}
            onChange={(event) => updateAlt('en', event.target.value)}
          />
        </label>
        <label>
          Alt text (ET)
          <input
            type="text"
            maxLength={180}
            value={alt.ee}
            onChange={(event) => updateAlt('ee', event.target.value)}
          />
        </label>
      </div>
      {helperText ? <p className="story-admin-help">{helperText}</p> : null}
    </>
  );
}

export default LocalizedImageAltFields;
