import { FaAngleRight } from 'react-icons/fa';
import { Link, useLocation } from "react-router-dom";
import { scrollViewportTop } from '../../utils/scrollViewportTop';

function MobileServices({ setOurServicesOpen, texts }) {
  const location = useLocation();
  const teamEventsText = texts && texts["team-events"] ? texts["team-events"].text : null;
  const privateTourText = texts && texts["private-tour"] ? texts["private-tour"].text : null;
  const quickTourText = texts && texts["\"we-only-have-30-minutes!\""] ? texts["\"we-only-have-30-minutes!\""].text : null;
  const destinationManagementText = texts && texts["destination-management"] ? texts["destination-management"].text : null;
  const fantasyWeddingsText = texts && texts["fantasy-weddings"] ? texts["fantasy-weddings"].text : null;
  const handleNavigation = (path) => {
    setOurServicesOpen(false);

    if (location.pathname === path) {
      scrollViewportTop();
    }
  };

  return (
    <div className="mobile-services">
      <Link to="/service/team" onClick={() => handleNavigation('/service/team')}>
        <div className="mobile-service">
          <h5 className="inter">{teamEventsText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/private" onClick={() => handleNavigation('/service/private')}>
        <div className="mobile-service">
          <h5 className="inter">{privateTourText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/quick" onClick={() => handleNavigation('/service/quick')}>
        <div className="mobile-service">
          <h5 className="inter">{quickTourText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/destination" onClick={() => handleNavigation('/service/destination')}>
        <div className="mobile-service">
          <h5 className="inter">{destinationManagementText}</h5>
          <FaAngleRight />
        </div>
      </Link>
      <Link to="/service/wedding" onClick={() => handleNavigation('/service/wedding')}>
        <div className="mobile-service">
          <h5 className="inter">{fantasyWeddingsText}</h5>
          <FaAngleRight />
        </div>
      </Link>
    </div>
  );
}

export default MobileServices;
