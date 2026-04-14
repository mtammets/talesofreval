import { ArrowRight } from "../../icons/ArrowRight.tsx";

function PayNow({link, onClick}) {
  return (
    <a href={link ? link : null} target="_blank" rel="noopener noreferrer" onClick={onClick}> 
      <button className="pay-now">
        <span className="button-text padding-10-right"><b>3.99 €</b></span>
          <span className="button-text padding-10-right">Pay now</span>
          <span className="icon-span-right"><ArrowRight /></span>
      </button>
    </a>
  )
}

export default PayNow