import ImageFocusEditor from './ImageFocusEditor';
import AdminModalShell from './AdminModalShell';

function HeroImageEditorModal({
  title = 'Change background image',
  description = 'Upload a new background image.',
  currentImage,
  currentImageUrl,
  draftImage,
  onChangeImage,
  selectedFile,
  onSelectFile,
  previewUrl,
  onSave,
  onCancel,
  isSaving,
  isPreparingImage = false,
  focusAspectRatio = '1440 / 700',
}) {
  const activeImageUrl = previewUrl || currentImageUrl || currentImage?.src || '';

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
              onChange={(event) => {
                onSelectFile?.(event.target.files?.[0] || null);
                event.target.value = '';
              }}
            />
            {currentImage?.src ? (
              <span className="story-admin-help">Current: {currentImage.name || currentImage.src}</span>
            ) : null}
          </label>

          {isPreparingImage ? (
            <p className="story-admin-help">Optimizing selected image in the browser…</p>
          ) : null}

          {selectedFile ? (
            <p className="story-admin-help">Selected image: {selectedFile.name}</p>
          ) : null}

          <ImageFocusEditor
            image={draftImage || currentImage}
            imageUrl={activeImageUrl}
            onChange={(focus) =>
              onChangeImage?.((current) => ({
                ...(current || currentImage || {}),
                ...focus,
              }))
            }
            aspectRatio={focusAspectRatio}
            label="Hero preview"
            helpText="This frame matches the live hero. Drag the photo and use zoom if needed until the visible crop looks right."
            previewVariant="hero"
          />

          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={
                isSaving ||
                isPreparingImage ||
                (!selectedFile && !currentImage?.src)
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

export default HeroImageEditorModal;
