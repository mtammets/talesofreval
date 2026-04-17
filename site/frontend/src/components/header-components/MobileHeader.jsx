import logo from '../../img/logo.svg';
import { IoMdClose } from "react-icons/io";
import { IoMdMenu } from "react-icons/io";
import BookNow from '../style-components/BookNow';
import MobileDropdown from './MobileDropdown';
import { useLocation, useNavigate } from 'react-router-dom';
import baloon_icon from '../../img/baloon-icon.png';
import { useState, useEffect, useRef } from 'react';
import { scrollViewportTop } from '../../utils/scrollViewportTop';

const LOGO_LOGIN_TAP_WINDOW_MS = 1800;

function MobileHeader({
  virtual,
  ourServicesOpen,
  setOurServicesOpen,
  setShowBookNow,
  texts,
  misc_texts,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  const goHome = () => {
    setOurServicesOpen(false);

    logoTapCount.current += 1;

    if (logoTapTimer.current) {
      window.clearTimeout(logoTapTimer.current);
    }

    if (logoTapCount.current >= 3) {
      logoTapCount.current = 0;
      navigate('/login', {
        state: {
          nextPath: location.pathname,
        },
      });
      return;
    }

    logoTapTimer.current = window.setTimeout(() => {
      logoTapCount.current = 0;
    }, LOGO_LOGIN_TAP_WINDOW_MS);

    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    scrollViewportTop();
  };

  const handleBookNow = () => {
    setOurServicesOpen(false);
    setShowBookNow(true);
  };

  // set localstorage for estonian or english
  const setLanguage = () => {
    const language = localStorage.getItem("language");
    localStorage.setItem("language", language === "ee" ? "en" : "ee");
    window.location.reload();
  };

  const languageSwitchText =
    texts && texts["eesti-keeles"] ? texts["eesti-keeles"].text : "Eesti keeles";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setHideOnScroll(true);
      } else {
        setHideOnScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (logoTapTimer.current) {
        window.clearTimeout(logoTapTimer.current);
      }
    };
  }, []);

  return (
    <div className={`mobile-header${ourServicesOpen ? ' mobile-header--menu-open' : ''}`}>
      <div className="header-logo" onClick={goHome}>
        <img src={logo} alt="Logo" />
      </div>
      {
        virtual ? 
        <div className={`virtual-bar ${hideOnScroll ? 'hide' : ''}`}>
          <img src={baloon_icon} alt="" />
        </div>
        :
        <div className="mobile-header-container">
          <div className="mobile-header-bar">
            {ourServicesOpen ? (
              <div className="mobile-language-switcher">
                <span onClick={setLanguage} style={{ cursor: "pointer" }}>{languageSwitchText}</span>
              </div>
            ) : (
              <div className="mobile-book-now" onClick={handleBookNow}>
                <BookNow texts={texts} />
              </div>
            )}

            <div className="mobile-menu-button" onClick={() => setOurServicesOpen(!ourServicesOpen)}>
              {ourServicesOpen ? (
                <IoMdClose size={"2rem"} />
              ) : (
                <IoMdMenu size={"2rem"} />
              )}
            </div>
          </div>
          {ourServicesOpen && (
            <MobileDropdown texts={texts} misc_texts={misc_texts} setShowBookNow={setShowBookNow} setOurServicesOpen={setOurServicesOpen} />
          )}
        </div>

      }
      
    </div>
  );
}

export default MobileHeader;
