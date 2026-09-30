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
  frequency: number; // times per day
  remaining: number;
  lowStockThreshold?: number;
  expiryDate?: string;
  instructions?: string;
  precautions?: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  times?: string[]; // e.g. ["08:00", "14:00", "20:00"]
  mealTiming?: 'ก่อนอาหาร' | 'หลังอาหาร' | 'พร้อมอาหาร' | 'ก่อนนอน';
}

export interface DrugFoodInteraction {
  id: string;
  medicationName: string;
  foodName: string;
  interactionType: 'หลีกเลี่ยง' | 'แนะนำ' | 'ข้อควรระวัง';
  severity: 'สูง' | 'กลาง' | 'ต่ำ';
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
  mealTiming: string;
  time: string; // "08:00 น."
  date: string; // "2026-07-12"
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
  type: 'med_reminder' | 'food_warning' | 'appointment' | 'med_taken' | 'low_stock';
  title: string;
  message: string;
  time: string;
  date: string;
  isActionable?: boolean;
  medicationName?: string;
  dosage?: string;
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
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error fetching user medications from storage:', e);
    }
    return [];
  },

  async saveMedication(med: Medication): Promise<Medication> {
    try {
      const current = await this.getMedications();
      const existingIdx = current.findIndex(m => m.id === med.id || (m.name === med.name && m.dosage === med.dosage));
      let updated: Medication[];

      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = { ...current[existingIdx], ...med };
      } else {
        updated = [med, ...current];
      }

      await safeStorage.setItem('med_user_medications_list', JSON.stringify(updated));

      // Create user_schedules for today if times are provided
      if (med.times && med.times.length > 0 && supabase) {
        const today = new Date().toISOString().split('T')[0];
        const user = await this.getUserProfile();
        const userUUID = user?.id && user.id.includes('-') && !user.id.startsWith('user-') ? user.id : null;

        const scheduleItems = med.times.map(t => ({
          user_id: userUUID,
          medication_id: med.id && med.id.includes('-') ? med.id : null,
          medication_name: med.name,
          dosage: med.dosage,
          unit: med.unit,
          type: med.type,
          meal_timing: med.mealTiming || 'หลังอาหาร',
          time: t.includes('น.') ? t : `${t} น.`,
          date: today,
          is_taken: false,
          is_skipped: false,
        }));

        try {
          await supabase
            .from('user_schedules')
            .delete()
            .eq('date', today)
            .eq('medication_name', med.name);

          await supabase.from('user_schedules').insert(scheduleItems);
        } catch (schErr) {
          console.warn('Failed to insert user_schedules to Supabase:', schErr);
        }
      }

      // Log Activity to Supabase
      await this.logActivity(`ผู้ใช้เพิ่มยาใน "ยาของฉัน": ${med.name}`, `ขนาด ${med.dosage} ${med.unit} (${med.category})`);
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
  async getTodaySchedule(): Promise<ScheduleItem[]> {
    await this.purgeMockCacheIfNeeded();
    const today = new Date().toISOString().split('T')[0];

    // Try Supabase user_schedules table
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_schedules')
          .select('*')
          .eq('date', today)
          .order('time', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            medicationId: d.medication_id,
            medicationName: d.medication_name,
            dosage: d.dosage,
            unit: d.unit,
            type: d.type,
            mealTiming: d.meal_timing,
            time: d.time,
            date: d.date,
            isTaken: d.is_taken,
            takenAt: d.taken_at,
            isSkipped: d.is_skipped,
          }));
        }
      } catch {}
    }

    // Try local storage for today
    const key = `med_schedule_${today}`;
    const local = await safeStorage.getItem(key);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // filter out old mock data
        const clean = parsed.filter(item => !item.id.startsWith('sch-'));
        return clean;
      }
    }

    return [];
  },

  async markScheduleTaken(scheduleId: string, isTaken: boolean): Promise<ScheduleItem[]> {
    const today = new Date().toISOString().split('T')[0];
    const key = `med_schedule_${today}`;
    const schedule = await this.getTodaySchedule();
    const timeNow = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} น.`;

    const updated = schedule.map(item => {
      if (item.id === scheduleId) {
        return {
          ...item,
          isTaken,
          takenAt: isTaken ? timeNow : undefined,
        };
      }
      return item;
    });

    await safeStorage.setItem(key, JSON.stringify(updated));

    // Sync to Supabase user_schedules if exists
    if (supabase) {
      try {
        await supabase
          .from('user_schedules')
          .update({ is_taken: isTaken, taken_at: isTaken ? timeNow : null })
          .eq('id', scheduleId);
      } catch {}
    }

    const item = updated.find(i => i.id === scheduleId);
    if (item && isTaken) {
      await this.logActivity(`รับประทานยา: ${item.medicationName}`, `เวลา ${item.time} (${item.dosage} ${item.unit})`);
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
        return parsed.filter(a => !a.id.startsWith('apt-'));
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
