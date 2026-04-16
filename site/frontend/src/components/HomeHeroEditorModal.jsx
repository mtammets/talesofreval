import AdminModalShell from './AdminModalShell';

function HomeHeroEditorModal({
  titleLine1,
  setTitleLine1,
  titleLine2,
  setTitleLine2,
  subtitle,
  setSubtitle,
  currentImage,
  currentImageUrl,
  selectedFile,
  setSelectedFile,
  previewUrl,
  onSave,
  onCancel,
  isSaving,
}) {
  return (
    <AdminModalShell
      eyebrow="Homepage hero"
      title="Change background image"
      description="Upload a new hero image for the homepage."
      onClose={onCancel}
    >
        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
            <label>
              Title line 1 (EN)
              <input
                type="text"
                value={titleLine1.en}
                onChange={(event) =>
                  setTitleLine1((current) => ({ ...current, en: event.target.value }))
                }
              />
            </label>
            <label>
              Title line 1 (ET)
              <input
                type="text"
                value={titleLine1.ee}
                onChange={(event) =>
                  setTitleLine1((current) => ({ ...current, ee: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Title line 2 (EN)
              <input
                type="text"
                value={titleLine2.en}
                onChange={(event) =>
                  setTitleLine2((current) => ({ ...current, en: event.target.value }))
                }
              />
            </label>
            <label>
              Title line 2 (ET)
              <input
                type="text"
                value={titleLine2.ee}
                onChange={(event) =>
                  setTitleLine2((current) => ({ ...current, ee: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Subtitle (EN)
              <input
                type="text"
                value={subtitle.en}
                onChange={(event) =>
                  setSubtitle((current) => ({ ...current, en: event.target.value }))
                }
              />
            </label>
            <label>
              Subtitle (ET)
              <input
                type="text"
                value={subtitle.ee}
                onChange={(event) =>
                  setSubtitle((current) => ({ ...current, ee: event.target.value }))
                }
              />
            </label>
          </div>

          <label>
            Background image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
            {currentImage?.src ? (
              <span className="story-admin-help">Current: {currentImage.name || currentImage.src}</span>
            ) : null}
          </label>

          {selectedFile ? (
            <p className="story-admin-help">Selected image: {selectedFile.name}</p>
          ) : null}

          <div className="hero-editor-preview">
            <div
              className="hero-editor-preview__image"
              style={{
                backgroundImage: `url(${previewUrl || currentImageUrl || currentImage?.src || ''})`,
              }}
            />
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

export default HomeHeroEditorModal;
