import ContactsTeamList from './ContactsTeamList';

import Reviews from './Reviews';

function ContactsTeam({ texts, contactPage = false, heading, items, language = 'en', adminAction = null }) {
  const ourTeamText = heading
    ? (language === 'ee' ? heading.ee || heading.en : heading.en || heading.ee)
    : texts && texts["our-team"] ? texts["our-team"].text : "";

  return (
    <div className="section our-team padding-80-top">
      <div className="section-heading-row">
        <h2 className='padding-20-bottom'>{ourTeamText}</h2>
        {adminAction}
      </div>
      <ContactsTeamList items={items} />
      {!contactPage && <Reviews misc_texts={texts} />}
    </div>
  );
}

export default ContactsTeam;
