import OurTeamCard from './style-components/OurTeamCard';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStorytellers, reset } from '../features/storytellers/storytellerSlice';
import PaymentCard from './PaymentCard';
import { FALLBACK_STORYTELLERS } from '../content/fallbackContent';

function OurTeamList({ limit, showPaymentButton = false }) {
  const dispatch = useDispatch();
  const { storytellers, isError, message } = useSelector((state) => state.storytellers);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    dispatch(getStorytellers());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

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

  const roster = storytellers.length ? storytellers : FALLBACK_STORYTELLERS;
  const visibleStorytellers = limit ? roster.slice(0, limit) : roster;

  return (
    <div className="our-team-grid">
      {visibleStorytellers.map((storyteller) => (
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
      ))}

      {paymentOpen && <PaymentCard name={name} links={links} closePaymentCard={() => setPaymentOpen(false)} />}
    </div>
  );
}

export default OurTeamList;
