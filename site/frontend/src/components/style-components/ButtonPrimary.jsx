import { ArrowRight } from "../../icons/ArrowRight.tsx";
import { ArrowRightUp } from "../../icons/ArrowRightUp.tsx";
import { DownSmall } from "../../icons/DownSmall.tsx";
import { UpSmall } from "../../icons/UpSmall.tsx";

function ButtonPrimary({icon, text, link, onClick}) {
  return (
    <a href={link ? link : null} target="_blank" rel="noopener noreferrer" onClick={onClick}> 
      <button className="button-primary">
          <span className="button-text">{text}</span>
          {icon === 'ArrowRight' && <span className="icon-span-right"><ArrowRight /></span>}
          {icon === 'ArrowRightUp' && <span className="icon-span-right"> <ArrowRightUp /></span>}
          {icon === 'DownSmall' && <span className="icon-span-right"> <DownSmall /></span>}
          {icon === 'UpSmall' && <span className="icon-span-right"> <UpSmall /></span>}
      </button>
    </a>
  )
}

export default ButtonPrimary