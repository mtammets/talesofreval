import React, { useState, useEffect } from 'react';
import { TripAdvisor } from "../../icons/TripAdvisor.tsx";
import { AirBnB } from "../../icons/AirBnB.tsx";
import { Facebook } from "../../icons/Facebook.tsx";
import { Instagram } from "../../icons/Instagram.tsx";
import { ArrowRightUp } from "../../icons/ArrowRightUp.tsx";

function SocialButton({text, icon, link}) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <a className="button-social" href={link} target="_blank" rel="noopener noreferrer">
      <div className="icon-and-text">
        {icon === 'TripAdvisor' && <span className="icon-span-left"><TripAdvisor size={mobile ? "1.5rem" : "1.15rem"}/></span>}
        {icon === 'AirBnB' && <span className="icon-span-left"><AirBnB size={mobile ? "1.5rem" : "1.15rem"}/></span>}
        {icon === 'Facebook' && <span className="icon-span-left"><Facebook size={mobile ? "1.5rem" : "1.15rem"}/></span>}
        {icon === 'Instagram' && <span className="icon-span-left"><Instagram size={mobile ? "1.5rem" : "1.15rem"}/></span>}
        {!mobile && <span>{text}</span>}
      </div>
      {!mobile && (
        <div className="icon-arrow">
          <span className="icon-span-right-far">
            <ArrowRightUp size="1rem" />
          </span>
        </div>
      )}
    </a>
  )
}

export default SocialButton
