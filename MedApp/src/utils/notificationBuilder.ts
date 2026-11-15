import {
  AppNotification,
  DoctorAppointment,
  DrugFoodInteraction,
  Medication,
  ScheduleItem,
} from './types';
import { formatDepartmentName, formatHospitalName } from './formatUtils';
import { parseAppointmentDateTime } from './dateUtils';
import { getMealCategory } from './scheduleUtils';
import { getMedicationStockStatus } from './stockUtils';
import {
  formatCleanDrugName,
  formatCleanFoodName,
  isMedicationMatch,
  resolveMedicationImageUri,
} from './interactionMatcher';

export function buildDynamicNotifications(params: {
  sched: ScheduleItem[];
  userMeds: Medication[];
  masterMedications: Medication[];
  apts: DoctorAppointment[];
  inter: DrugFoodInteraction[];
  dismissedIds?: Set<string>;
  now?: Date;
}): AppNotification[] {
  const {
    sched,
    userMeds,
    masterMedications,
    apts,
    inter,
    dismissedIds,
    now = new Date(),
  } = params;

  // Generate dynamic notifications based on real data (synced with Checklist & Schedule)
  const dynamicNotifs: AppNotification[] = [];

  // 1A. Upcoming medication reminders for items in the next upcoming meal
  const nowMs = now.getTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // ตรวจสอบว่ารายการยานี้ติดสถานะเลื่อนเวลา (Snoozed) อยู่หรือไม่
  const isSnoozed = (s: ScheduleItem) => {
    if (!s.postponedUntil) return false;
    return nowMs < s.postponedUntil;
  };

  const upcomingPending = sched.find(s => {
    if (s.isTaken || s.isSkipped) return false;
    const match = s.time.match(/(\d+):(\d+)/);
    if (!match) return true;
    const itemMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    return itemMinutes >= currentMinutes - 60;
  });
  const firstPending = upcomingPending || sched.find(s => !s.isTaken && !s.isSkipped);
  if (firstPending) {
    const targetMeal = getMealCategory(firstPending.time, firstPending.mealTiming);
    const nextMealPendingItems = sched.filter(
      s =>
        !s.isTaken &&
        !s.isSkipped &&
        getMealCategory(s.time, s.mealTiming) === targetMeal
    );

    const emittedFoodKeys = new Set<string>();

    // กรองเฉพาะรายการที่ไม่ได้ติดสถานะ Snooze (เลื่อนเวลา) อยู่ในขณะนี้
    const activeAlertItems = nextMealPendingItems.filter(s => !isSnoozed(s));

    activeAlertItems.forEach(pendingItem => {
      const cleanName = formatCleanDrugName(pendingItem.medicationName);
      const detailRight = [
        `${pendingItem.doseCount || 1} ${pendingItem.type}`,
        pendingItem.mealTiming,
      ]
        .filter(Boolean)
        .join(' ');

      const medImg = resolveMedicationImageUri(
        { id: pendingItem.medicationId, name: pendingItem.medicationName },
        masterMedications,
        userMeds
      );

      dynamicNotifs.push({
        id: `notif-remind-${pendingItem.id}`,
        scheduleId: pendingItem.id,
        type: 'med_reminder',
        title: 'ถึงเวลารับประทานยา',
        message: `${cleanName} ${pendingItem.dosage}${pendingItem.unit} — ${detailRight}`,
        time: pendingItem.time,
        date: 'วันนี้',
        isActionable: true,
        medicationName: pendingItem.medicationName,
        dosage: `${pendingItem.dosage}${pendingItem.unit}`,
        imageUrl: medImg || undefined,
        isRead: false,
      });

      // 1B. Foods to avoid for this next meal: fetch ALL matching avoidances
      const matchingInters = inter.filter(
        i =>
          (i.interactionType === 'หลีกเลี่ยง' || i.interactionType?.includes('หลีกเลี่ยง')) &&
          isMedicationMatch(pendingItem.medicationName, i.medicationName)
      );
      matchingInters.forEach(matchingInter => {
        const cleanFood = formatCleanFoodName(matchingInter.foodName);
        const foodKey = `${cleanFood.toLowerCase()}-${pendingItem.medicationName.toLowerCase()}`;
        if (!emittedFoodKeys.has(foodKey)) {
          emittedFoodKeys.add(foodKey);
          dynamicNotifs.push({
            id: `notif-food-${matchingInter.id || cleanFood}-${pendingItem.id}`,
            scheduleId: pendingItem.id,
            type: 'food_warning',
            title: 'แจ้งเตือนล่วงหน้า: อาหาร',
            message: `งด ${cleanFood} สำหรับ ${cleanName}`,
            time: pendingItem.time,
            date: 'วันนี้',
            isRead: false,
          });
        }
      });
    });
  }

  // 2. Upcoming doctor appointments (ล่วงหน้า 1-3 วัน นับจากวันและเวลาปัจจุบัน ไม่เกิน 3 วัน และแสดงนัดหมายในวันนั้นๆ ให้ครบ)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  // เกณฑ์แจ้งเตือนล่วงหน้า 1-3 วัน นับจากวันและเวลาปัจจุบัน (ไม่เกินสิ้นสุดวันที่ +3)
  const maxAheadDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59, 999);

  // กรองเฉพาะนัดหมายที่อยู่ในช่วงวันนี้จนถึงล่วงหน้า 3 วัน (ถ้าเกิน 3 วันยังไม่ต้องแจ้งเตือน)
  const upcomingApts = apts
    .filter(a => a.status !== 'passed')
    .map(a => ({
      apt: a,
      dt: parseAppointmentDateTime(a.date, a.time),
    }))
    .filter((item): item is { apt: DoctorAppointment; dt: Date } => {
      return item.dt !== null && item.dt >= todayStart && item.dt <= maxAheadDate;
    })
    .sort((a, b) => a.dt.getTime() - b.dt.getTime());

  // จัดกลุ่มนัดหมายตามวันที่ (YYYY-MM-DD)
  const aptsByDate = new Map<string, Array<{ apt: DoctorAppointment; dt: Date }>>();
  upcomingApts.forEach(item => {
    const y = item.dt.getFullYear();
    const m = String(item.dt.getMonth() + 1).padStart(2, '0');
    const d = String(item.dt.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;
    if (!aptsByDate.has(dateKey)) {
      aptsByDate.set(dateKey, []);
    }
    aptsByDate.get(dateKey)!.push(item);
  });

  // นำนัดหมายที่อยู่ในเกณฑ์ล่วงหน้า 1-3 วันมาแสดง (และถ้าใน 1 วันมีมากกว่า 1 รายการ ให้แสดงครบทุกรายการ)
  aptsByDate.forEach(itemsOnDate => {
    itemsOnDate.forEach(({ apt, dt }) => {
      const isToday = dt >= todayStart && dt <= todayEnd;
      const hosp = formatHospitalName(apt.hospital);
      const dept = formatDepartmentName(apt.department);
      const line1 = [apt.doctorName, hosp].filter(Boolean).join(' • ');
      const detailsPart = [line1, dept].filter(Boolean).join('\n');

      dynamicNotifs.push({
        id: `notif-apt-${apt.id}`,
        type: 'appointment',
        title: `นัดหมายแพทย์: ${apt.date}`,
        message: detailsPart,
        time: apt.time,
        date: isToday ? 'วันนี้' : 'เร็วๆ นี้',
        isRead: false,
      });
    });
  });

  // 3. Low stock warning for real user medications (1-day buffer + custom threshold, only when stock is tracked)
  userMeds
    .filter(m => m.status === 'active' && getMedicationStockStatus(m).isLowStock)
    .forEach(m => {
      const medImg = resolveMedicationImageUri(
        { id: m.id, name: m.name, imageUrl: m.imageUrl },
        masterMedications,
        userMeds
      );
      dynamicNotifs.push({
        id: `notif-stock-${m.id}`,
        type: 'low_stock',
        title: 'ยาใกล้หมด',
        message: `${formatCleanDrugName(m.name)} เหลือ ${m.remaining} ${m.type || 'เม็ด'} กรุณาสั่งซื้อเพิ่ม`,
        time: '09:00 น.',
        date: 'แจ้งเตือน',
        medicationName: m.name,
        imageUrl: medImg || undefined,
        isRead: false,
      });
    });

  if (dismissedIds && dismissedIds.size > 0) {
    return dynamicNotifs.filter(n => !dismissedIds.has(n.id));
  }
  return dynamicNotifs;
}

