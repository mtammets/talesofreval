import {
  getAvailableFreeTourDateKeys,
  getHighlightedFreeTourDates,
  getEstoniaTodayKey,
  isSameDayBookingOpen,
} from './freeTourBookingCalendar';

describe('freeTourBookingCalendar', () => {
  const slots = [
    { date: '2026-06-23', time: '10:30' },
    { date: '2026-06-24', time: '10:30' },
    { date: '2026-06-24', time: '13:00' },
    { date: '2026-06-25', time: '10:30' },
  ];

  test('keeps same-day booking open before the Estonia cutoff hour', () => {
    const now = new Date('2026-06-24T09:00:00.000Z');

    expect(getEstoniaTodayKey(now)).toBe('2026-06-24');
    expect(isSameDayBookingOpen(now)).toBe(true);
    expect(getAvailableFreeTourDateKeys(slots, now)).toEqual([
      '2026-06-24',
      '2026-06-25',
    ]);
    expect(
      getHighlightedFreeTourDates(slots, now).map((date) => date.toISOString().slice(0, 10))
    ).toEqual([
      '2026-06-24',
      '2026-06-25',
    ]);
  });

  test('closes same-day booking after the Estonia cutoff hour', () => {
    const now = new Date('2026-06-24T13:00:00.000Z');

    expect(getEstoniaTodayKey(now)).toBe('2026-06-24');
    expect(isSameDayBookingOpen(now)).toBe(false);
    expect(getAvailableFreeTourDateKeys(slots, now)).toEqual(['2026-06-25']);
  });
});
