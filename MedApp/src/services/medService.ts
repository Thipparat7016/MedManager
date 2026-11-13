import { safeStorage } from './storage';
import { supabase } from './supabase';

export interface Medication {
  id: string;
  code?: string;
  name: string;
  type: 'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ';
  category: 'ยา' | 'อาหารเสริม';
  dosage: string;
  unit: string;
  frequency: number; // จำนวนต่อครั้ง (dose per intake)
  remaining?: number;
  lowStockThreshold?: number;
  expiryDate?: string;
  durationMode?: 'ทุกวัน' | 'กำหนดเอง';
  customDays?: number[];
  instructions?: string;
  precautions?: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  times?: string[]; // e.g. ["08:00", "14:00", "20:00"]
  mealTiming?: 'ก่อนอาหาร' | 'หลังอาหาร' | 'พร้อมอาหาร' | 'ก่อนนอน';
  timeMealTimings?: Record<string, 'ก่อนอาหาร' | 'หลังอาหาร'>;
  createdAt?: string;
}

export interface DrugFoodInteraction {
  id: string;
  medicationName: string;
  foodName: string;
  interactionType: 'หลีกเลี่ยง' | 'แนะนำ' | 'แนะนำให้รับประทานร่วม' | 'ข้อควรระวัง' | string;
  severity?: 'สูง' | 'กลาง' | 'ต่ำ' | string;
  hoursNote?: string;
  impactDetails: string;
  sourceName: string;
  sourceType?: string;
}

export interface ScheduleItem {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  unit: string;
  type: string;
  doseCount?: number;
  mealTiming: string;
  time: string; // "08:00 น."
  originalTime?: string; // "08:00"
  postponedTime?: string; // "08:30 น."
  postponedUntil?: number; // timestamp (ms) until which the item is snoozed
  date: string; // "2026-07-12"
  isChecked?: boolean; // กดติ๊กที่หน้าหลักแล้ว (รอยืนยัน หาก isTaken === false)
  isTaken: boolean;
  takenAt?: string;
  isSkipped?: boolean;
}

export interface SideEffectLog {
  id: string;
  date: string;
  time: string;
  medicationName: string;
  symptoms: string[];
  severity: 'สูง' | 'กลาง' | 'ต่ำ';
  details?: string;
  createdAt: string;
}

export interface DoctorAppointment {
  id: string;
  doctorName: string;
  department: string;
  hospital: string;
  date: string;
  time: string;
  details?: string;
  status: 'confirmed' | 'pending' | 'passed';
}

export interface AppNotification {
  id: string;
  scheduleId?: string;
  type: 'med_reminder' | 'food_warning' | 'appointment' | 'med_taken' | 'low_stock';
  title: string;
  message: string;
  time: string;
  date: string;
  isActionable?: boolean;
  medicationName?: string;
  dosage?: string;
  imageUrl?: string;
  isRead?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  hasPassword?: boolean;
  notify30MinBefore: boolean;
  notifyFoodWarning: boolean;
  notifyAppointments: boolean;
  notifyLowStock: boolean;
}

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function normalizeMedName(name?: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[()（）[\]{}.,\/#!$%\^&\*;:{}=\-_`~?+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format hospital name to always be prefixed with "โรงพยาบาล"
 * e.g., "บางมด" -> "โรงพยาบาลบางมด"
 * e.g., "รพ.ธนบุรี" -> "โรงพยาบาลธนบุรี"
 * e.g., "โรงพยาบาลศิริราช" -> "โรงพยาบาลศิริราช"
 */
export function formatHospitalName(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('โรงพยาบาล')) {
    return trimmed;
  }
  if (trimmed.startsWith('รพ.') || trimmed.startsWith('รพ ')) {
    return `โรงพยาบาล${trimmed.replace(/^รพ\.?\s*/, '')}`;
  }
  return `โรงพยาบาล${trimmed}`;
}

/**
 * Format department name to always be prefixed with "แผนก"
 * e.g., "อายุรกรรม" -> "แผนกอายุรกรรม"
 * e.g., "แผนกทันตกรรม" -> "แผนกทันตกรรม"
 */
export function formatDepartmentName(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('แผนก')) {
    return trimmed;
  }
  return `แผนก${trimmed}`;
}

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

