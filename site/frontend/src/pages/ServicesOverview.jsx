import OurServices from '../components/OurServices';
import PageHero from '../components/PageHero';
import SeoHead, {
  buildBreadcrumbSchema,
  buildAbsoluteUrl,
  buildWebPageSchema,
} from '../components/SeoHead';
import {
  DEFAULT_SITE_SETTINGS,
  HERO_MEDIA_SIZES,
  getLocalizedSiteText,
  resolveSiteImageMedia,
} from '../content/siteSettingsDefaults';

const PAGE_COPY = {
  en: {
    description:
      'Browse our medieval tours, private experiences, destination management and themed celebrations in Tallinn.',
    title: 'Our services',
  },
  ee: {
    description:
      'Tutvu meie keskaegsete tuuride, privaatelamuste, sihtkoha halduse ja temaatiliste pidustustega Tallinnas.',
    title: 'Meie teenused',
  },
};

function ServicesOverview({ siteSettings = DEFAULT_SITE_SETTINGS }) {
  const language = localStorage.getItem('language') || 'en';
  const pageCopy = PAGE_COPY[language] || PAGE_COPY.en;
  const heroMedia = resolveSiteImageMedia(
    siteSettings.servicePageHeroes?.team?.image,
    siteSettings.servicePageHeroes?.team?.imageKey || 'serviceTeamHero',
    HERO_MEDIA_SIZES
  );
  const socialLinks = Object.values(siteSettings.footer?.socialLinks || {}).filter(Boolean);

  return (
    <div className="service-page services-overview-page">
      <SeoHead
        title={
          language === 'ee'
            ? 'Teenused ja keskaegsed elamused Tallinnas | Tales of Reval'
            : 'Services and Medieval Experiences in Tallinn | Tales of Reval'
        }
        description={pageCopy.description}
        path="/services"
        image={heroMedia?.src}
        imageAlt={pageCopy.title}
        language={language}
        keywords={
          language === 'ee'
            ? 'Tallinna teenused, keskaegsed elamused Tallinnas, privaattuurid Tallinnas, tiimiüritused Tallinnas, sihtkoha haldus Eestis'
            : 'Tallinn tour services, medieval experiences Tallinn, private tours Tallinn, team events Tallinn, destination management Estonia'
        }
        schema={[
          buildWebPageSchema({
            title:
              language === 'ee'
                ? 'Teenused ja keskaegsed elamused Tallinnas | Tales of Reval'
                : 'Services and Medieval Experiences in Tallinn | Tales of Reval',
            description: pageCopy.description,
            path: '/services',
            image: heroMedia?.src,
            language,
            type: 'CollectionPage',
          }),
          buildBreadcrumbSchema([
            {
              name: language === 'ee' ? 'Avaleht' : 'Home',
              path: '/',
            },
            {
              name: pageCopy.title,
              path: '/services',
            },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: pageCopy.title,
            itemListElement: (siteSettings.homeServices?.items || []).map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: getLocalizedSiteText(item.title, language, item.key || ''),
              url: buildAbsoluteUrl(`/service/${item.link}`),
            })),
          },
          socialLinks.length
            ? {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Tales of Reval',
                url: buildAbsoluteUrl('/services'),
                sameAs: socialLinks,
              }
            : null,
        ]}
      />
      <PageHero
        className="service-page-hero"
        mediaClassName="service-landing"
        backgroundMedia={heroMedia}
      >
        <h1>{pageCopy.title}</h1>
      </PageHero>

      <div className="container">
        <div className="tagline padding-40-top padding-40-bottom">
          <h4 className="cardo">{pageCopy.description}</h4>
        </div>
        <OurServices
          heading={siteSettings.homeServices.heading}
          items={siteSettings.homeServices.items}
          language={language}
          compact={false}
        />
      </div>
    </div>
  );
}

export default ServicesOverview;
