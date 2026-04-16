import AdminModalShell from './AdminModalShell';

function HomeReviewEditorModal({ heading, text, reviewer, onSave, onCancel, isSaving }) {
  const updateValue = (setter, language, value) => {
    setter((current) => ({
      ...current,
      [language]: value,
    }));
  };

  return (
    <AdminModalShell
      eyebrow="Social proof"
      title="Edit review"
      description="Update the homepage testimonial block."
      onClose={onCancel}
    >
        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
            <label>
              Heading (EN)
              <input
                type="text"
                value={heading.en}
                onChange={(event) => updateValue(heading.set, 'en', event.target.value)}
              />
            </label>
            <label>
              Heading (ET)
              <input
                type="text"
                value={heading.ee}
                onChange={(event) => updateValue(heading.set, 'ee', event.target.value)}
              />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Review text (EN)
              <textarea
                rows="6"
                value={text.en}
                onChange={(event) => updateValue(text.set, 'en', event.target.value)}
              />
            </label>
            <label>
              Review text (ET)
              <textarea
                rows="6"
                value={text.ee}
                onChange={(event) => updateValue(text.set, 'ee', event.target.value)}
              />
            </label>
          </div>
          <div className="story-admin-grid two">
            <label>
              Reviewer (EN)
              <input
                type="text"
                value={reviewer.en}
                onChange={(event) => updateValue(reviewer.set, 'en', event.target.value)}
              />
            </label>
            <label>
              Reviewer (ET)
              <input
                type="text"
                value={reviewer.ee}
                onChange={(event) => updateValue(reviewer.set, 'ee', event.target.value)}
              />
            </label>
          </div>
          <div className="story-admin-actions">
            <button
              type="submit"
              className="story-admin-button story-admin-button--primary"
              disabled={isSaving}
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

export default HomeReviewEditorModal;
