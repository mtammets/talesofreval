import OurTeamCard from './style-components/OurTeamCard';
import ContactsTeamCard from './style-components/ContactsTeamCard';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStorytellers, reset } from '../features/storytellers/storytellerSlice';
import PaymentCard from './PaymentCard';
import { FALLBACK_STORYTELLERS } from '../content/fallbackContent';
import { getLocalizedSiteText, resolveSiteImage } from '../content/siteSettingsDefaults';
import { DEFAULT_PAYMENT_CARD_COPY } from '../content/paymentCardDefaults';
import { normalizePaymentLinks } from '../content/paymentMethods';

const normalizeRosterImage = (image, imageKey = '') => {
  if (image?.src || typeof image === 'string') {
    return image;
  }

  const fallbackSrc = resolveSiteImage(image, imageKey);
  return fallbackSrc ? { src: fallbackSrc } : null;
};

function OurTeamList({
  limit,
  showPaymentButton = false,
  items = null,
  paymentCard = null,
  language = 'en',
}) {
  const dispatch = useDispatch();
  const { storytellers, isError, message } = useSelector((state) => state.storytellers);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const resolvedLanguage = language || localStorage.getItem('language') || 'en';
  const paymentButtonLabel = getLocalizedSiteText(
    paymentCard?.buttonLabel,
    resolvedLanguage,
    getLocalizedSiteText(DEFAULT_PAYMENT_CARD_COPY.buttonLabel, resolvedLanguage)
  );

  useEffect(() => {
    if (items?.length) {
      return undefined;
    }

    dispatch(getStorytellers());

    return () => {
      dispatch(reset());
    };
  }, [dispatch, items]);

  useEffect(() => {
    if (isError && message) {
      console.warn('Storytellers fallback active:', message);
    }
  }, [isError, message]);

  const startPayment = (nextLinks) => {
    setLinks(normalizePaymentLinks(nextLinks));
    setPaymentOpen(true);
  };

  const roster = items?.length
    ? items.map((member) => ({
        _id: member.key,
        name: getLocalizedSiteText(member.name, resolvedLanguage, 'Guide'),
        email: member.email,
        phone: member.phone,
        payment_links: normalizePaymentLinks(member.payment_links),
        image: normalizeRosterImage(member.image, member.imageKey),
      }))
    : storytellers.length
      ? storytellers.map((storyteller) => ({
          ...storyteller,
          payment_links: normalizePaymentLinks(storyteller.payment_links),
          image: normalizeRosterImage(storyteller.image),
        }))
      : FALLBACK_STORYTELLERS;
  const visibleStorytellers = limit ? roster.slice(0, limit) : roster;

  return (
    <div className={showPaymentButton ? "our-team-grid" : "our-team-grid contacts-team-grid"}>
      {visibleStorytellers.map((storyteller) =>
        showPaymentButton ? (
          <OurTeamCard
            key={storyteller._id}
            image={storyteller.image}
            title={storyteller.name}
            email={storyteller.email || ""}
            phone={storyteller.phone || ""}
            links={storyteller.payment_links || []}
            startPayment={startPayment}
            showPaymentButton={showPaymentButton}
            paymentButtonLabel={paymentButtonLabel}
          />
        ) : (
          <ContactsTeamCard
            key={storyteller._id}
            image={storyteller.image}
            title={storyteller.name}
            email={storyteller.email || ""}
            phone={storyteller.phone || ""}
          />
        )
      )}

      {paymentOpen ? (
        <PaymentCard
          links={links}
          copy={paymentCard}
          language={resolvedLanguage}
          closePaymentCard={() => setPaymentOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default OurTeamList;
