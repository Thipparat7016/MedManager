import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  medService,
  Medication,
  DrugFoodInteraction,
  ScheduleItem,
  DoctorAppointment,
  SideEffectLog,
  AppNotification,
  UserProfile,
} from '@/services/medService';
import { isMedicationMatch } from '@/services/interactionMatcher';

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
  markTaken: (scheduleId: string, isTaken?: boolean) => Promise<void>;
  postponeSchedule: (scheduleId: string, minutes?: number) => void;
  skipSchedule: (scheduleId: string) => void;
  saveMedication: (med: Medication) => Promise<Medication>;
  deleteMedication: (id: string) => Promise<void>;
  addAppointment: (apt: Omit<DoctorAppointment, 'id'>) => Promise<DoctorAppointment>;
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

  const loadAllData = async () => {
    try {
      setIsLoading(true);
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

      // Generate dynamic notifications based on real data
      const dynamicNotifs: AppNotification[] = [];
      
      // 1. Upcoming medication reminder
      const nextPending = sched.find(s => !s.isTaken && !s.isSkipped);
      if (nextPending) {
        dynamicNotifs.push({
          id: `notif-remind-${nextPending.id}`,
          type: 'med_reminder',
          title: 'ถึงเวลารับประทานยา',
          message: `${nextPending.medicationName} ${nextPending.dosage}${nextPending.unit} — 1 ${nextPending.type} ${nextPending.mealTiming}`,
          time: nextPending.time,
          date: 'วันนี้',
          isActionable: true,
          medicationName: nextPending.medicationName,
          dosage: `${nextPending.dosage}${nextPending.unit}`,
        });

        // Food warning for this upcoming med if any exists
        const matchingInter = inter.find(
          i => i.interactionType === 'หลีกเลี่ยง' && 
          isMedicationMatch(nextPending.medicationName, i.medicationName)
        );
        if (matchingInter) {
          dynamicNotifs.push({
            id: `notif-food-${matchingInter.id}`,
            type: 'food_warning',
            title: 'แจ้งเตือนล่วงหน้า: อาหาร',
            message: `งด ${matchingInter.foodName} สำหรับ ${nextPending.medicationName}`,
            time: nextPending.time,
            date: 'วันนี้',
          });
        }
      }

      // 2. Upcoming doctor appointments
      apts.filter(a => a.status === 'confirmed').forEach(a => {
        dynamicNotifs.push({
          id: `notif-apt-${a.id}`,
          type: 'appointment',
          title: `นัดหมายแพทย์: ${a.date}`,
          message: `${a.doctorName} • ${a.hospital} - ${a.time}`,
          time: a.time,
          date: 'เร็วๆ นี้',
        });
      });

      // 3. Low stock warning for real user medications
      userMeds.filter(m => m.remaining !== undefined && m.lowStockThreshold !== undefined && m.remaining <= m.lowStockThreshold).forEach(m => {
        dynamicNotifs.push({
          id: `notif-stock-${m.id}`,
          type: 'low_stock',
          title: 'ยาใกล้หมด',
          message: `${m.name} เหลือ ${m.remaining} เม็ด กรุณาสั่งซื้อเพิ่ม`,
          time: '09:00 น.',
          date: 'แจ้งเตือน',
        });
      });

      setNotifications(dynamicNotifs);
    } catch (e) {
      console.warn('Error initializing app context data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
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

  const refreshData = async () => {
    await loadAllData();
  };

  const markTaken = async (scheduleId: string, isTaken: boolean = true) => {
    const updated = await medService.markScheduleTaken(scheduleId, isTaken);
    setTodaySchedule(updated);
  };

  const postponeSchedule = (scheduleId: string, minutes: number = 30) => {
    setTodaySchedule(prev =>
      prev.map(item => (item.id === scheduleId ? { ...item, time: '14:30 น.' } : item))
    );
  };

  const skipSchedule = (scheduleId: string) => {
    setTodaySchedule(prev =>
      prev.map(item => (item.id === scheduleId ? { ...item, isSkipped: true } : item))
    );
  };

  const saveMedication = async (med: Medication) => {
    const saved = await medService.saveMedication(med);
    await loadAllData();
    return saved;
  };

  const deleteMedication = async (id: string) => {
    await medService.deleteMedication(id);
    await loadAllData();
  };

  const addAppointment = async (apt: Omit<DoctorAppointment, 'id'>) => {
    const saved = await medService.addAppointment(apt);
    await loadAllData();
    return saved;
  };

  const deleteAppointment = async (id: string) => {
    await medService.deleteAppointment(id);
    await loadAllData();
  };

  const addSideEffect = async (log: Omit<SideEffectLog, 'id' | 'createdAt'>) => {
    const saved = await medService.addSideEffect(log);
    await loadAllData();
    return saved;
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updated = await medService.updateUserProfile(profile);
    setUser(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
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
        markTaken,
        postponeSchedule,
        skipSchedule,
        saveMedication,
        deleteMedication,
        addAppointment,
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
