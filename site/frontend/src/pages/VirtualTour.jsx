import virtual_bg from '../img/virtual-bg.webp';
import virtual_image_phones from '../img/virtual-image-phones.webp';
import check_icon from '../img/check-icon.svg';
import PayNow from '../components/style-components/PayNow';
import google_store from '../img/google-store.png';
import apple_store from '../img/apple-store.png';
import { initiateStripe } from '../features/tour/tourSlice';
import { useDispatch } from 'react-redux';

function VirtualTour() {
  const dispatch = useDispatch();

  const initiateStripeFunction = () => {
    dispatch(initiateStripe());
  }

  return (
        <div className="virtual-tour" style={{ backgroundImage: `url(${virtual_bg})` }}>
          <div className="container">
            <h2 className="virtual light">
              Explore Alone,
              <br />
              Discover More!
            </h2>
            <h3 className="cardo light padding-20-top">Location based app guided tour</h3>
            <div className="two-columns">
              <div className="column image-column">
                <img src={virtual_image_phones} alt="Virtual Tour" className="virtual-phones-image" />
              </div>
              <div className="column virtual-info">
                <h4>Medieval adventure at your fingertips</h4>
                <ul className="padding-20-top padding-10-bottom">
                  <li>
                    <img className="check-icon padding-10-right" src={check_icon} alt="" />
                    Your time, your pace!
                  </li>
                  <li>
                    <img className="check-icon padding-10-right" src={check_icon} alt="" />
                    Interactive quizzes
                  </li>
                  <li>
                    <img className="check-icon padding-10-right" src={check_icon} alt="" />
                    Photo Challenges
                  </li>
                  <li>
                    <img className="check-icon padding-10-right" src={check_icon} alt="" />
                    In-depth tour with storytelling
                  </li>
                </ul>
                <PayNow onClick={initiateStripeFunction}/>
                <div className="google-apple-stores padding-10-top flex gap-10">
                  <a href="https://play.google.com/store/apps/details?id=com.leplace.global&pli=1" target="_blank">
                    <img src={google_store} alt="Google and Apple stores" />
                  </a>
                  <a  href="https://apps.apple.com/ee/app/leplace-world/id1496776027" target="_blank">
                    <img src={apple_store} alt="Google and Apple stores" />
                  </a>
                </div>
              </div>
            </div>
            <div className="width-40 padding-40-top padding-40-bottom" style={{ textAlign: 'center' }}>
              <h4 className="light">What is Leplace</h4>
              <p className="padding-20-top padding-20-bottom">
                Leplace transforms local tourism with the most interactive outdoor exploration games on your mobile
                phone and connects local creators and organizations with people and places worldwide!
              </p>
              <a className="dark" href="https://connect.leplace.online/#/storyline?storyId=401&token=H1Z6AC1YVPJITQFYZMFWRN8AHFSJBJZT3GYES7ZU3PWKQFHLSQ" target='_blank'>
                Read more
              </a>
            </div>
          </div>
        </div>

    );
  }
  
  export default VirtualTour;
  


{/* <h2 className='virtual light'>
              Explore Alone,
              <br />
              Discover More!
          </h2>
          <h3 className='cardo light padding-20-top'>Location based app guided tours</h3> */}
