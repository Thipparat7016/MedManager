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
  if (med.durationMode) return med.durationMode;
  if (med.instructions) {
    if (med.instructions.startsWith('วันที่ ') || med.instructions === 'กำหนดวันเอง') {
      return 'กำหนดเอง';
    }
    if (med.instructions === 'ทุกวัน') {
      return 'ทุกวัน';
    }
  }
  return null;
}

export function extractCustomDaysFromMedication(med: Medication): number[] {
  if (med.customDays && Array.isArray(med.customDays) && med.customDays.length > 0) {
    return med.customDays;
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

  // 1. ISO or YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }

  // 2. Thai text like '2 พฤศจิกายน 2569' or '2 พ.ย. 2569'
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

  // 3. DD/MM/YYYY or DD-MM-YYYY (or BE year)
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

export function getMedicationStartDate(med: Medication): Date | null {
  if (med.startDate) {
    const parsed = parseFlexibleDate(med.startDate);
    if (parsed) return parsed;
  }
  if (med.createdAt) {
    const parsed = parseFlexibleDate(med.createdAt);
    if (parsed) return parsed;
  }
  if (med.id && med.id.startsWith('med-')) {
    const ts = parseInt(med.id.replace('med-', ''), 10);
    if (!isNaN(ts) && ts > 1000000000) {
      const d = new Date(ts);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }
  return null;
}

export function getMedicationEndDate(med: Medication): Date | null {
  if (med.endDate) {
    const parsed = parseFlexibleDate(med.endDate);
    if (parsed) return parsed;
  }
  return null;
}

export function isMedicationScheduledForDate(med: Medication, targetDate: Date): boolean {
  if (med.status !== 'active') return false;

  const targetDateStr = getLocalDateString(targetDate);

  // Check start date boundary: Cannot be scheduled before medication starts
  const startDate = getMedicationStartDate(med);
  if (startDate) {
    const startDateStr = getLocalDateString(startDate);
    if (targetDateStr < startDateStr) {
      return false;
    }
  }

  // Check end date boundary: Cannot be scheduled after medication ends
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

    if (med.instructions && med.instructions.includes('ในเดือน')) {
      for (const [mName, mIdx] of Object.entries(THAI_MONTH_NAMES_MAP)) {
        if (mName.length > 3 && med.instructions.includes(mName)) {
          if (targetDate.getMonth() !== mIdx) {
            return false;
          }
          break;
        }
      }
    }
    return true;
  }

  return true;
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

      // Ensure authenticated flag is synced
      await safeStorage.setItem('med_is_authenticated', 'true');

      // 2. Refresh profile details silently from Supabase if online
      if (supabase && parsed.email) {
        try {
          const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('email', parsed.email.trim().toLowerCase())
            .limit(1);

          if (!error && data && data.length > 0) {
            const u = data[0];
            parsed.id = u.id;
            parsed.name = u.name;
            parsed.phone = u.phone || '';
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
      .eq('email', cleanEmail)
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
    if (u.password !== undefined && u.password !== null && u.password !== '') {
      if (u.password !== cleanPass) {
        throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
      }
    } else {
      // 2. Fallback check local credential cache
      const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
      if (cachedPass) {
        if (cachedPass !== cleanPass) {
          throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        }
      } else {
        // Account exists in DB but had no password set yet (e.g. initial user)
        // Store password for this user both in DB (if column exists) and local cache
        await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanPass);
        try {
          await supabase.from('app_users').update({ password: cleanPass }).eq('id', u.id);
        } catch (ignoreErr) {}
      }
    }

    const profile: UserProfile = {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
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
      .eq('email', cleanEmail)
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

    if (supabase && updated.email) {
      try {
        const cleanEmail = updated.email.trim().toLowerCase();

        // Update existing user in Supabase app_users
        const updatePayload: any = {
          status: 'Active',
        };
        if (updated.name) updatePayload.name = updated.name;
        if (updated.phone !== undefined) updatePayload.phone = updated.phone;

        const { data: updatedData, error: updateErr } = await supabase
          .from('app_users')
          .update(updatePayload)
          .eq('email', cleanEmail)
          .select();

        if (!updateErr && updatedData?.[0]) {
          updated.id = updatedData[0].id;
          updated.name = updatedData[0].name;
          updated.phone = updatedData[0].phone;
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
  // 2. User's "My Medications" (ยาของฉัน - ผู้ใช้เพิ่มเอง)
  // --------------------------------------------------------------------------
  async getMedications(): Promise<Medication[]> {
    try {
      const stored = await safeStorage.getItem('med_user_medications_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Deduplicate if there are any historical duplicates with identical normalized names
          const seen = new Map<string, Medication>();
          for (const item of parsed) {
            const key = normalizeMedName(item.name);
            if (!key) continue;
            if (!seen.has(key)) {
              seen.set(key, item);
            }
          }
          if (seen.size < parsed.length) {
            const deduplicated = Array.from(seen.values());
            await safeStorage.setItem('med_user_medications_list', JSON.stringify(deduplicated));
            return deduplicated;
          }
          return parsed;
        }
      }
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
      // Determine effective times if active
      let effectiveTimes = med.times || [];
      if (med.status === 'active' && effectiveTimes.length === 0) {
        effectiveTimes = this.getDefaultTimesForFrequency(1);
        med.times = effectiveTimes;
      }

      const current = await this.getMedications();
      const existingIdx = current.findIndex(m => m.id === med.id);
      const previousMed = existingIdx >= 0 ? current[existingIdx] : undefined;
      let updated: Medication[];

      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = {
          ...current[existingIdx],
          ...med,
          remaining: med.remaining,
          lowStockThreshold: med.lowStockThreshold,
          expiryDate: med.expiryDate,
          durationMode: med.durationMode,
          customDays: med.customDays,
          mealTiming: med.mealTiming,
          timeMealTimings: med.timeMealTimings,
          precautions: med.precautions,
          imageUrl: med.imageUrl,
        };
      } else {
        const normNew = normalizeMedName(med.name);
        const dupIdx = current.findIndex(m => normalizeMedName(m.name) === normNew);
        if (dupIdx >= 0) {
          throw new Error(
            `คุณมียา "${med.name}" ในรายการยาแล้ว หากต้องการแก้ไขข้อมูลหรือเพิ่มจำนวนยา กรุณาไปทำที่ปุ่มแก้ไข`
          );
        }
        updated = [med, ...current];
      }

      await safeStorage.setItem('med_user_medications_list', JSON.stringify(updated));

      // Manage today's schedule in local storage
      const todayDate = new Date();
      const today = getLocalDateString(todayDate);
      const scheduleKey = `med_schedule_${today}`;

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
          s.medicationName === med.name ||
          (previousMed && s.medicationName === previousMed.name)
      );

      // Remove previous schedule entries for this medication on today
      currentSchedule = currentSchedule.filter(
        s =>
          s.medicationId !== med.id &&
          s.medicationName !== med.name &&
          (!previousMed || s.medicationName !== previousMed.name)
      );

      // If scheduled for today, generate today's schedule entries (preserving isTaken for unchanged times)
      const shouldScheduleToday = isMedicationScheduledForDate(med, todayDate);
      let newScheduleItems: ScheduleItem[] = [];
      if (shouldScheduleToday && effectiveTimes.length > 0) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // If medication was created today, omit times before current time for today (start from now)
        const timesForToday = effectiveTimes.filter(t => {
          const normT = t.replace(' น.', '').trim();
          const [h, m] = normT.split(':').map(v => parseInt(v, 10));
          const timeMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
          const wasTaken = previousEntriesForMed.some(
            p => (p.originalTime || p.time.replace(' น.', '').trim()) === normT && (p.isTaken || p.isChecked)
          );
          return wasTaken || timeMinutes >= currentMinutes;
        });

        const usedPrevIds = new Set<string>();
        newScheduleItems = timesForToday.map((t, idx) => {
          const normT = t.replace(' น.', '').trim();
          const formattedTime = `${normT} น.`;
          const matchedPrev = previousEntriesForMed.find(
            p =>
              !usedPrevIds.has(p.id) &&
              (p.originalTime || p.time.replace(' น.', '').trim()) === normT
          );
          if (matchedPrev) {
            usedPrevIds.add(matchedPrev.id);
          }
          return {
            id: matchedPrev?.id || `sch-${today}-${med.id}-${idx}`,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            unit: med.unit,
            type: med.type,
            doseCount: 1,
            mealTiming: med.timeMealTimings?.[normT] || med.mealTiming || '',
            originalTime: normT,
            time: formattedTime,
            date: today,
            isChecked: matchedPrev ? Boolean(matchedPrev.isChecked || matchedPrev.isTaken) : false,
            isTaken: matchedPrev ? Boolean(matchedPrev.isTaken) : false,
            takenAt: matchedPrev?.takenAt,
            isSkipped: matchedPrev ? Boolean(matchedPrev.isSkipped) : false,
          };
        });

        currentSchedule = [...currentSchedule, ...newScheduleItems].sort((a, b) =>
          a.time.replace(' น.', '').trim().localeCompare(b.time.replace(' น.', '').trim())
        );
      }

      // ALWAYS update local storage for today
      await safeStorage.setItem(scheduleKey, JSON.stringify(currentSchedule));

      // Sync to Supabase user_schedules
      if (supabase) {
        try {
          if (previousMed && previousMed.name !== med.name) {
            await supabase
              .from('user_schedules')
              .delete()
              .eq('date', today)
              .eq('medication_name', previousMed.name);
          }
          await supabase
            .from('user_schedules')
            .delete()
            .eq('date', today)
            .eq('medication_name', med.name);

          if (shouldScheduleToday && newScheduleItems.length > 0) {
            const user = await this.getUserProfile();
            const userUUID = user?.id && isValidUUID(user.id) ? user.id : null;
            const medUUID = isValidUUID(med.id) ? med.id : null;

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
          console.warn('Failed to insert user_schedules to Supabase:', schErr);
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
      const current = await this.getMedications();
      const medToDelete = current.find(m => m.id === id);
      const updated = current.filter(m => m.id !== id);
      await safeStorage.setItem('med_user_medications_list', JSON.stringify(updated));

      // Remove from today's schedule
      const today = getLocalDateString();
      const scheduleKey = `med_schedule_${today}`;
      const localStr = await safeStorage.getItem(scheduleKey);
      if (localStr) {
        try {
          const parsed: ScheduleItem[] = JSON.parse(localStr);
          const filtered = parsed.filter(
            s => s.medicationId !== id && (!medToDelete || s.medicationName !== medToDelete.name)
          );
          await safeStorage.setItem(scheduleKey, JSON.stringify(filtered));
        } catch {}
      }

      if (supabase && medToDelete) {
        try {
          await supabase.from('user_schedules').delete().eq('medication_name', medToDelete.name);
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
  // Schedules & History
  // --------------------------------------------------------------------------
  async getScheduleForDate(dateStr?: string): Promise<ScheduleItem[]> {
    await this.purgeMockCacheIfNeeded();
    const targetDateStr = dateStr || getLocalDateString();
    const targetDate = parseLocalDateString(targetDateStr);
    const key = `med_schedule_${targetDateStr}`;

    // 1. Read local storage for this date (freshest isTaken state on this device)
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

    // 2. Read Supabase user_schedules for this date (to pick up remote UUIDs / records)
    let remoteItems: ScheduleItem[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_schedules')
          .select('*')
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
      const scheduledMeds = allMeds.filter(m => isMedicationScheduledForDate(m, targetDate));

      if (scheduledMeds.length === 0) {
        if (localItems.length > 0) {
          await safeStorage.setItem(key, JSON.stringify([]));
        }
        return [];
      }

      const reconciled: ScheduleItem[] = [];
      const consumedIndices = new Set<number>();

      for (const med of scheduledMeds) {
        let createdDate: Date | null = null;
        if (med.createdAt) {
          createdDate = new Date(med.createdAt);
        } else if (med.id && med.id.startsWith('med-')) {
          const ts = parseInt(med.id.replace('med-', ''), 10);
          if (!isNaN(ts) && ts > 1000000000) {
            createdDate = new Date(ts);
          }
        }
        if (!createdDate) {
          createdDate = getMedicationStartDate(med);
        }

        let isCreationDay = false;
        let createdMinutes = 0;
        if (createdDate && !isNaN(createdDate.getTime())) {
          const createdDateStr = getLocalDateString(createdDate);
          if (targetDateStr < createdDateStr) {
            // Target date is before medication was created! Skip!
            continue;
          }
          if (targetDateStr === createdDateStr) {
            isCreationDay = true;
            createdMinutes = createdDate.getHours() * 60 + createdDate.getMinutes();
          }
        }

        const times =
          med.times && med.times.length > 0
            ? med.times
            : this.getDefaultTimesForFrequency(1);

        times.forEach((rawTime, idx) => {
          const normTime = rawTime.replace(' น.', '').trim();
          const displayTime = `${normTime} น.`;
          const syntheticId = `sch-${targetDateStr}-${med.id}-${idx}`;

          const matchIdx = storedItems.findIndex(
            (s, sIdx) =>
              !consumedIndices.has(sIdx) &&
              (s.medicationId === med.id || s.medicationName === med.name) &&
              ((s.originalTime || s.time.replace(' น.', '').trim()) === normTime ||
                s.id === syntheticId)
          );

          const matched = matchIdx >= 0 ? storedItems[matchIdx] : undefined;
          if (matchIdx >= 0) {
            consumedIndices.add(matchIdx);
          }

          // If medication was created on targetDateStr, omit times that had already passed before creation
          if (isCreationDay) {
            const [h, m] = normTime.split(':').map(val => parseInt(val, 10));
            const timeMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
            if (timeMinutes < createdMinutes && !matched?.isTaken && !matched?.isChecked) {
              return; // Skip past times on creation day
            }
          }

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
    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${targetDate}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);

    // ถ้ายืนยันการรับประทานยาแล้ว (isTaken === true) ล็อกไว้ ไม่ให้กดติ๊กออกได้
    if (!targetItem || targetItem.isTaken) {
      return schedule;
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
    return updated;
  },

  async confirmCheckedSchedules(
    scheduleIds: string[],
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    const targetDate = dateStr || getLocalDateString();
    if (!scheduleIds || scheduleIds.length === 0) {
      return this.getScheduleForDate(targetDate);
    }

    const key = `med_schedule_${targetDate}`;
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
          await safeStorage.setItem('med_user_medications_list', JSON.stringify(updatedMeds));
        }
      } catch (stockErr) {
        console.warn('Failed to deduct medication stock on confirm:', stockErr);
      }

      if (supabase) {
        for (const confirmedItem of newlyConfirmed) {
          try {
            if (isValidUUID(confirmedItem.id)) {
              await supabase
                .from('user_schedules')
                .update({ is_taken: true, taken_at: timeNow })
                .eq('id', confirmedItem.id);
            } else {
              const { data: existingRows } = await supabase
                .from('user_schedules')
                .select('id')
                .eq('date', targetDate)
                .eq('medication_name', confirmedItem.medicationName)
                .eq('time', confirmedItem.time);

              if (existingRows && existingRows.length > 0) {
                await supabase
                  .from('user_schedules')
                  .update({ is_taken: true, taken_at: timeNow })
                  .eq('id', existingRows[0].id);
              } else {
                const user = await this.getUserProfile();
                const userUUID = user?.id && isValidUUID(user.id) ? user.id : null;
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
    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${targetDate}`;
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
          takenAt: isTaken ? (wasTaken && item.takenAt ? item.takenAt : timeNow) : undefined,
        };
      }
      return item;
    });

    await safeStorage.setItem(key, JSON.stringify(updated));

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
            await safeStorage.setItem('med_user_medications_list', JSON.stringify(updatedMeds));
          }
        }
      } catch (stockErr) {
        console.warn('Failed to update medication stock in real-time:', stockErr);
      }
    }

    // Sync to Supabase user_schedules
    if (supabase) {
      try {
        if (isValidUUID(scheduleId)) {
          await supabase
            .from('user_schedules')
            .update({ is_taken: isTaken, taken_at: isTaken ? timeNow : null })
            .eq('id', scheduleId);
        } else if (targetItem) {
          const { data: existingRows } = await supabase
            .from('user_schedules')
            .select('id')
            .eq('date', targetDate)
            .eq('medication_name', targetItem.medicationName)
            .eq('time', targetItem.time);

          if (existingRows && existingRows.length > 0) {
            await supabase
              .from('user_schedules')
              .update({ is_taken: isTaken, taken_at: isTaken ? timeNow : null })
              .eq('id', existingRows[0].id);
          } else if (isTaken) {
            const user = await this.getUserProfile();
            const userUUID = user?.id && isValidUUID(user.id) ? user.id : null;
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
    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${targetDate}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);

    if (!targetItem || targetItem.isTaken) {
      return schedule;
    }

    const oldNorm = targetItem.time.replace(' น.', '').trim();
    const [hStr, mStr] = oldNorm.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const baseTotal = (!isNaN(h) ? h : 8) * 60 + (!isNaN(m) ? m : 0);
    const nextTotal = (((baseTotal + minutes) % 1440) + 1440) % 1440;
    const nextH = String(Math.floor(nextTotal / 60)).padStart(2, '0');
    const nextM = String(nextTotal % 60).padStart(2, '0');
    const newTimeStr = `${nextH}:${nextM} น.`;

    const updated = schedule
      .map(s =>
        s.id === scheduleId
          ? {
              ...s,
              originalTime: s.originalTime || oldNorm,
              postponedTime: newTimeStr,
              time: newTimeStr,
            }
          : s
      )
      .sort((a, b) =>
        a.time.replace(' น.', '').trim().localeCompare(b.time.replace(' น.', '').trim())
      );

    await safeStorage.setItem(key, JSON.stringify(updated));

    if (supabase && isValidUUID(scheduleId)) {
      try {
        await supabase.from('user_schedules').update({ time: newTimeStr }).eq('id', scheduleId);
      } catch {}
    }

    return updated;
  },

  async skipSchedule(scheduleId: string, dateStr?: string): Promise<ScheduleItem[]> {
    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${targetDate}`;
    const schedule = await this.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);

    if (!targetItem || targetItem.isTaken) {
      return schedule;
    }

    const updated = schedule.map(s =>
      s.id === scheduleId ? { ...s, isSkipped: true, isChecked: false } : s
    );

    await safeStorage.setItem(key, JSON.stringify(updated));

    if (supabase && isValidUUID(scheduleId)) {
      try {
        await supabase.from('user_schedules').update({ is_skipped: true }).eq('id', scheduleId);
      } catch {}
    }

    return updated;
  },

  // --------------------------------------------------------------------------
  // Doctor Appointments (appointments table)
  // --------------------------------------------------------------------------
  async getAppointments(): Promise<DoctorAppointment[]> {
    await this.purgeMockCacheIfNeeded();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            doctorName: d.doctor_name,
            department: d.department || '',
            hospital: d.hospital || '',
            date: d.appointment_date,
            time: d.appointment_time,
            details: d.details || '',
            status: d.status || 'confirmed',
          }));
        }
      } catch {}
    }

    const local = await safeStorage.getItem('med_appointments');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed.filter(a => !['apt-1', 'apt-2', 'apt-3'].includes(a.id));
      }
    }

    return [];
  },

  async addAppointment(appointment: Omit<DoctorAppointment, 'id'>): Promise<DoctorAppointment> {
    const newApt: DoctorAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([
            {
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
    const updated = [newApt, ...appointments];
    await safeStorage.setItem('med_appointments', JSON.stringify(updated));

    await this.logActivity(`เพิ่มนัดหมายแพทย์: ${appointment.doctorName}`, `${appointment.hospital} (${appointment.date} ${appointment.time})`);
    return newApt;
  },

  async updateAppointment(appointment: DoctorAppointment): Promise<DoctorAppointment> {
    if (supabase && !appointment.id.startsWith('apt-')) {
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
          .eq('id', appointment.id);
      } catch (e) {
        console.warn('Supabase update appointment error:', e);
      }
    }

    const appointments = await this.getAppointments();
    const updated = appointments.map(a => (a.id === appointment.id ? appointment : a));
    await safeStorage.setItem('med_appointments', JSON.stringify(updated));

    await this.logActivity(`แก้ไขนัดหมายแพทย์: ${appointment.doctorName}`, `${appointment.hospital} (${appointment.date} ${appointment.time})`);
    return appointment;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('appointments').delete().eq('id', id);
      } catch {}
    }
    const appointments = await this.getAppointments();
    const updated = appointments.filter(a => a.id !== id);
    await safeStorage.setItem('med_appointments', JSON.stringify(updated));
    return true;
  },

  // --------------------------------------------------------------------------
  // Side Effect Logs (side_effects table)
  // --------------------------------------------------------------------------
  async getSideEffects(): Promise<SideEffectLog[]> {
    await this.purgeMockCacheIfNeeded();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('side_effects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            date: d.log_date || '',
            time: d.log_time || '',
            medicationName: d.medication_name,
            symptoms: d.symptoms || [],
            severity: d.severity,
            details: d.details || '',
            createdAt: d.created_at,
          }));
        }
      } catch {}
    }

    const local = await safeStorage.getItem('med_side_effects');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed.filter(se => !se.id.startsWith('se-'));
      }
    }

    return [];
  },

  async addSideEffect(log: Omit<SideEffectLog, 'id' | 'createdAt'>): Promise<SideEffectLog> {
    const newLog: SideEffectLog = {
      ...log,
      id: `se-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('side_effects')
          .insert([
            {
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
    const updated = [newLog, ...list];
    await safeStorage.setItem('med_side_effects', JSON.stringify(updated));

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
