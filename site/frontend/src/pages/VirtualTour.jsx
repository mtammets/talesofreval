import { useDispatch } from 'react-redux';
import virtualBg from '../img/virtual-bg.webp';
import phonesImage from '../img/phones-transparent-background.png';
import checkIcon from '../img/check-icon.svg';
import googleStore from '../img/google-store.png';
import appleStore from '../img/apple-store.png';
import { initiateStripe } from '../features/tour/tourSlice';
import { ArrowRight } from '../icons/ArrowRight.tsx';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.leplace.global&pli=1';
const APP_STORE_URL = 'https://apps.apple.com/ee/app/leplace-world/id1496776027';
const DEFAULT_READ_MORE_URL = 'https://connect.leplace.online/storyline-talesofreval';

const FEATURE_ITEMS = [
  'Your time, your pace!',
  'Interactive quizzes',
  'Photo Challenges',
  'In-depth tour with storytelling',
];

function VirtualTour({ siteSettings = null }) {
  const dispatch = useDispatch();
  const readMoreUrl = siteSettings?.footer?.gpsUrl || DEFAULT_READ_MORE_URL;

  return (
    <main className="virtual-tour-page">
      <section
        className="virtual-tour-page__hero"
        style={{ backgroundImage: `url(${virtualBg})` }}
      >
        <div className="virtual-tour-page__frame">
          <div className="virtual-tour-page__intro">
            <h1 className="virtual-tour-page__title cardo">
              <span>Explore Alone,</span>
              <span>Discover More!</span>
            </h1>
            <p className="virtual-tour-page__subtitle cardo">Location based app guided tours</p>
          </div>

          <div className="virtual-tour-page__hero-body">
            <div className="virtual-tour-page__phones">
              <img src={phonesImage} alt="LePlace mobile experience previews" />
            </div>

            <div className="virtual-tour-page__content">
              <h2 className="virtual-tour-page__content-title">
                Medieval adventure at your fingertips
              </h2>

              <ul className="virtual-tour-page__feature-list">
                {FEATURE_ITEMS.map((item) => (
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
                <span>Pay now</span>
                <ArrowRight size="1.35rem" />
              </button>

              <div className="virtual-tour-page__stores">
                <a
                  className="virtual-tour-page__store virtual-tour-page__store--google"
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={googleStore} alt="Get it on Google Play" />
                </a>
                <a
                  className="virtual-tour-page__store virtual-tour-page__store--apple"
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={appleStore} alt="Download on the App Store" />
                </a>
              </div>
            </div>
          </div>

          <div className="virtual-tour-page__about">
            <h2 className="virtual-tour-page__about-title">What is LePlace</h2>
            <p>
              Leplace transforms local tourism with the most interactive outdoor exploration
              games on your mobile phone and connects local creators and organizations with
              people and places worldwide!
            </p>
            <a href={readMoreUrl} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default VirtualTour;
