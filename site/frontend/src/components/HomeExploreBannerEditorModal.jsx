import AdminModalShell from './AdminModalShell';

function HomeExploreBannerEditorModal({
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

  const updateValue = (key, value) => {
    setContent((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <AdminModalShell
      eyebrow="Virtual tour"
      title="Edit virtual tour banner"
      description="Update the homepage teaser copy and store links for the virtual tour block."
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
            Read more label (EN)
            <input
              type="text"
              value={content.readMoreLabel.en}
              onChange={(event) => updateLocalized('readMoreLabel', 'en', event.target.value)}
            />
          </label>
          <label>
            Read more label (ET)
            <input
              type="text"
              value={content.readMoreLabel.ee}
              onChange={(event) => updateLocalized('readMoreLabel', 'ee', event.target.value)}
            />
          </label>
        </div>
        <div className="story-admin-grid two">
          <label>
            Google Play URL
            <input
              type="url"
              value={content.googlePlayUrl}
              onChange={(event) => updateValue('googlePlayUrl', event.target.value)}
            />
          </label>
          <label>
            App Store URL
            <input
              type="url"
              value={content.appStoreUrl}
              onChange={(event) => updateValue('appStoreUrl', event.target.value)}
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

export default HomeExploreBannerEditorModal;
