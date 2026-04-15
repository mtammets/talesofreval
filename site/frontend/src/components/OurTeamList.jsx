import OurTeamCard from './style-components/OurTeamCard';
import ContactsTeamCard from './style-components/ContactsTeamCard';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStorytellers, reset } from '../features/storytellers/storytellerSlice';
import PaymentCard from './PaymentCard';
import { FALLBACK_STORYTELLERS } from '../content/fallbackContent';
import { resolveSiteImage } from '../content/siteSettingsDefaults';

function OurTeamList({ limit, showPaymentButton = false, items = null }) {
  const dispatch = useDispatch();
  const { storytellers, isError, message } = useSelector((state) => state.storytellers);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [name, setName] = useState('');

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

  const startPayment = (nextName, nextLinks) => {
    setName(nextName);
    setLinks(nextLinks);
    setPaymentOpen(true);
  };

  const roster = items?.length
    ? items.map((member) => ({
        _id: member.key,
        name: member.name,
        email: member.email,
        phone: member.phone,
        payment_links: [],
        image: resolveSiteImage(member.image, member.imageKey),
      }))
    : storytellers.length
      ? storytellers
      : FALLBACK_STORYTELLERS;
  const visibleStorytellers = limit ? roster.slice(0, limit) : roster;

  return (
    <div className={showPaymentButton ? "our-team-grid" : "our-team-grid contacts-team-grid"}>
      {visibleStorytellers.map((storyteller) =>
        showPaymentButton ? (
          <OurTeamCard
            key={storyteller._id}
            bgimage={storyteller.image?.src || storyteller.image}
            title={storyteller.name}
            email={storyteller.email || ""}
            phone={storyteller.phone || ""}
            links={storyteller.payment_links || []}
            startPayment={startPayment}
            showPaymentButton={showPaymentButton}
          />
        ) : (
          <ContactsTeamCard
            key={storyteller._id}
            bgimage={storyteller.image?.src || storyteller.image}
            title={storyteller.name}
            email={storyteller.email || ""}
            phone={storyteller.phone || ""}
          />
        )
      )}

      {paymentOpen && <PaymentCard name={name} links={links} closePaymentCard={() => setPaymentOpen(false)} />}
    </div>
  );
}

export default OurTeamList;
