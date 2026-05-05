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
});
