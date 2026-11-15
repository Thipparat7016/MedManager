import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import {
  THAI_MONTHS_FULL,
  THAI_WEEKDAYS_SHORT,
  parseAppointmentDateParts,
  getYearPageBase,
  buildMondayFirstMonthGrid,
} from '@/utils/dateUtils';

export type AppointmentPickerMode = 'day' | 'month' | 'year';

/** Custom hook encapsulating calendar state, date filtering, and actions for AppointmentsScreen. */
export function useAppointmentsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointments, deleteAppointment } = useApp();

  const now = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState<number>(now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());
  const [pickerMode, setPickerMode] = useState<AppointmentPickerMode>('day');
  const [yearPageStart, setYearPageStart] = useState<number>(() =>
    getYearPageBase(now.getFullYear())
  );

  // รีเซ็ตปฏิทินเป็นวันที่ปัจจุบันแบบ real-time ทุกครั้งที่กลับมาที่หน้านัดหมาย
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setSelectedDay(today.getDate());
      setPickerMode('day');
      setYearPageStart(getYearPageBase(today.getFullYear()));
    }, [])
  );

  const selectedDateApts = useMemo(() => {
    return appointments.filter(apt => {
      if (apt.status === 'passed') return false;
      const parsed = parseAppointmentDateParts(apt.date);
      if (!parsed) return false;
      return (
        parsed.day === selectedDay &&
        parsed.month === viewMonth &&
        parsed.year === viewYear
      );
    });
  }, [appointments, selectedDay, viewMonth, viewYear]);

  const pastApts = useMemo(() => {
    return appointments.filter(a => a.status === 'passed');
  }, [appointments]);

  const calendarDays = useMemo(
    () => buildMondayFirstMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const appointmentDays = useMemo(() => {
    return appointments
      .map(apt => parseAppointmentDateParts(apt.date))
      .filter((parsed): parsed is { day: number; month: number; year: number } => {
        return !!parsed && parsed.month === viewMonth && parsed.year === viewYear;
      })
      .map(p => p.day);
  }, [appointments, viewMonth, viewYear]);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert('ยืนยันการลบ', `ต้องการลบนัดหมาย "${name}" หรือไม่?`, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: () => deleteAppointment(id) },
      ]);
    },
    [deleteAppointment]
  );

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  }, [viewMonth]);

  const handleNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  }, [viewMonth]);

  const handlePrevPeriod = useCallback(() => {
    if (pickerMode === 'year') {
      setYearPageStart(prev => prev - 12);
    } else if (pickerMode === 'month') {
      setViewYear(prev => prev - 1);
    } else {
      handlePrevMonth();
    }
  }, [pickerMode, handlePrevMonth]);

  const handleNextPeriod = useCallback(() => {
    if (pickerMode === 'year') {
      setYearPageStart(prev => prev + 12);
    } else if (pickerMode === 'month') {
      setViewYear(prev => prev + 1);
    } else {
      handleNextMonth();
    }
  }, [pickerMode, handleNextMonth]);

  const openYearPicker = useCallback(() => {
    setYearPageStart(getYearPageBase(viewYear));
    setPickerMode('year');
  }, [viewYear]);

  const openMonthPicker = useCallback(() => {
    setPickerMode('month');
  }, []);

  const closePickerToDay = useCallback(() => {
    setPickerMode('day');
  }, []);

  const handleSelectYear = useCallback((yr: number) => {
    setViewYear(yr);
    setPickerMode('month');
  }, []);

  const handleSelectMonth = useCallback(
    (mIdx: number) => {
      setViewMonth(mIdx);
      const maxDay = new Date(viewYear, mIdx + 1, 0).getDate();
      if (selectedDay > maxDay) {
        setSelectedDay(maxDay);
      }
      setPickerMode('day');
    },
    [viewYear, selectedDay]
  );

  const goToAddAppointment = useCallback(() => {
    router.push('/add-appointment');
  }, [router]);

  const goToEditAppointment = useCallback(
    (id: string) => {
      router.push({
        pathname: '/edit-appointment' as any,
        params: { id },
      });
    },
    [router]
  );

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return {
    THAI_MONTHS_FULL,
    daysOfWeek: THAI_WEEKDAYS_SHORT,
    viewYear,
    viewMonth,
    selectedDay,
    setSelectedDay,
    pickerMode,
    yearPageStart,
    calendarDays,
    appointmentDays,
    selectedDateApts,
    pastApts,
    handleDelete,
    handlePrevPeriod,
    handleNextPeriod,
    openYearPicker,
    openMonthPicker,
    closePickerToDay,
    handleSelectYear,
    handleSelectMonth,
    goToAddAppointment,
    goToEditAppointment,
    topInsetPadding,
  };
}
