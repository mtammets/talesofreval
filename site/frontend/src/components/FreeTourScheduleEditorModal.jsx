import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';

import AdminModalShell from './AdminModalShell';
import { DEFAULT_FREE_TOUR_TIMES } from '../content/fallbackTours';
import {
  DEFAULT_SITE_EMAIL_TEMPLATES,
  getSiteEmailTemplateOption,
  getSiteEmailTemplateToken,
  normalizeSiteEmailTemplates,
  SITE_EMAIL_TEMPLATE_GROUPS,
  SITE_EMAIL_TEMPLATE_OPTIONS,
  SITE_EMAIL_TEMPLATE_TOKENS,
  toSiteEmailEditorBodyHtml,
  toSiteEmailEditorSubjectHtml,
  toStoredSiteEmailBody,
  toStoredSiteEmailSubject,
} from '../utils/siteEmailTemplates';
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

const getMonthDateKeys = (monthDate) => {
  const date = toCalendarMonthStart(monthDate);
  const month = date.getMonth();
  const keys = [];

  while (date.getMonth() === month) {
    keys.push(toFreeTourDateKey(date));
    date.setDate(date.getDate() + 1);
  }

  return keys;
};

const formatCountLabel = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const serializeEditorState = (schedule, emailTemplates) =>
  JSON.stringify({
    schedule: toEditableFreeTourSchedule(schedule || DEFAULT_FREE_TOUR_SCHEDULE),
    emailTemplates: normalizeSiteEmailTemplates(
      emailTemplates || DEFAULT_SITE_EMAIL_TEMPLATES
    ),
  });

const DEFAULT_ACTIVE_EMAIL_TEMPLATE_KEY =
  SITE_EMAIL_TEMPLATE_OPTIONS.find((entry) => entry.key === 'freeTourConfirmation')?.key ||
  SITE_EMAIL_TEMPLATE_OPTIONS[0]?.key ||
  'freeTourConfirmation';

const EDITOR_VIEW_OPTIONS = [
  { key: 'calendar', ariaLabel: 'Open calendar view' },
  { key: 'emails', ariaLabel: 'Open email templates view' },
];

const getSiteEmailTemplateGroup = (templateKey) =>
  SITE_EMAIL_TEMPLATE_GROUPS.find((group) => group.templateKeys.includes(templateKey)) ||
  SITE_EMAIL_TEMPLATE_GROUPS[0] ||
  null;

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
const EDITOR_VIEW_SWIPE_TRANSITION_MS = 360;

