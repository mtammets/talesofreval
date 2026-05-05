import { render } from '@testing-library/react';

import PageHero from './PageHero';

describe('PageHero', () => {
  test('starts the carousel from the requested initial image index', () => {
    const { container } = render(
      <PageHero
        backgroundMediaItems={[
          { src: '/hero-1.webp' },
          { src: '/hero-2.webp' },
          { src: '/hero-3.webp' },
        ]}
        initialImageIndex={2}
      />
    );

    const activeLayer = container.querySelector('.page-hero__media-layer.is-active');
    const eagerImage = container.querySelector('img[loading="eager"]');

    expect(activeLayer?.querySelector('img')?.getAttribute('src')).toBe('/hero-3.webp');
    expect(eagerImage?.getAttribute('src')).toBe('/hero-3.webp');
  });

  test('falls back to the first image when the requested index is out of range', () => {
    const { container } = render(
      <PageHero
        backgroundMediaItems={[{ src: '/hero-1.webp' }, { src: '/hero-2.webp' }]}
        initialImageIndex={99}
      />
    );

    const activeLayer = container.querySelector('.page-hero__media-layer.is-active');

    expect(activeLayer?.querySelector('img')?.getAttribute('src')).toBe('/hero-1.webp');
  });

  test('passes separate desktop and mobile crop variables to the hero image', () => {
    const { container } = render(
      <PageHero
        backgroundMediaItems={[
          {
            src: '/hero-1.webp',
            objectPosition: '34% 61%',
            mobileObjectPosition: '70% 26%',
            zoom: 1.15,
            mobileZoom: 1.65,
          },
        ]}
      />
    );

    const image = container.querySelector('.page-hero__media-image');

    expect(image?.style.getPropertyValue('--page-hero-desktop-position')).toBe('34% 61%');
    expect(image?.style.getPropertyValue('--page-hero-mobile-position')).toBe('70% 26%');
    expect(image?.style.getPropertyValue('--page-hero-desktop-scale')).toBe('1.15');
    expect(image?.style.getPropertyValue('--page-hero-mobile-scale')).toBe('1.65');
  });
});
