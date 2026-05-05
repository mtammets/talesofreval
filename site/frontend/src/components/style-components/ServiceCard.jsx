import { Link, useLocation } from "react-router-dom"
import { scrollViewportTop } from '../../utils/scrollViewportTop';
import {
  getImageObjectPosition,
  getImageZoom,
  resolveSiteImageMedia,
} from '../../content/siteSettingsDefaults';

const SERVICE_CARD_MEDIA_SIZES = '(max-width: 768px) 100vw, (max-width: 1100px) 34vw, 20vw';

function ServiceCard({
  image,
  bgimage,
  title,
  mobile,
  link,
  setOurServicesOpen,
  description,
  compact = false,
}) {
  const location = useLocation();
  const targetPath = `/service/${link}`;
  const imageValue = image || bgimage || '';
  const responsiveMedia =
    imageValue && typeof imageValue === 'object'
      ? resolveSiteImageMedia(imageValue, '', SERVICE_CARD_MEDIA_SIZES)
      : null;
  const imageSrc = responsiveMedia?.src || imageValue?.src || imageValue || '';
  const imagePosition = responsiveMedia?.objectPosition || getImageObjectPosition(imageValue);
  const mobileImagePosition =
    responsiveMedia?.mobileObjectPosition || imagePosition;
  const imageZoom = responsiveMedia?.zoom || getImageZoom(imageValue);
  const mobileImageZoom =
    responsiveMedia?.mobileZoom || getImageZoom(imageValue, 'mobile');

  const handleClick = () => {
    setOurServicesOpen?.(false);

    if (location.pathname === targetPath) {
      scrollViewportTop();
    }
  };

  return (
    <Link to={targetPath} onClick={handleClick}>
      <div
        className={`service ${mobile ? 'mobile-service' : ''} ${description ? 'service-detailed' : ''} ${compact ? 'service-compact' : ''}`}
      >
          {imageSrc ? (
            <img
              className="service-media-image"
              src={imageSrc}
              srcSet={responsiveMedia?.srcSet || undefined}
              sizes={responsiveMedia?.sizes || undefined}
              alt=""
              aria-hidden="true"
              style={{
                '--service-desktop-position': imagePosition,
                '--service-mobile-position': mobileImagePosition,
                '--service-desktop-scale': String(imageZoom),
                '--service-mobile-scale': String(mobileImageZoom),
              }}
            />
          ) : null}
          <div className="service-info">
              <h5 className="service-title">{title}</h5>
              {description ? <p className="service-description">{description}</p> : null}
          </div>
      </div>
    </Link>
  )
}

export default ServiceCard
