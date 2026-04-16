import { Link, useLocation } from "react-router-dom"
import { scrollViewportTop } from '../../utils/scrollViewportTop';

function ServiceCard({bgimage, title, mobile, link, setOurServicesOpen, description, compact = false}) {
  const location = useLocation();
  const targetPath = `/service/${link}`;

  const handleClick = () => {
    setOurServicesOpen?.(false);

    if (location.pathname === targetPath) {
      scrollViewportTop();
    }
  };

  return (
    <Link to={targetPath} onClick={handleClick}>
      <div className={`service ${mobile ? 'mobile-service' : ''} ${description ? 'service-detailed' : ''} ${compact ? 'service-compact' : ''}`} style={{backgroundImage: `url(${bgimage})`}}>
          <div className="service-info">
              <h5 className="service-title">{title}</h5>
              {description ? <p className="service-description">{description}</p> : null}
          </div>
      </div>
    </Link>
  )
}

export default ServiceCard
