import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { resolveSiteImage } from '../content/siteSettingsDefaults';
import {
  HERO_IMAGE_PREPARATION_OPTIONS,
  prepareImageFileForUpload,
} from '../utils/prepareImageFilesForUpload';
import AdminModalShell from './AdminModalShell';
import ImageFocusEditor from './ImageFocusEditor';

const HOMEPAGE_SERVICE_CARD_PREVIEW_RATIO = '237 / 319';

function HomeServicesEditorModal({
  heading,
  items,
  imageFiles,
  setImageFiles,
  onSave,
  onCancel,
  isSaving,
}) {
  const [previewUrls, setPreviewUrls] = useState({});
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isPreparingImageIndex, setIsPreparingImageIndex] = useState(null);

  useEffect(() => {
    const objectUrls = [];
    const nextPreviewUrls = {};

    Object.entries(imageFiles || {}).forEach(([index, file]) => {
      if (!file) {
        return;
      }

      const nextUrl = URL.createObjectURL(file);
      objectUrls.push(nextUrl);
      nextPreviewUrls[index] = nextUrl;
    });

    setPreviewUrls(nextPreviewUrls);

    return () => {
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [imageFiles]);

  useEffect(() => {
    setActiveItemIndex((current) => Math.min(current, Math.max(items.value.length - 1, 0)));
  }, [items.value.length]);

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
    setImageFiles((current) => {
      const next = { ...current };

      if (file) {
        next[index] = file;
      } else {
        delete next[index];
      }

      return next;
    });
  };

  const resetItemImageEditorState = (index, fileName = '') => {
    items.set((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              image: {
                ...(item.image || {}),
                name: fileName,
                focusX: 50,
                focusY: 50,
                zoom: 1,
              },
            }
          : item
      )
    );
  };

  const updateItemImageFocus = (index, focus) => {
    items.set((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              image: {
                ...(item.image || {}),
                ...focus,
              },
            }
          : item
      )
    );
  };

  const activeItem = items.value[activeItemIndex] || null;
  const activePreviewUrl = activeItem
    ? previewUrls[activeItemIndex] || resolveSiteImage(activeItem.image, activeItem.imageKey)
    : '';
  const activeImageFile = imageFiles[activeItemIndex] || null;

  const handleItemFileSelected = async (index, file) => {
    if (!file) {
      setItemFile(index, null);
      return;
    }

    setIsPreparingImageIndex(index);

    try {
      const preparedFile = await prepareImageFileForUpload(
        file,
        HERO_IMAGE_PREPARATION_OPTIONS
      );

      if (!preparedFile) {
        return;
      }

      setItemFile(index, preparedFile);
      resetItemImageEditorState(index, preparedFile.name);
    } catch (error) {
      toast.error(error?.message || 'Image optimization failed.');
    } finally {
      setIsPreparingImageIndex(null);
    }
  };

  return (
    <AdminModalShell
      eyebrow="Services library"
      title="Edit services"
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

          <div className="home-services-editor">
            <div className="home-services-editor__header">
              <div />
            </div>

            <div className="home-services-editor__tabs" role="tablist" aria-label="Services">
              {items.value.map((item, index) => {
                const previewUrl = previewUrls[index] || resolveSiteImage(item.image, item.imageKey);
                const serviceName = item.title.en || item.title.ee || `Service ${index + 1}`;
                const serviceDescription =
                  item.title.ee && item.title.ee !== serviceName ? item.title.ee : item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`home-services-editor__tab${
                      index === activeItemIndex ? ' is-active' : ''
                    }`}
                    onClick={() => setActiveItemIndex(index)}
                    role="tab"
                    aria-selected={index === activeItemIndex}
                  >
                    <span
                      className="home-services-editor__tab-thumb"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                      aria-hidden="true"
                    />
                    <span className="home-services-editor__tab-copy">
                      <strong>{serviceName}</strong>
                      <span>{serviceDescription}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {activeItem ? (
              <div className="home-services-editor__workspace">
                <div className="home-services-editor__fields home-editor-card">
                  <div className="story-admin-grid two">
                    <label>
                      Title (EN)
                      <input
                        type="text"
                        value={activeItem.title.en}
                        onChange={(event) =>
                          updateItemTitle(activeItemIndex, 'en', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Title (ET)
                      <input
                        type="text"
                        value={activeItem.title.ee}
                        onChange={(event) =>
                          updateItemTitle(activeItemIndex, 'ee', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className="story-admin-grid two">
                    <label>
                      Description (EN)
                      <textarea
                        rows="4"
                        value={activeItem.description?.en || ''}
                        onChange={(event) =>
                          updateItemDescription(activeItemIndex, 'en', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Description (ET)
                      <textarea
                        rows="4"
                        value={activeItem.description?.ee || ''}
                        onChange={(event) =>
                          updateItemDescription(activeItemIndex, 'ee', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <label>
                    Upload image
                    <span className="story-admin-file-picker">
                      <input
                        className="story-admin-file-picker__input"
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const nextFile = event.target.files?.[0] || null;
                          event.target.value = '';
                          await handleItemFileSelected(activeItemIndex, nextFile);
                        }}
                      />
                      <span className="story-admin-file-picker__button">Choose file</span>
                    </span>
                  </label>
                </div>

                <div className="home-services-editor__media home-editor-card">
                  {activeImageFile ? (
                    <div className="home-services-editor__section-header">
                      <button
                        type="button"
                        className="story-admin-button story-admin-button--secondary"
                        onClick={() => setItemFile(activeItemIndex, null)}
                      >
                        Use current
                      </button>
                    </div>
                  ) : null}

                  <ImageFocusEditor
                    image={activeItem.image}
                    imageUrl={activePreviewUrl}
                    onChange={(focus) => updateItemImageFocus(activeItemIndex, focus)}
                    aspectRatio={HOMEPAGE_SERVICE_CARD_PREVIEW_RATIO}
                    label={null}
                    helpText={null}
                    allowZoom
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={isSaving || isPreparingImageIndex !== null}
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
