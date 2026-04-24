import { useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';

import AdminModalShell from './AdminModalShell';
import { DEFAULT_FREE_TOUR_TIMES } from '../content/fallbackTours';
import {
  DEFAULT_FREE_TOUR_SCHEDULE,
  getEffectiveFreeTourSlots,
  groupFreeTourSlotsByDate,
  normalizeFreeTourSchedule,
  parseFreeTourDate,
  toEditableFreeTourSchedule,
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

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
});

const createTomorrow = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
};

const formatMonthLabel = (date) => MONTH_LABEL_FORMATTER.format(date);

const formatMonthParts = (date) => {
  const parts = MONTH_LABEL_FORMATTER.formatToParts(date);

  return {
    month: parts.find((part) => part.type === 'month')?.value || '',
    year: parts.find((part) => part.type === 'year')?.value || '',
  };
};

const isWeekendCalendarDate = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

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

const toCalendarMonthStart = (value) => {
  const date = normalizeCalendarDate(value) || createTomorrow();
  date.setDate(1);
  return date;
};

const addCalendarMonths = (value, monthDelta) => {
  const date = toCalendarMonthStart(value);
  date.setMonth(date.getMonth() + monthDelta);
  date.setHours(12, 0, 0, 0);
  return date;
};

const isSameCalendarMonth = (left, right) =>
  Boolean(left && right) &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth();

const sortDateKeys = (dateKeys) => [...new Set(dateKeys)].sort((left, right) => left.localeCompare(right));

const formatCountLabel = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const serializeEditableSchedule = (schedule) =>
  JSON.stringify(toEditableFreeTourSchedule(schedule || DEFAULT_FREE_TOUR_SCHEDULE));

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

