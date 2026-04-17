export const PAYMENT_METHODS = [
  'Wise',
  'Apple Pay',
  'Google Pay',
  'PayPal',
  'Revolut',
];

export const createEmptyPaymentLinks = () =>
  PAYMENT_METHODS.map((name) => ({
    name,
    link: '',
  }));

export const normalizePaymentLinks = (links = []) =>
  PAYMENT_METHODS.map((name) => ({
    name,
    link: Array.isArray(links)
      ? links.find((entry) => entry?.name === name)?.link || ''
      : '',
  }));
