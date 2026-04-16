import AdminModalShell from './AdminModalShell';

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
    <AdminModalShell
      eyebrow="Confirm action"
      title={title}
      description={message}
      onClose={onCancel}
      compact
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
