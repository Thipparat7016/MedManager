import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { ScheduleItem } from '@/utils/types';
import {
  getLocalDateString,
  THAI_MONTHS_FULL,
  THAI_WEEKDAYS_SHORT,
  THAI_DAY_NAMES,
} from '@/utils/dateUtils';
import { buildScheduleForDateSync } from '@/utils/scheduleUtils';

export type ScheduleViewMode = 'day' | 'week' | 'month';

export interface PreviewMedImage {
  uri: string;
  name: string;
}

/** Custom hook encapsulating day/week/month schedule browsing, hydration, and image preview. */
export function useScheduleScreen() {
  const router = useRouter();
  const {
    medications,
    masterMedications,
    todaySchedule,
    getScheduleForDate,
    refreshData,
  } = useApp();

  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  const [storedSchedulesMap, setStoredSchedulesMap] = useState<Record<string, ScheduleItem[]>>({});
  const [previewMedImage, setPreviewMedImage] = useState<PreviewMedImage | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const todayStr = getLocalDateString(new Date());
  const selectedDateStr = getLocalDateString(selectedDate);
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthTitle = `${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`;

  // Monday of the selectedDate's week (0 = Mon .. 6 = Sun)
  const selectedDayOfWeek = (selectedDate.getDay() + 6) % 7;
  const monday = useMemo(() => {
    return new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() - selectedDayOfWeek
    );
  }, [selectedDate, selectedDayOfWeek]);

  // A date gets a red dot ONLY if buildScheduleForDateSync returns at least 1 scheduled dose for that date
  const hasScheduledMedOnDate = useCallback(
    (d: Date) => {
      const dStr = getLocalDateString(d);
      const storedForDay =
        dStr === todayStr ? todaySchedule : storedSchedulesMap[dStr] || [];
      return buildScheduleForDateSync(medications, d, storedForDay).length > 0;
    },
    [medications, todayStr, todaySchedule, storedSchedulesMap]
  );

  const weekDays = useMemo(() => {
    return THAI_WEEKDAYS_SHORT.map((label, idx) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      const dStr = getLocalDateString(d);
      return {
        label,
        day: d.getDate(),
        date: d,
        dateStr: dStr,
        isToday: dStr === todayStr,
        hasDot: hasScheduledMedOnDate(d),
      };
    });
  }, [monday, todayStr, hasScheduledMedOnDate]);

  const periodTitle = useMemo(() => {
    if (viewMode !== 'week' || weekDays.length < 7) {
      return monthTitle;
    }
    const startD = weekDays[0].date;
    const endD = weekDays[6].date;
    const startYearBE = startD.getFullYear() + 543;
    const endYearBE = endD.getFullYear() + 543;
    if (startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear()) {
      return `${startD.getDate()} – ${endD.getDate()} ${THAI_MONTHS_FULL[endD.getMonth()]} ${endYearBE}`;
    }
    if (startD.getFullYear() === endD.getFullYear()) {
      return `${startD.getDate()} ${THAI_MONTHS_FULL[startD.getMonth()]} – ${endD.getDate()} ${THAI_MONTHS_FULL[endD.getMonth()]} ${endYearBE}`;
    }
    return `${startD.getDate()} ${THAI_MONTHS_FULL[startD.getMonth()]} ${startYearBE} – ${endD.getDate()} ${THAI_MONTHS_FULL[endD.getMonth()]} ${endYearBE}`;
  }, [viewMode, weekDays, monthTitle]);

  // Synchronously compute schedules for all 7 days of the active week
  const weekSchedulesMap = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    for (const wd of weekDays) {
      const storedForDay =
        wd.dateStr === todayStr
          ? todaySchedule
          : storedSchedulesMap[wd.dateStr] || [];
      map[wd.dateStr] = buildScheduleForDateSync(medications, wd.date, storedForDay);
    }
    return map;
  }, [weekDays, medications, todayStr, todaySchedule, storedSchedulesMap]);

  const weekHasAnyItems = useMemo(
    () => weekDays.some(wd => (weekSchedulesMap[wd.dateStr] || []).length > 0),
    [weekDays, weekSchedulesMap]
  );

  // Put the selected day first at the top so tapping any day in week view immediately updates the top section
  const orderedWeekDays = useMemo(() => {
    const selectedWd = weekDays.find(wd => wd.dateStr === selectedDateStr);
    const otherScheduledWds = weekDays.filter(
      wd => wd.dateStr !== selectedDateStr && (weekSchedulesMap[wd.dateStr] || []).length > 0
    );
    return selectedWd ? [selectedWd, ...otherScheduledWds] : otherScheduledWds;
  }, [weekDays, selectedDateStr, weekSchedulesMap]);

  // Month grid cells (Monday-first to match weekDayLabels)
  const monthCells = useMemo(() => {
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const firstOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: Array<{
      day: number | null;
      date?: Date;
      dateStr?: string;
      hasDot?: boolean;
    }> = [];

    for (let i = 0; i < firstOffset; i++) {
      cells.push({ day: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      cells.push({
        day,
        date: d,
        dateStr: getLocalDateString(d),
        hasDot: hasScheduledMedOnDate(d),
      });
    }
    return cells;
  }, [currentYear, currentMonth, hasScheduledMedOnDate]);

  // Synchronously compute schedule for selectedDate so switching days or adding/editing/deleting meds updates in 0ms
  const selectedSchedule = useMemo(() => {
    const storedForDay =
      selectedDateStr === todayStr
        ? todaySchedule
        : storedSchedulesMap[selectedDateStr] || [];
    return buildScheduleForDateSync(medications, selectedDate, storedForDay);
  }, [medications, selectedDate, selectedDateStr, todayStr, todaySchedule, storedSchedulesMap]);

  // Load persisted taken/checked status for selectedDate whenever selectedDateStr changes
  useEffect(() => {
    if (selectedDateStr === todayStr) return;
    let active = true;
    getScheduleForDate(selectedDateStr).then(items => {
      if (active) {
        setStoredSchedulesMap(prev => ({
          ...prev,
          [selectedDateStr]: items,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, [selectedDateStr, todayStr, getScheduleForDate]);

  // Hydrate persisted taken/checked status for non-today days in the active week when in week view
  const mondayStr = getLocalDateString(monday);
  useEffect(() => {
    if (viewMode !== 'week') return;
    let active = true;
    const otherDays = weekDays.filter(wd => wd.dateStr !== todayStr);
    Promise.all(
      otherDays.map(async wd => {
        const items = await getScheduleForDate(wd.dateStr);
        return [wd.dateStr, items] as const;
      })
    ).then(entries => {
      if (active) {
        setStoredSchedulesMap(prev => {
          const next = { ...prev };
          entries.forEach(([k, v]) => {
            next[k] = v;
          });
          return next;
        });
      }
    });
    return () => {
      active = false;
    };
  }, [viewMode, mondayStr, todayStr, getScheduleForDate]);

  const handlePrevPeriod = useCallback(() => {
    if (viewMode === 'month') {
      const targetMonth = currentMonth - 1;
      const maxDay = new Date(currentYear, targetMonth + 1, 0).getDate();
      setSelectedDate(
        new Date(currentYear, targetMonth, Math.min(selectedDate.getDate(), maxDay))
      );
    } else if (viewMode === 'week') {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() - 7)
      );
    } else {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() - 1)
      );
    }
  }, [viewMode, currentYear, currentMonth, selectedDate]);

  const handleNextPeriod = useCallback(() => {
    if (viewMode === 'month') {
      const targetMonth = currentMonth + 1;
      const maxDay = new Date(currentYear, targetMonth + 1, 0).getDate();
      setSelectedDate(
        new Date(currentYear, targetMonth, Math.min(selectedDate.getDate(), maxDay))
      );
    } else if (viewMode === 'week') {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() + 7)
      );
    } else {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() + 1)
      );
    }
  }, [viewMode, currentYear, currentMonth, selectedDate]);

  const cleanTime = useCallback((t?: string) => (t || '').replace(' น.', '').trim(), []);

  const timeSlots = useMemo(
    () => Array.from(new Set(selectedSchedule.map(s => cleanTime(s.time)))).sort(),
    [selectedSchedule, cleanTime]
  );

  const goToAddMedication = useCallback(() => {
    router.push('/add-medication');
  }, [router]);

  return {
    THAI_MONTHS_FULL,
    WEEK_DAY_LABELS: THAI_WEEKDAYS_SHORT,
    THAI_DAY_NAMES,
    medications,
    masterMedications,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    previewMedImage,
    setPreviewMedImage,
    todayStr,
    selectedDateStr,
    currentYear,
    currentMonth,
    weekDays,
    periodTitle,
    weekSchedulesMap,
    weekHasAnyItems,
    orderedWeekDays,
    monthCells,
    selectedSchedule,
    timeSlots,
    cleanTime,
    handlePrevPeriod,
    handleNextPeriod,
    goToAddMedication,
  };
}
