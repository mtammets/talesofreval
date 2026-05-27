import {
  getSiteImageAlt,
  resolveSiteImageMedia,
} from './siteSettingsDefaults';

describe('getSiteImageAlt', () => {
  it('returns the localized alt text when it exists', () => {
    expect(
      getSiteImageAlt(
        {
          alt: {
            en: 'Medieval guide in Tallinn',
            ee: 'Keskaegne giid Tallinnas',
          },
        },
        'ee',
        'Fallback'
      )
    ).toBe('Keskaegne giid Tallinnas');
  });

  it('falls back when the image does not define an alt text', () => {
    expect(getSiteImageAlt({ src: '/hero.webp' }, 'en', 'Fallback text')).toBe(
      'Fallback text'
    );
  });
});

describe('resolveSiteImageMedia', () => {
  it('keeps the raw alt payload on resolved media objects', () => {
    expect(
      resolveSiteImageMedia(
        {
          src: '/story.webp',
          alt: {
            en: 'Guide telling a story',
            ee: 'Giid jutustab lugu',
          },
        },
        '',
        '100vw'
      )
    ).toMatchObject({
      src: '/story.webp',
      alt: {
        en: 'Guide telling a story',
        ee: 'Giid jutustab lugu',
      },
    });
  });
});
