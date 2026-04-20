import ImageFocusEditor from './ImageFocusEditor';
import AdminModalShell from './AdminModalShell';

const cloneValue = (value) =>
  value === null || value === undefined ? value : JSON.parse(JSON.stringify(value));

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
  const filePickerStatus = isPreparingImage
    ? 'Optimizing selected image in the browser…'
    : selectedFile
      ? '1 new image added'
      : '';
  const activeImageName =
    selectedFile?.name ||
    draftImage?.name ||
    currentImage?.name ||
    '';
  const hasEditableImage = Boolean(activeImageUrl);

  const restoreCurrentImage = () => {
    onSelectFile?.(null);
    onChangeImage?.(cloneValue(currentImage || null));
  };

  return (
    <AdminModalShell
      eyebrow="Hero media"
      title={title}
      description={description}
      onClose={onCancel}
    >
        <form onSubmit={onSave} className="story-admin-form">
          <label>
            <span className="story-admin-file-picker">
              <input
                className="story-admin-file-picker__input"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  onSelectFile?.(event.target.files?.[0] || null);
                  event.target.value = '';
                }}
              />
              <span className="story-admin-file-picker__button">Choose file</span>
              {filePickerStatus ? (
                <span className="story-admin-file-picker__status">{filePickerStatus}</span>
              ) : null}
            </span>
          </label>

          <div className="hero-editor-gallery hero-editor-gallery--single">
            <div className="hero-editor-gallery__grid">
              <div className="hero-editor-gallery__card">
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
                  label={null}
                  helpText={null}
                  previewVariant="hero"
                />
                <div
                  className={`hero-editor-gallery__meta${
                    activeImageName ? '' : ' hero-editor-gallery__meta--actions-only'
                  }`}
                >
                  {activeImageName ? <span>{activeImageName}</span> : null}
                  {selectedFile ? (
                    <button
                      type="button"
                      className="story-admin-button story-admin-button--secondary"
                      onClick={restoreCurrentImage}
                    >
                      Use current
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={
                isSaving ||
                isPreparingImage ||
                !hasEditableImage
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
