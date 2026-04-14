import { useEffect, useState } from 'react';
import destination from '../img/destination.webp';
import private_tour from '../img/private.webp';
import pulmad from '../img/pulmad.webp';
import quick from '../img/quick.webp';
import team from '../img/team.webp';
import ServiceCard from './style-components/ServiceCard';

const SERVICE_COPY = {
  team: {
    description:
      'Interactive medieval team events in Tallinn that bring guests together through humor, storytelling and live performance.'
  },
  private: {
    description:
      'Private guided experiences and immersive performances tailored for families, partners, delegations and special guests.'
  },
  quick: {
    description:
      'A short-format Tallinn experience for visitors with limited time who still want a memorable medieval story.'
  },
  destination: {
    description:
      'Destination management support for curated Tallinn programmes, hosted experiences and group itineraries.'
  },
  wedding: {
    description:
      'Fantasy wedding concepts and themed celebrations with hosts, performers and a distinctive medieval atmosphere.'
  }
};

const FIGMA_SERVICE_TITLES = {
  team: 'Team events',
  private: 'Private tour',
  quick: '"We Only Have 30 Minutes!"',
  destination: 'Destination management',
  wedding: 'Fantasy Weddings'
};

function ServicesList({ texts, compact = false }) {
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
  const serviceItems = [
    {
      key: 'team',
      link: 'team',
      image: team,
      title: compact ? FIGMA_SERVICE_TITLES.team : teamEventsText,
      description: compact ? null : SERVICE_COPY.team.description
    },
    {
      key: 'private',
      link: 'private',
      image: private_tour,
      title: compact ? FIGMA_SERVICE_TITLES.private : privateTourText,
      description: compact ? null : SERVICE_COPY.private.description
    },
    {
      key: 'quick',
      link: 'quick',
      image: quick,
      title: compact ? FIGMA_SERVICE_TITLES.quick : quickTourText,
      description: compact ? null : SERVICE_COPY.quick.description
    },
    {
      key: 'destination',
      link: 'destination',
      image: destination,
      title: compact ? FIGMA_SERVICE_TITLES.destination : destinationManagementText,
      description: compact ? null : SERVICE_COPY.destination.description
    },
    {
      key: 'wedding',
      link: 'wedding',
      image: pulmad,
      title: compact ? FIGMA_SERVICE_TITLES.wedding : fantasyWeddingsText,
      description: compact ? null : SERVICE_COPY.wedding.description
    }
  ];

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
