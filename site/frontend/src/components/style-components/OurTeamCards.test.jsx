import { render, screen } from '@testing-library/react';

import ContactsTeamCard from './ContactsTeamCard';
import OurTeamCard from './OurTeamCard';

describe('storyteller cards', () => {
  test('tippable storyteller card shows only the name and tip button', () => {
    localStorage.setItem('language', 'en');

    render(
      <OurTeamCard
        image={null}
        title="Guide Name"
        email="guide@example.com"
        phone="+372 5000 0000"
        links={[]}
        startPayment={() => {}}
        showPaymentButton
      />
    );

    expect(screen.getByText('Guide Name')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Tip your guide' })).not.toBeNull();
    expect(screen.queryByText('guide@example.com')).toBeNull();
    expect(screen.queryByText('+372 5000 0000')).toBeNull();
  });

  test('tippable storyteller card uses a custom button label when provided', () => {
    render(
      <OurTeamCard
        image={null}
        title="Guide Name"
        links={[]}
        startPayment={() => {}}
        showPaymentButton
        paymentButtonLabel="Leave a tip"
      />
    );

    expect(screen.getByRole('button', { name: 'Leave a tip' })).not.toBeNull();
  });

  test('contact storyteller card shows only the name', () => {
    render(
      <ContactsTeamCard
        image={null}
        title="Guide Name"
        email="guide@example.com"
        phone="+372 5000 0000"
      />
    );

    expect(screen.getByText('Guide Name')).not.toBeNull();
    expect(screen.queryByText('guide@example.com')).toBeNull();
    expect(screen.queryByText('+372 5000 0000')).toBeNull();
  });
});
