function AdminModalShell({
  eyebrow = 'Admin editor',
  title,
  description,
  onClose,
  compact = false,
  wide = false,
  noBackdropBlur = false,
  hideClose = false,
  cornerClose = false,
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
  const hasHeaderCopy = Boolean(title || description);
  const headerClassName = [
    'story-editor-header',
    !hasHeaderCopy ? 'story-editor-header--close-only' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const bodyClassName = [
    'story-editor-body',
    cornerClose ? 'story-editor-body--corner-close' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const closeClassName = [
    'story-editor-close',
    cornerClose ? 'story-editor-close--corner' : '',
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
          <div className={bodyClassName}>
            {hideClose || !cornerClose ? null : (
              <button
                type="button"
                className={closeClassName}
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
            {eyebrow ? <div className="story-editor-kicker">{eyebrow}</div> : null}
            {hasHeaderCopy || (!hideClose && !cornerClose) ? (
              <div className={headerClassName}>
                {hasHeaderCopy ? (
                  <div className="story-editor-header__copy">
                    {title ? <h2>{title}</h2> : null}
                    {description ? <p>{description}</p> : null}
                  </div>
                ) : null}
                {hideClose || cornerClose ? null : (
                  <button
                    type="button"
                    className={closeClassName}
                    onClick={onClose}
                    aria-label="Close"
                    title="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminModalShell;
