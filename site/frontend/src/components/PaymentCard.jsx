import { useEffect, useMemo } from 'react';

import { getLocalizedSiteText } from '../content/siteSettingsDefaults';
import { DEFAULT_PAYMENT_CARD_COPY } from '../content/paymentCardDefaults';
import { normalizePaymentLinks } from '../content/paymentMethods';
import PaymentMethodButton from './PaymentMethodButton';

function PaymentCard({ links, closePaymentCard, copy = null, language = null }) {
  const resolvedLanguage = language || localStorage.getItem('language') || 'en';
  const resolvedCopy = {
    title: getLocalizedSiteText(
      copy?.title,
      resolvedLanguage,
      getLocalizedSiteText(DEFAULT_PAYMENT_CARD_COPY.title, resolvedLanguage)
    ),
    intro: getLocalizedSiteText(
      copy?.intro,
      resolvedLanguage,
      getLocalizedSiteText(DEFAULT_PAYMENT_CARD_COPY.intro, resolvedLanguage)
    ),
    closeLabel: getLocalizedSiteText(
      copy?.closeLabel,
      resolvedLanguage,
      getLocalizedSiteText(DEFAULT_PAYMENT_CARD_COPY.closeLabel, resolvedLanguage)
    ),
  };
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
        <h2 id="payment-card-title">{resolvedCopy.title}</h2>
        <p className="payment-card__intro">{resolvedCopy.intro}</p>

        <div className="payment-card__row payment-card__row--three">
          {topRow.map((method) => (
            <PaymentMethodButton key={method.name} name={method.name} link={method.link} />
          ))}
        </div>

        <div className="payment-card__row payment-card__row--two">
          {bottomRow.map((method) => (
            <PaymentMethodButton key={method.name} name={method.name} link={method.link} />
          ))}
        </div>

        <div className="payment-card__actions">
          <button
            type="button"
            className="payment-card__cancel"
            onClick={closePaymentCard}
          >
            {resolvedCopy.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCard;
