import { useEffect, useState } from 'react';
import destination from '../img/destination.webp';
import private_tour from '../img/private.webp';
import pulmad from '../img/pulmad.webp';
import quick from '../img/quick.webp';
import team from '../img/team.webp';
import ServiceCard from './style-components/ServiceCard';
import { getLocalizedSiteText, resolveSiteImage } from '../content/siteSettingsDefaults';

const FIGMA_SERVICE_TITLES = {
  team: 'Team events',
  private: 'Private tour',
  quick: '"We Only Have 30 Minutes!"',
  destination: 'Destination management',
  wedding: 'Fantasy Weddings'
};

function ServicesList({ texts, compact = false, itemsOverride = null, language = 'en' }) {
  const [smallScreen, setSmallScreen] = useState(window.innerWidth < 1100 && window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setSmallScreen(window.innerWidth < 1100 && window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const teamEventsText = texts && texts["team-events"] ? texts["team-events"].text : "";
  const privateTourText = texts && texts["private-tour"] ? texts["private-tour"].text : "";
  const quickTourText = texts && texts["\"we-only-have-30-minutes!\""] ? texts["\"we-only-have-30-minutes!\""].text : "";
  const destinationManagementText = texts && texts["destination-management"] ? texts["destination-management"].text : "";
  const fantasyWeddingsText = texts && texts["fantasy-weddings"] ? texts["fantasy-weddings"].text : "";
  const fallbackItems = [
    {
      key: 'team',
      link: 'team',
      image: team,
      title: compact ? FIGMA_SERVICE_TITLES.team : teamEventsText,
      description: null
    },
    {
      key: 'private',
      link: 'private',
      image: private_tour,
      title: compact ? FIGMA_SERVICE_TITLES.private : privateTourText,
      description: null
    },
    {
      key: 'quick',
      link: 'quick',
      image: quick,
      title: compact ? FIGMA_SERVICE_TITLES.quick : quickTourText,
      description: null
    },
    {
      key: 'destination',
      link: 'destination',
      image: destination,
      title: compact ? FIGMA_SERVICE_TITLES.destination : destinationManagementText,
      description: null
    },
    {
      key: 'wedding',
      link: 'wedding',
      image: pulmad,
      title: compact ? FIGMA_SERVICE_TITLES.wedding : fantasyWeddingsText,
      description: null
    }
  ];

  const serviceItems = Array.isArray(itemsOverride) && itemsOverride.length
    ? itemsOverride.map((item, index) => ({
        key: item.key || fallbackItems[index]?.key || `service-${index + 1}`,
        link: item.link || fallbackItems[index]?.link || `service-${index + 1}`,
        image: resolveSiteImage(item.image, item.imageKey) || fallbackItems[index]?.image,
        title: getLocalizedSiteText(item.title, language, fallbackItems[index]?.title || ''),
        description: compact
          ? null
          : getLocalizedSiteText(item.description, language, fallbackItems[index]?.description || ''),
      }))
    : fallbackItems;

  return (
    <>
      {smallScreen ? (
        <>
          <div className="our-services-grid tripple">
            {serviceItems.slice(0, 3).map((item) => (
              <ServiceCard
                key={item.key}
                link={item.link}
                bgimage={item.image}
                title={item.title}
                description={item.description}
                compact={compact}
              />
            ))}
          </div>

          <div className="our-services-grid double">
            {serviceItems.slice(3).map((item) => (
              <ServiceCard
                key={item.key}
                link={item.link}
                bgimage={item.image}
                title={item.title}
                description={item.description}
                compact={compact}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="our-services-grid">
            {serviceItems.map((item) => (
              <ServiceCard
                key={item.key}
                link={item.link}
                bgimage={item.image}
                title={item.title}
                description={item.description}
                compact={compact}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default ServicesList;
