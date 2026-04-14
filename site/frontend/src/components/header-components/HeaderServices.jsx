import destination from '../../img/destination.webp';
import private_tour from '../../img/private.webp';
import pulmad from '../../img/pulmad.webp';
import quick from '../../img/quick.webp';
import team from '../../img/team.webp';
import ServiceCard from '../style-components/ServiceCard';

function HeaderServices({ mobile, setOurServicesOpen, texts }) {
  const teamEventsText = texts && texts["team-events"] ? texts["team-events"].text : null;
  const privateTourText = texts && texts["private-tour"] ? texts["private-tour"].text : null;
  const quickTourText = texts && texts["\"we-only-have-30-minutes!\""] ? texts["\"we-only-have-30-minutes!\""].text : null;
  const destinationManagementText = texts && texts["destination-management"] ? texts["destination-management"].text : null;
  const fantasyWeddingsText = texts && texts["fantasy-weddings"] ? texts["fantasy-weddings"].text : null;

  return (
    <div className="our-services-grid mobile">
      <ServiceCard setOurServicesOpen={setOurServicesOpen} link={"team"} mobile={mobile} bgimage={team} title={teamEventsText} />
      <ServiceCard setOurServicesOpen={setOurServicesOpen} link={"private"} mobile={mobile} bgimage={private_tour} title={privateTourText} />
      <ServiceCard setOurServicesOpen={setOurServicesOpen} link={"quick"} mobile={mobile} bgimage={quick} title={quickTourText} />
      <ServiceCard setOurServicesOpen={setOurServicesOpen} link={"destination"} mobile={mobile} bgimage={destination} title={destinationManagementText} />
      <ServiceCard setOurServicesOpen={setOurServicesOpen} link={"wedding"} mobile={mobile} bgimage={pulmad} title={fantasyWeddingsText} />
    </div>
  );
}

export default HeaderServices;
