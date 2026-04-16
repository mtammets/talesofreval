import AdminModalShell from './AdminModalShell';

function HeroImageEditorModal({
  title = 'Change background image',
  description = 'Upload a new background image.',
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
      eyebrow="Hero media"
      title={title}
      description={description}
      onClose={onCancel}
    >
        <form onSubmit={onSave} className="story-admin-form">
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
              disabled={isSaving || !selectedFile}
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

export default HeroImageEditorModal;
