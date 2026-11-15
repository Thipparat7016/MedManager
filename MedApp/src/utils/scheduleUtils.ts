import { Medication, ScheduleItem } from './types';
import {
  THAI_MONTH_NAMES_MAP,
  getLocalDateString,
  getMedicationCreatedDateTime,
  getMedicationStartDate,
  getMedicationEndDate,
} from './dateUtils';
import { normalizeMedName } from './formatUtils';

export function getMedicationDurationMode(med: Medication): 'ทุกวัน' | 'กำหนดเอง' | null {
  if (med.customDays && Array.isArray(med.customDays) && med.customDays.length > 0) {
    return 'กำหนดเอง';
  }
  if (med.instructions) {
    if (med.instructions.startsWith('วันที่ ') || med.instructions === 'กำหนดวันเอง') {
      return 'กำหนดเอง';
    }
    if (med.instructions === 'ทุกวัน') {
      return 'ทุกวัน';
    }
  }
  if (med.durationMode) return med.durationMode;
  return null;
}

export function extractCustomDaysFromMedication(med: Medication): number[] {
  if (med.customDays && Array.isArray(med.customDays) && med.customDays.length > 0) {
    return med.customDays
      .map(n => Number(n))
      .filter(n => !isNaN(n) && n >= 1 && n <= 31);
  }
  if (med.instructions && med.instructions.startsWith('วันที่ ')) {
    const matches = med.instructions.match(/\d+/g) || [];
    return matches
      .map(n => parseInt(n, 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 31);
  }
  return [];
}

export function isMedicationScheduledForDate(med: Medication, targetDate: Date): boolean {
  if (!med || med.status !== 'active') return false;

  const targetDateStr = getLocalDateString(targetDate);
  const startDate = getMedicationStartDate(med);

  // Check end date boundary: Cannot be scheduled after medication ends or expires
  const endDate = getMedicationEndDate(med);
  if (endDate) {
    const endDateStr = getLocalDateString(endDate);
    if (targetDateStr > endDateStr) {
      return false;
    }
  }

  const mode = getMedicationDurationMode(med);
  if (mode === 'กำหนดเอง') {
    const days = extractCustomDaysFromMedication(med);
    if (days.length === 0) return false;
    if (!days.includes(targetDate.getDate())) return false;

    let matchedInstructionMonth = false;
    if (med.instructions && med.instructions.includes('ในเดือน')) {
      for (const [mName, mIdx] of Object.entries(THAI_MONTH_NAMES_MAP)) {
        if (mName.length > 3 && med.instructions.includes(mName)) {
          matchedInstructionMonth = true;
          if (targetDate.getMonth() !== mIdx) {
            return false;
          }
          break;
        }
      }
    }

    if (startDate) {
      if (targetDate.getFullYear() !== startDate.getFullYear()) {
        return false;
      }
      if (!matchedInstructionMonth && targetDate.getMonth() !== startDate.getMonth()) {
        return false;
      }
    }

    const customCreatedDt = getMedicationCreatedDateTime(med);
    if (customCreatedDt && targetDateStr === getLocalDateString(customCreatedDt)) {
      const times = med.times && med.times.length > 0 ? med.times : ['08:00'];
      const hasAnyEligibleTime = times.some(rawTime =>
        isDoseEligibleOnCreationDay(rawTime, customCreatedDt)
      );
      if (!hasAnyEligibleTime) {
        return false;
      }
    }
    return true;
  }

  // For 'ทุกวัน' (every day), cannot be scheduled before medication start date / creation date
  if (startDate) {
    const startDateStr = getLocalDateString(startDate);
    if (targetDateStr < startDateStr) {
      return false;
    }
  }

  const createdDt = getMedicationCreatedDateTime(med);
  if (createdDt) {
    const createdDateStr = getLocalDateString(createdDt);
    if (targetDateStr < createdDateStr) {
      return false;
    }
    // On creation day, allow doses from the active meal window (or later) so same-period doses still appear
    if (targetDateStr === createdDateStr) {
      const times = med.times && med.times.length > 0 ? med.times : ['08:00'];
      const hasAnyEligibleTime = times.some(rawTime =>
        isDoseEligibleOnCreationDay(rawTime, createdDt)
      );
      if (!hasAnyEligibleTime) {
        return false;
      }
    }
  }

  return true;
}

export function buildScheduleForDateSync(
  allMeds: Medication[],
  targetDate: Date,
  storedItems: ScheduleItem[] = [],
  snoozeMap: Record<string, number> = {}
): ScheduleItem[] {
  const targetDateStr = getLocalDateString(targetDate);
  const scheduledMeds = allMeds.filter(m => isMedicationScheduledForDate(m, targetDate));
  if (scheduledMeds.length === 0) {
    return [];
  }

  const reconciled: ScheduleItem[] = [];
  const consumedIndices = new Set<number>();

  for (const med of scheduledMeds) {
    const mode = getMedicationDurationMode(med);
    const createdDt = getMedicationCreatedDateTime(med);
    let isCreationDay = false;

    if (createdDt) {
      const createdDateStr = getLocalDateString(createdDt);
      if (mode !== 'กำหนดเอง' && targetDateStr < createdDateStr) {
        continue;
      }
      if (targetDateStr === createdDateStr) {
        isCreationDay = true;
      }
    }

    const times = med.times && med.times.length > 0 ? med.times : ['08:00'];

    times.forEach((rawTime, idx) => {
      const normTime = rawTime.replace(' น.', '').trim();
      const displayTime = `${normTime} น.`;
      const syntheticId = `sch-${targetDateStr}-${med.id}-${idx}`;

      const matchIdx = storedItems.findIndex(
        (s, sIdx) =>
          !consumedIndices.has(sIdx) &&
          (s.medicationId === med.id ||
            normalizeMedName(s.medicationName) === normalizeMedName(med.name)) &&
          ((s.originalTime || s.time.replace(' น.', '').trim()) === normTime ||
            s.id === syntheticId)
      );

      const matched = matchIdx >= 0 ? storedItems[matchIdx] : undefined;
      if (matchIdx >= 0) {
        consumedIndices.add(matchIdx);
      }

      if (isCreationDay && createdDt) {
        if (
          !isDoseEligibleOnCreationDay(normTime, createdDt) &&
          !matched?.isTaken &&
          !matched?.isChecked
        ) {
          return;
        }
      }

      const itemPostponedUntil =
        matched?.postponedUntil ||
        snoozeMap[matched?.id || syntheticId] ||
        snoozeMap[`${med.id}_${targetDateStr}`] ||
        snoozeMap[`${med.name}_${targetDateStr}`];

      const activePostponedUntil =
        itemPostponedUntil && Date.now() < itemPostponedUntil
          ? itemPostponedUntil
          : undefined;

      reconciled.push({
        id: matched?.id || syntheticId,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        unit: med.unit,
        type: med.type,
        doseCount: 1,
        mealTiming:
          med.timeMealTimings?.[normTime] || med.mealTiming || matched?.mealTiming || '',
        originalTime: normTime,
        postponedTime: matched?.postponedTime,
        postponedUntil: activePostponedUntil,
        time: matched?.postponedTime || displayTime,
        date: targetDateStr,
        isChecked: matched ? Boolean(matched.isChecked || matched.isTaken) : false,
        isTaken: matched ? Boolean(matched.isTaken) : false,
        takenAt: matched?.takenAt,
        isSkipped: matched ? Boolean(matched.isSkipped) : false,
      });
    });
  }

  reconciled.sort((a, b) =>
    a.time.replace(' น.', '').trim().localeCompare(b.time.replace(' น.', '').trim())
  );

  return reconciled;
}

export function parseScheduleTimeMinutes(raw?: string): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.includes('T')) {
    const dt = new Date(trimmed);
    if (!isNaN(dt.getTime())) {
      return dt.getHours() * 60 + dt.getMinutes();
    }
  }
  const clean = trimmed.replace(' น.', '').trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function getMealWindowCategory(
  minutes: number,
  mealTiming?: string
): 'เช้า' | 'กลางวัน' | 'เย็น' | 'ก่อนนอน' {
  if (mealTiming === 'ก่อนนอน') return 'ก่อนนอน';
  if (minutes >= 300 && minutes <= 659) return 'เช้า'; // 05:00 - 10:59 น.
  if (minutes >= 660 && minutes <= 899) return 'กลางวัน'; // 11:00 - 14:59 น.
  if (minutes >= 900 && minutes <= 1199) return 'เย็น'; // 15:00 - 19:59 น.
  return 'ก่อนนอน'; // 20:00 - 04:59 น.
}

