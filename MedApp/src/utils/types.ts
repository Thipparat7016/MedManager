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
