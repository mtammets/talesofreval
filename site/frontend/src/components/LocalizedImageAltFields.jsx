import { normalizeLocalizedSiteTextValue } from '../content/siteSettingsDefaults';

function LocalizedImageAltFields({
  image = null,
  onChange = null,
  helperText = 'Describe what is visible in the image for SEO and screen readers.',
  layout = 'split',
  multiline = false,
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

  const FieldTag = multiline ? 'textarea' : 'input';
  const fieldGridClassName =
    layout === 'stacked'
      ? 'localized-image-alt-fields localized-image-alt-fields--stacked'
      : 'story-admin-grid two localized-image-alt-fields';

  const renderField = (language, label) => (
    <label>
      {label}
      <FieldTag
        {...(multiline
          ? { rows: 3 }
          : { type: 'text' })}
        maxLength={180}
        value={alt[language]}
        onChange={(event) => updateAlt(language, event.target.value)}
      />
    </label>
  );

  return (
    <>
      <div className={fieldGridClassName}>
        {renderField('en', 'Alt text (EN)')}
        {renderField('ee', 'Alt text (ET)')}
      </div>
      {helperText ? <p className="story-admin-help">{helperText}</p> : null}
    </>
  );
}

export default LocalizedImageAltFields;