export function getMealWindowStartMinutes(meal: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ก่อนนอน'): number {
  switch (meal) {
    case 'เช้า':
      return 300; // 05:00 น.
    case 'กลางวัน':
      return 660; // 11:00 น.
    case 'เย็น':
      return 900; // 15:00 น.
    case 'ก่อนนอน':
      return 1200; // 20:00 น.
  }
}

/**
 * Returns the start minute of the meal window active at `createdMinutes` on a calendar day
 * (`00:00-04:59 -> 0`, `05:00-10:59 -> 300`, `11:00-14:59 -> 660`, `15:00-19:59 -> 900`, `20:00-23:59 -> 1200`).
 */
export function getCreationDayActiveWindowStart(createdMinutes: number): number {
  if (createdMinutes < 300) return 0;
  if (createdMinutes < 660) return 300;
  if (createdMinutes < 900) return 660;
  if (createdMinutes < 1200) return 900;
  return 1200;
}

/** Checks whether a dose time on creation day falls in the active meal window or a later window. */
export function isDoseEligibleOnCreationDay(rawTime: string, createdDt: Date): boolean {
  const timeMinutes = parseScheduleTimeMinutes(rawTime) ?? 0;
  const createdMinutes = createdDt.getHours() * 60 + createdDt.getMinutes();
  return timeMinutes >= getCreationDayActiveWindowStart(createdMinutes);
}