const THAI_MONTH_NAMES_MAP: Record<string, number> = {
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
    // If targetDate is the exact day the medication was created, ensure at least one dose time is >= creation time
    if (targetDateStr === createdDateStr) {
      const createdMinutes = createdDt.getHours() * 60 + createdDt.getMinutes();
      const times =
        med.times && med.times.length > 0 ? med.times : ['08:00'];
      const hasAnyEligibleTime = times.some(rawTime => {
        const normTime = rawTime.replace(' น.', '').trim();
        const [h, m] = normTime.split(':').map(val => parseInt(val, 10));
        const timeMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
        return timeMinutes >= createdMinutes;
      });
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
    let createdMinutes = 0;

    if (createdDt && mode !== 'กำหนดเอง') {
      const createdDateStr = getLocalDateString(createdDt);
      if (targetDateStr < createdDateStr) {
        continue;
      }
      if (targetDateStr === createdDateStr) {
        isCreationDay = true;
        createdMinutes = createdDt.getHours() * 60 + createdDt.getMinutes();
      }
    }

    const times =
      med.times && med.times.length > 0 ? med.times : ['08:00'];

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

      if (isCreationDay) {
        const [h, m] = normTime.split(':').map(val => parseInt(val, 10));
        const timeMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
        if (timeMinutes < createdMinutes && !matched?.isTaken && !matched?.isChecked) {
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
        postponedTime: activePostponedUntil ? matched?.postponedTime : undefined,
        postponedUntil: activePostponedUntil,
        time: activePostponedUntil && matched?.postponedTime ? matched.postponedTime : displayTime,
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

export function getMedicationStockStatus(med: Medication): {
  hasStock: boolean;
  remaining: number;
  dailyUsage: number;
  effectiveThreshold: number;
  isLowStock: boolean;
} {
  const hasStock = med.remaining !== undefined && med.remaining !== null;
  if (!hasStock) {
    return {
      hasStock: false,
      remaining: 0,
      dailyUsage: 0,
      effectiveThreshold: 0,
      isLowStock: false,
    };
  }
  const remaining = med.remaining as number;
  // จำนวนครั้งที่รับประทานต่อวัน (เช่น 4 ครั้ง/วัน หรือตามจำนวนเวลาที่ระบุในตาราง)
  const timesPerDay = med.times && med.times.length > 0 ? med.times.length : Math.max(1, med.frequency || 1);
  // ปริมาณยาที่ต้องรับประทานเผื่อไว้อย่างน้อย 1 วัน (ทานครั้งละ 1 เม็ด/แคปซูล)
  const dailyUsage = timesPerDay;
  const customThreshold =
    med.lowStockThreshold !== undefined &&
    med.lowStockThreshold !== null &&
    med.lowStockThreshold > 0
      ? med.lowStockThreshold
      : 0;
  const effectiveThreshold = Math.max(dailyUsage, customThreshold);

  return {
    hasStock: true,
    remaining,
    dailyUsage,
    effectiveThreshold,
    isLowStock: remaining <= effectiveThreshold,
  };
}

let toggleCheckedQueue: Promise<any> = Promise.resolve();

export function toUserStorageKey(emailOrId?: string | null): string | null {
  if (!emailOrId) return null;
  const cleaned = emailOrId.trim().toLowerCase();
  if (!cleaned) return null;
  return cleaned.replace(/[^a-z0-9@._-]/gi, '_');
}

export function hasValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 9;
}

export const medService = {
  // --------------------------------------------------------------------------
  // Cache Cleanup for Mock Data
  // --------------------------------------------------------------------------
  async purgeMockCacheIfNeeded() {
    try {
      const isPurged = await safeStorage.getItem('med_mock_purged_v2');
      if (!isPurged) {
        await safeStorage.removeItem('med_user_medications');
        await safeStorage.removeItem('med_appointments');
        await safeStorage.removeItem('med_side_effects');
        await safeStorage.removeItem('med_user_profile');
        await safeStorage.setItem('med_mock_purged_v2', 'true');
      }
    } catch (e) {
      console.warn('Error purging mock cache:', e);
    }
  },

  async getCurrentUserScope(): Promise<{
    userKey: string | null;
    userUUID: string | null;
    user: UserProfile | null;
  }> {
    try {
      const stored = await safeStorage.getItem('med_user_profile');
      if (!stored) {
        return { userKey: null, userUUID: null, user: null };
      }

      const parsed: UserProfile = JSON.parse(stored);
      if (!parsed || !parsed.email || parsed.email === 'somchai@gmail.com') {
        return { userKey: null, userUUID: null, user: null };
      }

      const cleanEmail = parsed.email.trim().toLowerCase();
      const userKey = toUserStorageKey(cleanEmail);
      let userUUID = parsed.id && isValidUUID(parsed.id) ? parsed.id : null;

      if (!userUUID && supabase && cleanEmail) {
        try {
          const { data } = await supabase
            .from('app_users')
            .select('id, name, email, phone')
            .ilike('email', cleanEmail);
          const matchedUser = (data || []).find(
            (row: any) => String(row.email || '').trim().toLowerCase() === cleanEmail
          );
          if (matchedUser && isValidUUID(matchedUser.id)) {
            userUUID = matchedUser.id;
            parsed.id = matchedUser.id;
            if (matchedUser.name) parsed.name = matchedUser.name;
            if (matchedUser.phone !== undefined) parsed.phone = matchedUser.phone || parsed.phone || '';
            await safeStorage.setItem('med_user_profile', JSON.stringify(parsed));
          }
        } catch {}
      }

      return { userKey, userUUID, user: parsed };
    } catch {
      return { userKey: null, userUUID: null, user: null };
    }
  },

  async getUserPreferences(userKey: string | null): Promise<{
    avatarUrl?: string;
    notify30MinBefore: boolean;
    notifyFoodWarning: boolean;
    notifyAppointments: boolean;
    notifyLowStock: boolean;
  }> {
    const defaults = {
      avatarUrl: undefined as string | undefined,
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
    };
    if (!userKey) return defaults;
    try {
      const raw = await safeStorage.getItem(`med_user_prefs_${userKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          avatarUrl: parsed.avatarUrl || undefined,
          notify30MinBefore: parsed.notify30MinBefore ?? true,
          notifyFoodWarning: parsed.notifyFoodWarning ?? true,
          notifyAppointments: parsed.notifyAppointments ?? true,
          notifyLowStock: parsed.notifyLowStock ?? false,
        };
      }
    } catch {}
    return defaults;
  },

  // --------------------------------------------------------------------------
  // User Profile & Authentication (app_users table)
  // --------------------------------------------------------------------------
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // 1. Read stored session profile
      const stored = await safeStorage.getItem('med_user_profile');
      if (!stored) {
        return null; // Explicitly not logged in
      }

      const parsed: UserProfile = JSON.parse(stored);
      if (!parsed || !parsed.email || parsed.email === 'somchai@gmail.com') {
        return null;
      }

      const cleanEmail = parsed.email.trim().toLowerCase();
      const userKey = toUserStorageKey(cleanEmail);
      const prefs = await this.getUserPreferences(userKey);
      if (!parsed.avatarUrl && prefs.avatarUrl) {
        parsed.avatarUrl = prefs.avatarUrl;
      }

      const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
      if (cachedPass) {
        parsed.hasPassword = true;
      }

      // Ensure authenticated flag is synced
      await safeStorage.setItem('med_is_authenticated', 'true');

      // 2. Refresh profile details silently from Supabase if online (matched strictly by email)
      if (supabase && cleanEmail) {
        try {
          const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .ilike('email', cleanEmail);

          const u = !error
            ? (data || []).find(
                (row: any) => String(row.email || '').trim().toLowerCase() === cleanEmail
              )
            : null;

          if (u) {
            parsed.id = u.id;
            parsed.name = u.name;
            parsed.phone = u.phone || parsed.phone || '';
            parsed.hasPassword = Boolean(
              (u.password !== undefined && u.password !== null && String(u.password).trim() !== '') ||
                cachedPass
            );
            await safeStorage.setItem('med_user_profile', JSON.stringify(parsed));
          }
        } catch (syncErr) {
          console.warn('Background profile sync notice:', syncErr);
        }
      }

      return parsed;
    } catch (e) {
      console.warn('Error fetching user profile:', e);
    }
    return null;
  },

  async loginUser(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      throw new Error('กรุณากรอกอีเมล');
    }
    if (!cleanPass) {
      throw new Error('กรุณากรอกรหัสผ่าน');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    // Check user in Supabase app_users table
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (error) {
      console.error('Supabase query error during login:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบบัญชี: ' + error.message);
    }

    // STRICT CHECK: User MUST exist in Supabase app_users!
    if (!data || data.length === 0) {
      throw new Error('ไม่พบข้อมูลบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกก่อนเข้าสู่ระบบ');
    }

    const u = data[0];

    // PASSWORD VERIFICATION:
    // 1. If password exists in database record
    if (u.password !== undefined && u.password !== null && String(u.password).trim() !== '') {
      if (u.password !== cleanPass) {
        throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
      }
      await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanPass);
    } else {
      // 2. Fallback check local credential cache
      const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
      if (cachedPass) {
        if (cachedPass !== cleanPass) {
          throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        }
        try {
          await supabase.from('app_users').update({ password: cleanPass }).eq('id', u.id);
        } catch {}
      } else {
        throw new Error(
          'บัญชีนี้สมัครด้วย Google และยังไม่ได้ตั้งรหัสผ่าน กรุณาเข้าสู่ระบบด้วย Google แล้วไปตั้งรหัสผ่านที่หน้าโปรไฟล์'
        );
      }
    }

    const userKey = toUserStorageKey(cleanEmail);
    const prefs = await this.getUserPreferences(userKey);

    const profile: UserProfile = {
      id: u.id,
      name: u.name,
      email: u.email || cleanEmail,
      phone: u.phone || '',
      hasPassword: true,
      ...prefs,
    };
    await safeStorage.setItem('med_is_authenticated', 'true');
    await safeStorage.setItem('med_user_profile', JSON.stringify(profile));

    // Log activity: 'เข้าสู่ระบบ'
    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([{
        time: timeStr,
        user_name: profile.name,
        activity: 'เข้าสู่ระบบ',
        details: `ผู้ใช้งาน ${profile.name} (${profile.email}) เข้าสู่ระบบ MedApp`,
      }]);
    } catch (logErr) {
      console.warn('Failed to log login activity:', logErr);
    }

    return profile;
  },

  async loginWithGoogleUser(
    email: string,
    fullName?: string,
    avatarUrl?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('ไม่พบข้อมูลอีเมลจาก Google');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    const resolvedGoogleName =
      (fullName && fullName.trim()) || cleanEmail.split('@')[0] || 'ผู้ใช้งาน';

    // Check if user already exists in Supabase app_users table (strictly by email, never by name)
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('email', cleanEmail);

    if (error) {
      console.error('Supabase query error during Google login:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบบัญชี: ' + error.message);
    }

    let u: any = (data || []).find(
      (row: any) => String(row.email || '').trim().toLowerCase() === cleanEmail
    );
    let isNewGoogleRegistration = false;

    // Auto-register user in app_users using Google profile data if this email is not yet registered
    if (!u) {
      isNewGoogleRegistration = true;

      const { data: existingUsers } = await supabase
        .from('app_users')
        .select('code');

      let maxNum = 0;
      for (const row of existingUsers || []) {
        const match = String(row.code || '').match(/(\d+)/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      }
      const nextCode = `USR-${String(maxNum + 1).padStart(3, '0')}`;

      const insertPayload: any = {
        code: nextCode,
        name: resolvedGoogleName,
        email: cleanEmail,
        phone: '',
        status: 'Active',
      };

      const { data: insertedData, error: insertErr } = await supabase
        .from('app_users')
        .insert([insertPayload])
        .select();

      if (insertErr) {
        console.error('Supabase insert error during Google auto-register:', insertErr);
        throw new Error('ไม่สามารถสร้างบัญชีสมาชิกจาก Google ได้: ' + insertErr.message);
      }

      u = insertedData?.[0] || {
        id: `user-${Date.now()}`,
        name: resolvedGoogleName,
        email: cleanEmail,
        phone: '',
      };
    }

    const userKey = toUserStorageKey(cleanEmail);
    const prefs = await this.getUserPreferences(userKey);
    const resolvedAvatar = prefs.avatarUrl || (avatarUrl && avatarUrl.trim()) || undefined;

    if (userKey && resolvedAvatar && !prefs.avatarUrl) {
      await safeStorage.setItem(
        `med_user_prefs_${userKey}`,
        JSON.stringify({
          ...prefs,
          avatarUrl: resolvedAvatar,
        })
      );
    }

    const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
    const hasPassword = Boolean(
      (u.password !== undefined && u.password !== null && String(u.password).trim() !== '') ||
        cachedPass
    );

    const profile: UserProfile = {
      id: u.id,
      name: u.name || resolvedGoogleName,
      email: u.email || cleanEmail,
      phone: u.phone || '',
      hasPassword,
      ...prefs,
      avatarUrl: resolvedAvatar,
    };

    await safeStorage.setItem('med_is_authenticated', 'true');
    await safeStorage.setItem('med_user_profile', JSON.stringify(profile));

    // Log activity to activity_logs
    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([{
        time: timeStr,
        user_name: profile.name,
        activity: isNewGoogleRegistration ? 'สมัครสมาชิก (Google)' : 'เข้าสู่ระบบ (Google)',
        details: isNewGoogleRegistration
          ? `ผู้ใช้งาน ${profile.name} (${profile.email}) สมัครสมาชิกและเข้าสู่ระบบด้วย Google สำเร็จ`
          : `ผู้ใช้งาน ${profile.name} (${profile.email}) เข้าสู่ระบบด้วย Google บน MedApp`,
      }]);
    } catch (logErr) {
      console.warn('Failed to log Google login activity:', logErr);
    }

    return profile;
  },

  async registerUser(params: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<UserProfile> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.name.trim();
    const cleanPhone = (params.phone || '').trim();
    const cleanPass = params.password.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    // 1. Check if email already registered in Supabase
    const { data: existingUser, error: checkErr } = await supabase
      .from('app_users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .limit(1);

    if (checkErr) {
      console.warn('Check existing user error:', checkErr);
    }

    if (existingUser && existingUser.length > 0) {
      throw new Error('อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยอีเมลนี้');
    }

    // 2. Generate next sequential code (USR-xxx)
    const { data: existingUsers } = await supabase
      .from('app_users')
      .select('code')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextCode = 'USR-001';
    if (existingUsers && existingUsers.length > 0 && existingUsers[0].code) {
      const match = existingUsers[0].code.match(/(\d+)/);
      if (match) {
        nextCode = `USR-${String(parseInt(match[1], 10) + 1).padStart(3, '0')}`;
      }
    }

    // 3. Insert into Supabase app_users with password
    const insertPayload: any = {
      code: nextCode,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPass,
      status: 'Active',
    };

    let insertedUser: any = null;
    let { data: insertedData, error: insertErr } = await supabase
      .from('app_users')
      .insert([insertPayload])
      .select();

    if (insertErr) {
      console.warn('Insert with password column failed, retrying without password column:', insertErr.message);
      delete insertPayload.password;
      const retryResult = await supabase
        .from('app_users')
        .insert([insertPayload])
        .select();

      if (retryResult.error) {
        throw new Error('ไม่สามารถบันทึกข้อมูลสมาชิกได้: ' + retryResult.error.message);
      }
      insertedUser = retryResult.data?.[0];
    } else {
      insertedUser = insertedData?.[0];
    }

    // Cache password locally
    await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanPass);

    const profile: UserProfile = {
      id: insertedUser?.id || `user-${Date.now()}`,
      name: insertedUser?.name || cleanName,
      email: insertedUser?.email || cleanEmail,
      phone: insertedUser?.phone || cleanPhone,
      hasPassword: true,
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
    };
    await safeStorage.setItem('med_is_authenticated', 'true');
    await safeStorage.setItem('med_user_profile', JSON.stringify(profile));

    // 4. Log activity: 'สมัครสมาชิก' ONLY when explicitly registering
    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([{
        time: timeStr,
        user_name: profile.name,
        activity: 'สมัครสมาชิก',
        details: `ผู้ใช้งาน ${profile.name} (${profile.email}) สมัครสมาชิกเข้าสู่ระบบสำเร็จ`,
      }]);
    } catch (logErr) {
      console.warn('Failed to log registration activity:', logErr);
    }

    return profile;
  },

  async setAccountPassword(params: {
    verifyInput: string;
    newPassword: string;
  }): Promise<UserProfile> {
    const current = await this.getUserProfile();
    if (!current || !current.email) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนตั้งรหัสผ่าน');
    }

    const cleanEmail = current.email.trim().toLowerCase();
    const cleanVerify = (params.verifyInput || '').trim();
    const cleanNewPass = (params.newPassword || '').trim();

    if (!cleanVerify) {
      throw new Error('กรุณากรอกข้อมูลเพื่อยืนยันตัวตน');
    }
    if (!cleanNewPass || cleanNewPass.length < 6) {
      throw new Error('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (error || !data || data.length === 0) {
      throw new Error('ไม่พบข้อมูลบัญชีผู้ใช้นี้ในฐานข้อมูล');
    }

    const u = data[0];
    const dbPass = u.password !== undefined && u.password !== null ? String(u.password).trim() : '';
    const cachedPass = (await safeStorage.getItem(`med_user_pwd_${cleanEmail}`)) || '';
    const hasExistingPass = Boolean(dbPass || cachedPass);

    const normalizePhoneDigits = (p?: string) => (p || '').replace(/\D/g, '');
    const userPhoneDigits = normalizePhoneDigits(u.phone || current.phone);
    const verifyDigits = normalizePhoneDigits(cleanVerify);

    if (hasExistingPass) {
      const matchesOldPass =
        (dbPass && cleanVerify === dbPass) || (cachedPass && cleanVerify === cachedPass);
      const matchesEmail = cleanVerify.toLowerCase() === cleanEmail;
      if (!matchesOldPass && !matchesEmail) {
        throw new Error('ข้อมูลยืนยันตัวตนไม่ถูกต้อง กรุณากรอกรหัสผ่านเดิมหรืออีเมลของบัญชีนี้ให้ถูกต้อง');
      }
    } else {
      const matchesEmail = cleanVerify.toLowerCase() === cleanEmail;
      const matchesPhone = Boolean(
        userPhoneDigits && verifyDigits && userPhoneDigits === verifyDigits
      );
      if (!matchesEmail && !matchesPhone) {
        throw new Error(
          'การยืนยันตัวตนไม่สำเร็จ กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ของบัญชีนี้ให้ถูกต้อง'
        );
      }
    }

    // Save password to Supabase app_users table
    const { error: updateErr } = await supabase
      .from('app_users')
      .update({ password: cleanNewPass })
      .eq('id', u.id);

    if (updateErr) {
      throw new Error('ไม่สามารถบันทึกรหัสผ่านลงฐานข้อมูลได้: ' + updateErr.message);
    }

    await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanNewPass);

    const updatedProfile: UserProfile = {
      ...current,
      id: u.id,
      hasPassword: true,
    };
    await safeStorage.setItem('med_user_profile', JSON.stringify(updatedProfile));

    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([
        {
          time: timeStr,
          user_name: updatedProfile.name,
          activity: hasExistingPass ? 'เปลี่ยนรหัสผ่านบัญชี' : 'ตั้งรหัสผ่านบัญชี',
          details: `ผู้ใช้งาน ${updatedProfile.name} (${updatedProfile.email}) กำหนดรหัสผ่านสำหรับการเข้าสู่ระบบแบบธรรมดาสำเร็จ`,
        },
      ]);
    } catch {}

    return updatedProfile;
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = (await this.getUserProfile()) || {
      id: `user-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
    };

    const updated = { ...current, ...profile };
    await safeStorage.setItem('med_user_profile', JSON.stringify(updated));

    const userKey = toUserStorageKey(updated.email);
    if (userKey) {
      await safeStorage.setItem(
        `med_user_prefs_${userKey}`,
        JSON.stringify({
          avatarUrl: updated.avatarUrl || undefined,
          notify30MinBefore: updated.notify30MinBefore,
          notifyFoodWarning: updated.notifyFoodWarning,
          notifyAppointments: updated.notifyAppointments,
          notifyLowStock: updated.notifyLowStock,
        })
      );
    }

    if (supabase && updated.email) {
      try {
        const cleanEmail = updated.email.trim().toLowerCase();

        // Update existing user in Supabase app_users
        const updatePayload: any = {
          status: 'Active',
        };
        if (updated.name) updatePayload.name = updated.name;
        if (updated.phone !== undefined) updatePayload.phone = updated.phone;

        let updateQuery = supabase.from('app_users').update(updatePayload);
        if (updated.id && isValidUUID(updated.id)) {
          updateQuery = updateQuery.eq('id', updated.id);
        } else {
          updateQuery = updateQuery.ilike('email', cleanEmail);
        }
        const { data: updatedData, error: updateErr } = await updateQuery.select();

        if (!updateErr && updatedData?.[0]) {
          updated.id = updatedData[0].id;
          updated.name = updatedData[0].name;
          updated.phone = updatedData[0].phone || updated.phone || '';
          await safeStorage.setItem('med_user_profile', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Failed to update profile in Supabase app_users:', e);
      }
    }
    return updated;
  },

  async logoutUser(): Promise<void> {
    try {
      await safeStorage.removeItem('med_user_profile');
      await safeStorage.removeItem('med_is_authenticated');
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {
      console.warn('Error clearing med_user_profile on logout:', e);
    }
  },

  // --------------------------------------------------------------------------
  // 1. Admin Master Drug Catalog (medications table in Supabase)
  // --------------------------------------------------------------------------
  async getMasterMedications(): Promise<Medication[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('medications')
          .select('*')
          .order('name_th', { ascending: true });

        if (!error && data) {
          return data.map((m: any) => ({
            id: m.id,
            code: m.code,
            name: m.name_th || m.name_en || '',
            type: (m.type as any) || 'เม็ด',
            category: (m.category as any) || 'ยา',
            dosage: m.dosage || '100',
            unit: m.unit || 'mg',
            frequency: 1,
            remaining: 30,
            status: 'active',
            instructions: m.instructions || '',
            precautions: m.precautions || '',
            imageUrl: m.image_url,
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase fetch error for master medications:', e);
    }
    return [];
  },

  // --------------------------------------------------------------------------
  // 2. User's "My Medications" (ยาของฉัน - แยกตามบัญชีผู้ใช้แต่ละคน และซิงก์กับฐานข้อมูลของผู้ใช้นั้น)
  // --------------------------------------------------------------------------
  async getMedications(): Promise<Medication[]> {
    await this.purgeMockCacheIfNeeded();
    try {
      const { userKey, userUUID } = await this.getCurrentUserScope();
      if (!userKey) {
        return [];
      }
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;

      let deletedNames: string[] = [];
      try {
        const delRaw = await safeStorage.getItem(deletedKey);
        if (delRaw) {
          const parsedDel = JSON.parse(delRaw);
          if (Array.isArray(parsedDel)) {
            deletedNames = parsedDel;
          }
        }
      } catch {}
      const deletedSet = new Set(deletedNames.map(n => normalizeMedName(n)).filter(Boolean));

      let localMeds: Medication[] = [];
      const stored = await safeStorage.getItem(listKey);
      let hadStoredList = false;
      if (stored !== null) {
        hadStoredList = true;
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localMeds = parsed;
          }
        } catch {}
      }

      // Deduplicate localMeds and filter out explicitly deleted medications
      const seen = new Map<string, Medication>();
      let removedOrRevertedLocal = false;
      for (const item of localMeds) {
        const key = normalizeMedName(item.name);
        if (!key) continue;
        if (deletedSet.has(key)) {
          removedOrRevertedLocal = true;
          continue;
        }
        let cleanedItem = item;
        // Revert any medication that was previously converted with synthetic expiryDate '31/12/2570' back to 'ทุกวัน'
        if (item.expiryDate === '31/12/2570') {
          cleanedItem = {
            ...item,
            expiryDate: '',
            durationMode: 'ทุกวัน',
            customDays: undefined,
            instructions: 'ทุกวัน',
          };
          removedOrRevertedLocal = true;
        }
        if (!seen.has(key)) {
          seen.set(key, cleanedItem);
        }
      }
      localMeds = Array.from(seen.values());
      if (removedOrRevertedLocal) {
        await safeStorage.setItem(listKey, JSON.stringify(localMeds));
      }

      // Check if any local medication is missing startDate
      const hasLegacyRestoredMeds = localMeds.some(m => !m.startDate);

      // Sync / restore user's medications from Supabase user_schedules ONLY on initial hydration (!hadStoredList)
      // or to fill in missing startDate on restored entries
      if (supabase && userUUID && (!hadStoredList || hasLegacyRestoredMeds)) {
        try {
          const { data: schedRows, error: schedErr } = await supabase
            .from('user_schedules')
            .select('*')
            .eq('user_id', userUUID)
            .order('created_at', { ascending: true });

          let masterListCache: Medication[] | null = null;
          const getMasterCached = async () => {
            if (!masterListCache) {
              masterListCache = await this.getMasterMedications().catch(() => []);
            }
            return masterListCache;
          };

          let updatedFromRemote = false;

          if (!schedErr && schedRows && schedRows.length > 0) {
            const grouped = new Map<string, any[]>();
            for (const row of schedRows) {
              const normName = normalizeMedName(row.medication_name);
              if (!normName || deletedSet.has(normName)) continue;
              if (!grouped.has(normName)) {
                grouped.set(normName, []);
              }
              grouped.get(normName)!.push(row);
            }

            // 1. Ensure any restored medication missing startDate has its local startDate set without overwriting durationMode
            if (hasLegacyRestoredMeds) {
              for (const [normName, med] of seen.entries()) {
                if (!med.startDate) {
                  const rows = grouped.get(normName) || [];
                  const validDates = Array.from(
                    new Set(
                      rows
                        .map((r: any) => String(r.date || '').trim())
                        .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d))
                    )
                  ).sort();

                  const earliestDateStr = validDates[0] || getLocalDateString();
                  const earliestLocal = parseLocalDateString(earliestDateStr);
                  const localStartIso = new Date(
                    earliestLocal.getFullYear(),
                    earliestLocal.getMonth(),
                    earliestLocal.getDate(),
                    0,
                    0,
                    0
                  ).toISOString();

                  seen.set(normName, {
                    ...med,
                    startDate: earliestDateStr,
                    createdAt: med.createdAt || localStartIso,
                  });
                  updatedFromRemote = true;
                }
              }
            }

            // 2. Initial hydration when no local list existed yet (!hadStoredList)
            if (!hadStoredList) {
              const masterList = await getMasterCached();
              for (const [normName, rows] of grouped.entries()) {
                if (seen.has(normName) || deletedSet.has(normName)) continue;

                const firstRow = rows[0];
                const latestRow = rows[rows.length - 1];
                const medName = latestRow.medication_name || firstRow.medication_name;
                const matchedMaster = masterList.find(
                  m =>
                    (latestRow.medication_id && m.id === latestRow.medication_id) ||
                    normalizeMedName(m.name) === normName
                );

                const timeSet = new Set<string>();
                const timeMealTimings: Record<string, 'ก่อนอาหาร' | 'หลังอาหาร'> = {};
                let primaryMealTiming: any = undefined;

                for (const r of rows) {
                  const cleanT = String(r.time || '')
                    .replace(' น.', '')
                    .trim();
                  if (/^\d{1,2}:\d{2}$/.test(cleanT)) {
                    const [hh, mm] = cleanT.split(':');
                    const normT = `${hh.padStart(2, '0')}:${mm}`;
                    timeSet.add(normT);
                    if (r.meal_timing === 'ก่อนอาหาร' || r.meal_timing === 'หลังอาหาร') {
                      timeMealTimings[normT] = r.meal_timing;
                    }
                    if (!primaryMealTiming && r.meal_timing) {
                      primaryMealTiming = r.meal_timing;
                    }
                  }
                }

                const times = Array.from(timeSet).sort((a, b) => a.localeCompare(b));
                const resolvedTimes = times.length > 0 ? times : ['08:00'];

                const validDates = Array.from(
                  new Set(
                    rows
                      .map((r: any) => String(r.date || '').trim())
                      .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d))
                  )
                ).sort();

                const earliestDateStr = validDates[0] || getLocalDateString();
                const earliestLocal = parseLocalDateString(earliestDateStr);
                const localStartIso = new Date(
                  earliestLocal.getFullYear(),
                  earliestLocal.getMonth(),
                  earliestLocal.getDate(),
                  0,
                  0,
                  0
                ).toISOString();

                const restoredMed: Medication = {
                  id:
                    latestRow.medication_id ||
                    matchedMaster?.id ||
                    `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  code: matchedMaster?.code,
                  name: medName,
                  type: (latestRow.type || matchedMaster?.type || 'เม็ด') as any,
                  category: (matchedMaster?.category || 'ยา') as any,
                  dosage: latestRow.dosage || matchedMaster?.dosage || '1',
                  unit: latestRow.unit || matchedMaster?.unit || 'เม็ด',
                  frequency: resolvedTimes.length,
                  remaining: 30,
                  startDate: earliestDateStr,
                  durationMode: 'ทุกวัน',
                  instructions: 'ทานทุกวัน',
                  precautions: matchedMaster?.precautions || '',
                  imageUrl: matchedMaster?.imageUrl,
                  status: 'active',
                  times: resolvedTimes,
                  mealTiming: primaryMealTiming || 'หลังอาหาร',
                  timeMealTimings:
                    Object.keys(timeMealTimings).length > 0 ? timeMealTimings : undefined,
                  createdAt: localStartIso,
                };

                seen.set(normName, restoredMed);
                updatedFromRemote = true;
              }
            }
          }

          // Clean up any medications that were previously recovered from activity_logs by matching user_name
          // when this specific user account (userUUID) actually has 0 rows in user_schedules
          const recoveredKey = `med_recovered_logs_v1_${userKey}`;
          const cleanedCollisionKey = `med_cleaned_log_collision_v1_${userKey}`;
          const wasRecoveredByName = await safeStorage.getItem(recoveredKey);
          const alreadyCleanedCollision = await safeStorage.getItem(cleanedCollisionKey);
          if (
            wasRecoveredByName &&
            !alreadyCleanedCollision &&
            !schedErr &&
            (!schedRows || schedRows.length === 0)
          ) {
            seen.clear();
            localMeds = [];
            await safeStorage.setItem(listKey, JSON.stringify([]));
            await safeStorage.setItem(cleanedCollisionKey, 'true');
          }

          if (updatedFromRemote) {
            localMeds = Array.from(seen.values());
            await safeStorage.setItem(listKey, JSON.stringify(localMeds));
          }
        } catch (syncErr) {
          console.warn('Error syncing user medications from Supabase user_schedules:', syncErr);
        }
      }

      return localMeds;
    } catch (e) {
      console.warn('Error fetching user medications from storage:', e);
    }
    return [];
  },

  getDefaultTimesForFrequency(freq: number): string[] {
    switch (freq) {
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
  },

  async clearCachedSchedulesAroundMonth(userKey: string, keepDateStr?: string): Promise<void> {
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const datesToClear = new Set<string>();
      // Previous month, current month, next month
      for (let monthOffset = -1; monthOffset <= 1; monthOffset++) {
        const targetM = m + monthOffset;
        const daysInM = new Date(y, targetM + 1, 0).getDate();
        for (let day = 1; day <= daysInM; day++) {
          const dStr = getLocalDateString(new Date(y, targetM, day));
          if (dStr !== keepDateStr) {
            datesToClear.add(dStr);
          }
        }
      }
      await Promise.all(
        Array.from(datesToClear).map(dStr =>
          safeStorage.removeItem(`med_schedule_${userKey}_${dStr}`).catch(() => {})
        )
      );
    } catch {}
  },

  async saveMedication(med: Medication): Promise<Medication> {
    if (!med.createdAt) {
      if (med.id && med.id.startsWith('med-')) {
        const ts = parseInt(med.id.replace('med-', ''), 10);
        if (!isNaN(ts) && ts > 1000000000) {
          med.createdAt = new Date(ts).toISOString();
        } else {
          med.createdAt = new Date().toISOString();
        }
      } else {
        med.createdAt = new Date().toISOString();
      }
    }
    try {
      const { userKey, userUUID } = await this.getCurrentUserScope();
      if (!userKey) {
        return med;
      }
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;

      // Remove this medication name from deleted list if user is adding/saving it
      const normNew = normalizeMedName(med.name);
      try {
        const delRaw = await safeStorage.getItem(deletedKey);
        if (delRaw) {
          const parsedDel: string[] = JSON.parse(delRaw);
          if (Array.isArray(parsedDel)) {
            const nextDel = parsedDel.filter(n => normalizeMedName(n) !== normNew);
            if (nextDel.length !== parsedDel.length) {
              await safeStorage.setItem(deletedKey, JSON.stringify(nextDel));
            }
          }
        }
      } catch {}

      // Determine effective times if active
      let effectiveTimes = med.times || [];
      if (med.status === 'active' && effectiveTimes.length === 0) {
        effectiveTimes = this.getDefaultTimesForFrequency(1);
        med.times = effectiveTimes;
      }

      // Normalize durationMode & customDays so switching between 'ทุกวัน' and 'กำหนดเอง' is clean
      const resolvedDurationMode =
        med.durationMode === 'กำหนดเอง'
          ? 'กำหนดเอง'
          : med.durationMode === 'ทุกวัน'
          ? 'ทุกวัน'
          : getMedicationDurationMode(med) || 'ทุกวัน';
      const resolvedCustomDays =
        resolvedDurationMode === 'กำหนดเอง'
          ? extractCustomDaysFromMedication(med)
          : undefined;
      med.durationMode = resolvedDurationMode;
      med.customDays = resolvedCustomDays;
      if (resolvedDurationMode === 'ทุกวัน') {
        med.instructions = 'ทุกวัน';
      }

      const current = await this.getMedications();
      let existingIdx = current.findIndex(m => m.id === med.id);
      if (existingIdx < 0 && normNew) {
        existingIdx = current.findIndex(m => normalizeMedName(m.name) === normNew);
      }
      const previousMed = existingIdx >= 0 ? current[existingIdx] : undefined;
      let updated: Medication[];

      if (existingIdx >= 0) {
        updated = [...current];
        const mergedMed: Medication = {
          ...current[existingIdx],
          ...med,
          id: current[existingIdx].id || med.id,
          remaining: med.remaining,
          lowStockThreshold: med.lowStockThreshold,
          expiryDate: med.expiryDate,
          durationMode: resolvedDurationMode,
          customDays: resolvedCustomDays,
          instructions: med.instructions,
          mealTiming: med.mealTiming,
          timeMealTimings: med.timeMealTimings,
          precautions: med.precautions,
          imageUrl: med.imageUrl,
        };
        med = mergedMed;
        updated[existingIdx] = mergedMed;
      } else {
        updated = [med, ...current];
      }

      await safeStorage.setItem(listKey, JSON.stringify(updated));

      // Manage today's schedule in local storage (scoped per user)
      const todayDate = new Date();
      const today = getLocalDateString(todayDate);
      const scheduleKey = `med_schedule_${userKey}_${today}`;

      let currentSchedule: ScheduleItem[] = [];
      const localStr = await safeStorage.getItem(scheduleKey);
      if (localStr) {
        try {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed)) {
            currentSchedule = parsed;
          }
        } catch {}
      }

      const previousEntriesForMed = currentSchedule.filter(
        s =>
          s.medicationId === med.id ||
          normalizeMedName(s.medicationName) === normNew ||
          (previousMed &&
            normalizeMedName(s.medicationName) === normalizeMedName(previousMed.name))
      );

      // Remove previous schedule entries for this medication on today
      currentSchedule = currentSchedule.filter(
        s =>
          s.medicationId !== med.id &&
          normalizeMedName(s.medicationName) !== normNew &&
          (!previousMed ||
            normalizeMedName(s.medicationName) !== normalizeMedName(previousMed.name))
      );

      // If scheduled for today, generate today's schedule entries using buildScheduleForDateSync
      const newScheduleItems = buildScheduleForDateSync(
        [med],
        todayDate,
        previousEntriesForMed
      );

      if (newScheduleItems.length > 0) {
        currentSchedule = [...currentSchedule, ...newScheduleItems].sort((a, b) =>
          a.time.replace(' น.', '').trim().localeCompare(b.time.replace(' น.', '').trim())
        );
      }

      // ALWAYS update local storage for today and invalidate cached schedules for other dates
      await safeStorage.setItem(scheduleKey, JSON.stringify(currentSchedule));
      await this.clearCachedSchedulesAroundMonth(userKey, today);

      // Sync to Supabase user_schedules (strictly scoped to this user's UUID)
      if (supabase && userUUID) {
        try {
          if (previousMed && previousMed.name !== med.name) {
            await supabase
              .from('user_schedules')
              .delete()
              .eq('user_id', userUUID)
              .eq('medication_name', previousMed.name);
          }
          // Delete any untaken schedule rows across all dates for this medication so old dates/times don't linger
          await supabase
            .from('user_schedules')
            .delete()
            .eq('user_id', userUUID)
            .eq('medication_name', med.name)
            .eq('is_taken', false);

          await supabase
            .from('user_schedules')
            .delete()
            .eq('user_id', userUUID)
            .eq('date', today)
            .eq('medication_name', med.name);

          const medUUID = isValidUUID(med.id) ? med.id : null;

          if (newScheduleItems.length > 0) {
            const supabaseRows = newScheduleItems.map(item => ({
              user_id: userUUID,
              medication_id: medUUID,
              medication_name: item.medicationName,
              dosage: item.dosage,
              unit: item.unit,
              type: item.type,
              meal_timing: item.mealTiming,
              time: item.time,
              date: item.date,
              is_taken: item.isTaken,
              taken_at: item.takenAt || null,
              is_skipped: Boolean(item.isSkipped),
            }));

            await supabase.from('user_schedules').insert(supabaseRows);
          }
        } catch (schErr) {
          console.warn('Failed to sync user_schedules to Supabase:', schErr);
        }
      }

      // Log Activity to Supabase
      await this.logActivity(
        `ผู้ใช้บันทึกยาใน "ยาของฉัน": ${med.name}`,
        `ขนาด ${med.dosage} ${med.unit} (${med.status === 'active' ? 'สร้างตารางยาแล้ว' : 'บันทึกเฉพาะข้อมูล'})`
      );
    } catch (e) {
      console.warn('Failed to save user medication:', e);
    }

    return med;
  },

  async deleteMedication(id: string): Promise<boolean> {
    try {
      const { userKey, userUUID } = await this.getCurrentUserScope();
      if (!userKey) return false;
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;

      const current = await this.getMedications();
      const medToDelete = current.find(
        m => m.id === id || normalizeMedName(m.name) === normalizeMedName(id)
      );
      const normDeleteName = medToDelete ? normalizeMedName(medToDelete.name) : '';

      if (normDeleteName) {
        try {
          let delList: string[] = [];
          const delRaw = await safeStorage.getItem(deletedKey);
          if (delRaw) {
            const parsedDel = JSON.parse(delRaw);
            if (Array.isArray(parsedDel)) delList = parsedDel;
          }
          if (!delList.some(n => normalizeMedName(n) === normDeleteName)) {
            delList.push(normDeleteName);
            await safeStorage.setItem(deletedKey, JSON.stringify(delList));
          }
        } catch {}
      }

      const updated = current.filter(
        m =>
          m.id !== id &&
          (!normDeleteName || normalizeMedName(m.name) !== normDeleteName)
      );
      await safeStorage.setItem(listKey, JSON.stringify(updated));

      // Remove from today's schedule & clear cached schedules for other dates
      const today = getLocalDateString();
      const scheduleKey = `med_schedule_${userKey}_${today}`;
      const localStr = await safeStorage.getItem(scheduleKey);
      if (localStr) {
        try {
          const parsed: ScheduleItem[] = JSON.parse(localStr);
          const filtered = parsed.filter(
            s =>
              s.medicationId !== id &&
              (!normDeleteName || normalizeMedName(s.medicationName) !== normDeleteName)
          );
          await safeStorage.setItem(scheduleKey, JSON.stringify(filtered));
        } catch {}
      }
      await this.clearCachedSchedulesAroundMonth(userKey, today);

      if (supabase && userUUID) {
        try {
          if (medToDelete?.name) {
            await supabase
              .from('user_schedules')
              .delete()
              .eq('user_id', userUUID)
              .eq('medication_name', medToDelete.name);
          }
          if (isValidUUID(id)) {
            await supabase
              .from('user_schedules')
              .delete()
              .eq('user_id', userUUID)
              .eq('medication_id', id);
          }
        } catch {}
      }

      await this.logActivity('ผู้ใช้ลบยาจาก "ยาของฉัน"', `รหัสยา ${id}`);
      return true;
    } catch (e) {
      console.warn('Failed to delete user medication:', e);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // Drug-Food Interactions (drug_food_interactions table)
  // --------------------------------------------------------------------------
  async getInteractions(medicationName?: string): Promise<DrugFoodInteraction[]> {
    try {
      if (supabase) {
        let query = supabase.from('drug_food_interactions').select('*').order('created_at', { ascending: false });
        if (medicationName && medicationName !== 'ทั้งหมด') {
          query = query.ilike('medication_name', `%${medicationName}%`);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            medicationName: d.medication_name,
            foodName: d.food_name,
            interactionType: d.interaction_type,
            severity: d.severity,
            hoursNote: d.hours_note,
            impactDetails: d.impact_details,
            sourceName: d.source_name,
            sourceType: d.source_type,
          }));
        }
      }
    } catch (e) {
      console.warn('Error fetching interactions from Supabase:', e);
    }

    return [];
  },

  // --------------------------------------------------------------------------
  // Schedules & History (Strictly Scoped Per User)
  // --------------------------------------------------------------------------
  async getScheduleForDate(dateStr?: string): Promise<ScheduleItem[]> {
    await this.purgeMockCacheIfNeeded();
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDateStr = dateStr || getLocalDateString();
    const targetDate = parseLocalDateString(targetDateStr);
    const key = `med_schedule_${userKey}_${targetDateStr}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;

    // 1. Read local storage for this user & date (freshest isTaken state on this device)
    let localItems: ScheduleItem[] = [];
    const local = await safeStorage.getItem(key);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          localItems = parsed.filter(item => !String(item.id).startsWith('mock-'));
        }
      } catch {}
    }

    // 1.1 Read persistent snooze map for this user
    let snoozeMap: Record<string, number> = {};
    try {
      const snoozeRaw = await safeStorage.getItem(snoozeKey);
      if (snoozeRaw) snoozeMap = JSON.parse(snoozeRaw);
    } catch {}

    // 2. Read Supabase user_schedules ONLY for this specific user (user_id === userUUID)
    let remoteItems: ScheduleItem[] = [];
    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('user_schedules')
          .select('*')
          .eq('user_id', userUUID)
          .eq('date', targetDateStr)
          .order('time', { ascending: true });

        if (!error && data && data.length > 0) {
          remoteItems = data.map((d: any) => ({
            id: d.id,
            medicationId: d.medication_id,
            medicationName: d.medication_name,
            dosage: d.dosage,
            unit: d.unit,
            type: d.type,
            mealTiming: d.meal_timing || '',
            time: d.time && d.time.includes('น.') ? d.time.trim() : `${(d.time || '').trim()} น.`,
            date: d.date,
            isChecked: Boolean(d.is_taken),
            isTaken: Boolean(d.is_taken),
            takenAt: d.taken_at || undefined,
            isSkipped: Boolean(d.is_skipped),
          }));
        }
      } catch (e) {
        console.warn('Error reading from Supabase user_schedules:', e);
      }
    }

    // Merge stored items: keep local items first, supplement with remote items
    const storedItems: ScheduleItem[] = [...localItems];
    for (const rItem of remoteItems) {
      const rTime = rItem.time.replace(' น.', '').trim();
      const existingIdx = storedItems.findIndex(
        lItem =>
          ((rItem.medicationId && lItem.medicationId === rItem.medicationId) ||
            lItem.medicationName === rItem.medicationName) &&
          (lItem.time.replace(' น.', '').trim() === rTime || lItem.originalTime === rTime)
      );
      if (existingIdx >= 0) {
        const cur = storedItems[existingIdx];
        const mergedTaken = Boolean(cur.isTaken || rItem.isTaken);
        storedItems[existingIdx] = {
          ...cur,
          id: isValidUUID(rItem.id) && !isValidUUID(cur.id) ? rItem.id : cur.id,
          isTaken: mergedTaken,
          isChecked: Boolean(cur.isChecked || mergedTaken),
          takenAt: cur.takenAt || rItem.takenAt,
        };
      } else {
        storedItems.push(rItem);
      }
    }

    // 3. Always reconcile with ALL user medications scheduled for targetDate
    try {
      const allMeds = await this.getMedications();
      const reconciled = buildScheduleForDateSync(allMeds, targetDate, storedItems, snoozeMap);
      await safeStorage.setItem(key, JSON.stringify(reconciled));
      return reconciled;
    } catch (e) {
      console.warn('Error syncing schedule with active medications:', e);
    }

    return storedItems;
  },

  async getTodaySchedule(): Promise<ScheduleItem[]> {
    return this.getScheduleForDate(getLocalDateString());
  },

  async toggleScheduleChecked(
    scheduleId: string,
    isChecked: boolean,
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    return new Promise<ScheduleItem[]>((resolve, reject) => {
      toggleCheckedQueue = toggleCheckedQueue.then(async () => {
        try {
          const { userKey } = await this.getCurrentUserScope();
          if (!userKey) {
            resolve([]);
            return;
          }
          const targetDate = dateStr || getLocalDateString();
          const key = `med_schedule_${userKey}_${targetDate}`;

          // อ่านจาก local storage ก่อนเพื่อความรวดเร็วและไม่ชนกับ network call
          let schedule: ScheduleItem[] = [];
          const local = await safeStorage.getItem(key);
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (Array.isArray(parsed) && parsed.length > 0) {
                schedule = parsed;
              }
            } catch {}
          }
          if (schedule.length === 0) {
            schedule = await this.getScheduleForDate(targetDate);
          }

          const targetItem = schedule.find(i => i.id === scheduleId);

          // ถ้ายืนยันการรับประทานยาแล้ว (isTaken === true) ล็อกไว้ ไม่ให้กดติ๊กออกได้
          if (!targetItem || targetItem.isTaken) {
            resolve(schedule);
            return;
          }

          const updated = schedule.map(item => {
            if (item.id === scheduleId) {
              if (isChecked) {
                // ติ๊กแล้ว แต่ยังไม่ได้กดปุ่มยืนยัน = รอยืนยัน (ยังไม่หักยา)
                return {
                  ...item,
                  isChecked: true,
                };
              }
              // ยกเลิกการติ๊ก (เฉพาะรายการที่ยังไม่ยืนยัน) = กลับเป็น ยังไม่ได้กินยา
              return {
                ...item,
                isChecked: false,
                isTaken: false,
                takenAt: undefined,
              };
            }
            return item;
          });

          await safeStorage.setItem(key, JSON.stringify(updated));
          resolve(updated);
        } catch (err) {
          reject(err);
        }
      });
    });
  },

  async confirmCheckedSchedules(
    scheduleIds: string[],
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    if (!scheduleIds || scheduleIds.length === 0) {
      return this.getScheduleForDate(targetDate);
    }

    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const listKey = `med_user_medications_list_${userKey}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const idSet = new Set(scheduleIds);

    const now = new Date();
    const timeNow = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} น.`;

    const newlyConfirmed: ScheduleItem[] = [];
    const updated = schedule.map(item => {
      if (idSet.has(item.id) && !item.isTaken) {
        const confirmedItem: ScheduleItem = {
          ...item,
          isChecked: true,
          isTaken: true,
          takenAt: timeNow,
        };
        newlyConfirmed.push(confirmedItem);
        return confirmedItem;
      }
      return item;
    });

    await safeStorage.setItem(key, JSON.stringify(updated));

    if (newlyConfirmed.length > 0) {
      try {
        const snoozeRaw = await safeStorage.getItem(snoozeKey);
        if (snoozeRaw) {
          const snoozeMap = JSON.parse(snoozeRaw);
          newlyConfirmed.forEach(item => {
            delete snoozeMap[item.id];
            if (item.medicationId) delete snoozeMap[`${item.medicationId}_${targetDate}`];
            if (item.medicationName) delete snoozeMap[`${item.medicationName}_${targetDate}`];
          });
          await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
        }
      } catch {}
    }

    // หักจำนวนยาคงเหลือเฉพาะรายการที่พึ่งกดยืนยันรับประทาน
    if (newlyConfirmed.length > 0) {
      try {
        const meds = await this.getMedications();
        const updatedMeds = [...meds];
        let medChanged = false;

        for (const confirmedItem of newlyConfirmed) {
          const medIdx = updatedMeds.findIndex(
            m => m.id === confirmedItem.medicationId || m.name === confirmedItem.medicationName
          );
          if (medIdx >= 0) {
            const med = updatedMeds[medIdx];
            if (med.remaining !== undefined && med.remaining !== null) {
              const doseAmount = Math.max(1, confirmedItem.doseCount || 1);
              updatedMeds[medIdx] = {
                ...med,
                remaining: Math.max(0, med.remaining - doseAmount),
              };
              medChanged = true;
            }
          }
        }

        if (medChanged) {
          await safeStorage.setItem(listKey, JSON.stringify(updatedMeds));
        }
      } catch (stockErr) {
        console.warn('Failed to deduct medication stock on confirm:', stockErr);
      }

      if (supabase && userUUID) {
        for (const confirmedItem of newlyConfirmed) {
          try {
            if (isValidUUID(confirmedItem.id)) {
              await supabase
                .from('user_schedules')
                .update({ is_taken: true, taken_at: timeNow })
                .eq('id', confirmedItem.id)
                .eq('user_id', userUUID);
            } else {
              const { data: existingRows } = await supabase
                .from('user_schedules')
                .select('id')
                .eq('user_id', userUUID)
                .eq('date', targetDate)
                .eq('medication_name', confirmedItem.medicationName)
                .eq('time', confirmedItem.time);

              if (existingRows && existingRows.length > 0) {
                await supabase
                  .from('user_schedules')
                  .update({ is_taken: true, taken_at: timeNow })
                  .eq('id', existingRows[0].id)
                  .eq('user_id', userUUID);
              } else {
                const medUUID = isValidUUID(confirmedItem.medicationId)
                  ? confirmedItem.medicationId
                  : null;
                await supabase.from('user_schedules').insert([
                  {
                    user_id: userUUID,
                    medication_id: medUUID,
                    medication_name: confirmedItem.medicationName,
                    dosage: confirmedItem.dosage,
                    unit: confirmedItem.unit,
                    type: confirmedItem.type,
                    meal_timing: confirmedItem.mealTiming,
                    time: confirmedItem.time,
                    date: targetDate,
                    is_taken: true,
                    taken_at: timeNow,
                    is_skipped: false,
                  },
                ]);
              }
            }
          } catch {}
        }
      }

      for (const confirmedItem of newlyConfirmed) {
        await this.logActivity(
          `รับประทานยา: ${confirmedItem.medicationName}`,
          `เวลา ${confirmedItem.time} (${confirmedItem.dosage} ${confirmedItem.unit})`
        );
      }
    }

    return updated;
  },

  async markScheduleTaken(
    scheduleId: string,
    isTaken: boolean,
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const listKey = `med_user_medications_list_${userKey}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);
    const wasTaken = Boolean(targetItem?.isTaken);

    const now = new Date();
    const timeNow = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} น.`;

    const updated = schedule.map(item => {
      if (item.id === scheduleId) {
        return {
          ...item,
          isChecked: isTaken,
          isTaken,
          isSkipped: isTaken ? false : item.isSkipped,
          postponedUntil: isTaken ? undefined : item.postponedUntil,
          takenAt: isTaken ? (wasTaken && item.takenAt ? item.takenAt : timeNow) : undefined,
        };
      }
      return item;
    });

    await safeStorage.setItem(key, JSON.stringify(updated));

    if (isTaken) {
      try {
        const snoozeRaw = await safeStorage.getItem(snoozeKey);
        if (snoozeRaw) {
          const snoozeMap = JSON.parse(snoozeRaw);
          delete snoozeMap[scheduleId];
          if (targetItem?.medicationId) delete snoozeMap[`${targetItem.medicationId}_${targetDate}`];
          if (targetItem?.medicationName) delete snoozeMap[`${targetItem.medicationName}_${targetDate}`];
          await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
        }
      } catch {}
    }

    // Real-time stock update for this medication if intake status changed
    if (targetItem && wasTaken !== isTaken) {
      try {
        const meds = await this.getMedications();
        const medIdx = meds.findIndex(
          m => m.id === targetItem.medicationId || m.name === targetItem.medicationName
        );
        if (medIdx >= 0) {
          const med = meds[medIdx];
          if (med.remaining !== undefined && med.remaining !== null) {
            const doseAmount = Math.max(1, targetItem.doseCount || 1);
            const nextRemaining = isTaken
              ? Math.max(0, med.remaining - doseAmount)
              : med.remaining + doseAmount;
            const updatedMeds = [...meds];
            updatedMeds[medIdx] = {
              ...med,
              remaining: nextRemaining,
            };
            await safeStorage.setItem(listKey, JSON.stringify(updatedMeds));
          }
        }
      } catch (stockErr) {
        console.warn('Failed to update medication stock in real-time:', stockErr);
      }
    }

    // Sync to Supabase user_schedules (strictly scoped to this user)
    if (supabase && userUUID) {
      try {
        if (isValidUUID(scheduleId)) {
          await supabase
            .from('user_schedules')
            .update({ is_taken: isTaken, taken_at: isTaken ? timeNow : null })
            .eq('id', scheduleId)
            .eq('user_id', userUUID);
        } else if (targetItem) {
          const { data: existingRows } = await supabase
            .from('user_schedules')
            .select('id')
            .eq('user_id', userUUID)
            .eq('date', targetDate)
            .eq('medication_name', targetItem.medicationName)
            .eq('time', targetItem.time);

          if (existingRows && existingRows.length > 0) {
            await supabase
              .from('user_schedules')
              .update({ is_taken: isTaken, taken_at: isTaken ? timeNow : null })
              .eq('id', existingRows[0].id)
              .eq('user_id', userUUID);
          } else if (isTaken) {
            const medUUID = isValidUUID(targetItem.medicationId) ? targetItem.medicationId : null;
            await supabase.from('user_schedules').insert([
              {
                user_id: userUUID,
                medication_id: medUUID,
                medication_name: targetItem.medicationName,
                dosage: targetItem.dosage,
                unit: targetItem.unit,
                type: targetItem.type,
                meal_timing: targetItem.mealTiming,
                time: targetItem.time,
                date: targetDate,
                is_taken: true,
                taken_at: timeNow,
                is_skipped: false,
              },
            ]);
          }
        }
      } catch {}
    }

    const item = updated.find(i => i.id === scheduleId);
    if (item && isTaken && !wasTaken) {
      await this.logActivity(
        `รับประทานยา: ${item.medicationName}`,
        `เวลา ${item.time} (${item.dosage} ${item.unit})`
      );
    }

    return updated;
  },

  async postponeSchedule(
    scheduleId: string,
    minutes: number = 30,
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);

    if (!targetItem || targetItem.isTaken) {
      return schedule;
    }

    const oldNorm = targetItem.time.replace(' น.', '').trim();
    const [hStr, mStr] = oldNorm.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const itemTotal = (!isNaN(h) ? h : 8) * 60 + (!isNaN(m) ? m : 0);

    const now = new Date();
    const currentTotal = now.getHours() * 60 + now.getMinutes();

    // คำนวณเวลาเลื่อนโดยนับจากเวลาปัจจุบันเป็นหลัก (หรือเวลาของยาเดิมหากยังมาไม่ถึง) เพื่อให้เวลาเป็นอนาคตเสมอ
    const baseTotal = Math.max(itemTotal, currentTotal);
    const nextTotal = (((baseTotal + minutes) % 1440) + 1440) % 1440;
    const nextH = String(Math.floor(nextTotal / 60)).padStart(2, '0');
    const nextM = String(nextTotal % 60).padStart(2, '0');
    const newTimeStr = `${nextH}:${nextM} น.`;

    // กำหนด timestamp ให้ระบบทราบว่ารายการนี้ถูก Snooze ไว้จนถึงเวลาใด
    const postponedUntil = Date.now() + minutes * 60 * 1000;

    try {
      const snoozeRaw = await safeStorage.getItem(snoozeKey);
      const snoozeMap: Record<string, number> = snoozeRaw ? JSON.parse(snoozeRaw) : {};
      snoozeMap[scheduleId] = postponedUntil;
      if (targetItem.medicationId) {
        snoozeMap[`${targetItem.medicationId}_${targetDate}`] = postponedUntil;
      }
      snoozeMap[`${targetItem.medicationName}_${targetDate}`] = postponedUntil;
      await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
    } catch {}

    const updated = schedule
      .map(s =>
        s.id === scheduleId
          ? {
              ...s,
              originalTime: s.originalTime || oldNorm,
              postponedTime: newTimeStr,
              postponedUntil,
              time: newTimeStr,
            }
          : s
      )
      .sort((a, b) =>
        a.time.replace(' น.', '').trim().localeCompare(b.time.replace(' น.', '').trim())
      );

    await safeStorage.setItem(key, JSON.stringify(updated));

    if (supabase && userUUID && isValidUUID(scheduleId)) {
      try {
        await supabase
          .from('user_schedules')
          .update({ time: newTimeStr })
          .eq('id', scheduleId)
          .eq('user_id', userUUID);
      } catch {}
    }

    return updated;
  },

  async skipSchedule(scheduleId: string, dateStr?: string): Promise<ScheduleItem[]> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);

    if (!targetItem || targetItem.isTaken) {
      return schedule;
    }

    const updated = schedule.map(s =>
      s.id === scheduleId ? { ...s, isSkipped: true, isChecked: false, postponedUntil: undefined } : s
    );

    await safeStorage.setItem(key, JSON.stringify(updated));

    try {
      const snoozeRaw = await safeStorage.getItem(snoozeKey);
      if (snoozeRaw) {
        const snoozeMap = JSON.parse(snoozeRaw);
        delete snoozeMap[scheduleId];
        if (targetItem?.medicationId) delete snoozeMap[`${targetItem.medicationId}_${targetDate}`];
        if (targetItem?.medicationName) delete snoozeMap[`${targetItem.medicationName}_${targetDate}`];
        await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
      }
    } catch {}

    if (supabase && userUUID && isValidUUID(scheduleId)) {
      try {
        await supabase
          .from('user_schedules')
          .update({ is_skipped: true })
          .eq('id', scheduleId)
          .eq('user_id', userUUID);
      } catch {}
    }

    return updated;
  },

  // --------------------------------------------------------------------------
  // Doctor Appointments (appointments table - Strictly Scoped Per User)
  // --------------------------------------------------------------------------
  async getAppointments(): Promise<DoctorAppointment[]> {
    await this.purgeMockCacheIfNeeded();
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userUUID)
          .order('appointment_date', { ascending: true });

        if (!error && data) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            doctorName: d.doctor_name,
            department: d.department || '',
            hospital: d.hospital || '',
            date: d.appointment_date,
            time: d.appointment_time,
            details: d.details || '',
            status: d.status || 'confirmed',
          }));
          await safeStorage.setItem(storageKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch {}
    }

    const local = await safeStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => !['apt-1', 'apt-2', 'apt-3'].includes(a.id));
        }
      } catch {}
    }

    return [];
  },

  async addAppointment(appointment: Omit<DoctorAppointment, 'id'>): Promise<DoctorAppointment> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    const newApt: DoctorAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };

    if (!userKey) {
      return newApt;
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([
            {
              user_id: userUUID,
              doctor_name: appointment.doctorName,
              department: appointment.department,
              hospital: appointment.hospital,
              appointment_date: appointment.date,
              appointment_time: appointment.time,
              details: appointment.details,
              status: appointment.status,
            },
          ])
          .select();

        if (!error && data && data.length > 0) {
          newApt.id = data[0].id;
        }
      } catch {}
    }

    const appointments = await this.getAppointments();
    const exists = appointments.some(a => a.id === newApt.id);
    const updated = exists ? appointments : [newApt, ...appointments];
    await safeStorage.setItem(storageKey, JSON.stringify(updated));

    await this.logActivity(`เพิ่มนัดหมายแพทย์: ${appointment.doctorName}`, `${appointment.hospital} (${appointment.date} ${appointment.time})`);
    return newApt;
  },

  async updateAppointment(appointment: DoctorAppointment): Promise<DoctorAppointment> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return appointment;
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID && !appointment.id.startsWith('apt-')) {
      try {
        await supabase
          .from('appointments')
          .update({
            doctor_name: appointment.doctorName,
            department: appointment.department,
            hospital: appointment.hospital,
            appointment_date: appointment.date,
            appointment_time: appointment.time,
            details: appointment.details,
            status: appointment.status,
          })
          .eq('id', appointment.id)
          .eq('user_id', userUUID);
      } catch (e) {
        console.warn('Supabase update appointment error:', e);
      }
    }

    const appointments = await this.getAppointments();
    const updated = appointments.map(a => (a.id === appointment.id ? appointment : a));
    await safeStorage.setItem(storageKey, JSON.stringify(updated));

    await this.logActivity(`แก้ไขนัดหมายแพทย์: ${appointment.doctorName}`, `${appointment.hospital} (${appointment.date} ${appointment.time})`);
    return appointment;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return false;
    }
    const storageKey = `med_appointments_${userKey}`;

    if (supabase && userUUID) {
      try {
        await supabase
          .from('appointments')
          .delete()
          .eq('id', id)
          .eq('user_id', userUUID);
      } catch {}
    }
    const appointments = await this.getAppointments();
    const updated = appointments.filter(a => a.id !== id);
    await safeStorage.setItem(storageKey, JSON.stringify(updated));
    return true;
  },

  // --------------------------------------------------------------------------
  // Side Effect Logs (side_effects table - Strictly Scoped Per User)
  // --------------------------------------------------------------------------
  async getSideEffects(): Promise<SideEffectLog[]> {
    await this.purgeMockCacheIfNeeded();
    const { userKey, userUUID } = await this.getCurrentUserScope();
    if (!userKey) {
      return [];
    }
    const storageKey = `med_side_effects_${userKey}`;

    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('side_effects')
          .select('*')
          .eq('user_id', userUUID)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            date: d.log_date || '',
            time: d.log_time || '',
            medicationName: d.medication_name,
            symptoms: d.symptoms || [],
            severity: d.severity,
            details: d.details || '',
            createdAt: d.created_at,
          }));
          await safeStorage.setItem(storageKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch {}
    }

    const local = await safeStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }

    return [];
  },

  async addSideEffect(log: Omit<SideEffectLog, 'id' | 'createdAt'>): Promise<SideEffectLog> {
    const { userKey, userUUID } = await this.getCurrentUserScope();
    const newLog: SideEffectLog = {
      ...log,
      id: `se-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (!userKey) {
      return newLog;
    }
    const storageKey = `med_side_effects_${userKey}`;

    if (supabase && userUUID) {
      try {
        const { data, error } = await supabase
          .from('side_effects')
          .insert([
            {
              user_id: userUUID,
              medication_name: log.medicationName,
              symptoms: log.symptoms,
              severity: log.severity,
              log_date: log.date,
              log_time: log.time,
              details: log.details,
            },
          ])
          .select();

        if (!error && data && data.length > 0) {
          newLog.id = data[0].id;
        }
      } catch {}
    }

    const list = await this.getSideEffects();
    const exists = list.some(item => item.id === newLog.id);
    const updated = exists ? list : [newLog, ...list];
    await safeStorage.setItem(storageKey, JSON.stringify(updated));

    await this.logActivity(`บันทึกผลข้างเคียง: ${log.medicationName}`, `อาการ: ${log.symptoms.join(', ')} (ระดับ: ${log.severity})`);
    return newLog;
  },

  // --------------------------------------------------------------------------
  // Activity Logs to Supabase (Visible in AdminMed Dashboard)
  // --------------------------------------------------------------------------
  async logActivity(activity: string, details: string) {
    if (!supabase) return;
    try {
      const user = await this.getUserProfile();
      const timeStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} น.`;
      await supabase.from('activity_logs').insert({
        time: timeStr,
        user_name: user?.name || 'ผู้ใช้งาน MedApp',
        activity,
        details,
      });
    } catch (e) {
      console.warn('Failed to log activity to Supabase activity_logs:', e);
    }
  },
};
