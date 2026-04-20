import ImageFocusEditor from './ImageFocusEditor';
import AdminModalShell from './AdminModalShell';

function HomeHeroEditorModal({
  titleLine1,
  setTitleLine1,
  titleLine2,
  setTitleLine2,
  subtitle,
  setSubtitle,
  currentImages = [],
  currentImageUrls = [],
  setCurrentImages,
  selectedFiles = [],
  setSelectedFiles,
  selectedImages = [],
  setSelectedImages,
  onSelectFiles,
  previewUrls = [],
  onSave,
  onCancel,
  isSaving,
  isPreparingImages = false,
  maxImageCount = 6,
}) {
  const removeCurrentImage = (index) => {
    setCurrentImages((current) => current.filter((_image, imageIndex) => imageIndex !== index));
  };

  const updateCurrentImageFocus = (index, focus) => {
    setCurrentImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...(image || {}),
              ...focus,
            }
          : image
      )
    );
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((current) => current.filter((_file, fileIndex) => fileIndex !== index));
    setSelectedImages?.((current) =>
      current.filter((_image, imageIndex) => imageIndex !== index)
    );
  };

  const updateSelectedImageFocus = (index, focus) => {
    setSelectedImages?.((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...(image || {}),
              ...focus,
            }
          : image
      )
    );
  };

  const slideshowItems = [
    ...previewUrls.map((imageUrl, index) => ({
      key: `selected-${imageUrl}-${index}`,
      image: selectedImages[index],
      imageUrl,
      name: selectedFiles[index]?.name || `Upload ${index + 1}`,
      onChange: (focus) => updateSelectedImageFocus(index, focus),
      onRemove: () => removeSelectedFile(index),
    })),
    ...currentImageUrls.map((imageUrl, index) => ({
      key: `current-${imageUrl}-${index}`,
      image: currentImages[index],
      imageUrl,
      name: currentImages[index]?.name || `Image ${index + 1}`,
      onChange: (focus) => updateCurrentImageFocus(index, focus),
      onRemove: () => removeCurrentImage(index),
    })),
  ];

  const availableSlots = Math.max(0, maxImageCount - slideshowItems.length);
  const filePickerStatus = isPreparingImages
    ? 'Optimizing selected images in the browser…'
    : selectedFiles.length === 1
      ? '1 new image added'
      : selectedFiles.length > 1
        ? `${selectedFiles.length} new images added`
        : availableSlots
          ? 'Choose one or more images to add to the slideshow'
          : 'Slideshow is full';

  return (
    <AdminModalShell
      eyebrow="Homepage hero"
      title="Edit homepage hero"
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
            Background images
            <span className="story-admin-file-picker">
              <input
                className="story-admin-file-picker__input"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  onSelectFiles?.(event.target.files);
                  event.target.value = '';
                }}
              />
              <span className="story-admin-file-picker__button">Choose files</span>
              <span className="story-admin-file-picker__status">{filePickerStatus}</span>
            </span>
          </label>

          <div className="hero-editor-gallery">
            <div className="hero-editor-gallery__header">
              <strong>Current slideshow</strong>
              <span>
                {slideshowItems.length} / {maxImageCount} image(s)
              </span>
            </div>
            {slideshowItems.length ? (
              <div className="hero-editor-gallery__grid">
                {slideshowItems.map((item) => (
                  <div key={item.key} className="hero-editor-gallery__card">
                    <ImageFocusEditor
                      image={item.image}
                      imageUrl={item.imageUrl}
                      onChange={item.onChange}
                      aspectRatio="1440 / 700"
                      label={null}
                      helpText={null}
                      previewVariant="hero"
                    />
                    <div className="hero-editor-gallery__meta">
                      <span>{item.name}</span>
                      <button
                        type="button"
                        className="story-admin-button story-admin-button--secondary"
                        onClick={item.onRemove}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="story-admin-help">
                No uploaded hero images kept. If you save now, the built-in default hero image will be used.
              </p>
            )}
          </div>

          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={isSaving || isPreparingImages}
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