export const MEAL_ORDER = ['มื้อเช้า', 'มื้อกลางวัน', 'มื้อเย็น', 'ก่อนนอน'];

export const MEAL_TIME_RANGES: Record<string, { range: string; defaultTime: string }> = {
  'มื้อเช้า': { range: '05:00 - 10:59 น.', defaultTime: '08:00 น.' },
  'มื้อกลางวัน': { range: '11:00 - 14:59 น.', defaultTime: '12:00 น.' },
  'มื้อเย็น': { range: '15:00 - 19:59 น.', defaultTime: '18:00 น.' },
  'ก่อนนอน': { range: '20:00 - 04:59 น.', defaultTime: '21:00 น.' },
};

export function getMealCategory(timeStr?: string, mealTiming?: string): string {
  if (mealTiming === 'ก่อนนอน') return 'ก่อนนอน';
  const clean = (timeStr || '').replace(' น.', '').trim();
  const hour = parseInt(clean.split(':')[0], 10);
  if (!isNaN(hour)) {
    if (hour >= 5 && hour < 11) return 'มื้อเช้า';
    if (hour >= 11 && hour < 15) return 'มื้อกลางวัน';
    if (hour >= 15 && hour < 20) return 'มื้อเย็น';
    return 'ก่อนนอน';
  }
  return 'มื้อเช้า';
}

export function isScheduleTakenOnTime(item: ScheduleItem): boolean {
  if (!item || !item.isTaken || !item.takenAt) return false;

  const takenMinutes = parseScheduleTimeMinutes(item.takenAt);
  if (takenMinutes === null) return false;

  const origMinutes = parseScheduleTimeMinutes(item.originalTime || item.time);
  const postponedMinutes = parseScheduleTimeMinutes(item.postponedTime);
  const currentTargetMinutes = parseScheduleTimeMinutes(item.time);

  // กรณีที่ 1: คิดคะแนน "ตรงเวลา" เป็นมื้อตามช่วงเวลาที่แสดงบนการ์ด
  // - มื้อเช้า (05:00 - 10:59 น.) + ก่อนเริ่มมื้อไม่เกิน 30 นาที (04:30 - 04:59 น.)
  // - มื้อกลางวัน (11:00 - 14:59 น.) + ก่อนเริ่มมื้อไม่เกิน 30 นาที (10:30 - 10:59 น.)
  // - มื้อเย็น (15:00 - 19:59 น.) + ก่อนเริ่มมื้อไม่เกิน 30 นาที (14:30 - 14:59 น.)
  // - ก่อนนอน (20:00 - 04:59 น.) + ก่อนเริ่มมื้อไม่เกิน 30 นาที (19:30 - 19:59 น.)
  if (origMinutes !== null) {
    const scheduledMeal = getMealWindowCategory(origMinutes, item.mealTiming);
    const takenMeal = getMealWindowCategory(takenMinutes);
    if (scheduledMeal === takenMeal) {
      return true;
    }

    // เช็คกรณีทานก่อนเริ่มช่วงมื้อไม่เกิน 30 นาที (เช่น มื้อก่อนนอนเริ่ม 20:00 น. กดทานช่วง 19:30 - 19:59 น.)
    const mealStartMinutes = getMealWindowStartMinutes(scheduledMeal);
    const minutesBeforeMealStart = (((mealStartMinutes - takenMinutes) % 1440) + 1440) % 1440;
    if (minutesBeforeMealStart >= 0 && minutesBeforeMealStart <= 30) {
      return true;
    }

    // เช็คกรณีกดก่อนเวลาที่ตั้งไว้ไม่เกิน 30 นาที
    const minutesBeforeScheduled = (((origMinutes - takenMinutes) % 1440) + 1440) % 1440;
    if (minutesBeforeScheduled >= 0 && minutesBeforeScheduled <= 30) {
      return true;
    }
  }

  // กรณีที่ 2: กดปุ่ม "ข้าม 30 นาที" (แม้เวลาที่เลื่อนจะขยับพ้นขอบเขตมื้อไปเล็กน้อย) แล้วกดทานตามเวลาที่เลื่อน
  const effectivePostponed =
    postponedMinutes !== null
      ? postponedMinutes
      : item.postponedTime && origMinutes !== null
      ? (((origMinutes + 30) % 1440) + 1440) % 1440
      : currentTargetMinutes !== null && origMinutes !== null && currentTargetMinutes !== origMinutes
      ? currentTargetMinutes
      : null;

  if (effectivePostponed !== null) {
    const diffBeforePostponed = (((effectivePostponed - takenMinutes) % 1440) + 1440) % 1440;
    if (diffBeforePostponed >= 0 && diffBeforePostponed <= 30) {
      return true;
    }
  }

  return false;
}

