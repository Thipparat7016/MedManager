import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  formatHospitalName,
  formatDepartmentName,
  hasValidPhone,
} from '@/services/medService';
import { isMedicationMatch, formatCleanDrugName, formatCleanFoodName, resolveMedicationImageUri } from '@/services/interactionMatcher';
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
  loginWithGoogle: (email: string, fullName?: string, avatarUrl?: string) => Promise<{ success: boolean; needsPhone?: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
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

      // 1A. Upcoming medication reminders for items in the next upcoming meal
      const now = new Date();
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

      const parseAppointmentDateTime = (dateStr?: string, timeStr?: string): Date | null => {
        if (!dateStr) return null;
        const trimmed = dateStr.trim();
        let year = 0;
        let month = 0;
        let day = 0;

        const isoMatch = trimmed.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
        if (isoMatch) {
          year = parseInt(isoMatch[1], 10);
          month = parseInt(isoMatch[2], 10) - 1;
          day = parseInt(isoMatch[3], 10);
        } else {
          const dmyMatch = trimmed.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/);
          if (dmyMatch) {
            day = parseInt(dmyMatch[1], 10);
            month = parseInt(dmyMatch[2], 10) - 1;
            year = parseInt(dmyMatch[3], 10);
          } else {
            const parsed = Date.parse(trimmed);
            if (!isNaN(parsed)) return new Date(parsed);
            return null;
          }
        }

        if (year > 2400) year -= 543; // Buddhist Era to CE

        let hours = 0;
        let minutes = 0;
        if (timeStr) {
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{1,2})/);
          if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = parseInt(timeMatch[2], 10);
          }
        }

        const dt = new Date(year, month, day, hours, minutes, 0, 0);
        return isNaN(dt.getTime()) ? null : dt;
      };

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

    // ตรวจสอบและรีเฟรชข้อมูลทุก 30 วินาที เพื่อปลดล็อครายการที่หมดเวลา Snooze อัตโนมัติ
    const interval = setInterval(() => {
      loadAllData(false);
    }, 30000);

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
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_schedules' },
          () => {
            loadAllData(false);
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase?.removeChannel(channel);
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const profile = await medService.loginUser(email, pass);
      setUser(profile);
      setIsAuthenticated(true);
      setPhoneModalInput('');
      setSkippedPhoneEmail(null);
      await loadAllData();
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
      const profile = await medService.loginWithGoogleUser(email, fullName, avatarUrl);
      setUser(profile);
      setIsAuthenticated(true);
      setPhoneModalInput('');
      setSkippedPhoneEmail(null);
      await loadAllData();
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
      const profile = await medService.registerUser(data);
      setUser(profile);
      setIsAuthenticated(true);
      setPhoneModalInput('');
      setSkippedPhoneEmail(null);
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
    setSkippedPhoneEmail(null);
    setPhoneModalInput('');
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
    // 1. อัปเดต state ทันที (Optimistic update) ให้การติ๊กเช็กลิสต์ตอบสนองทันทีแบบสมูท
    setTodaySchedule(prev =>
      prev.map(item =>
        item.id === scheduleId ? { ...item, isChecked } : item
      )
    );
    // 2. บันทึกข้อมูลลง storage ในเบื้องหลัง (ไม่ต้องเรียก loadAllData ซ้ำ เพื่อป้องกัน race condition ที่ทำให้สถานะเด้งไปมา)
    await medService.toggleScheduleChecked(scheduleId, isChecked, dateStr);
  };

  const confirmCheckedIntake = async (scheduleIds: string[], dateStr?: string) => {
    // Optimistic update ทันที
    setTodaySchedule(prev =>
      prev.map(item =>
        scheduleIds.includes(item.id)
          ? { ...item, isTaken: true, takenAt: new Date().toISOString() }
          : item
      )
    );
    await medService.confirmCheckedSchedules(scheduleIds, dateStr);
    await loadAllData(false);
  };

  const markTaken = async (scheduleId: string, isTaken: boolean = true, dateStr?: string) => {
    setTodaySchedule(prev =>
      prev.map(item =>
        item.id === scheduleId
          ? { ...item, isTaken, takenAt: isTaken ? new Date().toISOString() : undefined }
          : item
      )
    );
    await medService.markScheduleTaken(scheduleId, isTaken, dateStr);
    await loadAllData(false);
  };

  const postponeSchedule = async (scheduleId: string, minutes: number = 30): Promise<string | undefined> => {
    // ซ่อนการ์ดแจ้งเตือนของยานี้และการ์ดอาหารที่ต้องเลี่ยงออกจากหน้าจอทันที
    setNotifications(prev =>
      prev.filter(n => n.scheduleId !== scheduleId && !n.id.includes(scheduleId))
    );
    const updated = await medService.postponeSchedule(scheduleId, minutes);
    await loadAllData(false);
    const target = updated.find(i => i.id === scheduleId);
    return target?.time;
  };

  const skipSchedule = async (scheduleId: string) => {
    await medService.skipSchedule(scheduleId);
    await loadAllData(false);
  };

  const saveMedication = async (med: Medication) => {
    const saved = await medService.saveMedication(med);
    setMedications(prev => {
      const idx = prev.findIndex(m => m.id === saved.id || m.id === med.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    await loadAllData(false);
    return saved;
  };

  const deleteMedication = async (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setTodaySchedule(prev => prev.filter(s => s.medicationId !== id));
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

  const setAccountPassword = async (verifyInput: string, newPassword: string) => {
    const updated = await medService.setAccountPassword({ verifyInput, newPassword });
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
      Alert.alert('กรุณากรอกเบอร์โทรศัพท์', 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (อย่างน้อย 9 หลัก)');
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

      {/* Global Phone Number Modal for Accounts Without Phone Number */}
      <Modal
        visible={showMandatoryPhoneModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipPhoneModal}
      >
        <View style={phoneModalStyles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={phoneModalStyles.keyboardWrapper}
          >
            <View style={phoneModalStyles.card}>
              <View style={phoneModalStyles.iconBox}>
                <MaterialCommunityIcons name="phone-outline" size={28} color="#8B95F6" />
              </View>
              <Text style={phoneModalStyles.title}>ระบุเบอร์โทรศัพท์เพิ่มเติม</Text>
              <Text style={phoneModalStyles.subtitle}>
                ยินดีต้อนรับคุณ {user?.name || ''}{'\n'}
                บัญชี: {user?.email || ''}{'\n'}
                กรุณากรอกเบอร์โทรศัพท์เพิ่มเติม หรือกดข้ามเพื่อกรอกภายหลังที่หน้าโปรไฟล์
              </Text>

              <View style={phoneModalStyles.inputGroup}>
                <Text style={phoneModalStyles.label}>เบอร์โทรศัพท์</Text>
                <TextInput
                  style={phoneModalStyles.input}
                  placeholder="0812345678"
                  placeholderTextColor="#94A3B8"
                  value={phoneModalInput}
                  onChangeText={setPhoneModalInput}
                  keyboardType="phone-pad"
                  maxLength={15}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[
                  phoneModalStyles.primaryButton,
                  isSavingPhoneModal && phoneModalStyles.disabledButton,
                ]}
                onPress={handleSaveMandatoryPhone}
                activeOpacity={0.8}
                disabled={isSavingPhoneModal}
              >
                <Text style={phoneModalStyles.primaryButtonText}>
                  {isSavingPhoneModal ? 'กำลังบันทึกข้อมูล...' : 'บันทึกและเข้าสู่แอป'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={phoneModalStyles.skipButton}
                onPress={handleSkipPhoneModal}
                disabled={isSavingPhoneModal}
                activeOpacity={0.75}
              >
                <Text style={phoneModalStyles.skipButtonText}>ข้าม</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </AppContext.Provider>
  );
};

const phoneModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  keyboardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FAFAFC',
  },
  primaryButton: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B95F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    height: 48,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