const CALENDAR_SWIPE_TRANSITION_MS = 360;

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
    return toCalendarMonthStart(parseFreeTourDate(firstDate) || createTomorrow());
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [calendarDragOffset, setCalendarDragOffset] = useState(0);
  const [isCalendarDragging, setIsCalendarDragging] = useState(false);
  const [isCalendarTransitioning, setIsCalendarTransitioning] = useState(false);
  const [calendarTransitionTargetMonth, setCalendarTransitionTargetMonth] = useState(null);
  const calendarSwipeViewportRef = useRef(null);
  const calendarSwipeStateRef = useRef({
    startX: 0,
    startY: 0,
    deltaX: 0,
    isPointerDown: false,
    isHorizontalSwipe: false,
    blockedByVerticalScroll: false,
    startTime: 0,
  });
  const calendarTransitionTimersRef = useRef([]);
  const undoToastIdRef = useRef(null);
  const initialEditableScheduleRef = useRef(serializeEditableSchedule(schedule));

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
  const selectedConfiguredDateCount = useMemo(
    () => workingDateKeys.filter((dateKey) => configuredDateKeySet.has(dateKey)).length,
    [configuredDateKeySet, workingDateKeys]
  );
  const selectionSummary = useMemo(() => {
    if (!isBulkSelectionMode) {
      return {
        label: '',
        detail: '',
        tone: 'idle',
      };
    }

    if (!workingDateKeys.length) {
      return {
        label: '',
        detail: '',
        tone: 'idle',
      };
    }

    const label = `${formatCountLabel(workingDateKeys.length, 'day')} selected`;

    if (!selectedConfiguredDateCount) {
      return {
        label,
        detail: 'add times below',
        tone: 'idle',
      };
    }

    if (selectedConfiguredDateCount === workingDateKeys.length) {
      return {
        label,
        detail: '',
        tone: 'configured',
      };
    }

    return {
      label,
      detail: `${formatCountLabel(selectedConfiguredDateCount, 'day')} already ${
        selectedConfiguredDateCount === 1 ? 'has' : 'have'
      } times`,
      tone: 'warning',
    };
  }, [
    isBulkSelectionMode,
    selectedConfiguredDateCount,
    workingDateKeys.length,
  ]);
  const showBulkSelectionHint = isBulkSelectionMode && !workingDateKeys.length;
  const visibleMonthKey = visibleMonth.getTime();
  const hasScheduleChanges =
    serializeEditableSchedule(normalizedSchedule) !== initialEditableScheduleRef.current;
  const canSaveCalendar = !isSaving && hasScheduleChanges;

  useEffect(() => {
    const updateViewportMode = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', updateViewportMode);

    return () => window.removeEventListener('resize', updateViewportMode);
  }, []);

  useEffect(() => {
    return () => {
      calendarTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      clearCalendarTransitionTimers();
      resetCalendarTransitionState();
    }
  }, [isMobile]);

  const dismissUndoToast = () => {
    if (undoToastIdRef.current) {
      toast.dismiss(undoToastIdRef.current);
      undoToastIdRef.current = null;
    }
  };

  const clearCalendarTransitionTimers = () => {
    calendarTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    calendarTransitionTimersRef.current = [];
  };

  const resetCalendarSwipeState = () => {
    calendarSwipeStateRef.current = {
      startX: 0,
      startY: 0,
      deltaX: 0,
      isPointerDown: false,
      isHorizontalSwipe: false,
      blockedByVerticalScroll: false,
      startTime: 0,
    };
  };

  const resetCalendarTransitionState = () => {
    setCalendarDragOffset(0);
    setIsCalendarDragging(false);
    setIsCalendarTransitioning(false);
    setCalendarTransitionTargetMonth(null);
    resetCalendarSwipeState();
  };

  const getCalendarSwipeWidth = () =>
    calendarSwipeViewportRef.current?.clientWidth || window.innerWidth || 320;

  const canNavigateToMonth = () => true;

  const getAdjacentCalendarMonth = (deltaX) => {
    if (deltaX < 0) {
      return addCalendarMonths(visibleMonth, 1);
    }

    if (deltaX > 0) {
      const previousMonth = addCalendarMonths(visibleMonth, -1);
      return canNavigateToMonth(previousMonth) ? previousMonth : null;
    }

    return null;
  };

  const finalizeCalendarTransition = (nextMonth) => {
    setVisibleMonth(toCalendarMonthStart(nextMonth));

    if (isBulkSelectionMode) {
      stopBulkSelectionDrag(null, null);
      setBulkSelectedDateKeys([]);
    }

    resetCalendarTransitionState();
  };

  const animateCalendarToMonth = (nextMonth, options = {}) => {
    const { fromDrag = false } = options;
    const normalizedNextMonth = toCalendarMonthStart(nextMonth);

    if (
      !canNavigateToMonth(normalizedNextMonth) ||
      normalizedNextMonth.getTime() === visibleMonthKey ||
      isCalendarTransitioning
    ) {
      return;
    }

    clearCalendarTransitionTimers();
    setIsCalendarDragging(false);
    setCalendarTransitionTargetMonth(normalizedNextMonth);

    const targetOffset = normalizedNextMonth.getTime() > visibleMonthKey
      ? -getCalendarSwipeWidth()
      : getCalendarSwipeWidth();

    if (fromDrag) {
      setIsCalendarTransitioning(true);
      setCalendarDragOffset(targetOffset);
    } else {
      setIsCalendarTransitioning(false);
      setCalendarDragOffset(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsCalendarTransitioning(true);
          setCalendarDragOffset(targetOffset);
        });
      });
    }

    calendarTransitionTimersRef.current.push(
      window.setTimeout(() => {
        finalizeCalendarTransition(normalizedNextMonth);
      }, CALENDAR_SWIPE_TRANSITION_MS)
    );
  };

  const animateCalendarSwipeBack = () => {
    const activeTargetMonth = calendarTransitionTargetMonth || getAdjacentCalendarMonth(calendarDragOffset);

    setIsCalendarDragging(false);
    setCalendarTransitionTargetMonth(activeTargetMonth);
    setIsCalendarTransitioning(true);
    setCalendarDragOffset(0);

    calendarTransitionTimersRef.current.push(
      window.setTimeout(() => {
        resetCalendarTransitionState();
      }, CALENDAR_SWIPE_TRANSITION_MS - 20)
    );
  };

  const updateSlots = (nextSlots) => {
    setSchedule({
      isCustomized: true,
      slots: normalizeFreeTourSchedule({
        isCustomized: true,
        slots: nextSlots,
      }).slots,
    });
  };

  const restoreRemovedSlots = (removedSlots) => {
    if (!removedSlots.length) {
      return;
    }

    setSchedule((currentSchedule) => {
      const currentSlots = normalizeFreeTourSchedule(
        currentSchedule || DEFAULT_FREE_TOUR_SCHEDULE
      ).slots;

      return {
        isCustomized: true,
        slots: normalizeFreeTourSchedule({
          isCustomized: true,
          slots: [...currentSlots, ...removedSlots],
        }).slots,
      };
    });
  };

  const showUndoToast = (time, removedSlots) => {
    if (!removedSlots.length) {
      return;
    }

    dismissUndoToast();

    const removedDateCount = new Set(removedSlots.map((slot) => slot.date)).size;
    const toastId = `free-tour-calendar-undo-${time}-${Date.now()}`;
    undoToastIdRef.current = toastId;

    toast.info(
      <div className="free-tour-calendar-editor__undo-toast">
        <span>{`${time} removed from ${formatCountLabel(removedDateCount, 'day')}`}</span>
        <button
          type="button"
          className="free-tour-calendar-editor__undo-toast-button"
          onClick={() => {
            restoreRemovedSlots(removedSlots);
            toast.dismiss(toastId);
          }}
        >
          Undo
        </button>
      </div>,
      {
        toastId,
        autoClose: 5000,
        closeButton: false,
        className: 'free-tour-calendar-editor__undo-toast-shell',
        bodyClassName: 'free-tour-calendar-editor__undo-toast-body',
        onClose: () => {
          if (undoToastIdRef.current === toastId) {
            undoToastIdRef.current = null;
          }
        },
      }
    );
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
    setVisibleMonth(toCalendarMonthStart(normalizedDate));

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
      setVisibleMonth(toCalendarMonthStart(fallbackDate));
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

  const handleCalendarSwipeStart = (event) => {
    if (
      !isMobile ||
      isBulkSelectionMode ||
      isCalendarTransitioning ||
      event.touches.length !== 1
    ) {
      return;
    }

    if (
      event.target instanceof Element &&
      event.target.closest(
        '.free-tour-calendar-editor__calendar-nav-button, .free-tour-calendar-editor__selection-toggle'
      )
    ) {
      return;
    }

    clearCalendarTransitionTimers();
    setIsCalendarTransitioning(false);
    setCalendarTransitionTargetMonth(null);

    const touch = event.touches[0];
    calendarSwipeStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      isPointerDown: true,
      isHorizontalSwipe: false,
      blockedByVerticalScroll: false,
      startTime: Date.now(),
    };
  };

  const handleCalendarSwipeMove = (event) => {
    if (
      !isMobile ||
      isBulkSelectionMode ||
      !calendarSwipeStateRef.current.isPointerDown ||
      event.touches.length !== 1
    ) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - calendarSwipeStateRef.current.startX;
    const deltaY = touch.clientY - calendarSwipeStateRef.current.startY;
    const targetMonth = getAdjacentCalendarMonth(deltaX);

    calendarSwipeStateRef.current.deltaX = deltaX;

    if (
      !calendarSwipeStateRef.current.isHorizontalSwipe &&
      !calendarSwipeStateRef.current.blockedByVerticalScroll
    ) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        calendarSwipeStateRef.current.isHorizontalSwipe = true;
        setIsCalendarDragging(true);
      } else {
        calendarSwipeStateRef.current.blockedByVerticalScroll = true;
        return;
      }
    }

    if (!calendarSwipeStateRef.current.isHorizontalSwipe) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const resistance = 0.92;

    setCalendarTransitionTargetMonth(targetMonth);
    setCalendarDragOffset(deltaX * resistance);
  };

  const handleCalendarSwipeEnd = () => {
    if (!isMobile || isBulkSelectionMode) {
      return;
    }

    if (!calendarSwipeStateRef.current.isPointerDown) {
      resetCalendarSwipeState();
      return;
    }

    const { deltaX, isHorizontalSwipe, startTime } = calendarSwipeStateRef.current;
    const width = getCalendarSwipeWidth();
    const elapsed = Math.max(Date.now() - startTime, 1);
    const velocity = Math.abs(deltaX) / elapsed;
    const threshold = Math.min(Math.max(width * 0.18, 42), 96);
    const targetMonth = getAdjacentCalendarMonth(deltaX);
    const shouldCommit = isHorizontalSwipe && (
      Math.abs(deltaX) > threshold ||
      (Math.abs(deltaX) > 24 && velocity > 0.55)
    );

    setIsCalendarDragging(false);

    if (shouldCommit && targetMonth) {
      resetCalendarSwipeState();
      animateCalendarToMonth(targetMonth, { fromDrag: true });
      return;
    }

    animateCalendarSwipeBack();
    resetCalendarSwipeState();
  };

  const renderCalendarPicker = (monthDate, options = {}) => {
    const { isTarget = false, style } = options;
    const previousMonth = addCalendarMonths(monthDate, -1);
    const isPrevDisabled = !canNavigateToMonth(previousMonth);
    const selectedDateForMonth = !isBulkSelectionMode && isSameCalendarMonth(activeDate, monthDate)
      ? activeDate
      : null;
    const monthLabel = formatMonthLabel(monthDate);
    const { month, year } = formatMonthParts(monthDate);

    return (
      <div
        className={`free-tour-calendar-editor__calendar-swipe-layer${
          isTarget
            ? ' free-tour-calendar-editor__calendar-swipe-layer--target'
            : ' free-tour-calendar-editor__calendar-swipe-layer--current'
        }${
          isCalendarDragging ? ' free-tour-calendar-editor__calendar-swipe-layer--dragging' : ''
        }${
          isCalendarTransitioning
            ? ' free-tour-calendar-editor__calendar-swipe-layer--transitioning'
            : ''
        }`}
        style={style}
        aria-hidden={isTarget ? 'true' : undefined}
      >
        <DatePicker
          inline
          selected={selectedDateForMonth}
          openToDate={monthDate}
          onChange={handleDateSelection}
          calendarStartDay={1}
          renderCustomHeader={() => (
            <div className="free-tour-calendar-editor__calendar-header">
              <div className="free-tour-calendar-editor__calendar-nav">
                <div className="free-tour-calendar-editor__calendar-nav-side free-tour-calendar-editor__calendar-nav-side--left">
                  <button
                    type="button"
                    className="free-tour-calendar-editor__calendar-nav-button"
                    onClick={() => animateCalendarToMonth(previousMonth)}
                    disabled={isPrevDisabled}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                </div>
                <div
                  className="free-tour-calendar-editor__calendar-month"
                  aria-live="polite"
                  aria-label={monthLabel}
                >
                  <span className="free-tour-calendar-editor__calendar-month-name">
                    {month}
                  </span>
                  {' '}
                  <span className="free-tour-calendar-editor__calendar-month-year">
                    {year}
                  </span>
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
                    onClick={() => animateCalendarToMonth(addCalendarMonths(monthDate, 1))}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="free-tour-calendar-editor__calendar-weekdays">
                {WEEKDAY_OPTIONS.map((option) => (
                  <span
                    key={option.value}
                    className={`free-tour-calendar-editor__calendar-weekday${
                      option.value === 6 || option.value === 0
                        ? ' free-tour-calendar-editor__calendar-weekday--weekend'
                        : ''
                    }`}
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          onMonthChange={(date) => {
            const nextVisibleMonth = toCalendarMonthStart(date || visibleMonth || createTomorrow());
            setVisibleMonth(nextVisibleMonth);

            if (isBulkSelectionMode) {
              stopBulkSelectionDrag(null, null);
              setBulkSelectedDateKeys([]);
            }
          }}
          dayClassName={(date) => {
            const classNames = [];
            const dateKey = toFreeTourDateKey(date);
            const hasSlots = configuredDateKeySet.has(dateKey);
            const isMarked = isBulkSelectionMode && bulkSelectedDateKeySet.has(dateKey);
            const isWeekend = isWeekendCalendarDate(date);
            const isActive =
              !isBulkSelectionMode &&
              isSameCalendarMonth(date, monthDate) &&
              dateKey === activeDateKey;

            if (isWeekend) {
              classNames.push('free-tour-calendar-editor__calendar-day--weekend');
            }

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
    );
  };

  const toggleTime = (time) => {
    if (!workingDateKeys.length) {
      return;
    }

    const allDatesHaveTime = workingDateKeys.every((dateKey) =>
      effectiveSlots.some((slot) => slot.date === dateKey && slot.time === time)
    );
    const removedSlots = allDatesHaveTime
      ? effectiveSlots.filter(
          (slot) => workingDateKeys.includes(slot.date) && slot.time === time
        )
      : [];

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

    if (allDatesHaveTime) {
      showUndoToast(time, removedSlots);
    }
  };

  const handleCancel = () => {
    dismissUndoToast();
    onCancel();
  };

  const handleSave = (event) => {
    if (!canSaveCalendar) {
      event.preventDefault();
      return;
    }

    dismissUndoToast();
    onSave(event);
  };

  const calendarSwipeWidth = getCalendarSwipeWidth();
  const calendarSwipeProgress = Math.min(Math.abs(calendarDragOffset) / calendarSwipeWidth, 1);
  const activeTargetMonth = calendarTransitionTargetMonth || getAdjacentCalendarMonth(calendarDragOffset);
  const targetBaseOffset = !activeTargetMonth
    ? 0
    : activeTargetMonth.getTime() > visibleMonthKey
      ? calendarSwipeWidth
      : -calendarSwipeWidth;
  const currentCalendarLayerStyle = {
    transform: `translate3d(${calendarDragOffset}px, 0, 0)`,
    opacity: 1 - (calendarSwipeProgress * 0.1),
  };
  const targetCalendarLayerStyle = activeTargetMonth
    ? {
        transform: `translate3d(${targetBaseOffset + calendarDragOffset}px, 0, 0)`,
        opacity: 0.76 + (calendarSwipeProgress * 0.24),
      }
    : undefined;

  return (
    <AdminModalShell
      eyebrow={null}
      title={null}
      onClose={handleCancel}
      wide
      hideClose
    >
      <form onSubmit={handleSave} className="story-admin-form free-tour-calendar-editor">
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
              <div
                ref={calendarSwipeViewportRef}
                className="free-tour-calendar-editor__calendar-swipe-viewport"
                onTouchStart={handleCalendarSwipeStart}
                onTouchMove={handleCalendarSwipeMove}
                onTouchEnd={handleCalendarSwipeEnd}
                onTouchCancel={handleCalendarSwipeEnd}
              >
                {activeTargetMonth
                  ? renderCalendarPicker(activeTargetMonth, {
                      isTarget: true,
                      style: targetCalendarLayerStyle,
                    })
                  : null}
                {renderCalendarPicker(visibleMonth, {
                  style: currentCalendarLayerStyle,
                })}
              </div>
            </div>
          </section>

          <section className="free-tour-calendar-editor__panel free-tour-calendar-editor__panel--times">
            {showBulkSelectionHint ? (
              <div className="free-tour-calendar-editor__selection-hint" aria-live="polite">
                Select days above
              </div>
            ) : isBulkSelectionMode ? (
              <div
                className={`free-tour-calendar-editor__selection-summary${
                  selectionSummary.tone === 'warning'
                    ? ' free-tour-calendar-editor__selection-summary--warning'
                    : selectionSummary.tone === 'configured'
                      ? ' free-tour-calendar-editor__selection-summary--configured'
                      : ''
                }`}
                aria-live="polite"
              >
                <span className="free-tour-calendar-editor__selection-summary-label">
                  {selectionSummary.label}
                </span>
                {selectionSummary.detail ? (
                  <span className="free-tour-calendar-editor__selection-summary-detail">
                    {selectionSummary.detail}
                  </span>
                ) : null}
              </div>
            ) : null}
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
          <button
            type="button"
            className="story-admin-button story-admin-button--secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="story-admin-button story-admin-button--primary"
            disabled={!canSaveCalendar}
          >
            {isSaving ? 'Saving…' : 'Save calendar'}
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

export default FreeTourScheduleEditorModal;
