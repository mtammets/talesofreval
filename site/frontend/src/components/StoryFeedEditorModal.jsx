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
}) {
  const updateValue = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="story-editor-modal">
      <div className="story-editor-sheet">
        <div className="story-editor-header">
          <div>
            <h2>{form._id ? 'Edit item' : 'Add item'}</h2>
            <p>
              Use a new year if you want to create a brand new timeline section on this page.
            </p>
          </div>
          <button type="button" className="story-editor-close" onClick={onCancel}>
            Close
          </button>
        </div>

        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
            <label>
              Year
              <input
                type="number"
                value={form.year}
                onChange={(event) => updateValue('year', event.target.value)}
              />
            </label>
            <label>
              Order
              <input
                type="number"
                value={form.order}
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
                onChange={(event) => updateValue('description', event.target.value)}
              />
            </label>
            <label>
              Description (ET)
              <textarea
                rows="7"
                value={form.description_estonian}
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
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : form._id ? 'Save changes' : 'Create item'}
            </button>
            {form._id ? (
              <button type="button" onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete item'}
              </button>
            ) : null}
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoryFeedEditorModal;
