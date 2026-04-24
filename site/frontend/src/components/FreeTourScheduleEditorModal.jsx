import { useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';

import AdminModalShell from './AdminModalShell';
import { DEFAULT_FREE_TOUR_TIMES } from '../content/fallbackTours';
import {
  DEFAULT_FREE_TOUR_SCHEDULE,
  getEffectiveFreeTourSlots,
  groupFreeTourSlotsByDate,
  normalizeFreeTourSchedule,
  parseFreeTourDate,
  toFreeTourDateKey,
} from '../utils/freeTourSchedule';

import 'react-datepicker/dist/react-datepicker.css';

const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Tu' },
  { value: 3, label: 'We' },
  { value: 4, label: 'Th' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'Su' },
];

const createTomorrow = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
};

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date);

const normalizeCalendarDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(12, 0, 0, 0);
  return date;
};

const sortDateKeys = (dateKeys) => [...new Set(dateKeys)].sort((left, right) => left.localeCompare(right));

const getSelectableDateKeyFromTarget = (target) => {
  if (!(target instanceof Element)) {
    return null;
  }

  const dayElement = target.closest('.react-datepicker__day');

  if (
    !dayElement ||
    dayElement.classList.contains('react-datepicker__day--disabled') ||
    dayElement.classList.contains('react-datepicker__day--outside-month')
  ) {
    return null;
  }

  const dateElement =
    target.closest('[data-free-tour-date-key]') ||
    dayElement.querySelector('[data-free-tour-date-key]');

  return dateElement?.getAttribute('data-free-tour-date-key') || null;
};

const isOutsideMonthDayTarget = (target) =>
  target instanceof Element && Boolean(target.closest('.react-datepicker__day--outside-month'));

