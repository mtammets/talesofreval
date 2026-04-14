import ContactsTeamCard from './style-components/ContactsTeamCard';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStorytellers, reset } from '../features/storytellers/storytellerSlice';
import { FALLBACK_STORYTELLERS } from '../content/fallbackContent';

function ContactsTeamList() {
  const dispatch = useDispatch();
  const { storytellers, isError, message } = useSelector((state) => state.storytellers);

  useEffect(() => {
    dispatch(getStorytellers());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      console.warn('Contacts storytellers fallback active:', message);
    }
  }, [isError, message]);

  const roster = storytellers.length ? storytellers : FALLBACK_STORYTELLERS;

  return (
    <div className="contacts-team-grid">
      {roster.map((storyteller) => (
        <ContactsTeamCard
          key={storyteller._id}
          bgimage={storyteller.image?.src || storyteller.image}
          title={storyteller.name}
          email={storyteller.email || ""}
          phone={storyteller.phone || ""}
        />
      ))}
    </div>
  );
}

export default ContactsTeamList;
