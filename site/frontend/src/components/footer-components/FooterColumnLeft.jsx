import React from 'react';
import ButtonPrimary from '../style-components/ButtonPrimary';
import { getLocalizedSiteText } from '../../content/siteSettingsDefaults';

function FooterColumnLeft({ texts, content = null }) {
  const language = localStorage.getItem('language') || 'en';
  const markerPosition = {
    lat: 59.436575996574305,
    lng: 24.74391712620674,
  };
  const mapLink = content?.openMapUrl || 'https://maps.app.goo.gl/bVono2RWfCPvSp5x5';
  const mapPreviewSrc = `https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}&z=16&output=embed`;

  const joinFreeTourText = content?.freeTourHeading
    ? getLocalizedSiteText(content.freeTourHeading, language)
    : texts && texts["join-our-free-tour:"] ? texts["join-our-free-tour:"].text : '';
  const footerFirstTimeText = content?.firstTime
    ? getLocalizedSiteText(content.firstTime, language)
    : texts && texts["footer-first-time"] ? texts["footer-first-time"].text : '';
  const footerSecondTimeText = content?.secondTime
    ? getLocalizedSiteText(content.secondTime, language)
    : texts && texts["footer-second-time"] ? texts["footer-second-time"].text : '';
  const languageText = content?.languageLine
    ? getLocalizedSiteText(content.languageLine, language).split(':')
    : texts && texts["language-:-english"] ? texts["language-:-english"].text.split(':') : ["", ""];
  const durationText = content?.durationLine
    ? getLocalizedSiteText(content.durationLine, language).split(':')
    : texts && texts["duration:-90-minutes"] ? texts["duration:-90-minutes"].text.split(':') : ["", ""];
  const distanceText = content?.distanceLine
    ? getLocalizedSiteText(content.distanceLine, language).split(':')
    : texts && texts["distance:-1.2-km"] ? texts["distance:-1.2-km"].text.split(':') : ["", ""];
  const startingPointText = content?.startingPointLine
    ? getLocalizedSiteText(content.startingPointLine, language).split(':')
    : texts && texts["starting-point:-niguliste-2"] ? texts["starting-point:-niguliste-2"].text.split(':') : ["", ""];
  const openMapText = content?.openMapLabel
    ? getLocalizedSiteText(content.openMapLabel, language)
    : texts && texts["open-map"] ? texts["open-map"].text : '';
  const footerTimeText = `${footerFirstTimeText} ${footerSecondTimeText}`.trim();

    return (
      <div className="footer-column footer-column-left">
        <h3 className="cardo footer-title">{joinFreeTourText}</h3>
        <div className="footer-tour-times">
          <p>{footerTimeText}</p>
        </div>
        <ul className="free-tour-info">
          <li>{languageText[0]}: <span className="bold">{languageText[1]}</span></li>
          <li>{durationText[0]}: <span className="bold">{durationText[1]}</span></li>
          <li>{distanceText[0]}: <span className="bold">{distanceText[1]}</span></li>
          <li>{startingPointText[0]}: <span className="bold">{startingPointText[1]}</span></li>
        </ul>
        <div className="footer-map-card">
          <iframe
            className="footer-map-embed"
            title="Map showing the Tales of Reval meeting point"
            src={mapPreviewSrc}
            loading="lazy"
            tabIndex="-1"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            className="footer-map-card__link"
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={openMapText || 'Open map'}
          />
        </div>
        <div className="footer-map-actions">
          <ButtonPrimary text={openMapText} icon="ArrowRightUp" link={mapLink} />
        </div>
      </div>
  );
}

export default FooterColumnLeft;
