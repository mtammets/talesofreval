import { TripAdvisor } from "../../icons/TripAdvisor.tsx";
import { AirBnB } from "../../icons/AirBnB.tsx";
import { Facebook } from "../../icons/Facebook.tsx";
import { Instagram } from "../../icons/Instagram.tsx";
import { ArrowRightUp } from "../../icons/ArrowRightUp.tsx";

function SocialButton({text, icon, link}) {
  const socialIcon = {
    TripAdvisor: <TripAdvisor size="1.2rem" />,
    AirBnB: <AirBnB size="1.2rem" />,
    Facebook: <Facebook size="1.2rem" />,
    Instagram: <Instagram size="1.2rem" />,
  }[icon];

  return (
    <a className="button-social" href={link} target="_blank" rel="noopener noreferrer">
      <div className="icon-and-text">
        <span className="icon-span-left">{socialIcon}</span>
        <span className="button-social__label">{text}</span>
      </div>
      <div className="icon-arrow" aria-hidden="true">
        <ArrowRightUp size="1rem" />
      </div>
    </a>
  )
}

export default SocialButton
