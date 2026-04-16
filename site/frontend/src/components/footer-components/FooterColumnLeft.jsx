import React, { lazy, Suspense, useRef } from 'react';
import ButtonPrimary from '../style-components/ButtonPrimary';
import footerMap from '../../img/footer-map.svg';
import { getLocalizedSiteText } from '../../content/siteSettingsDefaults';

const GoogleMapReact = lazy(() => import('google-map-react'));

function FooterColumnLeft({ texts, content = null }) {
  const markerRef = useRef(null);
  const markerPosition = {
    lat: 59.436575996574305,
    lng: 24.74391712620674,
  };
  const defaultProps = {
    center: markerPosition,
    zoom: 17,
  };
  const mapApiKey = process.env.REACT_APP_MAPS_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const shouldRenderLiveMap = process.env.REACT_APP_USE_LIVE_API === 'true';
  const canRenderMap = Boolean(mapApiKey);

  const handleApiLoaded = ({ map, maps }) => {
    if (markerRef.current) return;
    markerRef.current = new maps.Marker({
      position: markerPosition,
      map,
      title: 'Starting point',
    });
  };

  // Placeholder texts
  const joinFreeTourText = content?.freeTourHeading
    ? getLocalizedSiteText(content.freeTourHeading, localStorage.getItem('language') || 'en')
    : texts && texts["join-our-free-tour:"] ? texts["join-our-free-tour:"].text : '';
  const footerFirstTimeText = content?.firstTime
    ? getLocalizedSiteText(content.firstTime, localStorage.getItem('language') || 'en')
    : texts && texts["footer-first-time"] ? texts["footer-first-time"].text : '';
  const footerSecondTimeText = content?.secondTime
    ? getLocalizedSiteText(content.secondTime, localStorage.getItem('language') || 'en')
    : texts && texts["footer-second-time"] ? texts["footer-second-time"].text : '';
  const languageText = content?.languageLine
    ? getLocalizedSiteText(content.languageLine, localStorage.getItem('language') || 'en').split(':')
    : texts && texts["language-:-english"] ? texts["language-:-english"].text.split(':') : ["", ""];
  const durationText = content?.durationLine
    ? getLocalizedSiteText(content.durationLine, localStorage.getItem('language') || 'en').split(':')
    : texts && texts["duration:-90-minutes"] ? texts["duration:-90-minutes"].text.split(':') : ["", ""];
  const distanceText = content?.distanceLine
    ? getLocalizedSiteText(content.distanceLine, localStorage.getItem('language') || 'en').split(':')
    : texts && texts["distance:-1.2-km"] ? texts["distance:-1.2-km"].text.split(':') : ["", ""];
  const startingPointText = content?.startingPointLine
    ? getLocalizedSiteText(content.startingPointLine, localStorage.getItem('language') || 'en').split(':')
    : texts && texts["starting-point:-niguliste-2"] ? texts["starting-point:-niguliste-2"].text.split(':') : ["", ""];
  const openMapText = content?.openMapLabel
    ? getLocalizedSiteText(content.openMapLabel, localStorage.getItem('language') || 'en')
    : texts && texts["open-map"] ? texts["open-map"].text : '';
  const footerTimeText = `${footerFirstTimeText} ${footerSecondTimeText}`.trim();

  const isSnap = navigator.userAgent === 'ReactSnap';
  const fallbackMap = (
    <div className="google-maps footer-map footer-map-fallback">
      <img className="footer-map-image" src={footerMap} alt="Map showing the Tales of Reval meeting point" />
    </div>
  );

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
        {!isSnap && canRenderMap && shouldRenderLiveMap ? (
          <Suspense fallback={fallbackMap}>
            <div className="google-maps footer-map">
              <GoogleMapReact
                bootstrapURLKeys={{ key: mapApiKey }}
                defaultZoom={defaultProps.zoom}
                defaultCenter={defaultProps.center}
                options={{
                  minZoom: 14,
                  maxZoom: 19,
                }}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={handleApiLoaded}
              >
              </GoogleMapReact>
            </div>
          </Suspense>
        ) : (
          fallbackMap
        )}
        <div className="footer-map-actions">
          <ButtonPrimary text={openMapText} icon="ArrowRightUp" link={content?.openMapUrl || "https://maps.app.goo.gl/bVono2RWfCPvSp5x5"} />
        </div>
      </div>
  );
}

export default FooterColumnLeft;
