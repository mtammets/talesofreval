import React, { useState, useEffect } from "react";
import HeaderBar from "./HeaderBar";
import logo from '../../img/logo.svg';
import { useNavigate } from "react-router-dom";
import baloon_icon from '../../img/baloon-icon.png';

function DesktopHeader({ virtual, ourServicesOpen, setOurServicesOpen, setShowBookNow, texts, misc_texts }) {
  const navigate = useNavigate();
  const [hideOnScroll, setHideOnScroll] = useState(false);

  const navhome = () => {
    setOurServicesOpen(false);
    navigate("/");
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
