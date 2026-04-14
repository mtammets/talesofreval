import { FaAngleRight } from 'react-icons/fa';
import { Link } from "react-router-dom";

function MobileServices({ setOurServicesOpen, texts }) {
  const teamEventsText = texts && texts["team-events"] ? texts["team-events"].text : null;
  const privateTourText = texts && texts["private-tour"] ? texts["private-tour"].text : null;
  const quickTourText = texts && texts["\"we-only-have-30-minutes!\""] ? texts["\"we-only-have-30-minutes!\""].text : null;
  const destinationManagementText = texts && texts["destination-management"] ? texts["destination-management"].text : null;
  const fantasyWeddingsText = texts && texts["fantasy-weddings"] ? texts["fantasy-weddings"].text : null;

  return (
    <div className="mobile-services">
      <Link to="/service/team" onClick={() => setOurServicesOpen(false)}>
        <div className="mobile-service">
          <h5 className="inter">{teamEventsText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/private" onClick={() => setOurServicesOpen(false)}>
        <div className="mobile-service">
          <h5 className="inter">{privateTourText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/quick" onClick={() => setOurServicesOpen(false)}>
        <div className="mobile-service">
          <h5 className="inter">{quickTourText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/destination" onClick={() => setOurServicesOpen(false)}>
        <div className="mobile-service">
          <h5 className="inter">{destinationManagementText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/wedding" onClick={() => setOurServicesOpen(false)}>
        <div className="mobile-service">
          <h5 className="inter">{fantasyWeddingsText}</h5>
          <FaAngleRight />
        </div>
      </Link>
    </div>
  );
}

export default MobileServices;
