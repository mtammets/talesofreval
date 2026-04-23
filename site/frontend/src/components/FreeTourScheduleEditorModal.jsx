import { useMemo, useState } from 'react';
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

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Su' },
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Tu' },
  { value: 3, label: 'We' },
  { value: 4, label: 'Th' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
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
  const highlightedDates = useMemo(
    () => groupedSchedule.map((day) => parseFreeTourDate(day.date)).filter(Boolean),
    [groupedSchedule]
  );
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const firstDate = groupedSchedule[0]?.date;
    return parseFreeTourDate(firstDate) || createTomorrow();
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const firstDate = groupedSchedule[0]?.date;
    return firstDate || toFreeTourDateKey(createTomorrow());
  });
  const [customTime, setCustomTime] = useState('');

  const selectedDate = useMemo(
    () => parseFreeTourDate(selectedDateKey) || createTomorrow(),
    [selectedDateKey]
  );
  const selectedTimes = useMemo(
    () => groupedSchedule.find((day) => day.date === selectedDateKey)?.times || [],
    [groupedSchedule, selectedDateKey]
  );
  const configuredDateKeySet = useMemo(
    () => new Set(groupedSchedule.map((day) => day.date)),
    [groupedSchedule]
  );

  const updateSlots = (nextSlots) => {
    setSchedule({
      isCustomized: true,
      slots: normalizeFreeTourSchedule({
        isCustomized: true,
        slots: nextSlots,
      }).slots,
    });
  };

  const getWorkingDateKeys = () => [selectedDateKey];

  const toggleTime = (time) => {
    const workingDateKeys = getWorkingDateKeys();

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

  const addCustomTime = () => {
    const nextTime = customTime.trim();

    if (!TIME_PATTERN.test(nextTime)) {
      return;
    }

    if (!getWorkingDateKeys().length) {
      return;
    }

    updateSlots([
      ...effectiveSlots,
      ...getWorkingDateKeys()
        .filter(
          (dateKey) =>
            !effectiveSlots.some((slot) => slot.date === dateKey && slot.time === nextTime)
        )
        .map((dateKey) => ({ date: dateKey, time: nextTime, bookings: 0 })),
    ]);
    setCustomTime('');
  };

  const clearCurrentSelection = () => {
    updateSlots(effectiveSlots.filter((slot) => slot.date !== selectedDateKey));
  };

  return (
    <AdminModalShell
      title="Edit free tour calendar"
      onClose={onCancel}
      wide
    >
      <form onSubmit={onSave} className="story-admin-form">
        <div className="free-tour-calendar-editor__layout">
          <section className="free-tour-calendar-editor__panel free-tour-calendar-editor__panel--calendar">
            <div className="free-tour-calendar-editor__date-picker">
              <DatePicker
                inline
                selected={selectedDate}
                onChange={(date) => {
                  if (!date) {
                    return;
                  }

                  setSelectedDateKey(toFreeTourDateKey(date));
                  setVisibleMonth(date);
                }}
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="free-tour-calendar-editor__calendar-header">
                    <div className="free-tour-calendar-editor__calendar-nav">
                      <button
                        type="button"
                        className="free-tour-calendar-editor__calendar-nav-button"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        aria-label="Previous month"
                      >
                        ‹
                      </button>
                      <strong>{formatMonthLabel(date)}</strong>
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
                }}
                minDate={createTomorrow()}
                highlightDates={highlightedDates}
                dayClassName={(date) => {
                  const classNames = [];

                  if (configuredDateKeySet.has(toFreeTourDateKey(date))) {
                    classNames.push('free-tour-calendar-editor__calendar-day--batch');
                  }

                  return classNames.join(' ');
                }}
              />
            </div>
          </section>

          <section className="free-tour-calendar-editor__panel">
            <div className="free-tour-calendar-editor__panel-actions">
              <button
                type="button"
                className="story-admin-button story-admin-button--secondary"
                onClick={clearCurrentSelection}
                disabled={!selectedTimes.length}
              >
                Clear
              </button>
            </div>

            <div className="free-tour-calendar-editor__time-grid">
              {DEFAULT_FREE_TOUR_TIMES.map((time) => {
                const hasTimeOnAllSelectedDates = getWorkingDateKeys().every((dateKey) =>
                  effectiveSlots.some((slot) => slot.date === dateKey && slot.time === time)
                );
                const hasTimeOnSomeSelectedDates =
                  !hasTimeOnAllSelectedDates &&
                  getWorkingDateKeys().some((dateKey) =>
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
                    onClick={() => toggleTime(time)}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            <div className="free-tour-calendar-editor__custom-time">
              <label>
                Custom time
                <input
                  type="time"
                  step="300"
                  value={customTime}
                  onChange={(event) => setCustomTime(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="story-admin-button story-admin-button--primary"
                onClick={addCustomTime}
                disabled={!TIME_PATTERN.test(customTime.trim())}
              >
                Add time
              </button>
            </div>
          </section>
        </div>

        <div className="story-admin-actions">
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
