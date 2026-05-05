import AdminModalShell from './AdminModalShell';

function VirtualTourPageEditorModal({
  content,
  setContent,
  onSave,
  onCancel,
  isSaving,
}) {
  const updateLocalized = (key, language, value) => {
    setContent((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [language]: value,
      },
    }));
  };

  const updateFeatureItem = (index, language, value) => {
    setContent((current) => ({
      ...current,
      featureItems: current.featureItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [language]: value,
            }
          : item
      ),
    }));
  };

  const updateValue = (key, value) => {
    setContent((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <AdminModalShell
      eyebrow="Virtual tour"
      title="Edit virtual tour page"
      description="Update the copy, CTA labels, and outbound links shown on the dedicated virtual tour page."
      onClose={onCancel}
      wide
    >
      <form onSubmit={onSave} className="story-admin-form">
        <div className="story-admin-grid two">
          <label>
            Title line 1 (EN)
            <input
              type="text"
              value={content.titleLine1.en}
              onChange={(event) => updateLocalized('titleLine1', 'en', event.target.value)}
            />
          </label>
          <label>
            Title line 1 (ET)
            <input
              type="text"
              value={content.titleLine1.ee}
              onChange={(event) => updateLocalized('titleLine1', 'ee', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            Title line 2 (EN)
            <input
              type="text"
              value={content.titleLine2.en}
              onChange={(event) => updateLocalized('titleLine2', 'en', event.target.value)}
            />
          </label>
          <label>
            Title line 2 (ET)
            <input
              type="text"
              value={content.titleLine2.ee}
              onChange={(event) => updateLocalized('titleLine2', 'ee', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            Subtitle (EN)
            <input
              type="text"
              value={content.subtitle.en}
              onChange={(event) => updateLocalized('subtitle', 'en', event.target.value)}
            />
          </label>
          <label>
            Subtitle (ET)
            <input
              type="text"
              value={content.subtitle.ee}
              onChange={(event) => updateLocalized('subtitle', 'ee', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            Content title (EN)
            <input
              type="text"
              value={content.contentTitle.en}
              onChange={(event) => updateLocalized('contentTitle', 'en', event.target.value)}
            />
          </label>
          <label>
            Content title (ET)
            <input
              type="text"
              value={content.contentTitle.ee}
              onChange={(event) => updateLocalized('contentTitle', 'ee', event.target.value)}
            />
          </label>
        </div>
        {content.featureItems.map((item, index) => (
          <div key={`feature-${index}`} className="story-admin-grid two">
            <label>
              Feature {index + 1} (EN)
              <input
                type="text"
                value={item.en}
                onChange={(event) => updateFeatureItem(index, 'en', event.target.value)}
              />
            </label>
            <label>
              Feature {index + 1} (ET)
              <input
                type="text"
                value={item.ee}
                onChange={(event) => updateFeatureItem(index, 'ee', event.target.value)}
              />
            </label>
          </div>
        ))}
        <div className="story-admin-grid two">
          <label>
            Price label
            <input
              type="text"
              value={content.priceLabel}
              onChange={(event) => updateValue('priceLabel', event.target.value)}
            />
          </label>
          <label>
            Pay now label (EN)
            <input
              type="text"
              value={content.payNowLabel.en}
              onChange={(event) => updateLocalized('payNowLabel', 'en', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            Pay now label (ET)
            <input
              type="text"
              value={content.payNowLabel.ee}
              onChange={(event) => updateLocalized('payNowLabel', 'ee', event.target.value)}
            />
          </label>
          <label>
            Read more label (EN)
            <input
              type="text"
              value={content.readMoreLabel.en}
              onChange={(event) => updateLocalized('readMoreLabel', 'en', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            Read more label (ET)
            <input
              type="text"
              value={content.readMoreLabel.ee}
              onChange={(event) => updateLocalized('readMoreLabel', 'ee', event.target.value)}
            />
          </label>
          <label>
            About title (EN)
            <input
              type="text"
              value={content.aboutTitle.en}
              onChange={(event) => updateLocalized('aboutTitle', 'en', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            About title (ET)
            <input
              type="text"
              value={content.aboutTitle.ee}
              onChange={(event) => updateLocalized('aboutTitle', 'ee', event.target.value)}
            />
          </label>
          <label>
            About copy (EN)
            <textarea
              rows="5"
              value={content.aboutCopy.en}
              onChange={(event) => updateLocalized('aboutCopy', 'en', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            About copy (ET)
            <textarea
              rows="5"
              value={content.aboutCopy.ee}
              onChange={(event) => updateLocalized('aboutCopy', 'ee', event.target.value)}
            />
          </label>
          <label>
            Google Play URL
            <input
              type="url"
              value={content.googlePlayUrl}
              onChange={(event) => updateValue('googlePlayUrl', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            App Store URL
            <input
              type="url"
              value={content.appStoreUrl}
              onChange={(event) => updateValue('appStoreUrl', event.target.value)}
            />
          </label>
          <label>
            Read more URL
            <input
              type="url"
              value={content.readMoreUrl}
              onChange={(event) => updateValue('readMoreUrl', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-actions">
          <button
            type="submit"
            className="story-admin-button story-admin-button--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            className="story-admin-button story-admin-button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

export default VirtualTourPageEditorModal;
