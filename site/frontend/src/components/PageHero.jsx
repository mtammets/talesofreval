import { useEffect, useMemo, useState } from 'react';

const HERO_SLIDE_INTERVAL_MS = 9000;

function PageHero({
  className = '',
  mediaClassName = '',
  backgroundImage = '',
  backgroundImages = [],
  backgroundMedia = null,
  backgroundMediaItems = [],
  isEditable = false,
  onEditBackground,
  overlay = null,
  children,
}) {
  const wrapperClassName = ['page-hero', className].filter(Boolean).join(' ');
  const heroMediaClassName = ['page-hero__media', mediaClassName].filter(Boolean).join(' ');
  const heroMediaEntries = useMemo(() => {
    const mediaItems = Array.isArray(backgroundMediaItems)
      ? backgroundMediaItems.filter((mediaItem) => mediaItem?.src)
      : [];

    if (mediaItems.length) {
      return mediaItems;
    }

    if (backgroundMedia?.src) {
      return [backgroundMedia];
    }

    const imageUrls = Array.isArray(backgroundImages) ? backgroundImages.filter(Boolean) : [];

    if (imageUrls.length) {
      return imageUrls.map((src) => ({
        src,
        srcSet: '',
        sizes: '100vw',
      }));
    }

    return backgroundImage
      ? [
          {
            src: backgroundImage,
            srcSet: '',
            sizes: '100vw',
          },
        ]
      : [];
  }, [backgroundImage, backgroundImages, backgroundMedia, backgroundMediaItems]);
  const heroImageSignature = heroMediaEntries.map((entry) => entry.src).join('||');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadedImageIndexes, setLoadedImageIndexes] = useState([]);

  useEffect(() => {
    setActiveImageIndex(0);
    setLoadedImageIndexes(
      heroMediaEntries.length > 1 ? [0, 1] : heroMediaEntries.length ? [0] : []
    );
  }, [heroImageSignature, heroMediaEntries.length]);

  useEffect(() => {
    if (heroMediaEntries.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % heroMediaEntries.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [heroImageSignature, heroMediaEntries.length]);

  useEffect(() => {
    if (heroMediaEntries.length < 2) {
      return;
    }

    const nextIndex = (activeImageIndex + 1) % heroMediaEntries.length;
    setLoadedImageIndexes((current) =>
      current.includes(nextIndex) ? current : [...current, nextIndex]
    );
  }, [activeImageIndex, heroImageSignature, heroMediaEntries.length]);

  return (
    <section className={wrapperClassName}>
      <div className={heroMediaClassName}>
        {heroMediaEntries.length ? (
          <div className="page-hero__media-layers" aria-hidden="true">
            {heroMediaEntries.map((mediaItem, index) =>
              loadedImageIndexes.includes(index) ? (
                <div
                  key={`${mediaItem.src}-${index}`}
                  className={`page-hero__media-layer${
                    index === activeImageIndex ? ' is-active' : ''
                  }`}
                >
                  <img
                    className="page-hero__media-image"
                    src={mediaItem.src}
                    srcSet={mediaItem.srcSet || undefined}
                    sizes={mediaItem.sizes || undefined}
                    style={{
                      objectPosition: mediaItem.objectPosition || '50% 50%',
                      transform: `scale(${Number(mediaItem.zoom) || 1})`,
                      transformOrigin: mediaItem.objectPosition || '50% 50%',
                    }}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchpriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                  />
                </div>
              ) : null
            )}
          </div>
        ) : null}
        {overlay ? <div className="page-hero__overlay">{overlay}</div> : null}
        {isEditable ? (
          <div className="page-hero__admin-actions">
            <button type="button" onClick={onEditBackground}>
              Edit hero
            </button>
          </div>
        ) : null}
        {children ? <div className="page-hero__content">{children}</div> : null}
      </div>
    </section>
  );
}

export default PageHero;
