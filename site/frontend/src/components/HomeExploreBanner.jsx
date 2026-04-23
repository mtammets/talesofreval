import backgroundImage from '../img/home-explore-bg.webp';
import phoneImage from '../img/home-explore-phone.png';
import balloonImage from '../img/home-explore-balloon.png';
import googlePlayImage from '../img/home-explore-google-play.png';
import appStoreImage from '../img/home-explore-app-store.png';
import { ArrowRightUp } from '../icons/ArrowRightUp.tsx';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.leplace.global&pli=1';
const APP_STORE_URL = 'https://apps.apple.com/ee/app/leplace-world/id1496776027';
const DEFAULT_READ_MORE_URL = 'https://connect.leplace.online/storyline-talesofreval';

function HomeExploreBanner({ readMoreUrl = DEFAULT_READ_MORE_URL }) {
  return (
    <section className="home-explore-banner" aria-label="Explore Alone, Discover More">
      <div className="home-explore-banner__background" aria-hidden="true">
        <img src={backgroundImage} alt="" />
      </div>

      <img
        className="home-explore-banner__phone"
        src={phoneImage}
        alt="Tales of Reval GPS game phone preview"
      />

      <div className="home-explore-banner__copy">
        <h3>Explore Alone, Discover More!</h3>
        <p>Medieval adventure at your fingertips</p>
      </div>

      <a
        className="home-explore-banner__read-more"
        href={readMoreUrl || DEFAULT_READ_MORE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Read more</span>
        <ArrowRightUp color="#f0eee8" size="0.9rem" />
      </a>

      <img className="home-explore-banner__balloon" src={balloonImage} alt="" aria-hidden="true" />

      <a
        className="home-explore-banner__store home-explore-banner__store--google"
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={googlePlayImage} alt="Get it on Google Play" />
      </a>

      <a
        className="home-explore-banner__store home-explore-banner__store--apple"
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={appStoreImage} alt="Download on the App Store" />
      </a>
    </section>
  );
}

export default HomeExploreBanner;
