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
    <div className="story-editor-modal">
      <div className="story-editor-sheet">
        <div className="story-editor-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button type="button" className="story-editor-close" onClick={onCancel}>
            Close
          </button>
        </div>

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
            <button type="submit" disabled={isSaving || !selectedFile}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HeroImageEditorModal;
