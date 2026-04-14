import { ArrowRight } from "../../icons/ArrowRight.tsx";

function PaymentButton({text, link, onClick}) {
  return (
    <a href={link ? link : null} target="_blank" rel="noopener noreferrer" onClick={onClick}> 
      <button className="payment-button">
          <span className="button-text">{text}</span>
          <span className="icon-span-right"><ArrowRight /></span>
      </button>
    </a>
  )
}

export default PaymentButton