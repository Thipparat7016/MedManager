import { safeStorage } from './storage';
import { supabase } from './supabase';
import { userService } from './userService';
import { activityService } from './activityService';
import { SideEffectLog } from '../utils/types';

export const sideEffectService = {
  async getSideEffects(): Promise<SideEffectLog[]> {
    await userService.purgeMockCacheIfNeeded();
    const { userKey, userUUID } = await userService.getCurrentUserScope();
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
    const { userKey, userUUID } = await userService.getCurrentUserScope();
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

    const list = await sideEffectService.getSideEffects();
    const exists = list.some(item => item.id === newLog.id);
    const updated = exists ? list : [newLog, ...list];
    await safeStorage.setItem(storageKey, JSON.stringify(updated));

    await activityService.logActivity(
      `บันทึกผลข้างเคียง: ${log.medicationName}`,
      `อาการ: ${log.symptoms.join(', ')} (ระดับ: ${log.severity})`
    );
    return newLog;
  },
};
