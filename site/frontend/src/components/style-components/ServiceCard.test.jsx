import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ServiceCard from './ServiceCard';

describe('ServiceCard', () => {
  test('passes separate desktop and mobile crop variables to the service image', () => {
    const { container } = render(
      <MemoryRouter>
        <ServiceCard
          link="team"
          title="Team events"
          image={{
            src: '/service-team.webp',
            focusX: 28,
            focusY: 66,
            mobileFocusX: 73,
            mobileFocusY: 24,
            zoom: 1.18,
            mobileZoom: 1.64,
          }}
        />
      </MemoryRouter>
    );

    const image = container.querySelector('.service-media-image');

    expect(image?.style.getPropertyValue('--service-desktop-position')).toBe('28% 66%');
    expect(image?.style.getPropertyValue('--service-mobile-position')).toBe('73% 24%');
    expect(image?.style.getPropertyValue('--service-desktop-scale')).toBe('1.18');
    expect(image?.style.getPropertyValue('--service-mobile-scale')).toBe('1.64');
  });

  test('keeps rendering a fallback asset when only crop metadata is saved', () => {
    const { container } = render(
      <MemoryRouter>
        <ServiceCard
          link="team"
          title="Team events"
          imageKey="serviceTeam"
          image={{
            focusX: 42,
            focusY: 58,
            mobileFocusX: 51,
            mobileFocusY: 49,
            zoom: 1.12,
            mobileZoom: 1.25,
          }}
        />
      </MemoryRouter>
    );

    const image = container.querySelector('.service-media-image');

    expect(image?.getAttribute('src')).toBeTruthy();
    expect(image?.getAttribute('src')).not.toBe('[object Object]');
  });
});
