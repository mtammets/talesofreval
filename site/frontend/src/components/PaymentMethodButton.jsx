import google_logo from '../img/google-logo.png';
import paypal_logo from '../img/paypal-logo.png';
import apple_logo from '../img/apple-logo.png';
import wise_logo from '../img/wise-logo.png';

const PAYMENT_METHOD_META = {
  Wise: {
    logo: wise_logo,
    alt: 'Wise',
    className: 'payment-card__logo payment-card__logo--wise',
  },
  'Apple Pay': {
    logo: apple_logo,
    alt: 'Apple Pay',
    className: 'payment-card__logo payment-card__logo--apple',
  },
  'Google Pay': {
    logo: google_logo,
    alt: 'Google Pay',
    className: 'payment-card__logo payment-card__logo--google',
  },
  PayPal: {
    logo: paypal_logo,
    alt: 'PayPal',
    className: 'payment-card__logo payment-card__logo--paypal',
  },
  Revolut: null,
};

const renderMethodContent = (name) => {
  const meta = PAYMENT_METHOD_META[name];

  if (!meta) {
    return <span className="payment-card__label">{name}</span>;
  }

  return <img src={meta.logo} alt={meta.alt} className={meta.className} />;
};

function PaymentMethodButton({
  name,
  link,
  className = 'payment-card__method',
  disabledClassName = 'payment-card__method--disabled',
  openInNewTab = true,
}) {
  const resolvedClassName = `${className}${link ? '' : ` ${disabledClassName}`}`;

  if (!link) {
    return (
      <button type="button" className={resolvedClassName} disabled aria-disabled="true">
        {renderMethodContent(name)}
      </button>
    );
  }

  return (
    <a
      href={link}
      className={resolvedClassName}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {renderMethodContent(name)}
    </a>
  );
}

export default PaymentMethodButton;
