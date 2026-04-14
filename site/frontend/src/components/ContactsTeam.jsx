import ContactsTeamList from './ContactsTeamList';

import Reviews from './Reviews';

function ContactsTeam({ texts, contactPage = false }) {
  const ourTeamText = texts && texts["our-team"] ? texts["our-team"].text : "";

  return (
    <div className="section our-team padding-80-top">
      <h2 className='padding-20-bottom'>{ourTeamText}</h2>
      <ContactsTeamList />
      {!contactPage && <Reviews misc_texts={texts} />}
    </div>
  );
}

export default ContactsTeam;