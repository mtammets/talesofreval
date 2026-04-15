import OurTeamList from './OurTeamList';
import { getLocalizedSiteText } from '../content/siteSettingsDefaults';

function OurTeam({
  texts,
  limit = 3,
  showPaymentButton = false,
  heading,
  items,
  language = 'en',
  adminAction = null,
}) {
  const ourTeamText = heading
    ? getLocalizedSiteText(heading, language)
    : texts && texts["our-team"] ? texts["our-team"].text : "";

  return (
    <div className="section our-team padding-80-top">
      <div className="section-heading-row">
        <h2 className='padding-20-bottom'>{ourTeamText}</h2>
        {adminAction}
      </div>
      <OurTeamList limit={limit} showPaymentButton={showPaymentButton} items={items} />
    </div>
  );
}

export default OurTeam;
