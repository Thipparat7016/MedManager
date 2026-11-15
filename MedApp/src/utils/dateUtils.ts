import { Medication } from './types';

export const THAI_MONTH_NAMES_MAP: Record<string, number> = {
  'มกราคม': 0, 'ม.ค.': 0, 'ม.ค': 0,
  'กุมภาพันธ์': 1, 'ก.พ.': 1, 'ก.พ': 1,
  'มีนาคม': 2, 'มี.ค.': 2, 'มี.ค': 2,
  'เมษายน': 3, 'เม.ย.': 3, 'เม.ย': 3,
  'พฤษภาคม': 4, 'พ.ค.': 4, 'พ.ค': 4,
  'มิถุนายน': 5, 'มิ.ย.': 5, 'มิ.ย': 5,
  'กรกฎาคม': 6, 'ก.ค.': 6, 'ก.ค': 6,
  'สิงหาคม': 7, 'ส.ค.': 7, 'ส.ค': 7,
  'กันยายน': 8, 'ก.ย.': 8, 'ก.ย': 8,
  'ตุลาคม': 9, 'ต.ค.': 9, 'ต.ค': 9,
  'พฤศจิกายน': 10, 'พ.ย.': 10, 'พ.ย': 10,
  'ธันวาคม': 11, 'ธ.ค.': 11, 'ธ.ค': 11,
};

export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDateString(dateStr: string): Date {
  const parts = (dateStr || '').split('-').map(p => parseInt(p, 10));
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

export function parseFlexibleDate(raw?: string | null): Date | null {
  if (!raw || typeof raw !== 'string') return null;
  let str = raw.trim();
  if (!str) return null;

  // Remove common prefix text
  str = str.replace(/^(เริ่มต้น|ตั้งแต่วันที่|เริ่ม|วันที่)\s*/, '');

  // 1. Full ISO datetime string with 'T' (e.g. "2026-11-13T17:30:00.000Z") -> convert to LOCAL date
  if (str.includes('T')) {
    const parsedIso = new Date(str);
    if (!isNaN(parsedIso.getTime())) {
      return new Date(parsedIso.getFullYear(), parsedIso.getMonth(), parsedIso.getDate());
    }
  }

  // 2. Date-only YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    let y = parseInt(isoMatch[1], 10);
    if (y > 2400) y -= 543;
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }

  // 3. Thai text like '2 พฤศจิกายน 2569' or '2 พ.ย. 2569'
  const thaiMatch = str.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{2,4})$/);
  if (thaiMatch) {
    const d = parseInt(thaiMatch[1], 10);
    const mStr = thaiMatch[2];
    const m = THAI_MONTH_NAMES_MAP[mStr];
    let y = parseInt(thaiMatch[3], 10);
    if (y > 2400) y -= 543;
    else if (y < 100) y = y > 50 ? 2500 + y - 543 : 2000 + y;
    if (m !== undefined && !isNaN(d) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }

  // 4. DD/MM/YYYY or DD-MM-YYYY (or BE year)
  const slashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10) - 1;
    let y = parseInt(slashMatch[3], 10);
    if (y > 2400) y -= 543;
    else if (y < 100) y = y > 50 ? 2500 + y - 543 : 2000 + y;
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return null;
}

export function getMedicationCreatedDateTime(med: Medication): Date | null {
  if (med.createdAt) {
    const d = new Date(med.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (med.id && med.id.startsWith('med-')) {
    const ts = parseInt(med.id.replace('med-', ''), 10);
    if (!isNaN(ts) && ts > 1000000000) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export function getMedicationStartDate(med: Medication): Date | null {
  if (med.startDate) {
    const parsed = parseFlexibleDate(med.startDate);
    if (parsed) return parsed;
  }
  const createdDt = getMedicationCreatedDateTime(med);
  if (createdDt) {
    return new Date(createdDt.getFullYear(), createdDt.getMonth(), createdDt.getDate());
  }
  return null;
}

export function getMedicationEndDate(med: Medication): Date | null {
  if (med.endDate) {
    const parsed = parseFlexibleDate(med.endDate);
    if (parsed) return parsed;
  }
  if (med.expiryDate) {
    const parsedExp = parseFlexibleDate(med.expiryDate);
    if (parsedExp) return parsedExp;
  }
  return null;
}

export function parseAppointmentDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  let year = 0;
  let month = 0;
  let day = 0;

  const isoMatch = trimmed.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else {
    const dmyMatch = trimmed.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10) - 1;
      year = parseInt(dmyMatch[3], 10);
    } else {
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed)) return new Date(parsed);
      return null;
    }
  }

  if (year > 2400) year -= 543; // Buddhist Era to CE

  let hours = 0;
  let minutes = 0;
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{1,2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  }

  const dt = new Date(year, month, day, hours, minutes, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_WEEKDAYS_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

export const THAI_DAY_NAMES = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

export function formatThaiFullDate(d: Date = new Date()): string {
  return `${THAI_DAY_NAMES[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS_FULL[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function parseAppointmentDateParts(
  dateStr: string
): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/[\/\-.]/);
  if (parts.length >= 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    let y = parseInt(parts[2], 10);
    if (y > 2400) y -= 543; // Buddhist Era to CE
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return { day: d, month: m, year: y };
    }
  }
  return null;
}

export function getYearPageBase(year: number): number {
  return year - ((((year - 2024) % 12) + 12) % 12);
}

export function buildMondayFirstMonthGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarDays: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      calendarDays.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    calendarDays.push(currentWeek);
  }
  return calendarDays;
}
