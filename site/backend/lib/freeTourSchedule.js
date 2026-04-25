const DEFAULT_FREE_TOUR_DAYS = 30;
const DEFAULT_FREE_TOUR_TIMES = ['10:00', '13:00'];

const TOUR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TOUR_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const pad = (value) => String(value).padStart(2, '0');

const toIsoDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const createFreeTourSlotId = (date, time) => `${date}-${time}`;

const normalizeFreeTourSlots = (slots = []) => {
  const seen = new Set();

  return (Array.isArray(slots) ? slots : [])
    .map((slot) => {
      const date = String(slot?.date || '').trim();
      const time = String(slot?.time || '').trim();

      if (!TOUR_DATE_PATTERN.test(date) || !TOUR_TIME_PATTERN.test(time)) {
        return null;
      }

      const id = createFreeTourSlotId(date, time);

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

const normalizeFreeTourSchedule = (schedule = {}) => {
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

const getFallbackFreeTourSlots = (
  days = DEFAULT_FREE_TOUR_DAYS,
  times = DEFAULT_FREE_TOUR_TIMES
) => {
  const tours = [];

  for (let offset = 1; offset <= days; offset += 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);

    const isoDate = toIsoDate(date);

    for (const time of times) {
      tours.push({
        id: createFreeTourSlotId(isoDate, time),
        date: isoDate,
        time,
        bookings: 0,
      });
    }
  }

  return tours;
};

const getEffectiveFreeTourSlots = (schedule = {}) => {
  const normalizedSchedule = normalizeFreeTourSchedule(schedule);

  return normalizedSchedule.isCustomized || normalizedSchedule.slots.length > 0
    ? normalizedSchedule.slots
    : getFallbackFreeTourSlots();
};

const applyBookingCountsToSchedule = (schedule = {}, bookingCounts = new Map()) => {
  const normalizedSchedule = normalizeFreeTourSchedule(schedule);
  const effectiveSlots = getEffectiveFreeTourSlots(normalizedSchedule).map((slot) => ({
    ...slot,
    bookings: bookingCounts.get(slot.id) || 0,
  }));

  return {
    isCustomized: normalizedSchedule.isCustomized,
    slots: effectiveSlots,
  };
};

module.exports = {
  DEFAULT_FREE_TOUR_DAYS,
  DEFAULT_FREE_TOUR_TIMES,
  TOUR_DATE_PATTERN,
  TOUR_TIME_PATTERN,
  toIsoDate,
  createFreeTourSlotId,
  normalizeFreeTourSlots,
  normalizeFreeTourSchedule,
  getFallbackFreeTourSlots,
  getEffectiveFreeTourSlots,
  applyBookingCountsToSchedule,
};
