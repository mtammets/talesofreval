import AdminModalShell from './AdminModalShell';

function ContactSectionEditorModal({
  contact,
  setContact,
  onSave,
  onCancel,
  isSaving,
}) {
  const updateLocalized = (key, language, value) => {
    setContact((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [language]: value,
      },
    }));
  };

  const updateValue = (key, value) => {
    setContact((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <AdminModalShell
      eyebrow="Contact page"
      title="Edit contact section"
      description="Update the visible form and company information on the contact page."
      onClose={onCancel}
      wide
    >
        <form onSubmit={onSave} className="story-admin-form">
          <div className="story-admin-grid two">
            <label>
              Form title (EN)
              <input type="text" value={contact.formTitle.en} onChange={(event) => updateLocalized('formTitle', 'en', event.target.value)} />
            </label>
            <label>
              Form title (ET)
              <input type="text" value={contact.formTitle.ee} onChange={(event) => updateLocalized('formTitle', 'ee', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Name label (EN)
              <input type="text" value={contact.nameLabel.en} onChange={(event) => updateLocalized('nameLabel', 'en', event.target.value)} />
            </label>
            <label>
              Name label (ET)
              <input type="text" value={contact.nameLabel.ee} onChange={(event) => updateLocalized('nameLabel', 'ee', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Email label (EN)
              <input type="text" value={contact.emailLabel.en} onChange={(event) => updateLocalized('emailLabel', 'en', event.target.value)} />
            </label>
            <label>
              Email label (ET)
              <input type="text" value={contact.emailLabel.ee} onChange={(event) => updateLocalized('emailLabel', 'ee', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Message label (EN)
              <input type="text" value={contact.messageLabel.en} onChange={(event) => updateLocalized('messageLabel', 'en', event.target.value)} />
            </label>
            <label>
              Message label (ET)
              <input type="text" value={contact.messageLabel.ee} onChange={(event) => updateLocalized('messageLabel', 'ee', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Button label (EN)
              <input type="text" value={contact.submitLabel.en} onChange={(event) => updateLocalized('submitLabel', 'en', event.target.value)} />
            </label>
            <label>
              Button label (ET)
              <input type="text" value={contact.submitLabel.ee} onChange={(event) => updateLocalized('submitLabel', 'ee', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Company name
              <input type="text" value={contact.companyName} onChange={(event) => updateValue('companyName', event.target.value)} />
            </label>
            <label>
              Company registration
              <input type="text" value={contact.companyReg} onChange={(event) => updateValue('companyReg', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Address (EN)
              <textarea rows="3" value={contact.address.en} onChange={(event) => updateLocalized('address', 'en', event.target.value)} />
            </label>
            <label>
              Address (ET)
              <textarea rows="3" value={contact.address.ee} onChange={(event) => updateLocalized('address', 'ee', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Bank line 1
              <input type="text" value={contact.bankLine1} onChange={(event) => updateValue('bankLine1', event.target.value)} />
            </label>
            <label>
              Bank line 2
              <input type="text" value={contact.bankLine2} onChange={(event) => updateValue('bankLine2', event.target.value)} />
            </label>
          </div>

          <div className="story-admin-grid two">
            <label>
              Email
              <input type="email" value={contact.email} onChange={(event) => updateValue('email', event.target.value)} />
            </label>
            <label>
              Phone
              <input type="text" value={contact.phone} onChange={(event) => updateValue('phone', event.target.value)} />
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

export default ContactSectionEditorModal;
