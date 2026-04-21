import ButtonPrimary from '../style-components/ButtonPrimary';
import gpsGameImage from '../../img/gps-game.webp';
import {
  getImageObjectPosition,
  getImageZoom,
  getLocalizedSiteText,
  resolveSiteImageMedia,
} from '../../content/siteSettingsDefaults';

const FOOTER_GPS_MEDIA_SIZES = '(max-width: 768px) 100vw, 360px';

function FooterColumnMiddle({ texts, content = null }) {
  const language = localStorage.getItem('language') || 'en';
  const gpsImageMedia = resolveSiteImageMedia(
    content?.gpsImage,
    content?.gpsImageKey,
    FOOTER_GPS_MEDIA_SIZES
  );
  const gpsImageSrc = gpsImageMedia?.src || gpsGameImage;
  const gpsImagePosition =
    gpsImageMedia?.objectPosition || getImageObjectPosition(content?.gpsImage);
  const gpsImageZoom = gpsImageMedia?.zoom || getImageZoom(content?.gpsImage);
  const gpsGameText = content?.gpsHeading
    ? getLocalizedSiteText(content.gpsHeading, language)
    : texts && texts["our-gps-game"] ? texts["our-gps-game"].text : 'Our GPS game';
  const funGameText = content?.gpsCopy
    ? getLocalizedSiteText(content.gpsCopy, language)
    : texts && texts["very-fun-game-and-cool-stuff"] ? texts["very-fun-game-and-cool-stuff"].text : 'Very fun game and cool stuff';
  const tryItOutText = content?.gpsButtonLabel
    ? getLocalizedSiteText(content.gpsButtonLabel, language)
    : texts && texts["try-it-out!"] ? texts["try-it-out!"].text : 'Read more';

  return (
    <div className="footer-column footer-column-middle">
      <h3 className="cardo footer-title">{gpsGameText}</h3>
      <p className="footer-gps-copy">{funGameText}</p>
      <div className="footer-gps-image-frame">
        <img
          className="footer-gps-image"
          src={gpsImageSrc}
          srcSet={gpsImageMedia?.srcSet || undefined}
          sizes={gpsImageMedia?.sizes || undefined}
          alt="Tales of Reval GPS game"
          style={{
            objectPosition: gpsImagePosition,
            transform: `scale(${gpsImageZoom})`,
            transformOrigin: gpsImagePosition,
          }}
        />
      </div>
      <div className="footer-gps-actions">
        <ButtonPrimary text={tryItOutText} icon="ArrowRightUp" link={content?.gpsUrl || "https://connect.leplace.online/storyline-talesofreval"} />
      </div>
    </div>
  );
}

export default FooterColumnMiddle;
