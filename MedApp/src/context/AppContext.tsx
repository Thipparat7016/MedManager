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

interface AppContextType {
  user: UserProfile | null;
  medications: Medication[];
  todaySchedule: ScheduleItem[];
  appointments: DoctorAppointment[];
  sideEffects: SideEffectLog[];
  interactions: DrugFoodInteraction[];
  notifications: AppNotification[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
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

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'med_reminder',
    title: 'ถึงเวลารับประทานยา',
    message: 'แอสไพริน 100mg — 1 เม็ด หลังอาหาร',
    time: '14:00 น.',
    date: 'วันนี้',
    isActionable: true,
    medicationName: 'แอสไพริน',
    dosage: '100mg',
  },
  {
    id: 'notif-2',
    type: 'food_warning',
    title: 'แจ้งเตือนล่วงหน้า: อาหาร',
    message: 'งดส้มและน้ำส้ม 1 ชม. ก่อนรับประทานแอสไพริน',
    time: '13:00 น.',
    date: 'วันนี้',
  },
  {
    id: 'notif-3',
    type: 'appointment',
    title: 'นัดหมายแพทย์พรุ่งนี้',
    message: 'นพ. สมศักดิ์ • โรงพยาบาล A - 09:00 น.',
    time: '13:00 น.',
    date: 'วันนี้',
  },
  {
    id: 'notif-4',
    type: 'med_taken',
    title: 'รับประทานยาสำเร็จ',
    message: 'เมทฟอร์มิน 500mg - ยืนยัน 20:05 น.',
    time: '20:05 น.',
    date: 'เมื่อวาน',
  },
  {
    id: 'notif-5',
    type: 'low_stock',
    title: 'ยาใกล้หมด',
    message: 'แอสไพริน เหลือ 5 เม็ด กรุณาสั่งซื้อเพิ่ม',
    time: '09:00 น.',
    date: 'เมื่อวาน',
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffectLog[]>([]);
  const [interactions, setInteractions] = useState<DrugFoodInteraction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [u, meds, sched, apts, se, inter] = await Promise.all([
        medService.getUserProfile(),
        medService.getMedications(),
        medService.getTodaySchedule(),
        medService.getAppointments(),
        medService.getSideEffects(),
        medService.getInteractions(),
      ]);

      setUser(u);
      setMedications(meds);
      setTodaySchedule(sched);
      setAppointments(apts);
      setSideEffects(se);
      setInteractions(inter);
    } catch (e) {
      console.warn('Error initializing app context data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsAuthenticated(true);
    if (user) {
      setUser({ ...user, email });
    }
    return true;
  };

  const logout = async () => {
    setIsAuthenticated(false);
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
        todaySchedule,
        appointments,
        sideEffects,
        interactions,
        notifications,
        isLoading,
        isAuthenticated,
        login,
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
