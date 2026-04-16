import ServicePageCard from './ServicePageCard';

function ServicePageCards({
  cards,
  isEditable = false,
  onAdd,
  onEdit,
  onDelete,
}) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="service-page-cards-empty home-editor-card">
        <h5>No sections yet.</h5>
        <p>Add the first section for this service page.</p>
        {isEditable ? (
          <div className="section-inline-action">
            <button type="button" className="section-edit-button" onClick={onAdd}>
              Add new
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="service-page-cards">
      {cards.map((card, index) => (
        <ServicePageCard
          key={card.key || index}
          card={card}
          index={index}
          isEditable={isEditable}
          onEdit={() => onEdit(index)}
          onDelete={() => onDelete(index)}
        />
      ))}
    </div>
  );
}

export default ServicePageCards;
