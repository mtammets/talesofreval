import { useEffect, useState } from 'react';
import HeaderServices from "./HeaderServices";
import BookNow from "../style-components/BookNow";
import MobileServices from './MobileServices';
import { Link, useLocation } from 'react-router-dom';
import { scrollViewportTop } from '../../utils/scrollViewportTop';

function MobileDropdown({ setOurServicesOpen, setShowBookNow, texts, misc_texts }) {
  const [mobileScreen, setMobileScreen] = useState(window.innerWidth < 768);
  const location = useLocation();

  // Resize Event Listener
  useEffect(() => {
    const handleResize = () => {
      setMobileScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleBookNow = () => {
    setOurServicesOpen(false);
    setShowBookNow(true);
  };

  const handleNavigation = (path) => {
    setOurServicesOpen(false);

    if (location.pathname === path) {
      scrollViewportTop();
    }
  };

  const homeText = texts && texts["home"] ? texts["home"].text : null;
  const ourServicesText = misc_texts && misc_texts["our-services"] ? misc_texts["our-services"].text : null;
  const ourStoryText = texts && texts["our-story"] ? texts["our-story"].text : null;
  const contactsText = texts && texts["contacts"] ? texts["contacts"].text : null;

  return (
    <div className="mobile-dropdown">
      <ul className="mobile-menu-list">
        <Link to="/" onClick={() => handleNavigation('/')}>
          <li><h4 className='padding-20-bottom'>{homeText}</h4></li>
        </Link>

        <li>
          <h4 className='non-bold padding-20-top padding-10-bottom'>{ourServicesText}</h4>
          <div className="ipad-header-services padding-20-bottom">
            {mobileScreen ? <MobileServices texts={misc_texts} setOurServicesOpen={setOurServicesOpen} /> : <HeaderServices texts={misc_texts} setOurServicesOpen={setOurServicesOpen} mobile={true} />}
          </div>
        </li>
        <Link to="/story" onClick={() => handleNavigation('/story')}>
          <li><h4 className='padding-20-top padding-20-bottom'>{ourStoryText}</h4></li>
        </Link>
        <Link to="/contacts" onClick={() => handleNavigation('/contacts')}>
          <li><h4 className='padding-20-top padding-40-bottom'>{contactsText}</h4></li>
        </Link>
      </ul>
      <div className="mobile-book-now-container" onClick={handleBookNow}>
        <BookNow texts={texts} />
      </div>
    </div>
  );
}

export default MobileDropdown;
