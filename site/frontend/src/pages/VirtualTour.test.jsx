import { fireEvent, render, screen } from '@testing-library/react';

import { DEFAULT_SITE_SETTINGS } from '../content/siteSettingsDefaults';
import VirtualTour from './VirtualTour';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

describe('VirtualTour', () => {
  test('renders site settings content and opens the editor in edit mode', () => {
    localStorage.setItem('language', 'en');

    render(
      <VirtualTour
        siteSettings={{
          ...DEFAULT_SITE_SETTINGS,
          virtualTourPage: {
            ...DEFAULT_SITE_SETTINGS.virtualTourPage,
            titleLine1: { en: 'Go solo,', ee: 'Mine uksi,' },
            contentTitle: {
              en: 'A city quest in your pocket',
              ee: 'Linnaseiklus sinu taskus',
            },
          },
        }}
        isEditMode
      />
    );

    expect(screen.getByText('Go solo,')).not.toBeNull();
    expect(screen.getByText('A city quest in your pocket')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Edit virtual tour page')).not.toBeNull();
  });
});
