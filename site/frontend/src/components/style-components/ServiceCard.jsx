import { Link } from "react-router-dom"

function ServiceCard({bgimage, title, mobile, link, setOurServicesOpen, description, compact = false}) {
  const handleClick = () => {
    setOurServicesOpen?.(false);
  };

  return (
    <Link to={`/service/${link}`} onClick={handleClick}>
      <div className={`service ${mobile ? 'mobile-service' : ''} ${description ? 'service-detailed' : ''} ${compact ? 'service-compact' : ''}`} style={{backgroundImage: `url(${bgimage})`}}>
          <div className="service-scrim" />
          <div className="service-info">
              <h5 className="service-title">{title}</h5>
              {description ? <p className="service-description">{description}</p> : null}
          </div>
      </div>
    </Link>
  )
}

export default ServiceCard
