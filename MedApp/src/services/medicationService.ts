import { safeStorage } from './storage';
import { supabase } from './supabase';
import { userService } from './userService';
import { activityService } from './activityService';
import {
  syncService,
  incrementMedicationMutations,
  decrementMedicationMutations,
  hasActiveMedicationMutations,
} from './syncService';
import { Medication, ScheduleItem } from '../utils/types';
import { isValidUUID, normalizeMedName } from '../utils/formatUtils';
import { getLocalDateString, parseLocalDateString } from '../utils/dateUtils';
import {
  getMedicationDurationMode,
  extractCustomDaysFromMedication,
  buildScheduleForDateSync,
} from '../utils/scheduleUtils';

export const medicationService = {
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

  async getMedications(): Promise<Medication[]> {
    await userService.purgeMockCacheIfNeeded();
    try {
      const { userKey, userUUID } = await userService.getCurrentUserScope();
      if (!userKey) {
        return [];
      }
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;
      const deletedAtKey = `med_deleted_at_map_${userKey}`;
      const snoozeKey = `med_snooze_until_map_${userKey}`;

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

      let deletedAtMap: Record<string, number> = {};
      try {
        const delMapRaw = await safeStorage.getItem(deletedAtKey);
        if (delMapRaw) {
          const parsedMap = JSON.parse(delMapRaw);
          if (parsedMap && typeof parsedMap === 'object') {
            deletedAtMap = parsedMap;
          }
        }
      } catch {}
      for (const n of deletedNames) {
        const norm = normalizeMedName(n);
        if (norm && !deletedAtMap[norm]) {
          deletedAtMap[norm] = 1;
        }
      }

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

      const getMedTimestamp = (m: Medication): number => {
        const anyM = m as any;
        if (typeof anyM.updatedAt === 'number' && anyM.updatedAt > 0) {
          return anyM.updatedAt;
        }
        if (m.createdAt) {
          const parsed = new Date(m.createdAt).getTime();
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        if (m.id && m.id.startsWith('med-')) {
          const ts = parseInt(m.id.replace('med-', ''), 10);
          if (!isNaN(ts) && ts > 1000000000) return ts;
        }
        return 2;
      };

      const cleanSingleMed = (item: Medication): Medication => {
        if (item.expiryDate === '31/12/2570') {
          return {
            ...item,
            expiryDate: '',
            durationMode: 'ทุกวัน',
            customDays: undefined,
            instructions: 'ทุกวัน',
          };
        }
        return item;
      };

      // Deduplicate localMeds and filter out deleted items where deletedAt >= medTimestamp
      const seen = new Map<string, Medication>();
      let removedOrRevertedLocal = false;
      for (const rawItem of localMeds) {
        if (!rawItem || !rawItem.name) continue;
        const key = normalizeMedName(rawItem.name);
        if (!key) continue;
        const item = cleanSingleMed(rawItem);
        if (item !== rawItem) removedOrRevertedLocal = true;
        const medTs = getMedTimestamp(item);
        const delTs = deletedAtMap[key] || 0;
        if (delTs >= medTs) {
          removedOrRevertedLocal = true;
          continue;
        }
        const existing = seen.get(key);
        if (!existing || medTs > getMedTimestamp(existing)) {
          seen.set(key, item);
        }
      }
      localMeds = Array.from(seen.values());
      if (removedOrRevertedLocal) {
        await safeStorage.setItem(listKey, JSON.stringify(localMeds));
      }

      // If a saveMedication / deleteMedication is currently in progress on this device,
      // return localMeds immediately so in-flight mutations are never overwritten
      if (hasActiveMedicationMutations()) {
        return localMeds;
      }

      if (supabase && userKey) {
        try {
          const remoteSync = await syncService.fetchRemoteUserSync(userUUID, userKey);

          if (remoteSync) {
            const remotePayload = remoteSync.payload;
            const remoteDelMap: Record<string, number> = {
              ...(remotePayload.deletedAtMap || {}),
            };
            for (const n of remotePayload.deletedNames || []) {
              const norm = normalizeMedName(n);
              if (norm && !remoteDelMap[norm]) {
                remoteDelMap[norm] = 1;
              }
            }

            // Merge deletion timestamps (LWW-Element-Set CRDT)
            const mergedDelMap: Record<string, number> = { ...deletedAtMap };
            for (const [k, ts] of Object.entries(remoteDelMap)) {
              const norm = normalizeMedName(k);
              if (!norm) continue;
              mergedDelMap[norm] = Math.max(mergedDelMap[norm] || 0, Number(ts) || 0);
            }

            // Merge medications from BOTH localMeds and remotePayload.medications
            const mergedMedMap = new Map<string, Medication>();
            for (const rawItem of [...remotePayload.medications, ...localMeds]) {
              if (!rawItem || !rawItem.name) continue;
              const key = normalizeMedName(rawItem.name);
              if (!key) continue;
              const item = cleanSingleMed(rawItem);
              const medTs = getMedTimestamp(item);
              const delTs = mergedDelMap[key] || 0;
              if (delTs >= medTs) {
                continue;
              }
              // If this medication is newer than any prior deletion, clear its old deletion entry
              if (mergedDelMap[key]) {
                delete mergedDelMap[key];
              }
              const existing = mergedMedMap.get(key);
              if (!existing || medTs >= getMedTimestamp(existing)) {
                mergedMedMap.set(key, item);
              }
            }

            const nextMeds = Array.from(mergedMedMap.values());
            const nextDeletedNames = Object.keys(mergedDelMap);
            const prevLocalStr = JSON.stringify(localMeds);
            const nextLocalStr = JSON.stringify(nextMeds);
            const remoteStr = JSON.stringify(
              (remotePayload.medications || []).map(cleanSingleMed)
            );

            localMeds = nextMeds;
            deletedNames = nextDeletedNames;
            deletedAtMap = mergedDelMap;

            await safeStorage.setItem(listKey, JSON.stringify(localMeds));
            await safeStorage.setItem(deletedKey, JSON.stringify(deletedNames));
            await safeStorage.setItem(deletedAtKey, JSON.stringify(deletedAtMap));

            if (remotePayload.snoozeMap) {
              await safeStorage.setItem(snoozeKey, JSON.stringify(remotePayload.snoozeMap));
            }

            if (remotePayload.scheduleOverrides) {
              const today = getLocalDateString();
              const remoteTodaySched = remotePayload.scheduleOverrides[today];
              if (Array.isArray(remoteTodaySched) && remoteTodaySched.length > 0) {
                await safeStorage.setItem(
                  `med_schedule_${userKey}_${today}`,
                  JSON.stringify(remoteTodaySched)
                );
              }
            }

            if (prevLocalStr !== nextLocalStr) {
              await syncService.clearCachedSchedulesAroundMonth(userKey, getLocalDateString());
            }

            // If local device had newer medications or deletions not yet in remotePayload, push merged state to cloud
            if (nextLocalStr !== remoteStr) {
              await syncService.pushRemoteUserSync(userUUID, userKey, {
                medications: localMeds,
                deletedNames,
                deletedAtMap,
              });
            }

            return localMeds;
          }

          // Fallback when no remote sync state exists yet in Supabase for this user:
          // Hydrate from user_schedules if needed and immediately initialize remote sync state
          const hasLegacyRestoredMeds = localMeds.some(m => !m.startDate);
          if ((!hadStoredList || hasLegacyRestoredMeds) && userUUID) {
            const { data: schedRows, error: schedErr } = await supabase
              .from('user_schedules')
              .select('*')
              .eq('user_id', userUUID)
              .order('created_at', { ascending: true });

            let masterListCache: Medication[] | null = null;
            const getMasterCached = async () => {
              if (!masterListCache) {
                masterListCache = await medicationService.getMasterMedications().catch(() => []);
              }
              return masterListCache;
            };

            let updatedFromRemote = false;

            if (!schedErr && schedRows && schedRows.length > 0) {
              const grouped = new Map<string, any[]>();
              for (const row of schedRows) {
                const normName = normalizeMedName(row.medication_name);
                if (!normName || deletedAtMap[normName]) continue;
                if (!grouped.has(normName)) {
                  grouped.set(normName, []);
                }
                grouped.get(normName)!.push(row);
              }

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

              if (!hadStoredList) {
                const masterList = await getMasterCached();
                for (const [normName, rows] of grouped.entries()) {
                  if (seen.has(normName) || deletedAtMap[normName]) continue;

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
                    instructions: 'ทุกวัน',
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

            if (updatedFromRemote) {
              localMeds = Array.from(seen.values());
              await safeStorage.setItem(listKey, JSON.stringify(localMeds));
            }
          }

          await syncService.pushRemoteUserSync(userUUID, userKey, {
            medications: localMeds,
            deletedNames,
            deletedAtMap,
          });
        } catch (syncErr) {
          console.warn('Error syncing user medications from Supabase:', syncErr);
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

  async saveMedication(med: Medication): Promise<Medication> {
    incrementMedicationMutations();
    const nowTs = Date.now();
    if (!med.createdAt) {
      med.createdAt = new Date(nowTs).toISOString();
    }
    (med as any).updatedAt = nowTs;

    try {
      const { userKey, userUUID } = await userService.getCurrentUserScope();
      if (!userKey) {
        return med;
      }
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;
      const deletedAtKey = `med_deleted_at_map_${userKey}`;

      // Remove this medication name from deleted list & deletedAtMap if user is adding/saving it
      const normNew = normalizeMedName(med.name);
      let nextDelList: string[] = [];
      let nextDelAtMap: Record<string, number> = {};
      try {
        const delRaw = await safeStorage.getItem(deletedKey);
        if (delRaw) {
          const parsedDel: string[] = JSON.parse(delRaw);
          if (Array.isArray(parsedDel)) {
            nextDelList = parsedDel.filter(n => normalizeMedName(n) !== normNew);
          }
        }
        await safeStorage.setItem(deletedKey, JSON.stringify(nextDelList));
      } catch {}
      try {
        const delMapRaw = await safeStorage.getItem(deletedAtKey);
        if (delMapRaw) {
          const parsedMap = JSON.parse(delMapRaw);
          if (parsedMap && typeof parsedMap === 'object') {
            nextDelAtMap = { ...parsedMap };
            delete nextDelAtMap[normNew];
          }
        }
        await safeStorage.setItem(deletedAtKey, JSON.stringify(nextDelAtMap));
      } catch {}

      // Determine effective times if active
      let effectiveTimes = med.times || [];
      if (med.status === 'active' && effectiveTimes.length === 0) {
        effectiveTimes = medicationService.getDefaultTimesForFrequency(1);
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

      // Read current list directly from local storage first so we never block or lose local state
      let current: Medication[] = [];
      try {
        const rawCurrent = await safeStorage.getItem(listKey);
        if (rawCurrent) {
          const parsedCurrent = JSON.parse(rawCurrent);
          if (Array.isArray(parsedCurrent)) {
            current = parsedCurrent;
          }
        }
      } catch {}

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
        (mergedMed as any).updatedAt = nowTs;
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
      await syncService.clearCachedSchedulesAroundMonth(userKey, today);

      // Push remote user sync state FIRST so other devices & any subsequent reads immediately see the new medication
      if (supabase && userKey) {
        await syncService.pushRemoteUserSync(userUUID, userKey, {
          medications: updated,
          deletedNames: nextDelList,
          deletedAtMap: nextDelAtMap,
          scheduleOverrides: { [today]: currentSchedule },
        });
      }

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
      await activityService.logActivity(
        `ผู้ใช้บันทึกยาใน "ยาของฉัน": ${med.name}`,
        `ขนาด ${med.dosage} ${med.unit} (${med.status === 'active' ? 'สร้างตารางยาแล้ว' : 'บันทึกเฉพาะข้อมูล'})`
      );
    } catch (e) {
      console.warn('Failed to save user medication:', e);
    } finally {
      decrementMedicationMutations();
    }

    return med;
  },

  async deleteMedication(id: string): Promise<boolean> {
    incrementMedicationMutations();
    const nowTs = Date.now();
    try {
      const { userKey, userUUID } = await userService.getCurrentUserScope();
      if (!userKey) return false;
      const listKey = `med_user_medications_list_${userKey}`;
      const deletedKey = `med_deleted_med_names_${userKey}`;
      const deletedAtKey = `med_deleted_at_map_${userKey}`;

      let current: Medication[] = [];
      try {
        const rawCurrent = await safeStorage.getItem(listKey);
        if (rawCurrent) {
          const parsedCurrent = JSON.parse(rawCurrent);
          if (Array.isArray(parsedCurrent)) {
            current = parsedCurrent;
          }
        }
      } catch {}

      const medToDelete = current.find(
        m => m.id === id || normalizeMedName(m.name) === normalizeMedName(id)
      );
      const normDeleteName = medToDelete ? normalizeMedName(medToDelete.name) : '';

      let delList: string[] = [];
      let delAtMap: Record<string, number> = {};
      try {
        const delRaw = await safeStorage.getItem(deletedKey);
        if (delRaw) {
          const parsedDel = JSON.parse(delRaw);
          if (Array.isArray(parsedDel)) delList = parsedDel;
        }
        if (normDeleteName && !delList.some(n => normalizeMedName(n) === normDeleteName)) {
          delList.push(normDeleteName);
          await safeStorage.setItem(deletedKey, JSON.stringify(delList));
        }
      } catch {}
      try {
        const delMapRaw = await safeStorage.getItem(deletedAtKey);
        if (delMapRaw) {
          const parsedMap = JSON.parse(delMapRaw);
          if (parsedMap && typeof parsedMap === 'object') delAtMap = parsedMap;
        }
        if (normDeleteName) {
          delAtMap[normDeleteName] = nowTs;
          await safeStorage.setItem(deletedAtKey, JSON.stringify(delAtMap));
        }
      } catch {}

      const updated = current.filter(
        m =>
          m.id !== id &&
          (!normDeleteName || normalizeMedName(m.name) !== normDeleteName)
      );
      await safeStorage.setItem(listKey, JSON.stringify(updated));

      // Remove from today's schedule & clear cached schedules for other dates
      const today = getLocalDateString();
      const scheduleKey = `med_schedule_${userKey}_${today}`;
      let filteredTodaySchedule: ScheduleItem[] = [];
      const localStr = await safeStorage.getItem(scheduleKey);
      if (localStr) {
        try {
          const parsed: ScheduleItem[] = JSON.parse(localStr);
          filteredTodaySchedule = parsed.filter(
            s =>
              s.medicationId !== id &&
              (!normDeleteName || normalizeMedName(s.medicationName) !== normDeleteName)
          );
          await safeStorage.setItem(scheduleKey, JSON.stringify(filteredTodaySchedule));
        } catch {}
      }
      await syncService.clearCachedSchedulesAroundMonth(userKey, today);

      if (supabase && userKey) {
        await syncService.pushRemoteUserSync(userUUID, userKey, {
          medications: updated,
          deletedNames: delList,
          deletedAtMap: delAtMap,
          scheduleOverrides: { [today]: filteredTodaySchedule },
        });
      }

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

      await activityService.logActivity('ผู้ใช้ลบยาจาก "ยาของฉัน"', `รหัสยา ${id}`);
      return true;
    } catch (e) {
      console.warn('Failed to delete user medication:', e);
    } finally {
      decrementMedicationMutations();
    }
    return true;
  },
};