function FreeTourScheduleEditorModal({
  schedule,
  setSchedule,
  onSave,
  onCancel,
  isSaving,
}) {
  const normalizedSchedule = useMemo(
    () => normalizeFreeTourSchedule(schedule || DEFAULT_FREE_TOUR_SCHEDULE),
    [schedule]
  );
  const effectiveSlots = useMemo(
    () => getEffectiveFreeTourSlots(normalizedSchedule),
    [normalizedSchedule]
  );
  const groupedSchedule = useMemo(
    () => groupFreeTourSlotsByDate(effectiveSlots),
    [effectiveSlots]
  );
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const firstDate = groupedSchedule[0]?.date;
    return parseFreeTourDate(firstDate) || createTomorrow();
  });
  const [activeDate, setActiveDate] = useState(() => {
    const firstDate = groupedSchedule[0]?.date;
    return parseFreeTourDate(firstDate) || createTomorrow();
  });
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);
  const [bulkSelectedDateKeys, setBulkSelectedDateKeys] = useState(() => {
    const firstDate = groupedSchedule[0]?.date;
    const initialDate = parseFreeTourDate(firstDate) || createTomorrow();
    return [toFreeTourDateKey(initialDate)];
  });
  const [isDraggingBulkSelection, setIsDraggingBulkSelection] = useState(false);
  const dragSelectionRef = useRef({
    pointerId: null,
    shouldMark: true,
    touchedDateKeys: new Set(),
  });

  const activeDateKey = toFreeTourDateKey(activeDate);
  const bulkSelectedDateKeySet = useMemo(
    () => new Set(bulkSelectedDateKeys),
    [bulkSelectedDateKeys]
  );
  const workingDateKeys = useMemo(
    () => (isBulkSelectionMode ? bulkSelectedDateKeys : [activeDateKey]),
    [activeDateKey, bulkSelectedDateKeys, isBulkSelectionMode]
  );
  const configuredDateKeySet = useMemo(
    () => new Set(groupedSchedule.map((day) => day.date)),
    [groupedSchedule]
  );
  const displayedDate = isBulkSelectionMode ? null : activeDate;

  const updateSlots = (nextSlots) => {
    setSchedule({
      isCustomized: true,
      slots: normalizeFreeTourSchedule({
        isCustomized: true,
        slots: nextSlots,
      }).slots,
    });
  };

  const markDateKey = (dateKey, shouldMark) => {
    if (!dateKey) {
      return;
    }

    setBulkSelectedDateKeys((currentDateKeys) => {
      const nextDateKeys = new Set(currentDateKeys);

      if (shouldMark) {
        nextDateKeys.add(dateKey);
      } else {
        nextDateKeys.delete(dateKey);
      }

      return sortDateKeys(nextDateKeys);
    });

    const nextDate = parseFreeTourDate(dateKey);

    if (nextDate) {
      setActiveDate(nextDate);
    }
  };

  const stopBulkSelectionDrag = (currentTarget, pointerId) => {
    if (pointerId != null && currentTarget?.hasPointerCapture?.(pointerId)) {
      currentTarget.releasePointerCapture(pointerId);
    }

    dragSelectionRef.current = {
      pointerId: null,
      shouldMark: true,
      touchedDateKeys: new Set(),
    };
    setIsDraggingBulkSelection(false);
  };

  const handleDateSelection = (nextDate) => {
    const normalizedDate = normalizeCalendarDate(nextDate);

    if (!normalizedDate) {
      return;
    }

    const nextDateKey = toFreeTourDateKey(normalizedDate);

    setActiveDate(normalizedDate);
    setVisibleMonth(normalizedDate);

    if (!isBulkSelectionMode) {
      setBulkSelectedDateKeys([nextDateKey]);
    }
  };

  const handleBulkSelectionToggle = () => {
    if (isBulkSelectionMode) {
      const fallbackDateKey = bulkSelectedDateKeys[bulkSelectedDateKeys.length - 1] || activeDateKey;
      const fallbackDate = parseFreeTourDate(fallbackDateKey) || activeDate || createTomorrow();

      setIsBulkSelectionMode(false);
      setBulkSelectedDateKeys([toFreeTourDateKey(fallbackDate)]);
      setActiveDate(fallbackDate);
      setVisibleMonth(fallbackDate);
      stopBulkSelectionDrag(null, null);
      return;
    }

    stopBulkSelectionDrag(null, null);
    setIsBulkSelectionMode(true);
    setBulkSelectedDateKeys([]);
  };

  const handleCalendarPointerDown = (event) => {
    if (isOutsideMonthDayTarget(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!isBulkSelectionMode || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    const dateKey = getSelectableDateKeyFromTarget(event.target);

    if (!dateKey) {
      return;
    }

    const shouldMark = !bulkSelectedDateKeySet.has(dateKey);

    dragSelectionRef.current = {
      pointerId: event.pointerId,
      shouldMark,
      touchedDateKeys: new Set([dateKey]),
    };

    setIsDraggingBulkSelection(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    markDateKey(dateKey, shouldMark);
  };

  const handleCalendarPointerMove = (event) => {
    if (!isBulkSelectionMode || !isDraggingBulkSelection) {
      return;
    }

    const { pointerId, shouldMark, touchedDateKeys } = dragSelectionRef.current;

    if (pointerId !== event.pointerId) {
      return;
    }

    const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
    const hoveredDateKey = getSelectableDateKeyFromTarget(hoveredElement);

    if (!hoveredDateKey || touchedDateKeys.has(hoveredDateKey)) {
      return;
    }

    touchedDateKeys.add(hoveredDateKey);
    event.preventDefault();
    markDateKey(hoveredDateKey, shouldMark);
  };

  const handleCalendarPointerUp = (event) => {
    if (!isBulkSelectionMode || !isDraggingBulkSelection) {
      return;
    }

    if (dragSelectionRef.current.pointerId !== event.pointerId) {
      return;
    }

    stopBulkSelectionDrag(event.currentTarget, event.pointerId);
  };

  const handleCalendarPointerCancel = (event) => {
    if (!isBulkSelectionMode || !isDraggingBulkSelection) {
      return;
    }

    if (dragSelectionRef.current.pointerId !== event.pointerId) {
      return;
    }

    stopBulkSelectionDrag(event.currentTarget, event.pointerId);
  };

  const handleCalendarClickCapture = (event) => {
    if (!isOutsideMonthDayTarget(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const toggleTime = (time) => {
    if (!workingDateKeys.length) {
      return;
    }

    const allDatesHaveTime = workingDateKeys.every((dateKey) =>
      effectiveSlots.some((slot) => slot.date === dateKey && slot.time === time)
    );

    updateSlots(
      allDatesHaveTime
        ? effectiveSlots.filter(
            (slot) => !(workingDateKeys.includes(slot.date) && slot.time === time)
          )
        : [
            ...effectiveSlots,
            ...workingDateKeys
              .filter(
                (dateKey) =>
                  !effectiveSlots.some((slot) => slot.date === dateKey && slot.time === time)
              )
              .map((dateKey) => ({ date: dateKey, time, bookings: 0 })),
          ]
    );
  };

  return (
    <AdminModalShell
      eyebrow={null}
      title={null}
      onClose={onCancel}
      wide
      hideClose
    >
      <form onSubmit={onSave} className="story-admin-form free-tour-calendar-editor">
        <div className="free-tour-calendar-editor__layout">
          <section className="free-tour-calendar-editor__panel free-tour-calendar-editor__panel--calendar">
            <div
              className={`free-tour-calendar-editor__date-picker${
                isBulkSelectionMode ? ' free-tour-calendar-editor__date-picker--bulk' : ''
              }${
                isDraggingBulkSelection ? ' free-tour-calendar-editor__date-picker--dragging' : ''
              }`}
              onClickCapture={handleCalendarClickCapture}
              onPointerDownCapture={handleCalendarPointerDown}
              onPointerMoveCapture={handleCalendarPointerMove}
              onPointerUpCapture={handleCalendarPointerUp}
              onPointerCancelCapture={handleCalendarPointerCancel}
            >
              <DatePicker
                inline
                selected={displayedDate}
                openToDate={visibleMonth}
                onChange={handleDateSelection}
                calendarStartDay={1}
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="free-tour-calendar-editor__calendar-header">
                    <div className="free-tour-calendar-editor__calendar-nav">
                      <div className="free-tour-calendar-editor__calendar-nav-side free-tour-calendar-editor__calendar-nav-side--left">
                        <button
                          type="button"
                          className="free-tour-calendar-editor__calendar-nav-button"
                          onClick={decreaseMonth}
                          disabled={prevMonthButtonDisabled}
                          aria-label="Previous month"
                        >
                          ‹
                        </button>
                      </div>
                      <div className="free-tour-calendar-editor__calendar-month" aria-live="polite">
                        {formatMonthLabel(date)}
                      </div>
                      <div className="free-tour-calendar-editor__calendar-nav-side free-tour-calendar-editor__calendar-nav-side--right">
                        <button
                          type="button"
                          className={`free-tour-calendar-editor__selection-toggle${
                            isBulkSelectionMode
                              ? ' free-tour-calendar-editor__selection-toggle--active'
                              : ''
                          }`}
                          aria-label="Toggle multi-day selection"
                          aria-pressed={isBulkSelectionMode}
                          onClick={handleBulkSelectionToggle}
                        >
                          <span />
                          <span />
                          <span />
                          <span />
                        </button>
                        <button
                          type="button"
                          className="free-tour-calendar-editor__calendar-nav-button"
                          onClick={increaseMonth}
                          disabled={nextMonthButtonDisabled}
                          aria-label="Next month"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                    <div className="free-tour-calendar-editor__calendar-weekdays">
                      {WEEKDAY_OPTIONS.map((option) => (
                        <span key={option.value} className="free-tour-calendar-editor__calendar-weekday">
                          {option.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                onMonthChange={(date) => {
                  const nextVisibleMonth = date || visibleMonth || createTomorrow();
                  setVisibleMonth(nextVisibleMonth);

                  if (isBulkSelectionMode) {
                    stopBulkSelectionDrag(null, null);
                    setBulkSelectedDateKeys([]);
                  }
                }}
                minDate={createTomorrow()}
                dayClassName={(date) => {
                  const classNames = [];
                  const dateKey = toFreeTourDateKey(date);
                  const hasSlots = configuredDateKeySet.has(dateKey);
                  const isMarked = isBulkSelectionMode && bulkSelectedDateKeySet.has(dateKey);
                  const isActive = !isBulkSelectionMode && dateKey === activeDateKey;

                  if (hasSlots) {
                    classNames.push('free-tour-calendar-editor__calendar-day--has-slots');
                  }

                  if (isMarked) {
                    classNames.push('free-tour-calendar-editor__calendar-day--marked');
                    classNames.push(
                      hasSlots
                        ? 'free-tour-calendar-editor__calendar-day--marked-with-slots'
                        : 'free-tour-calendar-editor__calendar-day--marked-pending'
                    );
                  }

                  if (isActive) {
                    classNames.push('free-tour-calendar-editor__calendar-day--active');
                    classNames.push(
                      hasSlots
                        ? 'free-tour-calendar-editor__calendar-day--active-with-slots'
                        : 'free-tour-calendar-editor__calendar-day--active-pending'
                    );
                  }

                  return classNames.join(' ');
                }}
                renderDayContents={(dayOfMonth, date) => {
                  const dateKey = toFreeTourDateKey(date);
                  const isMarked = isBulkSelectionMode && bulkSelectedDateKeySet.has(dateKey);

                  return (
                    <span
                      className={`free-tour-calendar-editor__day-content${
                        isMarked ? ' free-tour-calendar-editor__day-content--marked' : ''
                      }`}
                      data-free-tour-date-key={dateKey}
                    >
                      <span className="free-tour-calendar-editor__day-number">{dayOfMonth}</span>
                    </span>
                  );
                }}
              />
            </div>
          </section>

          <section className="free-tour-calendar-editor__panel free-tour-calendar-editor__panel--times">
            <div className="free-tour-calendar-editor__time-grid">
              {DEFAULT_FREE_TOUR_TIMES.map((time) => {
                const hasSelection = workingDateKeys.length > 0;
                const hasTimeOnAllSelectedDates = hasSelection && workingDateKeys.every((dateKey) =>
                  effectiveSlots.some((slot) => slot.date === dateKey && slot.time === time)
                );
                const hasTimeOnSomeSelectedDates =
                  hasSelection &&
                  !hasTimeOnAllSelectedDates &&
                  workingDateKeys.some((dateKey) =>
                    effectiveSlots.some((slot) => slot.date === dateKey && slot.time === time)
                  );

                return (
                  <button
                    key={time}
                    type="button"
                    className={`free-tour-calendar-editor__time${
                      hasTimeOnAllSelectedDates
                        ? ' free-tour-calendar-editor__time--active'
                        : hasTimeOnSomeSelectedDates
                          ? ' free-tour-calendar-editor__time--partial'
                          : ''
                    }`}
                    disabled={!hasSelection}
                    onClick={() => toggleTime(time)}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="free-tour-calendar-editor__actions">
          <button type="button" className="story-admin-button story-admin-button--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="story-admin-button story-admin-button--primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save calendar'}
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

export default FreeTourScheduleEditorModal;
