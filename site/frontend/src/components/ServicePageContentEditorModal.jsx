import AdminModalShell from './AdminModalShell';

function ServicePageContentEditorModal({
  serviceKey,
  content,
  setContent,
  onSave,
  onCancel,
  isSaving,
}) {
  const updateLocalized = (field, language, value) => {
    setContent((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [language]: value,
      },
    }));
  };

  return (
    <AdminModalShell
      eyebrow="Service page"
      title="Edit page content"
      description="Update the page heading, intro and closing content."
      onClose={onCancel}
      wide
    >
      <form onSubmit={onSave} className="story-admin-form">
        <div className="story-admin-grid two">
          <label>
            Page title (EN)
            <input
              type="text"
              value={content.title.en}
              onChange={(event) => updateLocalized('title', 'en', event.target.value)}
            />
          </label>
          <label>
            Page title (ET)
            <input
              type="text"
              value={content.title.ee}
              onChange={(event) => updateLocalized('title', 'ee', event.target.value)}
            />
          </label>
        </div>

        <div className="story-admin-grid two">
          <label>
            Intro (EN)
            <textarea
              rows="4"
              value={content.intro.en}
              onChange={(event) => updateLocalized('intro', 'en', event.target.value)}
            />
          </label>
          <label>
            Intro (ET)
            <textarea
              rows="4"
              value={content.intro.ee}
              onChange={(event) => updateLocalized('intro', 'ee', event.target.value)}
            />
          </label>
        </div>

        {serviceKey === 'destination' ? (
          <>
            <div className="story-admin-grid two">
              <label>
                Download section heading (EN)
                <input
                  type="text"
                  value={content.destinationHeading.en}
                  onChange={(event) =>
                    updateLocalized('destinationHeading', 'en', event.target.value)
                  }
                />
              </label>
              <label>
                Download section heading (ET)
                <input
                  type="text"
                  value={content.destinationHeading.ee}
                  onChange={(event) =>
                    updateLocalized('destinationHeading', 'ee', event.target.value)
                  }
                />
              </label>
            </div>
            <div className="story-admin-grid two">
              <label>
                Download section copy (EN)
                <textarea
                  rows="4"
                  value={content.destinationDescription.en}
                  onChange={(event) =>
                    updateLocalized('destinationDescription', 'en', event.target.value)
                  }
                />
              </label>
              <label>
                Download section copy (ET)
                <textarea
                  rows="4"
                  value={content.destinationDescription.ee}
                  onChange={(event) =>
                    updateLocalized('destinationDescription', 'ee', event.target.value)
                  }
                />
              </label>
            </div>
            <div className="story-admin-grid two">
              <label>
                Download button label (EN)
                <input
                  type="text"
                  value={content.destinationButtonLabel.en}
                  onChange={(event) =>
                    updateLocalized('destinationButtonLabel', 'en', event.target.value)
                  }
                />
              </label>
              <label>
                Download button label (ET)
                <input
                  type="text"
                  value={content.destinationButtonLabel.ee}
                  onChange={(event) =>
                    updateLocalized('destinationButtonLabel', 'ee', event.target.value)
                  }
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <div className="story-admin-grid two">
              <label>
                Review text (EN)
                <textarea
                  rows="5"
                  value={content.review.en}
                  onChange={(event) => updateLocalized('review', 'en', event.target.value)}
                />
              </label>
              <label>
                Review text (ET)
                <textarea
                  rows="5"
                  value={content.review.ee}
                  onChange={(event) => updateLocalized('review', 'ee', event.target.value)}
                />
              </label>
            </div>
            <div className="story-admin-grid two">
              <label>
                Reviewer (EN)
                <input
                  type="text"
                  value={content.reviewAuthor.en}
                  onChange={(event) =>
                    updateLocalized('reviewAuthor', 'en', event.target.value)
                  }
                />
              </label>
              <label>
                Reviewer (ET)
                <input
                  type="text"
                  value={content.reviewAuthor.ee}
                  onChange={(event) =>
                    updateLocalized('reviewAuthor', 'ee', event.target.value)
                  }
                />
              </label>
            </div>
          </>
        )}

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

export default ServicePageContentEditorModal;
