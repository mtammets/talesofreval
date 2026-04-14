import OurTeamList from './OurTeamList';

function OurTeam({ texts, limit = 3, showPaymentButton = false }) {
  const ourTeamText = texts && texts["our-team"] ? texts["our-team"].text : "";

  return (
    <div className="section our-team padding-80-top">
      <h2 className='padding-20-bottom'>{ourTeamText}</h2>
      <OurTeamList limit={limit} showPaymentButton={showPaymentButton} />
    </div>
  );
}

export default OurTeam;
