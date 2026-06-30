import { parseFreeTourDate, toFreeTourDateKey } from './freeTourSchedule';

const ESTONIA_TIME_ZONE = 'Europe/Tallinn';
export const FREE_TOUR_SAME_DAY_BOOKING_CUTOFF_HOUR = 15;

export const getEstoniaNow = (now = new Date()) =>
  new Date(
    now.toLocaleString('en-US', {
      timeZone: ESTONIA_TIME_ZONE,
    })
  );

export const getEstoniaTodayKey = (now = new Date()) => toFreeTourDateKey(getEstoniaNow(now));

export const isSameDayBookingOpen = (now = new Date()) =>
  getEstoniaNow(now).getHours() < FREE_TOUR_SAME_DAY_BOOKING_CUTOFF_HOUR;

export const getAvailableFreeTourDateKeys = (slots = [], now = new Date()) => {
  const todayKey = getEstoniaTodayKey(now);
  const allowSameDayBooking = isSameDayBookingOpen(now);

  return [...new Set(
    (Array.isArray(slots) ? slots : [])
      .map((slot) => String(slot?.date || '').trim())
      .filter(Boolean)
      .filter(
        (dateKey) => dateKey > todayKey || (allowSameDayBooking && dateKey === todayKey)
      )
  )].sort((left, right) => left.localeCompare(right));
};

export const getHighlightedFreeTourDates = (slots = [], now = new Date()) =>
  getAvailableFreeTourDateKeys(slots, now)
    .map((dateKey) => parseFreeTourDate(dateKey))
    .filter(Boolean);

