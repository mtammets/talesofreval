import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import FreeTourScheduleEditorModal from './FreeTourScheduleEditorModal';

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
    dismiss: jest.fn(),
  },
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(toast.info).toHaveBeenCalledTimes(1);
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
    expect(screen.queryByText('2 days selected')).not.toBeNull();
    expect(screen.queryByText('add times below')).not.toBeNull();
  });

  test('enables save only after the schedule draft changes, not after day selection alone', () => {
    const onSave = jest.fn();

    function TestHarness() {
      const [schedule, setSchedule] = useState({
        isCustomized: true,
        slots: [],
      });

      return (
        <FreeTourScheduleEditorModal
          schedule={schedule}
          setSchedule={setSchedule}
          onSave={onSave}
          onCancel={jest.fn()}
          isSaving={false}
        />
      );
    }

    render(<TestHarness />);

    const saveButton = screen.getByRole('button', { name: /save calendar/i });
    expect(saveButton.disabled).toBe(true);

    fireEvent.click(screen.getByText('16'));
    expect(screen.getByRole('button', { name: /save calendar/i }).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '10:00' }));

    const enabledSaveButton = screen.getByRole('button', { name: /save calendar/i });
    expect(enabledSaveButton.disabled).toBe(false);

    fireEvent.submit(enabledSaveButton.closest('form'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  test('keeps save enabled after removing the last remaining time slot', () => {
    function TestHarness() {
      const [schedule, setSchedule] = useState({
        isCustomized: true,
        slots: [{ date: '2099-06-15', time: '10:00', bookings: 0 }],
      });

      return (
        <FreeTourScheduleEditorModal
          schedule={schedule}
          setSchedule={setSchedule}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          isSaving={false}
        />
      );
    }

    render(<TestHarness />);

    expect(screen.getByRole('button', { name: /save calendar/i }).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '10:00' }));

    expect(screen.getByRole('button', { name: /save calendar/i }).disabled).toBe(false);
  });

  test('shows only the selected day count when every bulk-selected day already has times', () => {
    const { container } = render(
      <FreeTourScheduleEditorModal
        schedule={buildSchedule()}
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
    markDate('2099-06-15', 24);
    markDate('2099-06-16', 25);
    markDate('2099-06-17', 26);

    expect(screen.queryByText('3 days selected')).not.toBeNull();
    expect(screen.queryByText('all already have times')).toBeNull();
  });

  test('moves to the next month with the animated calendar transition', () => {
    jest.useFakeTimers();

    try {
      const schedule = {
        isCustomized: true,
        slots: [{ date: '2099-06-15', time: '10:00', bookings: 0 }],
      };

      render(
        <FreeTourScheduleEditorModal
          schedule={schedule}
          setSchedule={jest.fn()}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          isSaving={false}
        />
      );

      expect(
        document.querySelector(
          '.free-tour-calendar-editor__calendar-month[aria-label="June 2099"]'
        )
      ).not.toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /next month/i }));

      act(() => {
        jest.advanceTimersByTime(360);
      });

      expect(
        document.querySelector(
          '.free-tour-calendar-editor__calendar-month[aria-label="July 2099"]'
        )
      ).not.toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  test('keeps an existing today slot selectable after switching to another day', () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date('2026-04-24T12:00:00'));

      const schedule = {
        isCustomized: true,
        slots: [
          { date: '2026-04-24', time: '10:00', bookings: 0 },
          { date: '2026-04-24', time: '13:00', bookings: 0 },
          { date: '2026-04-26', time: '10:00', bookings: 0 },
          { date: '2026-04-26', time: '13:00', bookings: 0 },
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

      const todayNode = container.querySelector('[data-free-tour-date-key="2026-04-24"]');
      const futureNode = container.querySelector('[data-free-tour-date-key="2026-04-26"]');

      expect(getDayCell(container, '2026-04-24')?.className).toContain(
        'free-tour-calendar-editor__calendar-day--active-with-slots'
      );

      fireEvent.click(futureNode);

      expect(getDayCell(container, '2026-04-26')?.className).toContain(
        'free-tour-calendar-editor__calendar-day--active-with-slots'
      );

      fireEvent.click(todayNode);

      expect(getDayCell(container, '2026-04-24')?.className).toContain(
        'free-tour-calendar-editor__calendar-day--active-with-slots'
      );
    } finally {
      jest.useRealTimers();
    }
  });

  test('allows selecting today and earlier dates in the admin calendar editor', () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date('2026-04-24T12:00:00'));

      const schedule = {
        isCustomized: true,
        slots: [
          { date: '2026-04-26', time: '10:00', bookings: 0 },
          { date: '2026-04-26', time: '13:00', bookings: 0 },
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

      fireEvent.click(container.querySelector('[data-free-tour-date-key="2026-04-24"]'));
      expect(getDayCell(container, '2026-04-24')?.className).toContain(
        'free-tour-calendar-editor__calendar-day--active-pending'
      );

      fireEvent.click(container.querySelector('[data-free-tour-date-key="2026-04-23"]'));
      expect(getDayCell(container, '2026-04-23')?.className).toContain(
        'free-tour-calendar-editor__calendar-day--active-pending'
      );
    } finally {
      jest.useRealTimers();
    }
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

    const monthHeading = document.querySelector(
      `.free-tour-calendar-editor__calendar-month[aria-label="${currentMonthLabel}"]`
    );
    const outsideMonthDay = container.querySelector(
      `[data-free-tour-date-key="${toDateKey(nextMonthDate)}"]`
    );

    expect(monthHeading).not.toBeNull();
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
    expect(screen.queryByText('1 day selected')).toBeNull();
  });

  test('shows a warning summary when bulk selection includes days that already have times', () => {
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
    markDate('2099-06-15', 31);
    markDate('2099-06-16', 32);

    expect(screen.queryByText('2 days selected')).not.toBeNull();
    expect(screen.queryByText('1 day already has times')).not.toBeNull();
  });

  test('shows a non-interactive select days hint when bulk mode is enabled without selected dates', () => {
    render(
      <FreeTourScheduleEditorModal
        schedule={buildSchedule()}
        setSchedule={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        isSaving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /toggle multi-day selection/i }));

    expect(screen.queryByText('Select days above')).not.toBeNull();
    expect(document.querySelector('.free-tour-calendar-editor__selection-summary')).toBeNull();
  });

  test('undo toast restores removed times without discarding later draft state', () => {
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
    markDate('2099-06-15', 41);
    markDate('2099-06-16', 42);
    markDate('2099-06-17', 43);
    fireEvent.click(screen.getByRole('button', { name: '10:00' }));

    const scheduleAfterRemoval = setSchedule.mock.calls[0][0];
    const undoToast = toast.info.mock.calls[0][0];
    const undoButton = undoToast.props.children[1];

    undoButton.props.onClick();

    expect(typeof setSchedule.mock.calls[1][0]).toBe('function');

    const restoredSchedule = setSchedule.mock.calls[1][0](scheduleAfterRemoval);

    expect(restoredSchedule.slots.map((slot) => `${slot.date}-${slot.time}`)).toEqual([
      '2099-06-15-10:00',
      '2099-06-15-13:00',
      '2099-06-16-10:00',
      '2099-06-16-13:00',
      '2099-06-17-10:00',
      '2099-06-17-13:00',
    ]);
    expect(toast.dismiss).toHaveBeenCalled();
  });
});
