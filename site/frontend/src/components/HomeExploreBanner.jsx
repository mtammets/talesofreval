import backgroundImage from '../img/home-explore-bg.webp';
import phoneImage from '../img/home-explore-phone.png';
import balloonImage from '../img/baloon-icon.png';
import googlePlayImage from '../img/home-explore-google-play.png';
import appStoreImage from '../img/home-explore-app-store.png';
import { useNavigate } from 'react-router-dom';
import { ArrowRightUp } from '../icons/ArrowRightUp.tsx';
import { getFallbackText } from '../content/fallbackContent';
import { getLocalizedSiteText } from '../content/siteSettingsDefaults';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.leplace.global&pli=1';
const APP_STORE_URL = 'https://apps.apple.com/ee/app/leplace-world/id1496776027';

function HomeExploreBanner({ texts = {}, language = 'en', content = null }) {
  const navigate = useNavigate();
  const exploreAloneText =
    getLocalizedSiteText(content?.titleLine1, language) ||
    texts?.["explore-alone"]?.text ||
    getFallbackText('misc', 'explore-alone', language, 'Explore Alone,');
  const discoverMoreText =
    getLocalizedSiteText(content?.titleLine2, language) ||
    texts?.["discover-more"]?.text ||
    getFallbackText('misc', 'discover-more', language, 'Discover More!');
  const subtitleText =
    getLocalizedSiteText(content?.subtitle, language) ||
    texts?.["medieval-adventure-at-your-fingertips"]?.text ||
    getFallbackText(
      'misc',
      'medieval-adventure-at-your-fingertips',
      language,
      'Medieval adventure at your fingertips'
    );
  const readMoreText =
    getLocalizedSiteText(content?.readMoreLabel, language) ||
    texts?.["read-more"]?.text ||
    getFallbackText('misc', 'read-more', language, 'Read more');
  const bannerAriaLabel =
    `${exploreAloneText} ${discoverMoreText}`.trim() ||
    texts?.["explore-alone-discover-more"]?.text ||
    getFallbackText(
      'misc',
      'explore-alone-discover-more',
      language,
      'Explore Alone, Discover More'
    );
  const googlePlayUrl = content?.googlePlayUrl || GOOGLE_PLAY_URL;
  const appStoreUrl = content?.appStoreUrl || APP_STORE_URL;
  const phonePreviewAlt =
    language === 'ee'
      ? 'Tales of Revali GPS-mängu telefoni eelvaade'
      : 'Tales of Reval GPS game phone preview';
  const googlePlayAlt =
    language === 'ee' ? 'Hangi Google Playst' : 'Get it on Google Play';
  const appStoreAlt =
    language === 'ee' ? "Laadi alla App Store'ist" : 'Download on the App Store';

  const openVirtualTour = () => {
    navigate('/virtual');
  };

  const handleBannerKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openVirtualTour();
    }
  };

  const stopBannerNavigation = (event) => {
    event.stopPropagation();
  };

  return (
    <section
      className="home-explore-banner home-explore-banner--interactive"
      aria-label={bannerAriaLabel}
      role="link"
      tabIndex={0}
      onClick={openVirtualTour}
      onKeyDown={handleBannerKeyDown}
    >
      <div className="home-explore-banner__background" aria-hidden="true">
        <img src={backgroundImage} alt="" />
      </div>

      <img
        className="home-explore-banner__phone"
        src={phoneImage}
        alt={phonePreviewAlt}
      />

      <div className="home-explore-banner__copy">
        <h3>
          <span>{exploreAloneText}</span>
          <span>{discoverMoreText}</span>
        </h3>
        <p>{subtitleText}</p>
      </div>

      <button
        type="button"
        className="home-explore-banner__read-more"
        onClick={(event) => {
          event.stopPropagation();
          openVirtualTour();
        }}
      >
        <span>{readMoreText}</span>
        <ArrowRightUp color="#f0eee8" size="0.9rem" />
      </button>

      <img className="home-explore-banner__balloon" src={balloonImage} alt="" aria-hidden="true" />

      <a
        className="home-explore-banner__store home-explore-banner__store--google"
        href={googlePlayUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopBannerNavigation}
      >
        <img src={googlePlayImage} alt={googlePlayAlt} />
      </a>

      <a
        className="home-explore-banner__store home-explore-banner__store--apple"
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopBannerNavigation}
      >
        <img src={appStoreImage} alt={appStoreAlt} />
      </a>
    </section>
  );
}

export default HomeExploreBanner;
