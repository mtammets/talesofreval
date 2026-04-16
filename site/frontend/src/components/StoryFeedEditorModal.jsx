import AdminModalShell from './AdminModalShell';

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
  const updateValue = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const title =
    form._id ? 'Edit item' : editorMode === 'add-page' ? 'Add page' : 'Add item';
  const helperText =
    editorMode === 'add-page'
      ? 'This new page will be added right after the selected item.'
      : editorMode === 'create'
        ? 'Create a new item for the story timeline.'
        : '';
  const submitLabel = form._id
    ? 'Save changes'
    : editorMode === 'add-page'
      ? 'Create page'
      : 'Create item';

  return (
    <AdminModalShell
      eyebrow="Story timeline"
      title={title}
      description={helperText}
      onClose={onCancel}
      wide
    >
        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
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
          </div>

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
                rows="7"
                value={form.description}
                placeholder="Empty line = new paragraph. Use [Link text](https://...) for links."
                onChange={(event) => updateValue('description', event.target.value)}
              />
            </label>
            <label>
              Description (ET)
              <textarea
                rows="7"
                value={form.description_estonian}
                placeholder="Tuhirida = uus loik. Link: [Lingitekst](https://...)"
                onChange={(event) =>
                  updateValue('description_estonian', event.target.value)
                }
              />
            </label>
          </div>

          {Number(form.mediaType) === 0 ? (
            <label>
              Image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setSingleImageFile(event.target.files?.[0] || null)}
              />
              {form.image?.src ? (
                <span className="story-admin-help">Current: {form.image.src}</span>
              ) : null}
              {form.image?.src ? (
                <div className="editor-inline-preview">
                  <span className="story-admin-help">Current image</span>
                  <div
                    className="editor-inline-preview__image"
                    style={{ backgroundImage: `url(${form.image.src})` }}
                  />
                </div>
              ) : null}
            </label>
          ) : null}

          {Number(form.mediaType) === 1 ? (
            <label>
              Gallery images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))}
              />
              {form.images?.length ? (
                <span className="story-admin-help">
                  Current gallery: {form.images.length} image(s)
                </span>
              ) : null}
              {form.images?.length ? (
                <div className="editor-inline-gallery">
                  {form.images.map((image, index) => (
                    <div
                      key={image.src || index}
                      className="editor-inline-gallery__image"
                      style={{ backgroundImage: `url(${image.src})` }}
                    />
                  ))}
                </div>
              ) : null}
            </label>
          ) : null}

          {Number(form.mediaType) === 2 ? (
            <label>
              Video URL
              <input
                type="text"
                value={form.video}
                onChange={(event) => updateValue('video', event.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </label>
          ) : null}

          {singleImageFile ? (
            <p className="story-admin-help">Selected image: {singleImageFile.name}</p>
          ) : null}
          {galleryFiles.length ? (
            <p className="story-admin-help">Selected gallery files: {galleryFiles.length}</p>
          ) : null}

          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : submitLabel}
            </button>
            {form._id ? (
              <button
                type="button"
                className="story-admin-button story-admin-button--danger"
                onClick={onDelete}
                disabled={isDeleting}
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
