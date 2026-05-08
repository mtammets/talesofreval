import {
  findGuideByTipId,
  getActiveGuidePaymentLinks,
  getGuideDisplayName,
  getGuideQrFileName,
  getGuideTipId,
  getGuideTipPath,
  getGuideTipUrl,
} from './guideTips';

describe('guide tip helpers', () => {
  const member = {
    key: 'contact-member-1',
    name: {
      en: 'Kaupo Tamm',
      ee: 'Kaupo Tamm ET',
    },
    payment_links: [
      { name: 'Wise', link: 'https://wise.com/example' },
      { name: 'Apple Pay', link: '' },
      { name: 'Google Pay', link: '' },
      { name: 'PayPal', link: 'https://paypal.me/example' },
      { name: 'Revolut', link: '' },
    ],
  };

  test('uses the persisted guide key for stable tip ids', () => {
    expect(getGuideTipId(member)).toBe('contact-member-1');
    expect(getGuideTipPath(member)).toBe('/tip/contact-member-1');
  });

  test('builds absolute tip urls when an origin is provided', () => {
    expect(getGuideTipUrl(member, 'https://www.talesofreval.ee')).toBe(
      'https://www.talesofreval.ee/tip/contact-member-1'
    );
  });

  test('finds guides by the tip route id', () => {
    expect(findGuideByTipId([member], 'contact-member-1')).toEqual(member);
    expect(findGuideByTipId([member], 'missing-guide')).toBeNull();
  });

  test('filters down to only active payment links', () => {
    expect(getActiveGuidePaymentLinks(member)).toEqual([
      { name: 'Wise', link: 'https://wise.com/example' },
      { name: 'PayPal', link: 'https://paypal.me/example' },
    ]);
  });

  test('creates a printable qr filename from the guide name', () => {
    expect(getGuideDisplayName(member)).toBe('Kaupo Tamm');
    expect(getGuideQrFileName(member)).toBe('tales-of-reval-tip-kaupo-tamm.png');
  });

  test('returns the localized guide display name when a language is provided', () => {
    expect(getGuideDisplayName(member, 'ee')).toBe('Kaupo Tamm ET');
  });
});
