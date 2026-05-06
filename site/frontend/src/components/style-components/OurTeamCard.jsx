import {
  getLocalizedSiteText,
  getImageObjectPosition,
  getImageZoom,
  resolveSiteImageMedia,
} from '../../content/siteSettingsDefaults';
import { DEFAULT_PAYMENT_CARD_COPY } from '../../content/paymentCardDefaults';
import PaymentButton from '../style-components/PaymentButton'

const TEAM_CARD_MEDIA_SIZES = '(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw';

function OurTeamCard({
  image,
  title,
  links,
  startPayment,
  showPaymentButton = false,
  paymentButtonLabel = '',
}) {
  const language = localStorage.getItem('language') || 'en';
  const resolvedPaymentButtonLabel =
    paymentButtonLabel ||
    getLocalizedSiteText(
      DEFAULT_PAYMENT_CARD_COPY.buttonLabel,
      language,
      DEFAULT_PAYMENT_CARD_COPY.buttonLabel.en
    );
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
        {showPaymentButton ? (
          <PaymentButton text={resolvedPaymentButtonLabel} onClick={() => startPayment(links)} />
        ) : null}
      </div>
    </div>
  )
}

export default OurTeamCard
