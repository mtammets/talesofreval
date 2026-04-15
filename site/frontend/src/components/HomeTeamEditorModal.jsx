import { resolveSiteImage } from '../content/siteSettingsDefaults';

function HomeTeamEditorModal({
  heading,
  members,
  imageFiles,
  setImageFiles,
  onSave,
  onCancel,
  isSaving,
  modalTitle = 'Edit team',
  modalDescription = 'Update the homepage team heading and visible cards.',
}) {
  const updateHeading = (language, value) => {
    heading.set((current) => ({
      ...current,
      [language]: value,
    }));
  };

  const updateMember = (index, key, value) => {
    members.set((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [key]: value,
            }
          : member
      )
    );
  };

  const setMemberFile = (index, file) => {
    setImageFiles((current) => ({
      ...current,
      [index]: file,
    }));
  };

  return (
    <div className="story-editor-modal">
      <div className="story-editor-sheet">
        <div className="story-editor-header">
          <div>
            <h2>{modalTitle}</h2>
            <p>{modalDescription}</p>
          </div>
          <button type="button" className="story-editor-close" onClick={onCancel}>
            Close
          </button>
        </div>

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

          {members.value.map((member, index) => (
            <div key={member.key} className="home-editor-card">
              <div className="story-admin-grid two">
                <label>
                  Name
                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) => updateMember(index, 'name', event.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={member.email}
                    onChange={(event) => updateMember(index, 'email', event.target.value)}
                  />
                </label>
              </div>
              <div className="story-admin-grid two">
                <label>
                  Phone
                  <input
                    type="text"
                    value={member.phone}
                    onChange={(event) => updateMember(index, 'phone', event.target.value)}
                  />
                </label>
                <label>
                  Card image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setMemberFile(index, event.target.files?.[0] || null)}
                  />
                  {resolveSiteImage(member.image, member.imageKey) ? (
                    <div className="editor-inline-preview">
                      <span className="story-admin-help">Current image</span>
                      <div
                        className="editor-inline-preview__image"
                        style={{
                          backgroundImage: `url(${resolveSiteImage(member.image, member.imageKey)})`,
                        }}
                      />
                    </div>
                  ) : null}
                  {imageFiles[index] ? (
                    <span className="story-admin-help">Selected: {imageFiles[index].name}</span>
                  ) : null}
                </label>
              </div>
            </div>
          ))}

          <div className="story-admin-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomeTeamEditorModal;
