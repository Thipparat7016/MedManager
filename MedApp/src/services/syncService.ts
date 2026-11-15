import { safeStorage } from './storage';
import { supabase } from './supabase';
import { Medication, ScheduleItem } from '../utils/types';
import { getLocalDateString } from '../utils/dateUtils';

let toggleCheckedQueue: Promise<any> = Promise.resolve();
let activeMedicationMutations = 0;

export function enqueueToggleChecked<T>(task: () => Promise<T>): Promise<T> {
  const next = toggleCheckedQueue.then(task);
  toggleCheckedQueue = next.catch(() => {});
  return next;
}

export function incrementMedicationMutations(): void {
  activeMedicationMutations++;
}

export function decrementMedicationMutations(): void {
  activeMedicationMutations = Math.max(0, activeMedicationMutations - 1);
}

export function hasActiveMedicationMutations(): boolean {
  return activeMedicationMutations > 0;
}

export const syncService = {
  async fetchRemoteUserSync(
    userUUID: string | null,
    userKey?: string | null
  ): Promise<{
    rowId?: string;
    logRowId?: string;
    payload: {
      version: number;
      updatedAt: number;
      medications: Medication[];
      deletedNames: string[];
      deletedAtMap?: Record<string, number>;
      snoozeMap?: Record<string, number>;
      scheduleOverrides?: Record<string, ScheduleItem[]>;
    };
  } | null> {
    if (!supabase || (!userUUID && !userKey)) return null;
    try {
      const userNameKeys = Array.from(new Set([userKey, userUUID].filter(Boolean) as string[]));
      const [aptRes, logRes] = await Promise.all([
        userUUID
          ? supabase
              .from('appointments')
              .select('id, details, created_at')
              .eq('user_id', userUUID)
              .eq('doctor_name', '__MED_LIST_SYNC__')
              .order('created_at', { ascending: false })
              .then(
                res => res,
                () => ({ data: null, error: true })
              )
          : Promise.resolve({ data: null, error: true }),
        userNameKeys.length > 0
          ? supabase
              .from('activity_logs')
              .select('id, details, created_at')
              .in('user_name', userNameKeys)
              .eq('activity', 'เข้าสู่ระบบ:MED_SYNC')
              .order('created_at', { ascending: false })
              .then(
                res => res,
                () => ({ data: null, error: true })
              )
          : Promise.resolve({ data: null, error: true }),
      ]);

      let bestAptRow: any = null;
      let bestLogRow: any = null;
      let bestPayload: any = null;

      const aptData = !aptRes.error && Array.isArray(aptRes.data) ? aptRes.data : [];
      for (const row of aptData) {
        if (!row.details) continue;
        try {
          const parsed = JSON.parse(row.details);
          if (parsed && Array.isArray(parsed.medications)) {
            if (!bestAptRow) bestAptRow = row;
            if (!bestPayload || (parsed.updatedAt || 0) > (bestPayload.updatedAt || 0)) {
              bestPayload = parsed;
            }
          }
        } catch {}
      }

      const logData = !logRes.error && Array.isArray(logRes.data) ? logRes.data : [];
      for (const row of logData) {
        if (!row.details) continue;
        try {
          const parsed = JSON.parse(row.details);
          if (parsed && Array.isArray(parsed.medications)) {
            if (!bestLogRow) bestLogRow = row;
            if (!bestPayload || (parsed.updatedAt || 0) > (bestPayload.updatedAt || 0)) {
              bestPayload = parsed;
            }
          }
        } catch {}
      }

      // Clean up duplicate sync rows if more than one was created concurrently
      if (userUUID && aptData.length > 1 && bestAptRow) {
        const extraIds = aptData.filter((r: any) => r.id !== bestAptRow.id).map((r: any) => r.id);
        if (extraIds.length > 0) {
          try {
            await supabase
              .from('appointments')
              .delete()
              .in('id', extraIds)
              .eq('user_id', userUUID);
          } catch {}
        }
      }
      if (logData.length > 1 && bestLogRow) {
        const extraIds = logData.filter((r: any) => r.id !== bestLogRow.id).map((r: any) => r.id);
        if (extraIds.length > 0) {
          try {
            await supabase.from('activity_logs').delete().in('id', extraIds);
          } catch {}
        }
      }

      if (!bestPayload) return null;

      return {
        rowId: bestAptRow?.id,
        logRowId: bestLogRow?.id,
        payload: {
          version: bestPayload.version || 1,
          updatedAt: Number(bestPayload.updatedAt || 0),
          medications: Array.isArray(bestPayload.medications) ? bestPayload.medications : [],
          deletedNames: Array.isArray(bestPayload.deletedNames) ? bestPayload.deletedNames : [],
          deletedAtMap:
            bestPayload.deletedAtMap && typeof bestPayload.deletedAtMap === 'object'
              ? bestPayload.deletedAtMap
              : undefined,
          snoozeMap:
            bestPayload.snoozeMap && typeof bestPayload.snoozeMap === 'object'
              ? bestPayload.snoozeMap
              : undefined,
          scheduleOverrides:
            bestPayload.scheduleOverrides && typeof bestPayload.scheduleOverrides === 'object'
              ? bestPayload.scheduleOverrides
              : undefined,
        },
      };
    } catch (e) {
      console.warn('Error fetching remote user sync:', e);
      return null;
    }
  },

  async pushRemoteUserSync(
    userUUID: string | null,
    userKey: string | null,
    partial?: {
      medications?: Medication[];
      deletedNames?: string[];
      deletedAtMap?: Record<string, number>;
      snoozeMap?: Record<string, number>;
      scheduleOverrides?: Record<string, ScheduleItem[]>;
    }
  ): Promise<void> {
    if (!supabase || !userKey) return;
    try {
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;
      const deletedAtKey = `med_deleted_at_map_${userKey}`;
      const snoozeKey = `med_snooze_until_map_${userKey}`;
      const today = getLocalDateString();
      const todayScheduleKey = `med_schedule_${userKey}_${today}`;

      let medications = partial?.medications;
      if (!medications) {
        const rawMeds = await safeStorage.getItem(listKey);
        medications = rawMeds ? JSON.parse(rawMeds) : [];
      }

      let deletedNames = partial?.deletedNames;
      if (!deletedNames) {
        const rawDel = await safeStorage.getItem(deletedKey);
        deletedNames = rawDel ? JSON.parse(rawDel) : [];
      }

      let deletedAtMap = partial?.deletedAtMap;
      if (!deletedAtMap) {
        const rawDelMap = await safeStorage.getItem(deletedAtKey);
        deletedAtMap = rawDelMap ? JSON.parse(rawDelMap) : {};
      }

      let snoozeMap = partial?.snoozeMap;
      if (!snoozeMap) {
        const rawSnooze = await safeStorage.getItem(snoozeKey);
        snoozeMap = rawSnooze ? JSON.parse(rawSnooze) : {};
      }

      let scheduleOverrides = partial?.scheduleOverrides;
      if (!scheduleOverrides) {
        const rawTodaySched = await safeStorage.getItem(todayScheduleKey);
        scheduleOverrides = {
          [today]: rawTodaySched ? JSON.parse(rawTodaySched) : [],
        };
      }

      const nowTs = Date.now();
      const payload = {
        version: 2,
        updatedAt: nowTs,
        medications: medications || [],
        deletedNames: deletedNames || [],
        deletedAtMap: deletedAtMap || {},
        snoozeMap: snoozeMap || {},
        scheduleOverrides: scheduleOverrides || {},
      };

      await safeStorage.setItem(`med_last_sync_ts_${userKey}`, String(nowTs));
      await safeStorage.setItem(`med_cloud_sync_migrated_v1_${userKey}`, 'true');

      const existing = await syncService.fetchRemoteUserSync(userUUID, userKey);
      const serialized = JSON.stringify(payload);
      const timeMarker = String(nowTs).slice(-10);

      // Sync to activity_logs keyed by userKey (email) so all devices with the same email sync
      try {
        if (existing?.logRowId) {
          await supabase
            .from('activity_logs')
            .update({
              time: timeMarker,
              user_name: userKey,
              details: serialized,
            })
            .eq('id', existing.logRowId);
        } else {
          await supabase.from('activity_logs').insert([
            {
              time: timeMarker,
              user_name: userKey,
              activity: 'เข้าสู่ระบบ:MED_SYNC',
              details: serialized,
            },
          ]);
        }
      } catch {}

      // Also sync to appointments if userUUID is available
      if (userUUID) {
        try {
          if (existing?.rowId) {
            await supabase
              .from('appointments')
              .update({
                details: serialized,
                appointment_time: timeMarker,
                status: '__SYNC__',
              })
              .eq('id', existing.rowId)
              .eq('user_id', userUUID);
          } else {
            await supabase.from('appointments').insert([
              {
                user_id: userUUID,
                doctor_name: '__MED_LIST_SYNC__',
                department: '__SYNC__',
                hospital: '__SYNC__',
                appointment_date: '1970-01-01',
                appointment_time: timeMarker,
                status: '__SYNC__',
                details: serialized,
              },
            ]);
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Error pushing remote user sync:', e);
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
};
