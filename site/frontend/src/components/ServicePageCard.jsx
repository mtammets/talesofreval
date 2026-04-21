import {
  getImageObjectPosition,
  getImageZoom,
} from '../content/siteSettingsDefaults';

function ServicePageCard({
  card,
  index,
  isEditable = false,
  onEdit,
  onDelete,
}) {
  const isFirst = index === 0;
  const layoutClassName = card.layout === 'image-right' ? 'even' : 'odd';
  const imageMedia = card.imageMedia || null;
  const imageSrc = imageMedia?.src || card.imageSrc || '';
  const imagePosition = imageMedia?.objectPosition || getImageObjectPosition(card.image);
  const imageZoom = imageMedia?.zoom || getImageZoom(card.image);

  return (
    <div className="service-page-card-wrapper">
      {isEditable ? (
        <div className="service-page-card__admin-actions">
          <button type="button" className="section-edit-button" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="section-edit-button" onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : null}
      <div
        className={`service-page-card ${layoutClassName} ${
          isFirst ? 'padding-40-top' : ''
        }`}
      >
        <div className="service-card-image">
          {imageSrc ? (
            <img
              src={imageSrc}
              srcSet={imageMedia?.srcSet || undefined}
              sizes={imageMedia?.sizes || undefined}
              alt={card.title}
              style={{
                objectPosition: imagePosition,
                transform: `scale(${imageZoom})`,
                transformOrigin: imagePosition,
              }}
            />
          ) : null}
        </div>
        <div className="service-card-info">
          <h5 className="padding-20-bottom">{card.title}</h5>
          <p>{card.body}</p>
        </div>
      </div>
    </div>
  );
}

export default ServicePageCard;
