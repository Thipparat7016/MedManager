import { Medication } from './types';

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
  const timesPerDay =
    med.times && med.times.length > 0 ? med.times.length : Math.max(1, med.frequency || 1);
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
