import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import {
  formatHospitalName,
  formatDepartmentName,
  normalizeDoctorName,
} from '@/utils/formatUtils';

export const EDIT_APPOINTMENT_QUICK_TIME_PRESETS = [
  { label: 'เช้า (08:00)', hour: 8, minute: 0 },
  { label: 'กลางวัน (12:00)', hour: 12, minute: 0 },
  { label: 'บ่าย (14:00)', hour: 14, minute: 0 },
  { label: 'เย็น (16:00)', hour: 16, minute: 0 },
];

const padTwoDigits = (n: number) => n.toString().padStart(2, '0');

/** Custom hook encapsulating form state, duplicate validation, and save flow for EditAppointmentScreen. */
export function useEditAppointment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { appointments, updateAppointment } = useApp();

  const currentApt = useMemo(
    () => appointments.find(a => a.id === id),
    [appointments, id]
  );

  const now = useMemo(() => new Date(), []);

  const [doctorName, setDoctorName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [date, setDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const [time, setTime] = useState<string>('');
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [modalHour, setModalHour] = useState<number>(14);
  const [modalMinute, setModalMinute] = useState<number>(0);
  const [selectedQuickTime, setSelectedQuickTime] = useState<string | null>(null);

  // Pre-fill fields from existing appointment
  useEffect(() => {
    if (currentApt) {
      setDoctorName(currentApt.doctorName || '');
      setDepartment(currentApt.department || '');
      setHospital(currentApt.hospital || '');
      setDate(currentApt.date || '');
      setTime(currentApt.time || '');
      setDetails(currentApt.details || '');

      const match = (currentApt.time || '').match(/(\d+):(\d+)/);
      if (match) {
        setModalHour(parseInt(match[1], 10));
        setModalMinute(parseInt(match[2], 10));
      }
    }
  }, [currentApt]);

  const openTimeModal = useCallback(() => {
    const match = time.match(/(\d+):(\d+)/);
    if (match) {
      setModalHour(parseInt(match[1], 10));
      setModalMinute(parseInt(match[2], 10));
    } else {
      setModalHour(14);
      setModalMinute(0);
    }
    setSelectedQuickTime(null);
    setShowTimeModal(true);
  }, [time]);

  const handleSaveTime = useCallback(() => {
    const formatted = `${padTwoDigits(modalHour)}:${padTwoDigits(modalMinute)} น.`;
    setTime(formatted);
    setShowTimeModal(false);
  }, [modalHour, modalMinute]);

  // Check if doctor name duplicates another existing appointment
  const isDuplicateDoctor = useMemo(() => {
    const trimmed = doctorName.trim();
    if (!trimmed) return false;
    const normalized = normalizeDoctorName(trimmed);
    if (!normalized) return false;

    return appointments.some(apt => {
      if (apt.id === currentApt?.id) return false;
      const existingNorm = normalizeDoctorName(apt.doctorName || '');
      return existingNorm === normalized;
    });
  }, [doctorName, appointments, currentApt]);

  const handleSubmit = useCallback(async () => {
    if (!id || !currentApt) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลนัดหมายที่ต้องการแก้ไข');
      return;
    }

    if (!doctorName.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อแพทย์');
      return;
    }

    if (isDuplicateDoctor) {
      Alert.alert(
        'ชื่อแพทย์ซ้ำ',
        `มีนัดหมายของแพทย์ "${doctorName.trim()}" ในระบบแล้ว ไม่สามารถเปลี่ยนชื่อซ้ำกับแพทย์ท่านอื่นได้`
      );
      return;
    }

    const finalDate =
      date ||
      `${padTwoDigits(now.getDate())}/${padTwoDigits(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
    const finalTime = time.trim() || '14:00 น.';

    setIsSubmitting(true);

    await updateAppointment({
      id: currentApt.id,
      doctorName: doctorName.trim(),
      department: formatDepartmentName(department.trim() || 'ตรวจสุขภาพ'),
      hospital: formatHospitalName(hospital.trim() || 'โรงพยาบาล'),
      date: finalDate,
      time: finalTime,
      details: details.trim(),
      status: currentApt.status || 'confirmed',
    });
    setIsSubmitting(false);

    Alert.alert('สำเร็จ', 'บันทึกการแก้ไขนัดหมายเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)/appointments' as any) },
    ]);
  }, [
    id,
    currentApt,
    doctorName,
    isDuplicateDoctor,
    date,
    time,
    department,
    hospital,
    details,
    now,
    updateAppointment,
    router,
  ]);

  return {
    doctorName,
    setDoctorName,
    department,
    setDepartment,
    hospital,
    setHospital,
    details,
    setDetails,
    isSubmitting,
    date,
    setDate,
    showDatePicker,
    setShowDatePicker,
    time,
    showTimeModal,
    setShowTimeModal,
    modalHour,
    setModalHour,
    modalMinute,
    setModalMinute,
    selectedQuickTime,
    setSelectedQuickTime,
    quickTimePresets: EDIT_APPOINTMENT_QUICK_TIME_PRESETS,
    isDuplicateDoctor,
    openTimeModal,
    handleSaveTime,
    handleSubmit,
    pad: padTwoDigits,
  };
}
