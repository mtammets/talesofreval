import PaymentButton from '../style-components/PaymentButton'

function OurTeamCard({bgimage, title, email, phone, links, startPayment, showPaymentButton = false}) {
  const firstName = (title || "").split(' ')[0] || "Host";
  return (
    <div className={`team ${showPaymentButton ? '' : 'team-home'}`}>
      <div className="team-image">
        <img src={bgimage} alt={title} />
      </div>
      <div className={`team-info ${showPaymentButton ? '' : 'team-home-info'}`}>
        <h5 className="team-name blue-text padding-20-bottom">{title}</h5>
        {email === "" ? null : <a className="team-email mail" href={`mailto:${email}`}>{email}</a>}
        {phone === "" ? null : <a className="team-phone phone bold padding-20-top padding-20-bottom" href={`tel:${phone}`}>{phone}</a>}
        {showPaymentButton ? (
          <PaymentButton text={`Tip ${firstName === "Apprentice" ? "Nicole" : firstName}`} onClick={() => startPayment(title, links)} />
        ) : null}
      </div>
    </div>
  )
}

export default OurTeamCard
