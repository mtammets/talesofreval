import { resolveSiteImage } from '../content/siteSettingsDefaults';
import AdminModalShell from './AdminModalShell';

function HomeServicesEditorModal({
  heading,
  items,
  imageFiles,
  setImageFiles,
  onSave,
  onCancel,
  isSaving,
}) {
  const updateHeading = (language, value) => {
    heading.set((current) => ({
      ...current,
      [language]: value,
    }));
  };

  const updateItemTitle = (index, language, value) => {
    items.set((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              title: {
                ...item.title,
                [language]: value,
              },
            }
          : item
      )
    );
  };

  const updateItemDescription = (index, language, value) => {
    items.set((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              description: {
                ...item.description,
                [language]: value,
              },
            }
          : item
      )
    );
  };

  const setItemFile = (index, file) => {
    setImageFiles((current) => ({
      ...current,
      [index]: file,
    }));
  };

  return (
    <AdminModalShell
      eyebrow="Services library"
      title="Edit services"
      description="Update the shared services content used across the site."
      onClose={onCancel}
      wide
    >
        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
            <label>
              Heading (EN)
              <input
                type="text"
                value={heading.value.en}
                onChange={(event) => updateHeading('en', event.target.value)}
              />
            </label>
            <label>
              Heading (ET)
              <input
                type="text"
                value={heading.value.ee}
                onChange={(event) => updateHeading('ee', event.target.value)}
              />
            </label>
          </div>

          {items.value.map((item, index) => (
            <div key={item.key} className="home-editor-card">
              <div className="story-admin-grid two">
                <label>
                  Card title (EN)
                  <input
                    type="text"
                    value={item.title.en}
                    onChange={(event) => updateItemTitle(index, 'en', event.target.value)}
                  />
                </label>
                <label>
                  Card title (ET)
                  <input
                    type="text"
                    value={item.title.ee}
                    onChange={(event) => updateItemTitle(index, 'ee', event.target.value)}
                  />
                </label>
              </div>
              <div className="story-admin-grid two">
                <label>
                  Description (EN)
                  <textarea
                    rows="4"
                    value={item.description?.en || ''}
                    onChange={(event) => updateItemDescription(index, 'en', event.target.value)}
                  />
                </label>
                <label>
                  Description (ET)
                  <textarea
                    rows="4"
                    value={item.description?.ee || ''}
                    onChange={(event) => updateItemDescription(index, 'ee', event.target.value)}
                  />
                </label>
              </div>
              <label>
                Card image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setItemFile(index, event.target.files?.[0] || null)}
                />
                {resolveSiteImage(item.image, item.imageKey) ? (
                  <div className="editor-inline-preview">
                    <span className="story-admin-help">Current image</span>
                    <div
                      className="editor-inline-preview__image"
                      style={{
                        backgroundImage: `url(${resolveSiteImage(item.image, item.imageKey)})`,
                      }}
                    />
                  </div>
                ) : null}
                {imageFiles[index] ? (
                  <span className="story-admin-help">Selected: {imageFiles[index].name}</span>
                ) : null}
              </label>
            </div>
          ))}

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

export default HomeServicesEditorModal;
