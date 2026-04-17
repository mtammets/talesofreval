import { ArrowRight } from "../../icons/ArrowRight.tsx";

function PaymentButton({text, onClick}) {
  return (
    <button type="button" className="payment-button" onClick={onClick}>
      <span className="button-text">{text}</span>
      <span className="icon-span-right"><ArrowRight /></span>
    </button>
  )
}

export default PaymentButton
