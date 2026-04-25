const fs = require('fs/promises');
const { randomUUID } = require('crypto');

const { runtimeFreeTourBookingsFile } = require('./storagePaths');
const { TOUR_DATE_PATTERN, TOUR_TIME_PATTERN, createFreeTourSlotId } = require('./freeTourSchedule');

const DATA_FILE = runtimeFreeTourBookingsFile;

const BOOKING_STATUS_ACTIVE = 'active';
const BOOKING_STATUS_CANCELLED = 'cancelled';

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizeName = (value = '') => String(value).trim();

const normalizePeople = (value) => {
  const resolved = Number.parseInt(value, 10);

  if (!Number.isFinite(resolved)) {
    return 1;
  }

  return Math.min(99, Math.max(1, resolved));
};

const normalizeTimestamp = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
};

const normalizeStatus = (value) =>
  value === BOOKING_STATUS_CANCELLED ? BOOKING_STATUS_CANCELLED : BOOKING_STATUS_ACTIVE;

const normalizeFreeTourBooking = (booking = {}) => {
  const date = String(booking.date || '').trim();
  const time = String(booking.time || '').trim();
  const email = normalizeEmail(booking.email);
  const slotId = TOUR_DATE_PATTERN.test(date) && TOUR_TIME_PATTERN.test(time)
    ? createFreeTourSlotId(date, time)
    : '';

  return {
    id: booking.id || randomUUID(),
    slotId,
    date,
    time,
    email,
    name: normalizeName(booking.name),
    people: normalizePeople(booking.people),
    status: normalizeStatus(booking.status),
    createdAt: normalizeTimestamp(booking.createdAt, new Date().toISOString()),
    updatedAt: normalizeTimestamp(booking.updatedAt, booking.createdAt || new Date().toISOString()),
    cancelledAt: normalizeTimestamp(booking.cancelledAt),
  };
};

const sortBookings = (bookings) =>
  bookings
    .slice()
    .sort((left, right) => {
      if (left.date === right.date) {
        if (left.time === right.time) {
          return left.createdAt.localeCompare(right.createdAt);
        }

        return left.time.localeCompare(right.time);
      }

      return left.date.localeCompare(right.date);
    });

const filterValidBookings = (bookings = []) =>
  bookings
    .map(normalizeFreeTourBooking)
    .filter((booking) => booking.slotId && booking.email);

const readFreeTourBookings = async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return sortBookings(filterValidBookings(JSON.parse(raw)));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const writeFreeTourBookings = async (bookings) => {
  const normalized = sortBookings(filterValidBookings(bookings));
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
};

const getActiveFreeTourBookings = async () => {
  const bookings = await readFreeTourBookings();
  return bookings.filter((booking) => booking.status === BOOKING_STATUS_ACTIVE);
};

const getFreeTourBookingCounts = async () => {
  const bookings = await getActiveFreeTourBookings();

  return bookings.reduce((counts, booking) => {
    counts.set(booking.slotId, (counts.get(booking.slotId) || 0) + 1);
    return counts;
  }, new Map());
};

const upsertFreeTourBooking = async (bookingInput = {}) => {
  const nextBooking = normalizeFreeTourBooking({
    ...bookingInput,
    status: BOOKING_STATUS_ACTIVE,
  });
  const bookings = await readFreeTourBookings();
  const existingBooking = bookings.find(
    (booking) =>
      booking.status === BOOKING_STATUS_ACTIVE &&
      booking.slotId === nextBooking.slotId &&
      booking.email === nextBooking.email
  );

  if (existingBooking) {
    const updatedBooking = {
      ...existingBooking,
      name: nextBooking.name || existingBooking.name,
      people: nextBooking.people,
      updatedAt: new Date().toISOString(),
    };
    const savedBookings = await writeFreeTourBookings(
      bookings.map((booking) => (booking.id === existingBooking.id ? updatedBooking : booking))
    );

    return {
      created: false,
      booking: savedBookings.find((booking) => booking.id === existingBooking.id) || updatedBooking,
    };
  }

  const savedBookings = await writeFreeTourBookings([
    ...bookings,
    {
      ...nextBooking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cancelledAt: null,
    },
  ]);

  return {
    created: true,
    booking: savedBookings.find((booking) => booking.id === nextBooking.id) || nextBooking,
  };
};

const cancelFreeTourBookingsForSlotIds = async (slotIds = []) => {
  const normalizedSlotIds = [...new Set((Array.isArray(slotIds) ? slotIds : []).filter(Boolean))];

  if (!normalizedSlotIds.length) {
    return [];
  }

  const bookings = await readFreeTourBookings();
  const cancelledAt = new Date().toISOString();
  const cancelledBookings = [];

  const nextBookings = bookings.map((booking) => {
    if (
      booking.status === BOOKING_STATUS_ACTIVE &&
      normalizedSlotIds.includes(booking.slotId)
    ) {
      const cancelledBooking = {
        ...booking,
        status: BOOKING_STATUS_CANCELLED,
        cancelledAt,
        updatedAt: cancelledAt,
      };

      cancelledBookings.push(cancelledBooking);
      return cancelledBooking;
    }

    return booking;
  });

  if (!cancelledBookings.length) {
    return [];
  }

  await writeFreeTourBookings(nextBookings);
  return cancelledBookings;
};

module.exports = {
  BOOKING_STATUS_ACTIVE,
  BOOKING_STATUS_CANCELLED,
  readFreeTourBookings,
  writeFreeTourBookings,
  getActiveFreeTourBookings,
  getFreeTourBookingCounts,
  upsertFreeTourBooking,
  cancelFreeTourBookingsForSlotIds,
};
