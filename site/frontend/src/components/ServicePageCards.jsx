import ServicePageCard from "./ServicePageCard";

function ServicePageCards({ activeService }) {
  return (
    <div className="service-page-cards">
      {Array.isArray(activeService.texts) ? (
        activeService.texts.map((card, index) => (
          <ServicePageCard activeService={activeService} index={index} key={index} />
        ))
      ) : (
        <p>No service texts available.</p> // Fallback content when texts is not an array
      )}
    </div>
  );
}

export default ServicePageCards;