export function formatAppointmentNotificationMessage(rawMessage?: string): string {
  const cleanMsg = (rawMessage || '')
    .replace(/\s*[-–—•]\s*\d{1,2}:\d{2}\s*(น\.)?\s*$/, '')
    .trim();

  const rawParts = cleanMsg
    .split(/[\n•]/)
    .map(p => p.trim())
    .filter(Boolean);

  let doctorName = '';
  let hospitalName = '';
  let departmentName = '';

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (
      part.startsWith('แผนก') ||
      part.includes('กรรม') ||
      part.includes('วิทยา') ||
      part.includes('ตรวจ') ||
      part.includes('คลินิก') ||
      part.includes('สูติ') ||
      part.includes('แพทย์')
    ) {
      if (!departmentName && (part.startsWith('แผนก') || i > 0)) {
        departmentName = formatDepartmentName(part);
        continue;
      }
    }
    if (part.startsWith('โรงพยาบาล') || part.startsWith('รพ.') || part.includes('พยาบาล')) {
      hospitalName = formatHospitalName(part);
      continue;
    }
    if (i === 0) {
      doctorName = part;
    } else if (!hospitalName) {
      hospitalName = formatHospitalName(part);
    } else if (!departmentName) {
      departmentName = formatDepartmentName(part);
    }
  }

  const line1 = [doctorName, hospitalName].filter(Boolean).join(' • ');
  return [line1, departmentName].filter(Boolean).join('\n');
}

