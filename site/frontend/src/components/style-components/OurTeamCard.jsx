import {
  getImageObjectPosition,
  getImageZoom,
  resolveSiteImageMedia,
} from '../../content/siteSettingsDefaults';
import PaymentButton from '../style-components/PaymentButton'

const TEAM_CARD_MEDIA_SIZES = '(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw';

function OurTeamCard({image, title, email, phone, links, startPayment, showPaymentButton = false}) {
  const language = localStorage.getItem('language') || 'en';
  const paymentButtonLabel = language === 'ee' ? 'Jäta giidile jootraha' : 'Tip your guide';
  const responsiveMedia =
    image && typeof image === 'object'
      ? resolveSiteImageMedia(image, '', TEAM_CARD_MEDIA_SIZES)
      : null;
  const imageSrc = responsiveMedia?.src || image?.src || image || '';
  const imagePosition = responsiveMedia?.objectPosition || getImageObjectPosition(image);
  const imageZoom = responsiveMedia?.zoom || getImageZoom(image);

  return (
    <div className={`team ${showPaymentButton ? 'team--tippable' : 'team-home'}`}>
      <div className="team-image">
        <img
          src={imageSrc}
          srcSet={responsiveMedia?.srcSet || undefined}
          sizes={responsiveMedia?.sizes || undefined}
          alt={title}
          style={{
            objectPosition: imagePosition,
            transform: `scale(${imageZoom})`,
            transformOrigin: imagePosition,
          }}
        />
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
