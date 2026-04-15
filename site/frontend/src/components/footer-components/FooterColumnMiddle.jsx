import ButtonPrimary from '../style-components/ButtonPrimary';
import gpsGameImage from '../../img/gps-game.webp';
import { getLocalizedSiteText, resolveSiteImage } from '../../content/siteSettingsDefaults';

function FooterColumnMiddle({ texts, content = null }) {
  const language = localStorage.getItem('language') || 'en';
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
          src={resolveSiteImage(content?.gpsImage, content?.gpsImageKey) || gpsGameImage}
          alt="Tales of Reval GPS game"
        />
      </div>
      <div className="footer-gps-actions">
        <ButtonPrimary text={tryItOutText} icon="ArrowRightUp" link={content?.gpsUrl || "https://connect.leplace.online/storyline-talesofreval"} />
      </div>
    </div>
  );
}

export default FooterColumnMiddle;
