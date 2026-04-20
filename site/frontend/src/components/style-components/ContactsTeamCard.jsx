import {
  getImageBackgroundPosition,
  getImageZoom,
  resolveSiteImageMedia,
} from '../../content/siteSettingsDefaults';

const CONTACT_TEAM_MEDIA_SIZES = '(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw';

function OurTeamCard({image, title, email, phone}) {
  const responsiveMedia =
    image && typeof image === 'object'
      ? resolveSiteImageMedia(image, '', CONTACT_TEAM_MEDIA_SIZES)
      : null;
  const imageSrc = responsiveMedia?.src || image?.src || image || '';
  const imagePosition =
    responsiveMedia?.objectPosition || getImageBackgroundPosition(image);
  const imageZoom = responsiveMedia?.zoom || getImageZoom(image);

  return (
    <div className="contacts-team">
      {imageSrc ? (
        <img
          className="contacts-team-image"
          src={imageSrc}
          srcSet={responsiveMedia?.srcSet || undefined}
          sizes={responsiveMedia?.sizes || undefined}
          alt={title}
          style={{
            objectPosition: imagePosition,
            transform: `scale(${imageZoom})`,
            transformOrigin: imagePosition,
          }}
        />
      ) : null}
      <div className="contacts-team-info">
        <h5>{title}</h5>
        <a className="mail" href={`mailto:${email}`}>{email}</a>
        <a className="phone bold" href={`tel:${phone}`}>{phone}</a>
      </div>
    </div>
  )
}

export default OurTeamCard
