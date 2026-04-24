import { fireEvent, render, screen } from '@testing-library/react';

import FreeTourScheduleEditorModal from './FreeTourScheduleEditorModal';

const buildSchedule = () => ({
  isCustomized: true,
  slots: [
    { date: '2099-06-15', time: '10:00', bookings: 0 },
    { date: '2099-06-15', time: '13:00', bookings: 0 },
    { date: '2099-06-16', time: '10:00', bookings: 0 },
    { date: '2099-06-16', time: '13:00', bookings: 0 },
    { date: '2099-06-17', time: '10:00', bookings: 0 },
    { date: '2099-06-17', time: '13:00', bookings: 0 },
  ],
});

const getDayCell = (container, dateKey) =>
  container
    .querySelector(`[data-free-tour-date-key="${dateKey}"]`)
    ?.closest('.react-datepicker__day');

const toDateKey = (date) => date.toISOString().slice(0, 10);

const getMonthWithVisibleNextMonthDay = () => {
  const monthDate = new Date('2099-01-15T12:00:00');

  while (new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDay() === 0) {
    monthDate.setMonth(monthDate.getMonth() + 1);
  }

  return monthDate;
};

describe('FreeTourScheduleEditorModal', () => {
  test('marks bulk-selected dates and removes a time from all of them at once', async () => {
    const setSchedule = jest.fn();
    const { container } = render(
      <FreeTourScheduleEditorModal
        schedule={buildSchedule()}
        setSchedule={setSchedule}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        isSaving={false}
      />
    );

    const markDate = (dateKey, pointerId) => {
      const dateNode = container.querySelector(`[data-free-tour-date-key="${dateKey}"]`);

      fireEvent.pointerDown(dateNode, { pointerId, pointerType: 'mouse', button: 0 });
      fireEvent.pointerUp(dateNode, { pointerId, pointerType: 'mouse', button: 0 });
      fireEvent.click(dateNode);
    };

    fireEvent.click(screen.getByRole('button', { name: /toggle multi-day selection/i }));
    markDate('2099-06-15', 1);
    markDate('2099-06-16', 2);
    markDate('2099-06-17', 3);

    expect(getDayCell(container, '2099-06-15')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked'
    );
    expect(getDayCell(container, '2099-06-15')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked-with-slots'
    );
    expect(getDayCell(container, '2099-06-16')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked'
    );
    expect(getDayCell(container, '2099-06-16')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked-with-slots'
    );
    expect(getDayCell(container, '2099-06-17')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked'
    );
    expect(getDayCell(container, '2099-06-17')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked-with-slots'
    );
    expect(container.querySelector('.react-datepicker__day--selected')).toBeNull();
    expect(container.querySelector('.free-tour-calendar-editor__calendar-day--active')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '10:00' }));

    const nextSchedule = setSchedule.mock.calls.at(-1)?.[0];
    const remainingIds = nextSchedule?.slots?.map((slot) => `${slot.date}-${slot.time}`) || [];

    expect(remainingIds).toEqual([
      '2099-06-15-13:00',
      '2099-06-16-13:00',
      '2099-06-17-13:00',
    ]);
  });

  test('keeps empty bulk-selected dates in a pending visual state before times are added', () => {
    const schedule = {
      isCustomized: true,
      slots: [{ date: '2099-06-15', time: '10:00', bookings: 0 }],
    };
    const { container } = render(
      <FreeTourScheduleEditorModal
        schedule={schedule}
        setSchedule={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        isSaving={false}
      />
    );

    const markDate = (dateKey, pointerId) => {
      const dateNode = container.querySelector(`[data-free-tour-date-key="${dateKey}"]`);

      fireEvent.pointerDown(dateNode, { pointerId, pointerType: 'mouse', button: 0 });
      fireEvent.pointerUp(dateNode, { pointerId, pointerType: 'mouse', button: 0 });
      fireEvent.click(dateNode);
    };

    fireEvent.click(screen.getByRole('button', { name: /toggle multi-day selection/i }));
    markDate('2099-06-16', 21);
    markDate('2099-06-17', 22);

    expect(getDayCell(container, '2099-06-16')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked-pending'
    );
    expect(getDayCell(container, '2099-06-16')?.className).not.toContain(
      'free-tour-calendar-editor__calendar-day--marked-with-slots'
    );
    expect(getDayCell(container, '2099-06-17')?.className).toContain(
      'free-tour-calendar-editor__calendar-day--marked-pending'
    );
    expect(getDayCell(container, '2099-06-17')?.className).not.toContain(
      'free-tour-calendar-editor__calendar-day--has-slots'
    );
  });

  test('does not switch months when clicking a visible day from the next month', () => {
    const monthDate = getMonthWithVisibleNextMonthDay();
    const nextMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1, 12, 0, 0, 0);
    const currentMonthLabel = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
    }).format(monthDate);

    const schedule = {
      isCustomized: true,
      slots: [
        { date: toDateKey(monthDate), time: '10:00', bookings: 0 },
        { date: toDateKey(monthDate), time: '13:00', bookings: 0 },
      ],
    };

    const { container } = render(
      <FreeTourScheduleEditorModal
        schedule={schedule}
        setSchedule={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        isSaving={false}
      />
    );

    const monthHeading = screen.getByText(currentMonthLabel, {
      selector: '.free-tour-calendar-editor__calendar-month',
    });
    const outsideMonthDay = container.querySelector(
      `[data-free-tour-date-key="${toDateKey(nextMonthDate)}"]`
    );

    expect(outsideMonthDay).not.toBeNull();

    fireEvent.pointerDown(outsideMonthDay, { pointerId: 11, pointerType: 'mouse', button: 0 });
    fireEvent.click(outsideMonthDay);

    expect(monthHeading.textContent).toBe(currentMonthLabel);
  });

  test('does not add a special today marker by default', () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const schedule = {
      isCustomized: true,
      slots: [{ date: toDateKey(today), time: '10:00', bookings: 0 }],
    };

    const { container } = render(
      <FreeTourScheduleEditorModal
        schedule={schedule}
        setSchedule={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        isSaving={false}
      />
    );

    expect(getDayCell(container, toDateKey(today))?.className).not.toContain(
      'free-tour-calendar-editor__calendar-day--today'
    );
  });
});
