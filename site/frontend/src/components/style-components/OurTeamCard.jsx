import PaymentButton from '../style-components/PaymentButton'

function OurTeamCard({bgimage, title, email, phone, links, startPayment, showPaymentButton = false}) {
  const language = localStorage.getItem('language') || 'en';
  const paymentButtonLabel = language === 'ee' ? 'Jäta giidile jootraha' : 'Tip your guide';

  return (
    <div className={`team ${showPaymentButton ? 'team--tippable' : 'team-home'}`}>
      <div className="team-image">
        <img src={bgimage} alt={title} />
      </div>
      <div className={`team-info ${showPaymentButton ? 'team-info--tippable' : 'team-home-info'}`}>
        <h5 className="team-name blue-text padding-20-bottom">{title}</h5>
        {email === "" ? null : <a className={`team-email mail ${showPaymentButton ? 'team-link--tippable' : ''}`} href={`mailto:${email}`}>{email}</a>}
        {phone === "" ? null : <a className={`team-phone phone bold ${showPaymentButton ? 'team-link--tippable team-link--phone' : 'padding-20-top padding-20-bottom'}`} href={`tel:${phone}`}>{phone}</a>}
        {showPaymentButton ? (
          <PaymentButton text={paymentButtonLabel} onClick={() => startPayment(links)} />
        ) : null}
      </div>
    </div>
  )
}

export default OurTeamCard
