export const DEFAULT_FREE_TOUR_DAYS = 30;
export const DEFAULT_FREE_TOUR_TIMES = ['10:00', '13:00'];

const pad = (value) => String(value).padStart(2, '0');

export const toIsoDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getFallbackTours = (
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
        id: `${isoDate}-${time}`,
        date: isoDate,
        time,
        bookings: 0,
      });
    }
  }

  return tours;
};
