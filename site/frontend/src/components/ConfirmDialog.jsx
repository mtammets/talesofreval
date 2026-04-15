function ConfirmDialog({
  open = false,
  title = 'Confirm action',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="story-editor-modal" onClick={onCancel}>
      <div
        className="story-editor-sheet story-editor-sheet--compact"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="story-editor-header">
          <div>
            <h2>{title}</h2>
            {message ? <p>{message}</p> : null}
          </div>
        </div>

        <div className="story-admin-actions story-admin-actions--confirm">
          <button
            type="button"
            className="story-admin-actions__secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="story-admin-actions__danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
