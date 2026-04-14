const pad = (value) => String(value).padStart(2, '0');

const toIsoDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getFallbackTours = (days = 30, times = ['10:00', '13:00']) => {
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
