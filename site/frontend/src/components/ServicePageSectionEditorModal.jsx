import { resolveSiteImage } from '../content/siteSettingsDefaults';
import AdminModalShell from './AdminModalShell';

function ServicePageSectionEditorModal({
  mode = 'create',
  section,
  setSection,
  imageFile,
  setImageFile,
  onSave,
  onCancel,
  isSaving,
}) {
  const updateLocalized = (field, language, value) => {
    setSection((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [language]: value,
      },
    }));
  };

  const updateValue = (field, value) => {
    setSection((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const title = mode === 'create' ? 'Add section' : 'Edit section';

  return (
    <AdminModalShell
      eyebrow="Service section"
      title={title}
      description="Choose the layout, upload an image and edit the section copy."
      onClose={onCancel}
      wide
    >
      <form onSubmit={onSave} className="story-admin-form">
        <label>
          Layout
          <select
            value={section.layout}
            onChange={(event) => updateValue('layout', event.target.value)}
          >
            <option value="image-left">Image left, text right</option>
            <option value="image-right">Image right, text left</option>
          </select>
        </label>

        <label>
          Section image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          />
          {resolveSiteImage(section.image, section.imageKey) ? (
            <div className="editor-inline-preview">
              <span className="story-admin-help">Current image</span>
              <div
                className="editor-inline-preview__image"
                style={{
                  backgroundImage: `url(${resolveSiteImage(section.image, section.imageKey)})`,
                }}
              />
            </div>
          ) : null}
          {imageFile ? (
            <span className="story-admin-help">Selected: {imageFile.name}</span>
          ) : null}
        </label>

        <div className="story-admin-grid two">
          <label>
            Section title (EN)
            <input
              type="text"
              value={section.title.en}
              onChange={(event) => updateLocalized('title', 'en', event.target.value)}
            />
          </label>
          <label>
            Section title (ET)
            <input
              type="text"
              value={section.title.ee}
              onChange={(event) => updateLocalized('title', 'ee', event.target.value)}
            />
          </label>
        </div>

        <div className="story-admin-grid two">
          <label>
            Section copy (EN)
            <textarea
              rows="5"
              value={section.body.en}
              onChange={(event) => updateLocalized('body', 'en', event.target.value)}
            />
          </label>
          <label>
            Section copy (ET)
            <textarea
              rows="5"
              value={section.body.ee}
              onChange={(event) => updateLocalized('body', 'ee', event.target.value)}
            />
          </label>
        </div>

        <div className="story-admin-actions">
          <button
            type="submit"
            className="story-admin-button story-admin-button--primary"
            disabled={
              isSaving ||
              (!imageFile && !resolveSiteImage(section.image, section.imageKey))
            }
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

export default ServicePageSectionEditorModal;
