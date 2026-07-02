import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import PageHero from '../components/PageHero';
import SeoHead, {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from '../components/SeoHead';
import {
  DEFAULT_SITE_SETTINGS,
  HERO_MEDIA_SIZES,
  resolveSiteImageMedia,
} from '../content/siteSettingsDefaults';

const SORO_BLOG_EMBED_ID =
  process.env.REACT_APP_SORO_BLOG_EMBED_ID || '784da2e5-b950-4b11-bbcb-c05d76ba86d0';
const SORO_BLOG_CONTAINER_ID = 'soro-blog';

const PAGE_COPY = {
  en: {
    description:
      'Read medieval Tallinn stories, travel insights and behind-the-scenes notes from Tales of Reval.',
    embedError:
      'The blog feed is temporarily unavailable. Please try again shortly or contact us directly.',
    intro:
      'A running collection of stories, ideas and practical insights around Tallinn, storytelling and guest experience.',
    title: 'Blog',
  },
  ee: {
    description:
      'Loe Tallinna keskaegseid lugusid, praktilisi soovitusi ja telgitaguseid mõtteid Tales of Revali tegemistest.',
    embedError:
      'Blogivoog ei ole hetkel saadaval. Proovi mõne aja pärast uuesti või võta meiega otse ühendust.',
    intro:
      'Siia koguneb pidevalt lugusid, ideid ja praktilisi tähelepanekuid Tallinna, lugude jutustamise ning külaliskogemuse kohta.',
    title: 'Blogi',
  },
};

const buildSoroEmbedUrl = (search = '') => {
  const url = new URL(`https://app.trysoro.com/api/embed/${SORO_BLOG_EMBED_ID}`);
  const params = new URLSearchParams(search);
  const post = params.get('post');

  if (post) {
    url.searchParams.set('post', post);
  }

  return url.toString();
};

function BlogPage({ siteSettings = DEFAULT_SITE_SETTINGS }) {
  const location = useLocation();
  const embedRootRef = useRef(null);
  const [embedError, setEmbedError] = useState(false);
  const language =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('language') || 'en'
      : 'en';
  const pageCopy = PAGE_COPY[language] || PAGE_COPY.en;
  const heroMedia = resolveSiteImageMedia(
    siteSettings.storyPage?.image,
    siteSettings.storyPage?.imageKey || 'storyBg',
    HERO_MEDIA_SIZES
  );

  useEffect(() => {
    const embedRoot = embedRootRef.current;
    const embedWrapper = embedRoot?.parentElement;
    if (!embedRoot || !embedWrapper) {
      return undefined;
    }

    embedRoot.innerHTML = '';
    setEmbedError(false);

    const scriptElement = document.createElement('script');
    scriptElement.src = buildSoroEmbedUrl(location.search);
    scriptElement.defer = true;
    scriptElement.async = true;
    scriptElement.onerror = () => {
      setEmbedError(true);
    };

    embedWrapper.appendChild(scriptElement);

    return () => {
      scriptElement.onerror = null;
      scriptElement.remove();
      embedRoot.innerHTML = '';
    };
  }, [location.search]);

  return (
    <div className="blog-page">
      <SeoHead
        title={
          language === 'ee'
            ? 'Blogi | Tales of Reval'
            : 'Blog | Tales of Reval'
        }
        description={pageCopy.description}
        path="/blog"
        image={heroMedia?.src}
        imageAlt={pageCopy.title}
        language={language}
        keywords={
          language === 'ee'
            ? 'Tallinna blogi, keskaegne Tallinn, Tallinna lood, Tallinna elamused, Tales of Reval blogi'
            : 'Tallinn blog, medieval Tallinn, Tallinn stories, Tallinn experiences, Tales of Reval blog'
        }
        schema={[
          buildWebPageSchema({
            title:
              language === 'ee'
                ? 'Blogi | Tales of Reval'
                : 'Blog | Tales of Reval',
            description: pageCopy.description,
            path: '/blog',
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
              path: '/blog',
            },
          ]),
        ]}
      />

      <PageHero
        className="service-page-hero blog-page-hero"
        mediaClassName="blog-page-hero__media"
        backgroundMedia={heroMedia}
      >
        <h1>{pageCopy.title}</h1>
      </PageHero>

      <div className="container blog-page__container">
        <div className="tagline padding-40-top padding-40-bottom blog-page__intro">
          <h4 className="cardo">{pageCopy.intro}</h4>
          <p>{pageCopy.description}</p>
        </div>

        <section className="blog-embed-section" aria-label={pageCopy.title}>
          <div className="blog-embed-shell">
            <div id={SORO_BLOG_CONTAINER_ID} ref={embedRootRef}></div>
            {embedError ? (
              <p className="blog-embed-error">{pageCopy.embedError}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BlogPage;
