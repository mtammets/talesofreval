import logo from '../../img/logo.svg';
import { IoMdClose } from "react-icons/io";
import { IoMdMenu } from "react-icons/io";
import BookNow from '../style-components/BookNow';
import MobileDropdown from './MobileDropdown';
import { useNavigate } from 'react-router-dom';
import baloon_icon from '../../img/baloon-icon.png';
import { useState, useEffect, useRef } from 'react';

function MobileHeader({ virtual, ourServicesOpen, setOurServicesOpen, setShowBookNow, texts, misc_texts }) {

  const navigate = useNavigate();
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const goHome = () => {
    const isHomePage = window.location.pathname === '/';

    setOurServicesOpen(false);

    if (!isHomePage) {
      navigate("/");
      return;
    }

    logoClickCount.current += 1;

    if (logoClickTimer.current) {
      window.clearTimeout(logoClickTimer.current);
    }

    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0;
      navigate('/login', {
        state: {
          nextPath: window.location.pathname,
        },
      });
      return;
    }

    logoClickTimer.current = window.setTimeout(() => {
      logoClickCount.current = 0;
    }, 900);
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
      if (logoClickTimer.current) {
        window.clearTimeout(logoClickTimer.current);
      }
    };
  }, []);

  return (
    <div className="mobile-header">
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
                <span onClick={setLanguage} style={{ cursor: "pointer" }}>Eesti keeles</span>
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
