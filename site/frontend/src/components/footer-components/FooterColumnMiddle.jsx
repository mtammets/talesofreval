import ButtonPrimary from '../style-components/ButtonPrimary';
import gps_game from '../../img/gps-game.webp';

function FooterColumnMiddle({ texts }) {
  const gpsGameText = texts && texts["our-gps-game"] ? texts["our-gps-game"].text : 'Our GPS game';
  const funGameText = texts && texts["very-fun-game-and-cool-stuff"] ? texts["very-fun-game-and-cool-stuff"].text : 'Very fun game and cool stuff';
  const tryItOutText = texts && texts["try-it-out!"] ? texts["try-it-out!"].text : 'Read more';

  return (
    <div className="footer-column footer-column-middle">
      <h3 className="cardo footer-title">{gpsGameText}</h3>
      <p className="footer-gps-copy">{funGameText}</p>
      <div className="footer-gps-image-frame">
        <img className="footer-gps-image" src={gps_game} alt="Tales of Reval GPS game" />
      </div>
      <div className="footer-gps-actions">
        <ButtonPrimary text={tryItOutText} icon="ArrowRightUp" link="https://connect.leplace.online/storyline-talesofreval" />
      </div>
    </div>
  );
}

export default FooterColumnMiddle;
