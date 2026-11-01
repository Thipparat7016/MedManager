import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  medService,
  Medication,
  DrugFoodInteraction,
  ScheduleItem,
  DoctorAppointment,
  SideEffectLog,
  AppNotification,
  UserProfile,
  getMedicationStockStatus,
} from '@/services/medService';
import { isMedicationMatch, formatCleanDrugName, formatCleanFoodName } from '@/services/interactionMatcher';
import { supabase } from '@/services/supabase';

function getMealCategory(timeStr?: string, mealTiming?: string): string {
  if (mealTiming === 'ก่อนนอน') return 'ก่อนนอน';
  const clean = (timeStr || '').replace(' น.', '').trim();
  const hour = parseInt(clean.split(':')[0], 10);
  if (!isNaN(hour)) {
    if (hour >= 5 && hour < 11) return 'มื้อเช้า';
    if (hour >= 11 && hour < 15) return 'มื้อกลางวัน';
    if (hour >= 15 && hour < 20) return 'มื้อเย็น';
    return 'ก่อนนอน';
  }
  return 'มื้อเช้า';
}

interface AppContextType {
  user: UserProfile | null;
  medications: Medication[];
  masterMedications: Medication[];
  todaySchedule: ScheduleItem[];
  appointments: DoctorAppointment[];
  sideEffects: SideEffectLog[];
  interactions: DrugFoodInteraction[];
  notifications: AppNotification[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  getScheduleForDate: (dateStr?: string) => Promise<ScheduleItem[]>;
  toggleChecklist: (scheduleId: string, isChecked: boolean, dateStr?: string) => Promise<void>;
  confirmCheckedIntake: (scheduleIds: string[], dateStr?: string) => Promise<void>;
  markTaken: (scheduleId: string, isTaken?: boolean, dateStr?: string) => Promise<void>;
  postponeSchedule: (scheduleId: string, minutes?: number) => Promise<void>;
  skipSchedule: (scheduleId: string) => Promise<void>;
  saveMedication: (med: Medication) => Promise<Medication>;
  deleteMedication: (id: string) => Promise<void>;
  addAppointment: (apt: Omit<DoctorAppointment, 'id'>) => Promise<DoctorAppointment>;
  updateAppointment: (apt: DoctorAppointment) => Promise<DoctorAppointment>;
  deleteAppointment: (id: string) => Promise<void>;
  addSideEffect: (log: Omit<SideEffectLog, 'id' | 'createdAt'>) => Promise<SideEffectLog>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [masterMedications, setMasterMedications] = useState<Medication[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffectLog[]>([]);
  const [interactions, setInteractions] = useState<DrugFoodInteraction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const dismissedNotifIdsRef = useRef<Set<string>>(new Set());

  const loadAllData = useCallback(async (showGlobalLoading = false) => {
    try {
      if (showGlobalLoading) {
        setIsLoading(true);
      }
      // 1. Immediately restore user profile & auth status
      const u = await medService.getUserProfile().catch(() => null);
      setUser(u);
      setIsAuthenticated(Boolean(u && u.email));

      // 2. Concurrently load application datasets
      const [userMeds, masterMeds, sched, apts, se, inter] = await Promise.all([
        medService.getMedications().catch(() => []),
        medService.getMasterMedications().catch(() => []),
        medService.getTodaySchedule().catch(() => []),
        medService.getAppointments().catch(() => []),
        medService.getSideEffects().catch(() => []),
        medService.getInteractions().catch(() => []),
      ]);

      setMedications(userMeds);
      setMasterMedications(masterMeds);
      setTodaySchedule(sched);
      setAppointments(apts);
      setSideEffects(se);
      setInteractions(inter);

      // Generate dynamic notifications based on real data (synced with Checklist & Schedule)
      const dynamicNotifs: AppNotification[] = [];

      // 1A. Upcoming medication reminders for ALL unconfirmed items in the next upcoming meal
      const firstPending = sched.find(s => !s.isTaken && !s.isSkipped);
      if (firstPending) {
        const targetMeal = getMealCategory(firstPending.time, firstPending.mealTiming);
        const nextMealPendingItems = sched.filter(
          s =>
            !s.isTaken &&
            !s.isSkipped &&
            getMealCategory(s.time, s.mealTiming) === targetMeal
        );

        const emittedFoodKeys = new Set<string>();

        nextMealPendingItems.forEach(pendingItem => {
          const cleanName = formatCleanDrugName(pendingItem.medicationName);
          const detailRight = [
            `${pendingItem.doseCount || 1} ${pendingItem.type}`,
            pendingItem.mealTiming,
          ]
            .filter(Boolean)
            .join(' ');

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
            isRead: false,
          });

          const matchingInter = inter.find(
            i =>
              (i.interactionType === 'หลีกเลี่ยง' || i.interactionType?.includes('หลีกเลี่ยง')) &&
              isMedicationMatch(pendingItem.medicationName, i.medicationName)
          );
          if (matchingInter) {
            const foodKey = `${matchingInter.id}-${pendingItem.medicationName}`;
            if (!emittedFoodKeys.has(foodKey)) {
              emittedFoodKeys.add(foodKey);
              dynamicNotifs.push({
                id: `notif-food-${matchingInter.id}-${pendingItem.id}`,
                scheduleId: pendingItem.id,
                type: 'food_warning',
                title: 'แจ้งเตือนล่วงหน้า: อาหาร',
                message: `งด ${formatCleanFoodName(matchingInter.foodName)} สำหรับ ${cleanName}`,
                time: pendingItem.time,
                date: 'วันนี้',
                isRead: false,
              });
            }
          }
        });
      }

      // 1B. Confirmed medication cards ("ยืนยันรับประทานยาแล้ว") synced whether confirmed via Checklist or Notification
      const confirmedToday = [...sched.filter(s => s.isTaken)].reverse();
      confirmedToday.forEach(takenItem => {
        const cleanName = formatCleanDrugName(takenItem.medicationName);
        const detailRight = [
          `${takenItem.doseCount || 1} ${takenItem.type}`,
          takenItem.mealTiming,
        ]
          .filter(Boolean)
          .join(' ');

        dynamicNotifs.push({
          id: `notif-taken-${takenItem.id}`,
          scheduleId: takenItem.id,
          type: 'med_taken',
          title: 'ยืนยันรับประทานยาแล้ว',
          message: `${cleanName} ${takenItem.dosage}${takenItem.unit} — ${detailRight}`,
          time: takenItem.takenAt || takenItem.time,
          date: 'วันนี้',
          medicationName: takenItem.medicationName,
          dosage: `${takenItem.dosage}${takenItem.unit}`,
          isRead: true,
        });
      });

      // 2. Upcoming doctor appointments
      apts.filter(a => a.status === 'confirmed').forEach(a => {
        dynamicNotifs.push({
          id: `notif-apt-${a.id}`,
          type: 'appointment',
          title: `นัดหมายแพทย์: ${a.date}`,
          message: `${a.doctorName} • ${a.hospital} - ${a.time}`,
          time: a.time,
          date: 'เร็วๆ นี้',
          isRead: false,
        });
      });

      // 3. Low stock warning for real user medications (1-day buffer + custom threshold, only when stock is tracked)
      userMeds
        .filter(m => m.status === 'active' && getMedicationStockStatus(m).isLowStock)
        .forEach(m => {
          dynamicNotifs.push({
            id: `notif-stock-${m.id}`,
            type: 'low_stock',
            title: 'ยาใกล้หมด',
            message: `${formatCleanDrugName(m.name)} เหลือ ${m.remaining} ${m.type || 'เม็ด'} กรุณาสั่งซื้อเพิ่ม`,
            time: '09:00 น.',
            date: 'แจ้งเตือน',
            isRead: false,
          });
        });

      setNotifications(dynamicNotifs.filter(n => !dismissedNotifIdsRef.current.has(n.id)));
    } catch (e) {
      console.warn('Error initializing app context data:', e);
    } finally {
      if (showGlobalLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadAllData(true);

    // Supabase Realtime Subscription for Live Sync with AdminMed
    if (supabase) {
      const channel = supabase
        .channel('realtime:app-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'medications' },
          async () => {
            try {
              const freshMasterMeds = await medService.getMasterMedications();
              setMasterMedications(freshMasterMeds);
            } catch (err) {
              console.warn('Realtime sync error for medications:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'drug_food_interactions' },
          async () => {
            try {
              const freshInteractions = await medService.getInteractions();
              setInteractions(freshInteractions);
            } catch (err) {
              console.warn('Realtime sync error for interactions:', err);
            }
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const profile = await medService.loginUser(email, pass);
      setUser(profile);
      setIsAuthenticated(true);
      await loadAllData();
      return { success: true };
    } catch (e: any) {
      console.warn('Login error:', e);
      return { success: false, error: e?.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const profile = await medService.registerUser(data);
      setUser(profile);
      setIsAuthenticated(true);
      await loadAllData();
      return { success: true };
    } catch (e: any) {
      console.warn('Register error:', e);
      return { success: false, error: e?.message || 'สมัครสมาชิกไม่สำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await medService.logoutUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshData = useCallback(async () => {
    await loadAllData(false);
  }, [loadAllData]);

  const getScheduleForDate = useCallback(async (dateStr?: string) => {
    return medService.getScheduleForDate(dateStr);
  }, []);

  const toggleChecklist = async (scheduleId: string, isChecked: boolean, dateStr?: string) => {
    await medService.toggleScheduleChecked(scheduleId, isChecked, dateStr);
    await loadAllData(false);
  };

  const confirmCheckedIntake = async (scheduleIds: string[], dateStr?: string) => {
    await medService.confirmCheckedSchedules(scheduleIds, dateStr);
    await loadAllData(false);
  };

  const markTaken = async (scheduleId: string, isTaken: boolean = true, dateStr?: string) => {
    await medService.markScheduleTaken(scheduleId, isTaken, dateStr);
    await loadAllData(false);
  };

  const postponeSchedule = async (scheduleId: string, minutes: number = 30) => {
    await medService.postponeSchedule(scheduleId, minutes);
    await loadAllData(false);
  };

  const skipSchedule = async (scheduleId: string) => {
    await medService.skipSchedule(scheduleId);
    await loadAllData(false);
  };

  const saveMedication = async (med: Medication) => {
    const saved = await medService.saveMedication(med);
    await loadAllData(false);
    return saved;
  };

  const deleteMedication = async (id: string) => {
    await medService.deleteMedication(id);
    await loadAllData(false);
  };

  const addAppointment = async (apt: Omit<DoctorAppointment, 'id'>) => {
    const saved = await medService.addAppointment(apt);
    await loadAllData(false);
    return saved;
  };

  const updateAppointment = async (apt: DoctorAppointment) => {
    const updated = await medService.updateAppointment(apt);
    await loadAllData(false);
    return updated;
  };

  const deleteAppointment = async (id: string) => {
    await medService.deleteAppointment(id);
    await loadAllData(false);
  };

  const addSideEffect = async (log: Omit<SideEffectLog, 'id' | 'createdAt'>) => {
    const saved = await medService.addSideEffect(log);
    await loadAllData(false);
    return saved;
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updated = await medService.updateUserProfile(profile);
    setUser(updated);
  };

  const clearNotifications = () => {
    setNotifications(prev => {
      prev.forEach(n => dismissedNotifIdsRef.current.add(n.id));
      return [];
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        medications,
        masterMedications,
        todaySchedule,
        appointments,
        sideEffects,
        interactions,
        notifications,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshData,
        getScheduleForDate,
        toggleChecklist,
        confirmCheckedIntake,
        markTaken,
        postponeSchedule,
        skipSchedule,
        saveMedication,
        deleteMedication,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addSideEffect,
        updateProfile,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
