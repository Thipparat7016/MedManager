import { safeStorage } from './storage';
import { supabase } from './supabase';
import { userService } from './userService';
import { medicationService } from './medicationService';
import { syncService, enqueueToggleChecked } from './syncService';
import { activityService } from './activityService';
import { Medication, ScheduleItem } from '../utils/types';
import { isValidUUID, normalizeMedName } from '../utils/formatUtils';
import { getLocalDateString, parseLocalDateString } from '../utils/dateUtils';
import { buildScheduleForDateSync } from '../utils/scheduleUtils';

export const scheduleService = {
  async getScheduleForDate(dateStr?: string): Promise<ScheduleItem[]> {
    await userService.purgeMockCacheIfNeeded();
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDateStr = dateStr || getLocalDateString();
    const targetDate = parseLocalDateString(targetDateStr);
    const key = `med_schedule_${userKey}_${targetDateStr}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;

    // 0. Read medications from local storage (remote sync is already handled by loadAllData / Realtime)
    const allMeds = await medicationService.getMedications({ skipRemoteSync: true }).catch(() => []);

    // 1. Read local storage for this user & date (now updated with remote overrides if any)
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
            time:
              d.time && d.time.includes('น.') ? d.time.trim() : `${(d.time || '').trim()} น.`,
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
            normalizeMedName(lItem.medicationName) === normalizeMedName(rItem.medicationName)) &&
          (lItem.time.replace(' น.', '').trim() === rTime ||
            lItem.originalTime === rTime ||
            (lItem.postponedTime && lItem.postponedTime.replace(' น.', '').trim() === rTime))
      );
      if (existingIdx >= 0) {
        const cur = storedItems[existingIdx];
        const mergedTaken = Boolean(cur.isTaken || rItem.isTaken);
        const mergedSkipped = mergedTaken ? false : Boolean(cur.isSkipped || rItem.isSkipped);
        storedItems[existingIdx] = {
          ...cur,
          id: isValidUUID(rItem.id) && !isValidUUID(cur.id) ? rItem.id : cur.id,
          isTaken: mergedTaken,
          isChecked: Boolean(cur.isChecked || mergedTaken),
          takenAt: cur.takenAt || rItem.takenAt,
          isSkipped: mergedSkipped,
        };
      } else {
        storedItems.push(rItem);
      }
    }

    // 3. Always reconcile with ALL user medications scheduled for targetDate
    try {
      const reconciled = buildScheduleForDateSync(allMeds, targetDate, storedItems, snoozeMap);
      await safeStorage.setItem(key, JSON.stringify(reconciled));

      if (supabase && userUUID && remoteItems.length > 0) {
        const reconciledIdSet = new Set(reconciled.map(item => item.id));
        const staleRemoteIds = remoteItems
          .filter(
            r => !r.isTaken && !r.isSkipped && isValidUUID(r.id) && !reconciledIdSet.has(r.id)
          )
          .map(r => r.id);
        if (staleRemoteIds.length > 0) {
          supabase
            .from('user_schedules')
            .delete()
            .in('id', staleRemoteIds)
            .eq('user_id', userUUID)
            .eq('is_taken', false)
            .then(
              () => {},
              () => {}
            );
        }
      }

      return reconciled;
    } catch (e) {
      console.warn('Error syncing schedule with active medications:', e);
    }

    return storedItems;
  },

  async getTodaySchedule(): Promise<ScheduleItem[]> {
    return scheduleService.getScheduleForDate(getLocalDateString());
  },

  async toggleScheduleChecked(
    scheduleId: string,
    isChecked: boolean,
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    return enqueueToggleChecked(async () => {
      const { userKey } = await userService.getCurrentUserScope();
      if (!userKey) {
        return [];
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
        schedule = await scheduleService.getScheduleForDate(targetDate);
      }

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
    });
  },

  async confirmCheckedSchedules(
    scheduleIds: string[],
    dateStr?: string
  ): Promise<ScheduleItem[]> {
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    if (!scheduleIds || scheduleIds.length === 0) {
      return scheduleService.getScheduleForDate(targetDate);
    }

    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const listKey = `med_user_medications_list_${userKey}`;
    const schedule = await scheduleService.getScheduleForDate(targetDate);
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

    let currentSnoozeMap: Record<string, number> | undefined = undefined;
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
          currentSnoozeMap = snoozeMap;
          await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
        }
      } catch {}
    }

    // หักจำนวนยาคงเหลือเฉพาะรายการที่พึ่งกดยืนยันรับประทาน
    let latestMeds: Medication[] | undefined = undefined;
    if (newlyConfirmed.length > 0) {
      try {
        const meds = await medicationService.getMedications();
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

        latestMeds = updatedMeds;
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

        await syncService.pushRemoteUserSync(userUUID, userKey, {
          medications: latestMeds,
          snoozeMap: currentSnoozeMap,
          scheduleOverrides: { [targetDate]: updated },
        });
      }

      for (const confirmedItem of newlyConfirmed) {
        await activityService.logActivity(
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
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const listKey = `med_user_medications_list_${userKey}`;
    const schedule = await scheduleService.getScheduleForDate(targetDate);
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

    let currentSnoozeMap: Record<string, number> | undefined = undefined;
    if (isTaken) {
      try {
        const snoozeRaw = await safeStorage.getItem(snoozeKey);
        if (snoozeRaw) {
          const snoozeMap = JSON.parse(snoozeRaw);
          delete snoozeMap[scheduleId];
          if (targetItem?.medicationId) {
            delete snoozeMap[`${targetItem.medicationId}_${targetDate}`];
          }
          if (targetItem?.medicationName) {
            delete snoozeMap[`${targetItem.medicationName}_${targetDate}`];
          }
          currentSnoozeMap = snoozeMap;
          await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
        }
      } catch {}
    }

    // Real-time stock update for this medication if intake status changed
    let latestMeds: Medication[] | undefined = undefined;
    if (targetItem && wasTaken !== isTaken) {
      try {
        const meds = await medicationService.getMedications();
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
            latestMeds = updatedMeds;
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
            const medUUID = isValidUUID(targetItem.medicationId)
              ? targetItem.medicationId
              : null;
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

      await syncService.pushRemoteUserSync(userUUID, userKey, {
        medications: latestMeds,
        snoozeMap: currentSnoozeMap,
        scheduleOverrides: { [targetDate]: updated },
      });
    }

    const item = updated.find(i => i.id === scheduleId);
    if (item && isTaken && !wasTaken) {
      await activityService.logActivity(
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
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const schedule = await scheduleService.getScheduleForDate(targetDate);
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

    let currentSnoozeMap: Record<string, number> = {};
    try {
      const snoozeRaw = await safeStorage.getItem(snoozeKey);
      const snoozeMap: Record<string, number> = snoozeRaw ? JSON.parse(snoozeRaw) : {};
      snoozeMap[scheduleId] = postponedUntil;
      if (targetItem.medicationId) {
        snoozeMap[`${targetItem.medicationId}_${targetDate}`] = postponedUntil;
      }
      snoozeMap[`${targetItem.medicationName}_${targetDate}`] = postponedUntil;
      currentSnoozeMap = snoozeMap;
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

    if (supabase && userUUID) {
      try {
        if (isValidUUID(scheduleId)) {
          await supabase
            .from('user_schedules')
            .update({ time: newTimeStr })
            .eq('id', scheduleId)
            .eq('user_id', userUUID);
        } else {
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
              .update({ time: newTimeStr })
              .eq('id', existingRows[0].id)
              .eq('user_id', userUUID);
          }
        }
      } catch {}

      await syncService.pushRemoteUserSync(userUUID, userKey, {
        snoozeMap: currentSnoozeMap,
        scheduleOverrides: { [targetDate]: updated },
      });
    }

    return updated;
  },

  async skipSchedule(scheduleId: string, dateStr?: string): Promise<ScheduleItem[]> {
    const { userKey, userUUID } = await userService.getCurrentUserScope();
    if (!userKey) {
      return [];
    }

    const targetDate = dateStr || getLocalDateString();
    const key = `med_schedule_${userKey}_${targetDate}`;
    const snoozeKey = `med_snooze_until_map_${userKey}`;
    const schedule = await scheduleService.getScheduleForDate(targetDate);
    const targetItem = schedule.find(i => i.id === scheduleId);

    if (!targetItem || targetItem.isTaken) {
      return schedule;
    }

    const updated = schedule.map(s =>
      s.id === scheduleId
        ? { ...s, isSkipped: true, isChecked: false, postponedUntil: undefined }
        : s
    );

    await safeStorage.setItem(key, JSON.stringify(updated));

    let currentSnoozeMap: Record<string, number> | undefined = undefined;
    try {
      const snoozeRaw = await safeStorage.getItem(snoozeKey);
      if (snoozeRaw) {
        const snoozeMap = JSON.parse(snoozeRaw);
        delete snoozeMap[scheduleId];
        if (targetItem?.medicationId) {
          delete snoozeMap[`${targetItem.medicationId}_${targetDate}`];
        }
        if (targetItem?.medicationName) {
          delete snoozeMap[`${targetItem.medicationName}_${targetDate}`];
        }
        currentSnoozeMap = snoozeMap;
        await safeStorage.setItem(snoozeKey, JSON.stringify(snoozeMap));
      }
    } catch {}

    if (supabase && userUUID) {
      try {
        if (isValidUUID(scheduleId)) {
          await supabase
            .from('user_schedules')
            .update({ is_skipped: true })
            .eq('id', scheduleId)
            .eq('user_id', userUUID);
        } else {
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
              .update({ is_skipped: true })
              .eq('id', existingRows[0].id)
              .eq('user_id', userUUID);
          } else {
            const medUUID = isValidUUID(targetItem.medicationId)
              ? targetItem.medicationId
              : null;
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
                is_taken: false,
                taken_at: null,
                is_skipped: true,
              },
            ]);
          }
        }
      } catch {}

      await syncService.pushRemoteUserSync(userUUID, userKey, {
        snoozeMap: currentSnoozeMap,
        scheduleOverrides: { [targetDate]: updated },
      });
    }

    return updated;
  },
};
