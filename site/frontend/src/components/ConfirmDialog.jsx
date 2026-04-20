import AdminModalShell from './AdminModalShell';

function ConfirmDialog({
  open = false,
  title = 'Confirm action',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  eyebrow = 'Confirm action',
  hideClose = false,
  noBackdropBlur = false,
  minimal = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  if (minimal) {
    const modalClassName = [
      'story-editor-modal',
      noBackdropBlur ? 'story-editor-modal--plain' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={modalClassName} onClick={onCancel}>
        <div
          className="story-editor-sheet story-editor-sheet--compact story-editor-sheet--confirm"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="story-editor-shell">
            <div className="story-editor-body story-editor-body--confirm">
              {eyebrow ? <div className="story-editor-kicker">{eyebrow}</div> : null}
              <div className="confirm-dialog__header">
                <h2>{title}</h2>
                {message ? <p>{message}</p> : null}
              </div>
              <div className="confirm-dialog__actions">
                <button
                  type="button"
                  className="story-admin-button story-admin-button--secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  className="story-admin-button story-admin-button--danger"
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting…' : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminModalShell
      eyebrow={eyebrow}
      title={title}
      description={message}
      onClose={onCancel}
      compact
      hideClose={hideClose}
      noBackdropBlur={noBackdropBlur}
    >
        <div className="story-admin-actions story-admin-actions--confirm">
          <button
            type="button"
            className="story-admin-button story-admin-button--secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="story-admin-button story-admin-button--danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
    </AdminModalShell>
  );
}

export default ConfirmDialog;