function FreeTourScheduleEditorModal({
  schedule,
  setSchedule,
  emailTemplates = DEFAULT_SITE_EMAIL_TEMPLATES,
  setEmailTemplates,
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
  const slotLookup = useMemo(
    () =>
      effectiveSlots.reduce((lookup, slot) => {
        lookup.set(`${slot.date}-${slot.time}`, slot);
        return lookup;
      }, new Map()),
    [effectiveSlots]
  );
  const normalizedEmailTemplates = useMemo(
    () => normalizeSiteEmailTemplates(emailTemplates),
    [emailTemplates]
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
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const activeTemplateFieldRef = useRef({
    emailKey: DEFAULT_ACTIVE_EMAIL_TEMPLATE_KEY,
    field: 'body',
  });
  const [activeEmailTemplateKey, setActiveEmailTemplateKey] = useState(
    DEFAULT_ACTIVE_EMAIL_TEMPLATE_KEY
  );
  const focusedTemplateFieldRef = useRef(null);
  const templateFieldRefs = useRef({});
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
  const editorViewSwipeViewportRef = useRef(null);
  const calendarSwipeStateRef = useRef({
    startX: 0,
    startY: 0,
    deltaX: 0,
    isPointerDown: false,
    isHorizontalSwipe: false,
    blockedByVerticalScroll: false,
    startTime: 0,
  });
  const editorViewSwipeStateRef = useRef({
    startX: 0,
    startY: 0,
    deltaX: 0,
    isPointerDown: false,
    isHorizontalSwipe: false,
    blockedByVerticalScroll: false,
    startTime: 0,
  });
  const calendarTransitionTimersRef = useRef([]);
  const editorViewTransitionTimersRef = useRef([]);
  const [editorViewDragOffset, setEditorViewDragOffset] = useState(0);
  const [isEditorViewDragging, setIsEditorViewDragging] = useState(false);
  const [isEditorViewTransitioning, setIsEditorViewTransitioning] = useState(false);
  const [editorViewTransitionTargetIndex, setEditorViewTransitionTargetIndex] = useState(null);
  const undoToastIdRef = useRef(null);
  const initialEditorStateRef = useRef(serializeEditorState(schedule, emailTemplates));

  const activeDateKey = toFreeTourDateKey(activeDate);
  const visibleMonthDateKeys = useMemo(
    () => getMonthDateKeys(visibleMonth),
    [visibleMonth]
  );
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
  const hasEditorChanges =
    serializeEditorState(normalizedSchedule, normalizedEmailTemplates) !== initialEditorStateRef.current;
  const canSaveCalendar = !isSaving && hasEditorChanges;
  const activeView = EDITOR_VIEW_OPTIONS[activeViewIndex] || EDITOR_VIEW_OPTIONS[0];
  const activeEmailOption =
    getSiteEmailTemplateOption(activeEmailTemplateKey) ||
    SITE_EMAIL_TEMPLATE_OPTIONS[0];

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
      editorViewTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      calendarTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      calendarTransitionTimersRef.current = [];
      setCalendarDragOffset(0);
      setIsCalendarDragging(false);
      setIsCalendarTransitioning(false);
      setCalendarTransitionTargetMonth(null);
      calendarSwipeStateRef.current = {
        startX: 0,
        startY: 0,
        deltaX: 0,
        isPointerDown: false,
        isHorizontalSwipe: false,
        blockedByVerticalScroll: false,
        startTime: 0,
      };
    }
  }, [isMobile]);

  useEffect(() => {
    if (!getSiteEmailTemplateOption(activeEmailTemplateKey)) {
      setActiveEmailTemplateKey(DEFAULT_ACTIVE_EMAIL_TEMPLATE_KEY);
    }
  }, [activeEmailTemplateKey]);

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

  const updateEmailTemplateField = (emailKey, field, value) => {
    if (typeof setEmailTemplates !== 'function') {
      return;
    }

    setEmailTemplates((currentTemplates) => {
      const nextTemplates = normalizeSiteEmailTemplates(currentTemplates);

      return {
        ...nextTemplates,
        [emailKey]: {
          ...nextTemplates[emailKey],
          [field]: value,
        },
      };
    });
  };

  const setActiveTemplateField = (emailKey, field) => {
    activeTemplateFieldRef.current = {
      emailKey,
      field,
    };
  };

  const setTemplateFieldRef = (emailKey, field, node) => {
    templateFieldRefs.current[`${emailKey}.${field}`] = node;

    if (!node) {
      return;
    }

    const nextValue = normalizedEmailTemplates[emailKey]?.[field] || '';
    const nextHtml = field === 'subject'
      ? toSiteEmailEditorSubjectHtml(nextValue)
      : toSiteEmailEditorBodyHtml(nextValue);

    if (node.innerHTML !== nextHtml) {
      node.innerHTML = nextHtml;
    }
  };

  const syncTemplateFieldNode = useCallback((emailKey, field) => {
    const node = templateFieldRefs.current[`${emailKey}.${field}`];

    if (!node) {
      return;
    }

    const nextValue = normalizedEmailTemplates[emailKey]?.[field] || '';
    const nextHtml = field === 'subject'
      ? toSiteEmailEditorSubjectHtml(nextValue)
      : toSiteEmailEditorBodyHtml(nextValue);

    if (node.innerHTML !== nextHtml) {
      node.innerHTML = nextHtml;
    }
  }, [normalizedEmailTemplates]);

  const focusTemplateField = (emailKey, field) => {
    const node = templateFieldRefs.current[`${emailKey}.${field}`];

    if (!node || typeof node.focus !== 'function') {
      return false;
    }

    node.focus();

    const selection = window.getSelection?.();

    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return true;
  };

  const handleEditorShellClick = (emailKey, field, event) => {
    if (
      event.target instanceof Element &&
      event.target.closest('.free-tour-calendar-editor__email-editor')
    ) {
      return;
    }

    focusTemplateField(emailKey, field);
  };

  const handleTemplateFieldFocus = (emailKey, field) => {
    focusedTemplateFieldRef.current = `${emailKey}.${field}`;
    setActiveTemplateField(emailKey, field);
  };

  const handleTemplateFieldBlur = (emailKey, field) => {
    const fieldKey = `${emailKey}.${field}`;

    if (focusedTemplateFieldRef.current === fieldKey) {
      focusedTemplateFieldRef.current = null;
    }
  };

  const handleTemplateFieldInput = (emailKey, field, event) => {
    const nextValue = field === 'subject'
      ? toStoredSiteEmailSubject(event.currentTarget.innerHTML)
      : toStoredSiteEmailBody(event.currentTarget.innerHTML);

    updateEmailTemplateField(emailKey, field, nextValue);
  };

  useEffect(() => {
    SITE_EMAIL_TEMPLATE_OPTIONS.forEach((option) => {
      const subjectFieldKey = `${option.key}.subject`;
      const bodyFieldKey = `${option.key}.body`;

      if (focusedTemplateFieldRef.current !== subjectFieldKey) {
        syncTemplateFieldNode(option.key, 'subject');
      }

      if (focusedTemplateFieldRef.current !== bodyFieldKey) {
        syncTemplateFieldNode(option.key, 'body');
      }
    });
  }, [normalizedEmailTemplates, syncTemplateFieldNode]);

  const clearEditorViewTransitionTimers = () => {
    editorViewTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    editorViewTransitionTimersRef.current = [];
  };

  const blurActiveEditorField = () => {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      activeElement.closest('.free-tour-calendar-editor__email-editor')
    ) {
      activeElement.blur();
    }
  };

  const resetEditorViewSwipeState = () => {
    editorViewSwipeStateRef.current = {
      startX: 0,
      startY: 0,
      deltaX: 0,
      isPointerDown: false,
      isHorizontalSwipe: false,
      blockedByVerticalScroll: false,
      startTime: 0,
    };
  };

  const getEditorViewSwipeWidth = () =>
    editorViewSwipeViewportRef.current?.clientWidth || window.innerWidth || 320;

  const getAdjacentEditorViewIndex = (deltaX) => {
    if (deltaX < 0 && activeViewIndex < EDITOR_VIEW_OPTIONS.length - 1) {
      return activeViewIndex + 1;
    }

    if (deltaX > 0 && activeViewIndex > 0) {
      return activeViewIndex - 1;
    }

    return null;
  };

  const finalizeEditorViewTransition = (nextIndex) => {
    setActiveViewIndex(nextIndex);
    setEditorViewDragOffset(0);
    setIsEditorViewDragging(false);
    setIsEditorViewTransitioning(false);
    setEditorViewTransitionTargetIndex(null);
    focusedTemplateFieldRef.current = null;
    resetEditorViewSwipeState();
  };

  const animateToEditorView = (nextIndex, options = {}) => {
    const { fromDrag = false } = options;

    if (
      nextIndex < 0 ||
      nextIndex > EDITOR_VIEW_OPTIONS.length - 1 ||
      nextIndex === activeViewIndex ||
      isEditorViewTransitioning
    ) {
      return;
    }

    clearEditorViewTransitionTimers();
    blurActiveEditorField();
    setIsEditorViewDragging(false);
    setEditorViewTransitionTargetIndex(nextIndex);

    const targetOffset = nextIndex > activeViewIndex ? -getEditorViewSwipeWidth() : getEditorViewSwipeWidth();

    if (fromDrag) {
      setIsEditorViewTransitioning(true);
      setEditorViewDragOffset(targetOffset);
    } else {
      setIsEditorViewTransitioning(false);
      setEditorViewDragOffset(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsEditorViewTransitioning(true);
          setEditorViewDragOffset(targetOffset);
        });
      });
    }

    editorViewTransitionTimersRef.current.push(
      window.setTimeout(() => {
        finalizeEditorViewTransition(nextIndex);
      }, EDITOR_VIEW_SWIPE_TRANSITION_MS)
    );
  };

  const animateEditorViewSwipeBack = () => {
    const activeTargetIndex =
      editorViewTransitionTargetIndex ?? getAdjacentEditorViewIndex(editorViewDragOffset);

    setIsEditorViewDragging(false);
    setEditorViewTransitionTargetIndex(activeTargetIndex);
    setIsEditorViewTransitioning(true);
    setEditorViewDragOffset(0);

    editorViewTransitionTimersRef.current.push(
      window.setTimeout(() => {
        setIsEditorViewTransitioning(false);
        setEditorViewTransitionTargetIndex(null);
        setEditorViewDragOffset(0);
        resetEditorViewSwipeState();
      }, EDITOR_VIEW_SWIPE_TRANSITION_MS - 20)
    );
  };

  const navigateToEditorView = (nextIndex) => {
    if (nextIndex === activeViewIndex) {
      return;
    }

    focusedTemplateFieldRef.current = null;
    animateToEditorView(nextIndex);
  };

  const handleEditorViewTouchStart = (event) => {
    if (isEditorViewTransitioning || event.touches.length !== 1 || EDITOR_VIEW_OPTIONS.length < 2) {
      return;
    }

    if (
      event.target instanceof Element &&
      event.target.closest(
        '.free-tour-calendar-editor__date-picker, .free-tour-calendar-editor__email-editor, button, a, input, textarea, select'
      )
    ) {
      return;
    }

    clearEditorViewTransitionTimers();
    setIsEditorViewTransitioning(false);
    setEditorViewTransitionTargetIndex(null);

    const touch = event.touches[0];
    editorViewSwipeStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      isPointerDown: true,
      isHorizontalSwipe: false,
      blockedByVerticalScroll: false,
      startTime: Date.now(),
    };
  };

  const handleEditorViewTouchMove = (event) => {
    if (!editorViewSwipeStateRef.current.isPointerDown || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - editorViewSwipeStateRef.current.startX;
    const deltaY = touch.clientY - editorViewSwipeStateRef.current.startY;
    const targetIndex = getAdjacentEditorViewIndex(deltaX);

    editorViewSwipeStateRef.current.deltaX = deltaX;

    if (
      !editorViewSwipeStateRef.current.isHorizontalSwipe &&
      !editorViewSwipeStateRef.current.blockedByVerticalScroll
    ) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        editorViewSwipeStateRef.current.isHorizontalSwipe = true;
        setIsEditorViewDragging(true);
      } else {
        editorViewSwipeStateRef.current.blockedByVerticalScroll = true;
        return;
      }
    }

    if (!editorViewSwipeStateRef.current.isHorizontalSwipe) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const isPushingPastFirst = activeViewIndex === 0 && deltaX > 0;
    const isPushingPastLast = activeViewIndex === EDITOR_VIEW_OPTIONS.length - 1 && deltaX < 0;
    const resistance = isPushingPastFirst || isPushingPastLast ? 0.28 : 0.92;

    setEditorViewTransitionTargetIndex(targetIndex);
    setEditorViewDragOffset(deltaX * resistance);
  };

  const handleEditorViewTouchEnd = () => {
    if (!editorViewSwipeStateRef.current.isPointerDown) {
      resetEditorViewSwipeState();
      return;
    }

    const { deltaX, isHorizontalSwipe, startTime } = editorViewSwipeStateRef.current;
    const width = getEditorViewSwipeWidth();
    const elapsed = Math.max(Date.now() - startTime, 1);
    const velocity = Math.abs(deltaX) / elapsed;
    const threshold = Math.min(Math.max(width * 0.18, 42), 96);
    const targetIndex = getAdjacentEditorViewIndex(deltaX);
    const shouldCommit = isHorizontalSwipe && (
      Math.abs(deltaX) > threshold ||
      (Math.abs(deltaX) > 24 && velocity > 0.55)
    );

    setIsEditorViewDragging(false);

    if (shouldCommit && targetIndex !== null) {
      resetEditorViewSwipeState();
      animateToEditorView(targetIndex, { fromDrag: true });
      return;
    }

    animateEditorViewSwipeBack();
    resetEditorViewSwipeState();
  };

  const insertTemplateToken = (emailKey, token) => {
    if (typeof setEmailTemplates !== 'function') {
      return;
    }

    const activeField =
      activeTemplateFieldRef.current?.emailKey === emailKey
        ? activeTemplateFieldRef.current.field
        : 'body';
    const inputKey = `${emailKey}.${activeField}`;
    const inputElement = templateFieldRefs.current[inputKey];

    if (!inputElement || typeof document === 'undefined') {
      return;
    }

    inputElement.focus();

    const selection = window.getSelection?.();

    if (!selection) {
      return;
    }

    if (!selection.rangeCount || !inputElement.contains(selection.anchorNode)) {
      const fallbackRange = document.createRange();
      fallbackRange.selectNodeContents(inputElement);
      fallbackRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(fallbackRange);
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const tokenNode = document.createElement('span');
    tokenNode.className = 'free-tour-calendar-editor__merge-token';
    tokenNode.setAttribute('data-free-tour-token', token);
    tokenNode.setAttribute('contenteditable', 'false');
    tokenNode.textContent = getSiteEmailTemplateToken(token)?.label || token;

    const spacerNode = document.createTextNode('\u00A0');
    range.insertNode(tokenNode);
    tokenNode.after(spacerNode);
    range.setStartAfter(spacerNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
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

  const replaceBulkSelection = (dateKeys) => {
    const nextDateKeys = sortDateKeys(dateKeys);
    setBulkSelectedDateKeys(nextDateKeys);

    const focusDate = parseFreeTourDate(nextDateKeys[nextDateKeys.length - 1]);

    if (focusDate) {
      setActiveDate(focusDate);
    }
  };

  const handleSelectVisibleMonth = () => {
    if (!isBulkSelectionMode) {
      return;
    }

    replaceBulkSelection(visibleMonthDateKeys);
  };

  const handleSelectVisibleColumn = () => {
    if (!isBulkSelectionMode) {
      return;
    }

    const seedDate = isSameCalendarMonth(activeDate, visibleMonth)
      ? activeDate
      : toCalendarMonthStart(visibleMonth);
    const targetDay = seedDate.getDay();

    replaceBulkSelection(
      visibleMonthDateKeys.filter((dateKey) => parseFreeTourDate(dateKey)?.getDay() === targetDay)
    );
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
                  {isBulkSelectionMode ? (
                    <div className="free-tour-calendar-editor__bulk-shortcuts" aria-hidden="false">
                      <button
                        type="button"
                        className="free-tour-calendar-editor__bulk-shortcut free-tour-calendar-editor__bulk-shortcut--column"
                        aria-label="Select visible column"
                        onClick={handleSelectVisibleColumn}
                      >
                        {Array.from({ length: 9 }, (_, index) => (
                          <span
                            key={`column-${index}`}
                            className={
                              index === 1 || index === 4 || index === 7
                                ? 'free-tour-calendar-editor__bulk-shortcut-dot free-tour-calendar-editor__bulk-shortcut-dot--active'
                                : 'free-tour-calendar-editor__bulk-shortcut-dot free-tour-calendar-editor__bulk-shortcut-dot--muted'
                            }
                          />
                        ))}
                      </button>
                      <button
                        type="button"
                        className="free-tour-calendar-editor__bulk-shortcut free-tour-calendar-editor__bulk-shortcut--month"
                        aria-label="Select visible month"
                        onClick={handleSelectVisibleMonth}
                      >
                        {Array.from({ length: 9 }, (_, index) => (
                          <span
                            key={`month-${index}`}
                            className="free-tour-calendar-editor__bulk-shortcut-dot free-tour-calendar-editor__bulk-shortcut-dot--active"
                          />
                        ))}
                      </button>
                    </div>
                  ) : null}
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
  const editorViewSwipeWidth = getEditorViewSwipeWidth();
  const editorViewSwipeProgress = Math.min(Math.abs(editorViewDragOffset) / editorViewSwipeWidth, 1);
  const activeTargetViewIndex =
    editorViewTransitionTargetIndex ?? getAdjacentEditorViewIndex(editorViewDragOffset);
  const activeTargetView = activeTargetViewIndex !== null
    ? EDITOR_VIEW_OPTIONS[activeTargetViewIndex]
    : null;
  const editorViewTargetBaseOffset = activeTargetViewIndex === null
    ? 0
    : activeTargetViewIndex > activeViewIndex
      ? editorViewSwipeWidth
      : -editorViewSwipeWidth;
  const currentEditorViewStyle = {
    transform: `translate3d(${editorViewDragOffset}px, 0, 0)`,
    opacity: 1 - (editorViewSwipeProgress * 0.1),
  };
  const targetEditorViewStyle = activeTargetView
    ? {
        transform: `translate3d(${editorViewTargetBaseOffset + editorViewDragOffset}px, 0, 0)`,
        opacity: 0.76 + (editorViewSwipeProgress * 0.24),
      }
    : undefined;

  const renderCalendarView = () => (
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
            const bookingCount = hasSelection
              ? workingDateKeys.reduce(
                  (total, dateKey) => total + (slotLookup.get(`${dateKey}-${time}`)?.bookings || 0),
                  0
                )
              : 0;
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
                aria-label={time}
              >
                <span className="free-tour-calendar-editor__time-label">{time}</span>
                {hasSelection ? (
                  <span
                    className={`free-tour-calendar-editor__time-count${
                      hasTimeOnAllSelectedDates
                        ? ' free-tour-calendar-editor__time-count--active'
                        : hasTimeOnSomeSelectedDates
                          ? ' free-tour-calendar-editor__time-count--partial'
                          : ''
                    }`}
                    aria-hidden="true"
                  >
                    {bookingCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  const selectEmailTemplate = (nextTemplateKey) => {
    if (nextTemplateKey === activeEmailOption?.key) {
      return;
    }

    blurActiveEditorField();
    focusedTemplateFieldRef.current = null;
    setActiveEmailTemplateKey(nextTemplateKey);
  };

  const selectEmailGroup = (nextGroupKey) => {
    const nextGroup = SITE_EMAIL_TEMPLATE_GROUPS.find((group) => group.key === nextGroupKey);

    if (!nextGroup) {
      return;
    }

    const nextTemplateKey =
      nextGroup.templateKeys.find((templateKey) => getSiteEmailTemplateOption(templateKey)) ||
      DEFAULT_ACTIVE_EMAIL_TEMPLATE_KEY;

    selectEmailTemplate(nextTemplateKey);
  };

  const renderEmailView = () => {
    if (!activeEmailOption) {
      return null;
    }

    const option = activeEmailOption;
    const activeEmailGroup = getSiteEmailTemplateGroup(option.key);
    const groupedTemplateOptions = (activeEmailGroup?.templateKeys || [])
      .map((templateKey) => getSiteEmailTemplateOption(templateKey))
      .filter(Boolean);
    const availableTokens = SITE_EMAIL_TEMPLATE_TOKENS.filter((entry) =>
      option.tokenKeys.includes(entry.key)
    );

    return (
      <section className="free-tour-calendar-editor__email-composer free-tour-calendar-editor__email-composer--swipe">
        <div className="free-tour-calendar-editor__email-tabs" aria-label="Email groups">
          {SITE_EMAIL_TEMPLATE_GROUPS.map((group) => {
            const isActive = group.key === activeEmailGroup?.key;

            return (
              <button
                key={group.key}
                type="button"
                className={`free-tour-calendar-editor__email-tab${
                  isActive ? ' free-tour-calendar-editor__email-tab--active' : ''
                }`}
                onClick={() => selectEmailGroup(group.key)}
                aria-pressed={isActive}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        <div className="free-tour-calendar-editor__email-subtabs-shell">
          <div
            className="free-tour-calendar-editor__email-tabs free-tour-calendar-editor__email-tabs--secondary"
            aria-label={`${activeEmailGroup?.label || option.groupLabel} email templates`}
          >
            {groupedTemplateOptions.map((templateOption) => {
              const isActive = templateOption.key === option.key;

              return (
                <button
                  key={templateOption.key}
                  type="button"
                  className={`free-tour-calendar-editor__email-tab free-tour-calendar-editor__email-tab--secondary${
                    isActive ? ' free-tour-calendar-editor__email-tab--active' : ''
                  }`}
                  onClick={() => selectEmailTemplate(templateOption.key)}
                  aria-label={templateOption.ariaLabel}
                  aria-pressed={isActive}
                >
                  {templateOption.tabLabel || templateOption.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="free-tour-calendar-editor__email-composer-editors">
          <div
            className="free-tour-calendar-editor__email-editor-shell"
            onClick={(event) => handleEditorShellClick(option.key, 'subject', event)}
          >
            <span className="free-tour-calendar-editor__email-editor-label">Subject</span>
            <div
              ref={(node) => setTemplateFieldRef(option.key, 'subject', node)}
              className="free-tour-calendar-editor__email-editor free-tour-calendar-editor__email-editor--subject"
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label={option.subjectLabel}
              aria-multiline={false}
              onFocus={() => handleTemplateFieldFocus(option.key, 'subject')}
              onBlur={() => handleTemplateFieldBlur(option.key, 'subject')}
              onInput={(event) => handleTemplateFieldInput(option.key, 'subject', event)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
            />
          </div>

          <div className="free-tour-calendar-editor__token-row">
            {availableTokens.map((entry) => (
              <button
                key={`${option.key}-${entry.token}`}
                type="button"
                className="free-tour-calendar-editor__token"
                onClick={() => insertTemplateToken(option.key, entry.token)}
                aria-label={`Insert ${entry.label}`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div
            className="free-tour-calendar-editor__email-editor-shell free-tour-calendar-editor__email-editor-shell--body"
            onClick={(event) => handleEditorShellClick(option.key, 'body', event)}
          >
            <span className="free-tour-calendar-editor__email-editor-label">Message</span>
            <div
              ref={(node) => setTemplateFieldRef(option.key, 'body', node)}
              className="free-tour-calendar-editor__email-editor free-tour-calendar-editor__email-editor--body"
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label={option.bodyLabel}
              aria-multiline
              onFocus={() => handleTemplateFieldFocus(option.key, 'body')}
              onBlur={() => handleTemplateFieldBlur(option.key, 'body')}
              onInput={(event) => handleTemplateFieldInput(option.key, 'body', event)}
            />
          </div>
        </div>
      </section>
    );
  };

  const renderEditorView = (view, options = {}) => {
    const { isTarget = false, style } = options;

    return (
      <div
        className={`free-tour-calendar-editor__view-swipe-layer${
          isTarget
            ? ' free-tour-calendar-editor__view-swipe-layer--target'
            : ' free-tour-calendar-editor__view-swipe-layer--current'
        }${
          isEditorViewDragging ? ' free-tour-calendar-editor__view-swipe-layer--dragging' : ''
        }${
          isEditorViewTransitioning
            ? ' free-tour-calendar-editor__view-swipe-layer--transitioning'
            : ''
        }`}
        style={style}
        aria-hidden={isTarget ? 'true' : undefined}
      >
        {view.key === 'calendar' ? renderCalendarView() : renderEmailView()}
      </div>
    );
  };

  const renderViewSwitchIcon = (view) => {
    if (view.key === 'calendar') {
      return (
        <span
          className="free-tour-calendar-editor__view-switch-icon free-tour-calendar-editor__view-switch-icon--calendar"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
        </span>
      );
    }

    return (
      <span
        className={`free-tour-calendar-editor__view-switch-icon free-tour-calendar-editor__view-switch-icon--mail free-tour-calendar-editor__view-switch-icon--${view.key}`}
        aria-hidden="true"
      >
        <span className="free-tour-calendar-editor__view-switch-mail">
          <span className="free-tour-calendar-editor__view-switch-mail-line" />
          <span className="free-tour-calendar-editor__view-switch-mail-line" />
        </span>
        <span className="free-tour-calendar-editor__view-switch-badge" />
      </span>
    );
  };

  return (
    <AdminModalShell
      eyebrow={null}
      title={null}
      onClose={handleCancel}
      wide
      hideClose
    >
      <form onSubmit={handleSave} className="story-admin-form free-tour-calendar-editor">
        <div className="free-tour-calendar-editor__view-switcher" aria-label="Editor views">
          {EDITOR_VIEW_OPTIONS.map((view, index) => (
            <button
              key={view.key}
              type="button"
              className={`free-tour-calendar-editor__view-switch${
                index === activeViewIndex ? ' free-tour-calendar-editor__view-switch--active' : ''
              }`}
              onClick={() => navigateToEditorView(index)}
              aria-label={view.ariaLabel}
              aria-pressed={index === activeViewIndex}
            >
              {renderViewSwitchIcon(view)}
            </button>
          ))}
        </div>

        <div
          ref={editorViewSwipeViewportRef}
          className="free-tour-calendar-editor__view-swipe-viewport"
          onTouchStart={handleEditorViewTouchStart}
          onTouchMove={handleEditorViewTouchMove}
          onTouchEnd={handleEditorViewTouchEnd}
          onTouchCancel={handleEditorViewTouchEnd}
        >
          {activeTargetView
            ? renderEditorView(activeTargetView, {
                isTarget: true,
                style: targetEditorViewStyle,
              })
            : null}
          {renderEditorView(activeView, {
            style: currentEditorViewStyle,
          })}
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
            {isSaving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </AdminModalShell>
  );
}

export default FreeTourScheduleEditorModal;
