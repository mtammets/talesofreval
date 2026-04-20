import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { resolveSiteImage } from '../content/siteSettingsDefaults';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFileForUpload,
  prepareImageFilesForUpload,
} from '../utils/prepareImageFilesForUpload';
import AdminModalShell from './AdminModalShell';
import ImageFocusEditor from './ImageFocusEditor';

const STORY_SINGLE_IMAGE_RATIO = '30 / 19';

const cloneImage = (image) => (image ? JSON.parse(JSON.stringify(image)) : null);

function StoryFeedEditorModal({
  form,
  setForm,
  singleImageFile,
  setSingleImageFile,
  galleryFiles,
  setGalleryFiles,
  onSave,
  onDelete,
  onCancel,
  isSaving,
  isDeleting,
  editorMode = 'create',
  lockYear = false,
  lockOrder = false,
}) {
  const [singleImagePreviewUrl, setSingleImagePreviewUrl] = useState('');
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState([]);
  const [isPreparingSingleImage, setIsPreparingSingleImage] = useState(false);
  const [isPreparingGallery, setIsPreparingGallery] = useState(false);
  const [singleImageSnapshot, setSingleImageSnapshot] = useState(null);

  useEffect(() => {
    if (!singleImageFile) {
      setSingleImagePreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(singleImageFile);
    setSingleImagePreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [singleImageFile]);

  useEffect(() => {
    if (!galleryFiles.length) {
      setGalleryPreviewUrls([]);
      return undefined;
    }

    const nextUrls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviewUrls(nextUrls);

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryFiles]);

  useEffect(() => {
    if (!form._id) {
      setSingleImageSnapshot(null);
    }
  }, [form._id]);

  const updateValue = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateSingleImageFocus = (focus) => {
    setForm((current) => ({
      ...current,
      image: {
        ...(current.image || {}),
        ...focus,
      },
    }));
  };

  const resetSingleImageEditorState = (fileName = '') => {
    setForm((current) => ({
      ...current,
      image: {
        ...(current.image || {}),
        name: fileName,
        focusX: 50,
        focusY: 50,
        zoom: 1,
      },
    }));
  };

  const restoreCurrentSingleImage = () => {
    setSingleImageFile(null);
    setForm((current) => ({
      ...current,
      image: cloneImage(singleImageSnapshot),
    }));
    setSingleImageSnapshot(null);
  };

  const handleSingleImageSelected = async (file) => {
    if (!file) {
      return;
    }

    setIsPreparingSingleImage(true);

    try {
      const preparedFile = await prepareImageFileForUpload(
        file,
        HERO_IMAGE_PREPARATION_OPTIONS
      );

      if (!preparedFile) {
        return;
      }

      setSingleImageSnapshot((current) => current || cloneImage(form.image));
      setSingleImageFile(preparedFile);
      resetSingleImageEditorState(preparedFile.name);
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingSingleImage(false);
    }
  };

  const handleGallerySelected = async (files) => {
    if (!files.length) {
      return;
    }

    setIsPreparingGallery(true);

    try {
      const preparedFiles = await prepareImageFilesForUpload(
        files,
        HERO_IMAGE_PREPARATION_OPTIONS
      );
      setGalleryFiles(preparedFiles);
    } catch (error) {
      toast.error(error?.message || 'Gallery image optimization failed.');
    } finally {
      setIsPreparingGallery(false);
    }
  };

  const title =
    form._id ? 'Edit item' : editorMode === 'add-page' ? 'Add page' : 'Add year';
  const submitLabel = form._id
    ? 'Save changes'
    : editorMode === 'add-page'
      ? 'Create page'
      : 'Create year';
  const isPreparingMedia = isPreparingSingleImage || isPreparingGallery;
  const singleImageUrl = singleImagePreviewUrl || resolveSiteImage(form.image, '');
  const galleryPreviewImages = galleryPreviewUrls.length
    ? galleryPreviewUrls
    : (form.images || [])
        .map((image) => resolveSiteImage(image, ''))
        .filter(Boolean);
  const singleImageStatus = isPreparingSingleImage
    ? 'Optimizing selected image…'
    : singleImageFile
      ? '1 new image added'
      : '';
  const galleryStatus = isPreparingGallery
    ? 'Optimizing selected images…'
    : galleryFiles.length
      ? `${galleryFiles.length} new image${galleryFiles.length === 1 ? '' : 's'} added`
      : '';

  return (
    <AdminModalShell eyebrow="Story timeline" title={title} onClose={onCancel} wide>
      <form onSubmit={onSave} className="story-admin-form">
        <div className="story-feed-editor__meta">
          <label>
            Year
            <input
              type="number"
              value={form.year}
              disabled={lockYear}
              onChange={(event) => updateValue('year', event.target.value)}
            />
          </label>

          <label>
            Order
            <input
              type="number"
              value={form.order}
              disabled={lockOrder}
              onChange={(event) => updateValue('order', event.target.value)}
            />
          </label>

          <label>
            Media type
            <select
              value={form.mediaType}
              onChange={(event) => updateValue('mediaType', Number(event.target.value))}
            >
              <option value={0}>Single image</option>
              <option value={1}>Gallery</option>
              <option value={2}>Video embed</option>
            </select>
          </label>
        </div>

        <div className="story-feed-editor__workspace">
          <div className="story-feed-editor__fields home-editor-card">
            <div className="story-admin-grid two">
              <label>
                Title (EN)
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateValue('title', event.target.value)}
                />
              </label>
              <label>
                Title (ET)
                <input
                  type="text"
                  value={form.title_estonian}
                  onChange={(event) => updateValue('title_estonian', event.target.value)}
                />
              </label>
            </div>

            <div className="story-admin-grid two">
              <label>
                Description (EN)
                <textarea
                  rows="6"
                  value={form.description}
                  placeholder="Empty line = new paragraph. Use [Link text](https://...) for links."
                  onChange={(event) => updateValue('description', event.target.value)}
                />
              </label>
              <label>
                Description (ET)
                <textarea
                  rows="6"
                  value={form.description_estonian}
                  placeholder="Tuhirida = uus loik. Link: [Lingitekst](https://...)"
                  onChange={(event) =>
                    updateValue('description_estonian', event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <div className="story-feed-editor__media home-editor-card">
            {Number(form.mediaType) === 0 ? (
              <>
                <label>
                  Upload image
                  <span
                    className={`story-admin-file-picker${
                      isPreparingSingleImage ? ' is-disabled' : ''
                    }`}
                  >
                    <input
                      className="story-admin-file-picker__input"
                      type="file"
                      accept="image/*"
                      disabled={isPreparingSingleImage}
                      onChange={async (event) => {
                        const nextFile = event.target.files?.[0] || null;
                        event.target.value = '';
                        await handleSingleImageSelected(nextFile);
                      }}
                    />
                    <span className="story-admin-file-picker__button">Choose file</span>
                    {singleImageStatus ? (
                      <span className="story-admin-file-picker__status">{singleImageStatus}</span>
                    ) : null}
                  </span>
                </label>

                {singleImageFile ? (
                  <div className="story-feed-editor__media-actions">
                    <button
                      type="button"
                      className="story-admin-button story-admin-button--secondary"
                      onClick={restoreCurrentSingleImage}
                    >
                      Use current
                    </button>
                  </div>
                ) : null}

                {singleImageUrl ? (
                  <ImageFocusEditor
                    image={form.image}
                    imageUrl={singleImageUrl}
                    onChange={updateSingleImageFocus}
                    aspectRatio={STORY_SINGLE_IMAGE_RATIO}
                    label={null}
                    helpText={null}
                    allowZoom
                  />
                ) : (
                  <div className="story-feed-editor__empty">
                    <span>Choose an image to preview it here.</span>
                  </div>
                )}
              </>
            ) : null}

            {Number(form.mediaType) === 1 ? (
              <>
                <label>
                  Upload gallery
                  <span
                    className={`story-admin-file-picker${
                      isPreparingGallery ? ' is-disabled' : ''
                    }`}
                  >
                    <input
                      className="story-admin-file-picker__input"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isPreparingGallery}
                      onChange={async (event) => {
                        const nextFiles = Array.from(event.target.files || []);
                        event.target.value = '';
                        await handleGallerySelected(nextFiles);
                      }}
                    />
                    <span className="story-admin-file-picker__button">Choose files</span>
                    {galleryStatus ? (
                      <span className="story-admin-file-picker__status">{galleryStatus}</span>
                    ) : null}
                  </span>
                </label>

                {galleryFiles.length ? (
                  <div className="story-feed-editor__media-actions">
                    <button
                      type="button"
                      className="story-admin-button story-admin-button--secondary"
                      onClick={() => setGalleryFiles([])}
                    >
                      Use current
                    </button>
                  </div>
                ) : null}

                {galleryPreviewImages.length ? (
                  <div className="story-feed-editor__gallery-grid">
                    {galleryPreviewImages.map((src, index) => (
                      <div key={`${src}-${index}`} className="story-feed-editor__gallery-item">
                        <img src={src} alt="" aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="story-feed-editor__empty">
                    <span>Choose gallery images to preview them here.</span>
                  </div>
                )}
              </>
            ) : null}

            {Number(form.mediaType) === 2 ? (
              <div className="story-feed-editor__video">
                <label>
                  Video URL
                  <input
                    type="text"
                    value={form.video}
                    onChange={(event) => updateValue('video', event.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </label>

                {form.video.trim() ? (
                  <div className="story-feed-editor__video-preview">
                    <iframe
                      title="Story video preview"
                      src={form.video}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="story-feed-editor__empty">
                    <span>Paste an embed URL to preview the video here.</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="story-admin-actions">
          <button
            type="submit"
            className="story-admin-button story-admin-button--primary"
            disabled={isSaving || isPreparingMedia}
          >
            {isSaving ? 'Saving…' : submitLabel}
          </button>
          {form._id ? (
            <button
              type="button"
              className="story-admin-button story-admin-button--danger"
              onClick={onDelete}
              disabled={isDeleting || isPreparingMedia}
            >
              {isDeleting ? 'Deleting…' : 'Delete item'}
            </button>
          ) : null}
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

export default StoryFeedEditorModal;
