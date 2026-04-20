import React, { useEffect, useRef, useState } from "react";
import HeaderBar from "./HeaderBar";
import logo from '../../img/logo.svg';
import { useLocation, useNavigate } from "react-router-dom";
import baloon_icon from '../../img/baloon-icon.png';
import { scrollViewportTop } from '../../utils/scrollViewportTop';

const LOGO_LOGIN_TAP_WINDOW_MS = 1800;

function DesktopHeader({
  virtual,
  ourServicesOpen,
  setOurServicesOpen,
  setShowBookNow,
  texts,
  misc_texts,
  serviceItems,
  isEditMode = false,
  adminToken,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  const navhome = () => {
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
    <div className="header-container">
      <div className="header-logo" onClick={navhome}>
        <img src={logo} alt="" />
      </div>
      {virtual ? (
        <div className={`virtual-bar flex space-between ${hideOnScroll ? 'hide' : ''}`}>
          <img src={baloon_icon} alt="" />
          <a className="dark" href="/">Tales of Reval homepage</a>
        </div>
      ) : (
        <HeaderBar
          texts={texts}
          misc_texts={misc_texts}
          setShowBookNow={setShowBookNow}
          ourServicesOpen={ourServicesOpen}
          setOurServicesOpen={setOurServicesOpen}
          serviceItems={serviceItems}
          isEditMode={isEditMode}
          adminToken={adminToken}
        />
      )}
    </div>
  );
}

export default DesktopHeader;
