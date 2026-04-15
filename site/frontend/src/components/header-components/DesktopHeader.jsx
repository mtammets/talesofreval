import React, { useEffect, useRef, useState } from "react";
import HeaderBar from "./HeaderBar";
import logo from '../../img/logo.svg';
import { useNavigate } from "react-router-dom";
import baloon_icon from '../../img/baloon-icon.png';
import { setStoredStoryAdminAuth } from '../../features/events/storyAdminService';

function DesktopHeader({
  virtual,
  ourServicesOpen,
  setOurServicesOpen,
  setShowBookNow,
  texts,
  misc_texts,
  adminToken,
  setAdminToken,
}) {
  const navigate = useNavigate();
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const navhome = () => {
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

    if (adminToken && logoClickCount.current >= 2) {
      logoClickCount.current = 0;
      setStoredStoryAdminAuth('');
      setAdminToken?.('');
      return;
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
        />
      )}
    </div>
  );
}

export default DesktopHeader;
