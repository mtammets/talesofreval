import { render, screen } from '@testing-library/react';

import HomeLanding from './HomeLanding';

jest.mock('./PageHero', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe('HomeLanding', () => {
  test('renders bracketed subtitle copy as a footer anchor link', () => {
    render(
      <HomeLanding
        texts={{
          storytelling: { text: 'Storytelling' },
          reinvented: { text: 'Reinvented' },
          'imagination-voice': {
            text: 'Looking to join our free tour? [Click here!]',
          },
        }}
      />
    );

    expect(screen.getByText(/Looking to join our free tour\?/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Click here!' }).getAttribute('href')).toBe(
      '#footer-booking'
    );
  });

  test('renders plain subtitle copy without a link when no bracket markup exists', () => {
    render(
      <HomeLanding
        texts={{
          storytelling: { text: 'Storytelling' },
          reinvented: { text: 'Reinvented' },
          'imagination-voice': {
            text: 'Plain subtitle copy',
          },
        }}
      />
    );

    expect(screen.getByText('Plain subtitle copy')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
