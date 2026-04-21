import { useEffect, useState } from 'react';

import { resolveSiteImage } from '../content/siteSettingsDefaults';
import AdminModalShell from './AdminModalShell';
import ImageFocusEditor from './ImageFocusEditor';

const cloneValue = (value) =>
  value === null || value === undefined ? value : JSON.parse(JSON.stringify(value));

function ServicePageSectionEditorModal({
  mode = 'create',
  section,
  setSection,
  imageFile,
  onSelectImageFile,
  currentImage = null,
  currentImageUrl = '',
  onSave,
  onCancel,
  isSaving,
  isPreparingImage = false,
}) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [imageFile]);

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

  const updateImageFocus = (focus) => {
    setSection((current) => ({
      ...current,
      image: {
        ...(current.image || {}),
        ...focus,
      },
    }));
  };

  const restoreCurrentImage = () => {
    onSelectImageFile?.(null);
    setSection((current) => ({
      ...current,
      image: cloneValue(currentImage || null),
    }));
  };

  const title = mode === 'create' ? 'Add section' : 'Edit section';
  const imageUrl = previewUrl || resolveSiteImage(section.image, section.imageKey) || currentImageUrl;
  const imageName = imageFile?.name || section.image?.name || currentImage?.name || '';
  const filePickerStatus = isPreparingImage
    ? 'Optimizing selected image in the browser...'
    : imageFile
      ? '1 new image added'
      : imageUrl
        ? 'Choose a replacement image'
        : 'Choose an image';

  return (
    <AdminModalShell
      eyebrow="Service section"
      title={title}
      description="Choose the layout, upload an image and edit the section copy."
      onClose={onCancel}
      wide
    >
      <form onSubmit={onSave} className="story-admin-form">
        <div className="service-section-editor">
          <div className="service-section-editor__media hero-editor-gallery hero-editor-gallery--single">
            <label>
              Section image
              <span className="story-admin-file-picker">
                <input
                  className="story-admin-file-picker__input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    onSelectImageFile?.(event.target.files?.[0] || null);
                    event.target.value = '';
                  }}
                />
                <span className="story-admin-file-picker__button">Choose file</span>
                <span className="story-admin-file-picker__status">{filePickerStatus}</span>
              </span>
            </label>

            <div className="hero-editor-gallery__grid">
              <div className="hero-editor-gallery__card">
                <ImageFocusEditor
                  image={section.image || currentImage}
                  imageUrl={imageUrl}
                  onChange={updateImageFocus}
                  aspectRatio="11 / 7"
                  label={null}
                  helpText={null}
                  allowZoom
                />
                <div
                  className={`hero-editor-gallery__meta${
                    imageName ? '' : ' hero-editor-gallery__meta--actions-only'
                  }`}
                >
                  {imageName ? <span>{imageName}</span> : null}
                  {imageFile ? (
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

          <div className="service-section-editor__fields home-editor-card">
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
          </div>
        </div>

        <div className="story-admin-actions">
          <button
            type="submit"
            className="story-admin-button story-admin-button--primary"
            disabled={
              isSaving ||
              isPreparingImage ||
              !imageUrl
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
