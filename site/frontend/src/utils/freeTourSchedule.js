import {
  DEFAULT_FREE_TOUR_DAYS,
  DEFAULT_FREE_TOUR_TIMES,
  getFallbackTours,
  toIsoDate,
} from '../content/fallbackTours';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DEFAULT_FREE_TOUR_SCHEDULE = {
  isCustomized: false,
  slots: [],
};

export const parseFreeTourDate = (value) => {
  if (!DATE_PATTERN.test(String(value || ''))) {
    return null;
  }

  return new Date(`${value}T12:00:00`);
};

export const normalizeFreeTourSlots = (slots = []) => {
  const seen = new Set();

  return (Array.isArray(slots) ? slots : [])
    .map((slot) => {
      const date = String(slot?.date || '').trim();
      const time = String(slot?.time || '').trim();

      if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) {
        return null;
      }

      const id = `${date}-${time}`;

      if (seen.has(id)) {
        return null;
      }

      seen.add(id);

      return {
        id,
        date,
        time,
        bookings: Number.isFinite(Number(slot?.bookings)) ? Number(slot.bookings) : 0,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.date === right.date) {
        return left.time.localeCompare(right.time);
      }

      return left.date.localeCompare(right.date);
    });
};

export const normalizeFreeTourSchedule = (schedule = DEFAULT_FREE_TOUR_SCHEDULE) => {
  if (Array.isArray(schedule)) {
    return {
      isCustomized: true,
      slots: normalizeFreeTourSlots(schedule),
    };
  }

  return {
    isCustomized: schedule?.isCustomized === true,
    slots: normalizeFreeTourSlots(schedule?.slots),
  };
};

export const getEffectiveFreeTourSlots = (schedule = DEFAULT_FREE_TOUR_SCHEDULE) => {
  const normalizedSchedule = normalizeFreeTourSchedule(schedule);

  return normalizedSchedule.isCustomized
    ? normalizedSchedule.slots
    : getFallbackTours(DEFAULT_FREE_TOUR_DAYS, DEFAULT_FREE_TOUR_TIMES);
};

export const toEditableFreeTourSchedule = (schedule = DEFAULT_FREE_TOUR_SCHEDULE) => ({
  isCustomized: true,
  slots: normalizeFreeTourSlots(getEffectiveFreeTourSlots(schedule)),
});

export const toFreeTourDateKey = (date) => toIsoDate(date);

export const groupFreeTourSlotsByDate = (slots = []) => {
  const grouped = normalizeFreeTourSlots(slots).reduce((accumulator, slot) => {
    if (!accumulator.has(slot.date)) {
      accumulator.set(slot.date, []);
    }

    accumulator.get(slot.date).push(slot.time);
    return accumulator;
  }, new Map());

  return [...grouped.entries()].map(([date, times]) => ({
    date,
    times,
  }));
};
