import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import virtualBg from '../img/virtual-bg.webp';
import phonesImage from '../img/phones-transparent-background.png';
import checkIcon from '../img/check-icon.svg';
import googleStore from '../img/google-store.png';
import appleStore from '../img/apple-store.png';
import { initiateStripe } from '../features/tour/tourSlice';
import { getFallbackText } from '../content/fallbackContent';
import { ArrowRight } from '../icons/ArrowRight.tsx';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.leplace.global&pli=1';
const APP_STORE_URL = 'https://apps.apple.com/ee/app/leplace-world/id1496776027';
const DEFAULT_READ_MORE_URL = 'https://connect.leplace.online/storyline-talesofreval';

function VirtualTour({ siteSettings = null }) {
  const dispatch = useDispatch();
  const readMoreUrl = siteSettings?.footer?.gpsUrl || DEFAULT_READ_MORE_URL;
  const language = localStorage.getItem('language') || 'en';
  const featureItems = [
    getFallbackText('misc', 'your-time-your-pace', language, 'Your time, your pace!'),
    getFallbackText('misc', 'interactive-quizzes', language, 'Interactive quizzes'),
    getFallbackText('misc', 'photo-challenges', language, 'Photo challenges'),
    getFallbackText(
      'misc',
      'in-depth-tour-with-storytelling',
      language,
      'In-depth tour with storytelling'
    ),
  ];
  const titleLine1 = getFallbackText('misc', 'explore-alone', language, 'Explore Alone,');
  const titleLine2 = getFallbackText('misc', 'discover-more', language, 'Discover More!');
  const subtitle = getFallbackText(
    'misc',
    'location-based-app-guided-tours',
    language,
    'Location based app guided tours'
  );
  const contentTitle = getFallbackText(
    'misc',
    'medieval-adventure-at-your-fingertips',
    language,
    'Medieval adventure at your fingertips'
  );
  const payNowText = getFallbackText('misc', 'pay-now', language, 'Pay now');
  const aboutTitle = getFallbackText('misc', 'what-is-leplace', language, 'What is LePlace');
  const aboutCopy = getFallbackText(
    'misc',
    'leplace-about-copy',
    language,
    'LePlace transforms local tourism with interactive outdoor exploration games on your mobile phone and connects creators and organizations with people and places worldwide.'
  );
  const readMoreText = getFallbackText('misc', 'read-more', language, 'Read more');
  const pageTitle = `${titleLine1} ${titleLine2}`.trim();
  const pageDescription = `${contentTitle}. ${subtitle}`;
  const phonesAlt =
    language === 'ee'
      ? 'LePlace mobiilse kogemuse eelvaated'
      : 'LePlace mobile experience previews';
  const googlePlayAlt =
    language === 'ee' ? 'Hangi Google Playst' : 'Get it on Google Play';
  const appStoreAlt =
    language === 'ee' ? "Laadi alla App Store'ist" : 'Download on the App Store';

  return (
    <main className="virtual-tour-page">
      <Helmet>
        <title>{pageTitle} - Tales of Reval</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <section
        className="virtual-tour-page__hero"
        style={{ backgroundImage: `url(${virtualBg})` }}
      >
        <div className="virtual-tour-page__frame">
          <div className="virtual-tour-page__intro">
            <h1 className="virtual-tour-page__title cardo">
              <span>{titleLine1}</span>
              <span>{titleLine2}</span>
            </h1>
            <p className="virtual-tour-page__subtitle cardo">{subtitle}</p>
          </div>

          <div className="virtual-tour-page__hero-body">
            <div className="virtual-tour-page__phones">
              <img src={phonesImage} alt={phonesAlt} />
            </div>

            <div className="virtual-tour-page__content">
              <h2 className="virtual-tour-page__content-title">{contentTitle}</h2>

              <ul className="virtual-tour-page__feature-list">
                {featureItems.map((item) => (
                  <li key={item} className="virtual-tour-page__feature-item">
                    <img
                      className="virtual-tour-page__feature-icon"
                      src={checkIcon}
                      alt=""
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="virtual-tour-page__pay-button"
                onClick={() => dispatch(initiateStripe())}
              >
                <span className="virtual-tour-page__pay-price">3.99 €</span>
                <span>{payNowText}</span>
                <ArrowRight size="1.35rem" />
              </button>

              <div className="virtual-tour-page__stores">
                <a
                  className="virtual-tour-page__store virtual-tour-page__store--google"
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={googleStore} alt={googlePlayAlt} />
                </a>
                <a
                  className="virtual-tour-page__store virtual-tour-page__store--apple"
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={appleStore} alt={appStoreAlt} />
                </a>
              </div>
            </div>
          </div>

          <div className="virtual-tour-page__about">
            <h2 className="virtual-tour-page__about-title">{aboutTitle}</h2>
            <p>{aboutCopy}</p>
            <a href={readMoreUrl} target="_blank" rel="noopener noreferrer">
              {readMoreText}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default VirtualTour;
