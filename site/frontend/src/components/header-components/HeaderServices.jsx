import destination from '../../img/destination.webp';
import private_tour from '../../img/private.webp';
import pulmad from '../../img/pulmad.webp';
import quick from '../../img/quick.webp';
import team from '../../img/team.webp';
import { getLocalizedSiteText, resolveSiteImage } from '../../content/siteSettingsDefaults';
import ServiceCard from '../style-components/ServiceCard';

const FALLBACK_SERVICE_IMAGES = {
  team,
  private: private_tour,
  quick,
  destination,
  wedding: pulmad,
};

function HeaderServices({
  mobile,
  setOurServicesOpen,
  texts,
  items = [],
  adminAction = null,
}) {
  const language = localStorage.getItem('language') === 'ee' ? 'ee' : 'en';
  const fallbackItems = [
    {
      key: 'team',
      link: 'team',
      title: texts && texts["team-events"] ? texts["team-events"].text : '',
      image: team,
    },
    {
      key: 'private',
      link: 'private',
      title: texts && texts["private-tour"] ? texts["private-tour"].text : '',
      image: private_tour,
    },
    {
      key: 'quick',
      link: 'quick',
      title:
        texts && texts["\"we-only-have-30-minutes!\""]
          ? texts["\"we-only-have-30-minutes!\""].text
          : '',
      image: quick,
    },
    {
      key: 'destination',
      link: 'destination',
      title:
        texts && texts["destination-management"]
          ? texts["destination-management"].text
          : '',
      image: destination,
    },
    {
      key: 'wedding',
      link: 'wedding',
      title: texts && texts["fantasy-weddings"] ? texts["fantasy-weddings"].text : '',
      image: pulmad,
    },
  ];
  const serviceItems = Array.isArray(items) && items.length
    ? items.map((item, index) => ({
        key: item.key || fallbackItems[index]?.key || `service-${index + 1}`,
        link: item.link || fallbackItems[index]?.link || '',
        title: getLocalizedSiteText(item.title, language, fallbackItems[index]?.title || ''),
        image: item.image || null,
        backgroundImage:
          resolveSiteImage(item.image, item.imageKey) ||
          FALLBACK_SERVICE_IMAGES[item.key] ||
          fallbackItems[index]?.image ||
          '',
      }))
    : fallbackItems.map((item) => ({
        ...item,
        backgroundImage: item.image,
      }));

  return (
    <div className="header-services-panel">
      {adminAction ? <div className="header-services-panel__actions">{adminAction}</div> : null}
      <div className="our-services-grid mobile">
        {serviceItems.map((item) => (
          <ServiceCard
            key={item.key}
            setOurServicesOpen={setOurServicesOpen}
            link={item.link}
            mobile={mobile}
            image={item.image}
            bgimage={item.backgroundImage}
            title={item.title}
          />
        ))}
      </div>
    </div>
  );
}

export default HeaderServices;
