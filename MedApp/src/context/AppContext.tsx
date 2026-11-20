import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Platform, Alert, AppState } from 'react-native';
import {
  Medication,
  DrugFoodInteraction,
  ScheduleItem,
  DoctorAppointment,
  SideEffectLog,
  AppNotification,
  UserProfile,
} from '@/utils/types';
import { hasValidPhone } from '@/utils/formatUtils';
import { buildDynamicNotifications } from '@/utils/notificationBuilder';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { medicationService } from '@/services/medicationService';
import { scheduleService } from '@/services/scheduleService';
import { appointmentService } from '@/services/appointmentService';
import { sideEffectService } from '@/services/sideEffectService';
import { interactionService } from '@/services/interactionService';
import { subscribeToAppRealtime } from '@/services/realtimeService';
import { MandatoryPhoneModal } from '@/components/ui/MandatoryPhoneModal';

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
  loginWithGoogle: (
    email: string,
    fullName?: string,
    avatarUrl?: string
  ) => Promise<{ success: boolean; needsPhone?: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  getScheduleForDate: (dateStr?: string) => Promise<ScheduleItem[]>;
  toggleChecklist: (scheduleId: string, isChecked: boolean, dateStr?: string) => Promise<void>;
  confirmCheckedIntake: (scheduleIds: string[], dateStr?: string) => Promise<void>;
  markTaken: (scheduleId: string, isTaken?: boolean, dateStr?: string) => Promise<void>;
  postponeSchedule: (scheduleId: string, minutes?: number) => Promise<string | undefined>;
  skipSchedule: (scheduleId: string) => Promise<void>;
  saveMedication: (med: Medication) => Promise<Medication>;
  deleteMedication: (id: string) => Promise<void>;
  addAppointment: (apt: Omit<DoctorAppointment, 'id'>) => Promise<DoctorAppointment>;
  updateAppointment: (apt: DoctorAppointment) => Promise<DoctorAppointment>;
  deleteAppointment: (id: string) => Promise<void>;
  addSideEffect: (log: Omit<SideEffectLog, 'id' | 'createdAt'>) => Promise<SideEffectLog>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setAccountPassword: (verifyInput: string, newPassword: string) => Promise<void>;
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
  const [phoneModalInput, setPhoneModalInput] = useState<string>('');
  const [isSavingPhoneModal, setIsSavingPhoneModal] = useState<boolean>(false);
  const [skippedPhoneEmail, setSkippedPhoneEmail] = useState<string | null>(null);
  const dismissedNotifIdsRef = useRef<Set<string>>(new Set());
  const isRefreshingRef = useRef<boolean>(false);
  const pendingRefreshRef = useRef<boolean>(false);
  const lastLoadAllAtRef = useRef<number>(0);

  const loadAllData = useCallback(async (showGlobalLoading = false, force = false) => {
    const now = Date.now();
    // Skip redundant passive refetches (e.g. tab switch useFocusEffect) if data was loaded within 15s
    if (!showGlobalLoading && !force && now - lastLoadAllAtRef.current < 15000) {
      return;
    }
    if (!showGlobalLoading && isRefreshingRef.current) {
      if (force) {
        pendingRefreshRef.current = true;
      }
      return;
    }
    try {
      if (showGlobalLoading) {
        setIsLoading(true);
      } else {
        isRefreshingRef.current = true;
      }
      lastLoadAllAtRef.current = Date.now();
      // 1. Immediately restore user profile & auth status
      const u = await userService.getUserProfile().catch(() => null);
      setUser(u);
      setIsAuthenticated(Boolean(u && u.email));

      // 2. Sync user medications first so remote medication & schedule overrides are ready, then load remaining datasets
      const userMeds = await medicationService.getMedications().catch(() => []);
      const [masterMeds, sched, apts, se, inter] = await Promise.all([
        medicationService.getMasterMedications().catch(() => []),
        scheduleService.getTodaySchedule().catch(() => []),
        appointmentService.getAppointments().catch(() => []),
        sideEffectService.getSideEffects().catch(() => []),
        interactionService.getInteractions().catch(() => []),
      ]);

      setMedications(userMeds);
      setMasterMedications(masterMeds);
      setTodaySchedule(sched);
      setAppointments(apts);
      setSideEffects(se);
      setInteractions(inter);

      const nextNotifications = buildDynamicNotifications({
        sched,
        userMeds,
        masterMedications: masterMeds,
        apts,
        inter,
        dismissedIds: dismissedNotifIdsRef.current,
      });
      setNotifications(nextNotifications);
    } catch (e) {
      console.warn('Error initializing app context data:', e);
    } finally {
      if (showGlobalLoading) {
        setIsLoading(false);
      } else {
        isRefreshingRef.current = false;
        if (pendingRefreshRef.current) {
          pendingRefreshRef.current = false;
          setTimeout(() => {
            loadAllData(false, true);
          }, 50);
        }
      }
    }
  }, []);

  useEffect(() => {
    loadAllData(true, true);

    const appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        loadAllData(false, false);
      }
    });

    const handleWindowFocus = () => {
      loadAllData(false, false);
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    // Supabase Realtime Subscription for Live Sync across Devices & AdminMed
    const unsubscribeRealtime = subscribeToAppRealtime({
      onMasterMedicationsChanged: async () => {
        try {
          const freshMasterMeds = await medicationService.getMasterMedications(true);
          setMasterMedications(freshMasterMeds);
        } catch (err) {
          console.warn('Realtime sync error for medications:', err);
        }
      },
      onInteractionsChanged: async () => {
        try {
          const freshInteractions = await interactionService.getInteractions(undefined, true);
          setInteractions(freshInteractions);
        } catch (err) {
          console.warn('Realtime sync error for interactions:', err);
        }
      },
      onUserDataChanged: () => {
        loadAllData(false, true);
      },
    });

    return () => {
      appStateSubscription.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }
      unsubscribeRealtime();
    };
  }, [loadAllData]);

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const profile = await authService.loginUser(email, pass);
      setUser(profile);
      setIsAuthenticated(true);
      setPhoneModalInput('');
      setSkippedPhoneEmail(null);
      await loadAllData(false, true);
      return { success: true };
    } catch (e: any) {
      console.warn('Login error:', e);
      return { success: false, error: e?.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    email: string,
    fullName?: string,
    avatarUrl?: string
  ): Promise<{ success: boolean; needsPhone?: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const profile = await authService.loginWithGoogleUser(email, fullName, avatarUrl);
      setUser(profile);
      setIsAuthenticated(true);
      setPhoneModalInput('');
      setSkippedPhoneEmail(null);
      await loadAllData(false, true);
      const needsPhone = !hasValidPhone(profile.phone);
      return { success: true, needsPhone };
    } catch (e: any) {
      console.warn('Google login error:', e);
      return { success: false, error: e?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' };
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
      const profile = await authService.registerUser(data);
      setUser(profile);
      setIsAuthenticated(true);
      setPhoneModalInput('');
      setSkippedPhoneEmail(null);
      await loadAllData(false, true);
      return { success: true };
    } catch (e: any) {
      console.warn('Register error:', e);
      return { success: false, error: e?.message || 'สมัครสมาชิกไม่สำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logoutUser();
    setSkippedPhoneEmail(null);
    setPhoneModalInput('');
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshData = useCallback(async () => {
    await loadAllData(false, false);
  }, [loadAllData]);

  const getScheduleForDate = useCallback(async (dateStr?: string) => {
    return scheduleService.getScheduleForDate(dateStr);
  }, []);

  const toggleChecklist = async (scheduleId: string, isChecked: boolean, dateStr?: string) => {
    // 1. อัปเดต state ทันที (Optimistic update) ให้การติ๊กเช็กลิสต์ตอบสนองทันทีแบบสมูท
    setTodaySchedule(prev =>
      prev.map(item => (item.id === scheduleId ? { ...item, isChecked } : item))
    );
    // 2. บันทึกข้อมูลลง storage ในเบื้องหลัง (ไม่ต้องเรียก loadAllData ซ้ำ เพื่อป้องกัน race condition ที่ทำให้สถานะเด้งไปมา)
    await scheduleService.toggleScheduleChecked(scheduleId, isChecked, dateStr);
  };

  const confirmCheckedIntake = async (scheduleIds: string[], dateStr?: string) => {
    const now = new Date();
    const timeNow = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} น.`;
    // Optimistic update ทันที
    setTodaySchedule(prev =>
      prev.map(item =>
        scheduleIds.includes(item.id)
          ? { ...item, isTaken: true, takenAt: item.takenAt || timeNow }
          : item
      )
    );
    await scheduleService.confirmCheckedSchedules(scheduleIds, dateStr);
    await loadAllData(false, true);
  };

  const markTaken = async (scheduleId: string, isTaken: boolean = true, dateStr?: string) => {
    const now = new Date();
    const timeNow = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} น.`;
    setTodaySchedule(prev =>
      prev.map(item =>
        item.id === scheduleId
          ? { ...item, isTaken, takenAt: isTaken ? item.takenAt || timeNow : undefined }
          : item
      )
    );
    await scheduleService.markScheduleTaken(scheduleId, isTaken, dateStr);
    await loadAllData(false, true);
  };

  const postponeSchedule = async (
    scheduleId: string,
    minutes: number = 30
  ): Promise<string | undefined> => {
    // ซ่อนการ์ดแจ้งเตือนของยานี้และการ์ดอาหารที่ต้องเลี่ยงออกจากหน้าจอทันที
    setNotifications(prev =>
      prev.filter(n => n.scheduleId !== scheduleId && !n.id.includes(scheduleId))
    );
    const updated = await scheduleService.postponeSchedule(scheduleId, minutes);
    await loadAllData(false, true);
    const target = updated.find(i => i.id === scheduleId);
    return target?.time;
  };

  const skipSchedule = async (scheduleId: string) => {
    await scheduleService.skipSchedule(scheduleId);
    await loadAllData(false, true);
  };

  const saveMedication = async (med: Medication) => {
    const saved = await medicationService.saveMedication(med);
    setMedications(prev => {
      const idx = prev.findIndex(m => m.id === saved.id || m.id === med.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    await loadAllData(false, true);
    return saved;
  };

  const deleteMedication = async (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setTodaySchedule(prev => prev.filter(s => s.medicationId !== id));
    await medicationService.deleteMedication(id);
    await loadAllData(false, true);
  };

  const addAppointment = async (apt: Omit<DoctorAppointment, 'id'>) => {
    const saved = await appointmentService.addAppointment(apt);
    await loadAllData(false, true);
    return saved;
  };

  const updateAppointment = async (apt: DoctorAppointment) => {
    const updated = await appointmentService.updateAppointment(apt);
    await loadAllData(false, true);
    return updated;
  };

  const deleteAppointment = async (id: string) => {
    await appointmentService.deleteAppointment(id);
    await loadAllData(false, true);
  };

  const addSideEffect = async (log: Omit<SideEffectLog, 'id' | 'createdAt'>) => {
    const saved = await sideEffectService.addSideEffect(log);
    await loadAllData(false, true);
    return saved;
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updated = await userService.updateUserProfile(profile);
    setUser(updated);
  };

  const setAccountPassword = async (verifyInput: string, newPassword: string) => {
    const updated = await authService.setAccountPassword({ verifyInput, newPassword });
    setUser(updated);
  };

  const clearNotifications = () => {
    setNotifications(prev => {
      prev.forEach(n => dismissedNotifIdsRef.current.add(n.id));
      return [];
    });
  };

  const currentCleanEmail = user?.email ? user.email.trim().toLowerCase() : '';
  const showMandatoryPhoneModal = Boolean(
    isAuthenticated &&
      !isLoading &&
      user &&
      currentCleanEmail &&
      !hasValidPhone(user.phone) &&
      skippedPhoneEmail !== currentCleanEmail
  );

  const handleSkipPhoneModal = () => {
    if (currentCleanEmail) {
      setSkippedPhoneEmail(currentCleanEmail);
    }
    setPhoneModalInput('');
  };

  const handleSaveMandatoryPhone = async () => {
    const trimmed = phoneModalInput.trim();
    if (!hasValidPhone(trimmed)) {
      Alert.alert(
        'กรุณากรอกเบอร์โทรศัพท์',
        'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (อย่างน้อย 9 หลัก)'
      );
      return;
    }
    try {
      setIsSavingPhoneModal(true);
      await updateProfile({ phone: trimmed });
      setPhoneModalInput('');
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถบันทึกเบอร์โทรศัพท์ได้');
    } finally {
      setIsSavingPhoneModal(false);
    }
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
        loginWithGoogle,
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
        setAccountPassword,
        clearNotifications,
      }}
    >
      {children}

      <MandatoryPhoneModal
        visible={showMandatoryPhoneModal}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        phoneInput={phoneModalInput}
        isSaving={isSavingPhoneModal}
        onChangePhone={setPhoneModalInput}
        onSave={handleSaveMandatoryPhone}
        onSkip={handleSkipPhoneModal}
      />
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
