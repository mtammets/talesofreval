function AdminModalShell({
  eyebrow = 'Admin editor',
  title,
  description,
  onClose,
  compact = false,
  wide = false,
  noBackdropBlur = false,
  hideClose = false,
  children,
}) {
  const modalClassName = [
    'story-editor-modal',
    noBackdropBlur ? 'story-editor-modal--plain' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const sheetClassName = [
    'story-editor-sheet',
    compact ? 'story-editor-sheet--compact' : '',
    wide ? 'story-editor-sheet--wide' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={modalClassName} onClick={onClose}>
      <div
        className={sheetClassName}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="story-editor-shell">
          <div className="story-editor-body">
            {eyebrow ? <div className="story-editor-kicker">{eyebrow}</div> : null}
            <div className="story-editor-header">
              <div>
                <h2>{title}</h2>
                {description ? <p>{description}</p> : null}
              </div>
              {hideClose ? null : (
                <button type="button" className="story-editor-close" onClick={onClose}>
                  Close
                </button>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminModalShell;