export const MEDICATION_MEAL_TIMES = [
  { id: 'เช้า', label: 'เช้า', h: 8, m: 0, defaultFormatted: '08:00' },
  { id: 'กลางวัน', label: 'กลางวัน', h: 12, m: 0, defaultFormatted: '12:00' },
  { id: 'เย็น', label: 'เย็น', h: 18, m: 0, defaultFormatted: '18:00' },
  { id: 'ก่อนนอน', label: 'ก่อนนอน', h: 21, m: 0, defaultFormatted: '21:00' },
] as const;

export const MEDICATION_WEEKDAYS = [
  { id: 'จ.', label: 'จันทร์', full: 'วันจันทร์', short: 'จ.' },
  { id: 'อ.', label: 'อังคาร', full: 'วันอังคาร', short: 'อ.' },
  { id: 'พ.', label: 'พุธ', full: 'วันพุธ', short: 'พ.' },
  { id: 'พฤ.', label: 'พฤหัสฯ', full: 'วันพฤหัสบดี', short: 'พฤ.' },
  { id: 'ศ.', label: 'ศุกร์', full: 'วันศุกร์', short: 'ศ.' },
  { id: 'ส.', label: 'เสาร์', full: 'วันเสาร์', short: 'ส.' },
  { id: 'อา.', label: 'อาทิตย์', full: 'วันอาทิตย์', short: 'อา.' },
] as const;

export const MEDICATION_QUICK_TIMES = [
  { label: '07:00 (เช้าตรู่)', h: 7, m: 0 },
  { label: '08:00 (เช้า)', h: 8, m: 0 },
  { label: '12:00 (เที่ยง)', h: 12, m: 0 },
  { label: '13:00 (บ่าย)', h: 13, m: 0 },
  { label: '18:00 (เย็น)', h: 18, m: 0 },
  { label: '20:00 (ค่ำ)', h: 20, m: 0 },
  { label: '21:00 (ก่อนนอน)', h: 21, m: 0 },
] as const;

/** Filters the master medication catalog by name, formula, code, category, instructions, or precautions. */
export function filterMasterMedications(
  catalog: Medication[],
  query: string,
  cleanNameFn: (rawName?: string | null) => string
): Medication[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return catalog.slice(0, 10);
  }
  return catalog.filter(m => {
    const cleanName = cleanNameFn(m.name).toLowerCase();
    const rawName = (m.name || '').toLowerCase();
    const code = (m.code || '').toLowerCase();
    const cat = (m.category || '').toLowerCase();
    const inst = (m.instructions || '').toLowerCase();
    const prec = (m.precautions || '').toLowerCase();
    return (
      cleanName.includes(q) ||
      rawName.includes(q) ||
      code.includes(q) ||
      cat.includes(q) ||
      inst.includes(q) ||
      prec.includes(q)
    );
  });
}

/** Generates evenly spaced day numbers in a month starting from day 1 (e.g. step 2 = odd days, step 3 = every 3 days). */
export function buildMonthStepDays(daysInMonth: number, step: number): number[] {
  const days: number[] = [];
  for (let d = 1; d <= daysInMonth; d += step) {
    days.push(d);
  }
  return days;
}

/** Generates a Sunday-first calendar grid of nullable day numbers for the given year and month. */
export function buildCalendarMonthCells(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  return cells;
}

/** Maps a daily dose frequency count to default reminder time slots when the user leaves times empty. */
export function getDefaultTimesForFrequency(frequencyCount: number): string[] {
  switch (frequencyCount) {
    case 1:
      return ['08:00'];
    case 2:
      return ['08:00', '20:00'];
    case 3:
      return ['08:00', '12:00', '20:00'];
    case 4:
      return ['08:00', '12:00', '18:00', '21:00'];
    default:
      return ['08:00'];
  }
}
