import {
  getImageBackgroundPosition,
  getSiteImageAlt,
  getImageZoom,
  resolveSiteImageMedia,
} from '../../content/siteSettingsDefaults';

const CONTACT_TEAM_MEDIA_SIZES = '(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw';

function OurTeamCard({image, title}) {
  const responsiveMedia =
    image && typeof image === 'object'
      ? resolveSiteImageMedia(image, '', CONTACT_TEAM_MEDIA_SIZES)
      : null;
  const imageSrc = responsiveMedia?.src || image?.src || image || '';
  const imagePosition =
    responsiveMedia?.objectPosition || getImageBackgroundPosition(image);
  const imageZoom = responsiveMedia?.zoom || getImageZoom(image);
  const language = localStorage.getItem('language') || 'en';
  const imageAlt = getSiteImageAlt(image, language, title);

  return (
    <div className="contacts-team">
      {imageSrc ? (
        <img
          className="contacts-team-image"
          src={imageSrc}
          srcSet={responsiveMedia?.srcSet || undefined}
          sizes={responsiveMedia?.sizes || undefined}
          alt={imageAlt}
          style={{
            objectPosition: imagePosition,
            transform: `scale(${imageZoom})`,
            transformOrigin: imagePosition,
          }}
        />
      ) : null}
      <div className="contacts-team-info contacts-team-info--name-only">
        <h5>{title}</h5>
      </div>
    </div>
  )
}

export default OurTeamCard
