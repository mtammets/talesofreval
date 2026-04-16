function PageHero({
  className = '',
  mediaClassName = '',
  backgroundImage = '',
  isEditable = false,
  onEditBackground,
  overlay = null,
  children,
}) {
  const wrapperClassName = ['page-hero', className].filter(Boolean).join(' ');
  const heroMediaClassName = ['page-hero__media', mediaClassName].filter(Boolean).join(' ');

  return (
    <section className={wrapperClassName}>
      <div
        className={heroMediaClassName}
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
      >
        {overlay}
        {isEditable ? (
          <div className="page-hero__admin-actions">
            <button type="button" onClick={onEditBackground}>
              Edit hero
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export default PageHero;
