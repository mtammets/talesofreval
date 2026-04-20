import { getImageObjectPosition } from '../content/siteSettingsDefaults';

function ServicePageCard({
  card,
  index,
  isEditable = false,
  onEdit,
  onDelete,
}) {
  const isFirst = index === 0;
  const layoutClassName = card.layout === 'image-right' ? 'even' : 'odd';

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
          <img
            src={card.imageSrc}
            alt={card.title}
            style={{ objectPosition: getImageObjectPosition(card.image) }}
          />
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
