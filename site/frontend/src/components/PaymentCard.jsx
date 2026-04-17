import { useEffect, useMemo } from 'react';

import google_logo from '../img/google-logo.png';
import paypal_logo from '../img/paypal-logo.png';
import apple_logo from '../img/apple-logo.png';
import wise_logo from '../img/wise-logo.png';
import { normalizePaymentLinks } from '../content/paymentMethods';

const PAYMENT_COPY = {
  en: {
    title: 'Tip your guide',
    intro:
      'You enjoyed your tour? Or just wanna hug this guy, send us a tip! None of it goes to charity.',
    cancel: 'Cancel',
  },
  ee: {
    title: 'Jäta giidile jootraha',
    intro:
      'Kui tuur meeldis või tahad lihtsalt giidile tänu avaldada, saada tipp otse talle. Mitte sentigi ei lähe heategevusse.',
    cancel: 'Sulge',
  },
};

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

const PaymentMethod = ({ name, link }) => {
  const className = `payment-card__method${link ? '' : ' payment-card__method--disabled'}`;

  if (!link) {
    return (
      <button type="button" className={className} disabled aria-disabled="true">
        {renderMethodContent(name)}
      </button>
    );
  }

  return (
    <a
      href={link}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {renderMethodContent(name)}
    </a>
  );
};

function PaymentCard({ links, closePaymentCard }) {
  const language = localStorage.getItem('language') || 'en';
  const copy = PAYMENT_COPY[language] || PAYMENT_COPY.en;
  const methods = useMemo(() => normalizePaymentLinks(links), [links]);
  const topRow = methods.slice(0, 3);
  const bottomRow = methods.slice(3);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closePaymentCard();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePaymentCard]);

  return (
    <div
      className="payment-card-container"
      onClick={closePaymentCard}
      role="presentation"
    >
      <div
        className="payment-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-card-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="payment-card-title">{copy.title}</h2>
        <p className="payment-card__intro">{copy.intro}</p>

        <div className="payment-card__row payment-card__row--three">
          {topRow.map((method) => (
            <PaymentMethod key={method.name} name={method.name} link={method.link} />
          ))}
        </div>

        <div className="payment-card__row payment-card__row--two">
          {bottomRow.map((method) => (
            <PaymentMethod key={method.name} name={method.name} link={method.link} />
          ))}
        </div>

        <div className="payment-card__actions">
          <button
            type="button"
            className="payment-card__cancel"
            onClick={closePaymentCard}
          >
            {copy.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCard;
