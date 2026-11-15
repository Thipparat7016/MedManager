import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import {
  appointmentService,
  FavoriteDoctor,
} from '@/services/appointmentService';
import {
  formatHospitalName,
  formatDepartmentName,
  toUserStorageKey,
  normalizeDoctorName,
} from '@/utils/formatUtils';

export type { FavoriteDoctor };

export const ADD_APPOINTMENT_QUICK_TIME_PRESETS = [
  { label: 'เช้า ', hour: 8, minute: 0 },
  { label: 'กลางวัน ', hour: 12, minute: 0 },
  { label: 'บ่าย ', hour: 14, minute: 0 },
  { label: 'เย็น ', hour: 16, minute: 0 },
];

const padTwoDigits = (n: number) => n.toString().padStart(2, '0');

/** Custom hook encapsulating favorite doctors storage, form state, and appointment creation. */
export function useAddAppointment() {
  const router = useRouter();
  const { user, appointments, addAppointment } = useApp();

  const favStorageKey = useMemo(() => {
    const key = toUserStorageKey(user?.email || user?.id);
    return key ? `favorite_doctors_${key}` : null;
  }, [user?.email, user?.id]);

  const now = useMemo(() => new Date(), []);

  // Favorite Doctors State
  const [favoriteDoctors, setFavoriteDoctors] = useState<FavoriteDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [saveAsFavorite, setSaveAsFavorite] = useState<boolean>(false);

  // Edit Favorite Doctor Modal State
  const [editingDoc, setEditingDoc] = useState<FavoriteDoctor | null>(null);
  const [editDocName, setEditDocName] = useState<string>('');
  const [editDocDept, setEditDocDept] = useState<string>('');
  const [editDocHosp, setEditDocHosp] = useState<string>('');
  const [showEditDocModal, setShowEditDocModal] = useState<boolean>(false);

  // Form Fields State
  const [doctorName, setDoctorName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Date State & Calendar Modal
  const [date, setDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Time State & Time Picker Modal
  const [time, setTime] = useState<string>('');
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [modalHour, setModalHour] = useState<number>(14);
  const [modalMinute, setModalMinute] = useState<number>(0);
  const [selectedQuickTime, setSelectedQuickTime] = useState<string | null>(null);

  // Load persisted favorite doctors for current user via appointmentService
  useEffect(() => {
    let active = true;
    appointmentService.getFavoriteDoctors(favStorageKey).then(list => {
      if (active) setFavoriteDoctors(list);
    });
    return () => {
      active = false;
    };
  }, [favStorageKey]);

  const handleSelectDoctor = useCallback(
    (doc: FavoriteDoctor) => {
      if (selectedDoctorId === doc.id) {
        setSelectedDoctorId(null);
        setDoctorName('');
        setDepartment('');
        setHospital('');
        setSaveAsFavorite(false);
      } else {
        setSelectedDoctorId(doc.id);
        setDoctorName(doc.name);
        setDepartment(doc.department);
        setHospital(doc.hospital);
        setSaveAsFavorite(true);
      }
    },
    [selectedDoctorId]
  );

  const handleAddNewDoctor = useCallback(() => {
    setSelectedDoctorId('new');
    setDoctorName('');
    setDepartment('');
    setHospital('');
    setSaveAsFavorite(false);
  }, []);

  const handleDoctorNameChange = useCallback(
    (txt: string) => {
      setDoctorName(txt);
      if (selectedDoctorId && selectedDoctorId !== 'new') {
        const cur = favoriteDoctors.find(d => d.id === selectedDoctorId);
        if (cur && cur.name !== txt) {
          setSelectedDoctorId(null);
          setSaveAsFavorite(false);
        }
      }
    },
    [selectedDoctorId, favoriteDoctors]
  );

  const handleDeleteFavoriteDoctor = useCallback(
    (doc: FavoriteDoctor) => {
      Alert.alert(
        'ลบแพทย์ที่ใช้บ่อย',
        `ต้องการลบ "${doc.name}" ออกจากรายการแพทย์ที่นัดประจำหรือไม่?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบ',
            style: 'destructive',
            onPress: async () => {
              const updated = favoriteDoctors.filter(d => d.id !== doc.id);
              setFavoriteDoctors(updated);
              await appointmentService.saveFavoriteDoctors(favStorageKey, updated);
              if (selectedDoctorId === doc.id) {
                setSelectedDoctorId(null);
                setDoctorName('');
                setDepartment('');
                setHospital('');
                setSaveAsFavorite(false);
              }
            },
          },
        ]
      );
    },
    [favoriteDoctors, favStorageKey, selectedDoctorId]
  );

  const handleOpenEditDoc = useCallback((doc: FavoriteDoctor) => {
    setEditingDoc(doc);
    setEditDocName(doc.name);
    setEditDocDept(doc.department);
    setEditDocHosp(doc.hospital);
    setShowEditDocModal(true);
  }, []);

  const handleSaveEditDoc = useCallback(async () => {
    if (!editingDoc || !editDocName.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อแพทย์');
      return;
    }

    const updated = favoriteDoctors.map(d =>
      d.id === editingDoc.id
        ? {
            ...d,
            name: editDocName.trim(),
            department: editDocDept.trim() || 'ตรวจสุขภาพทั่วไป',
            hospital: editDocHosp.trim() || 'โรงพยาบาล',
          }
        : d
    );
    setFavoriteDoctors(updated);
    await appointmentService.saveFavoriteDoctors(favStorageKey, updated);

    if (selectedDoctorId === editingDoc.id) {
      setDoctorName(editDocName.trim());
      setDepartment(editDocDept.trim() || 'ตรวจสุขภาพทั่วไป');
      setHospital(editDocHosp.trim() || 'โรงพยาบาล');
    }

    setShowEditDocModal(false);
    setEditingDoc(null);
  }, [editingDoc, editDocName, editDocDept, editDocHosp, favoriteDoctors, favStorageKey, selectedDoctorId]);

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

  // Duplicate check only applies when adding a new doctor manually
  const isDuplicateDoctor = useMemo(() => {
    if (isSubmitting) return false;
    if (selectedDoctorId && selectedDoctorId !== 'new') return false;

    const trimmed = doctorName.trim();
    if (!trimmed) return false;
    const normalized = normalizeDoctorName(trimmed);
    if (!normalized) return false;

    const inFavorites = favoriteDoctors.some(
      d => selectedDoctorId !== d.id && normalizeDoctorName(d.name) === normalized
    );
    const inAppointments = appointments.some(
      apt => normalizeDoctorName(apt.doctorName || '') === normalized
    );

    return inFavorites || inAppointments;
  }, [doctorName, selectedDoctorId, favoriteDoctors, appointments, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (!doctorName.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อแพทย์');
      return;
    }

    if (isDuplicateDoctor) {
      Alert.alert(
        'ชื่อแพทย์ซ้ำ',
        `มีแพทย์ชื่อ "${doctorName.trim()}" มีแพทย์ที่นัดประจำท่านนี้ในระบบแล้ว กรุณาเลือกจากรายการแพทย์ที่นัดประจำด้านบน`
      );
      return;
    }

    const finalDate =
      date ||
      `${padTwoDigits(now.getDate())}/${padTwoDigits(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
    const finalTime = time.trim() || '14:00 น.';

    const isSameSlot = appointments.some(
      apt =>
        apt.status !== 'passed' &&
        apt.date === finalDate &&
        apt.time === finalTime &&
        normalizeDoctorName(apt.doctorName || '') === normalizeDoctorName(doctorName)
    );
    if (isSameSlot) {
      Alert.alert(
        'เวลานัดหมายซ้ำ',
        `มีนัดหมายของ "${doctorName.trim()}" ในวันที่ ${finalDate} เวลา ${finalTime} แล้ว`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (saveAsFavorite && doctorName.trim()) {
        const exists = favoriteDoctors.some(
          d => normalizeDoctorName(d.name) === normalizeDoctorName(doctorName)
        );
        if (!exists) {
          const newDoc: FavoriteDoctor = {
            id: `fav-${Date.now()}`,
            name: doctorName.trim(),
            department: formatDepartmentName(department.trim() || 'ตรวจสุขภาพทั่วไป'),
            hospital: formatHospitalName(hospital.trim() || 'โรงพยาบาล'),
          };
          const updated = [...favoriteDoctors, newDoc];
          setFavoriteDoctors(updated);
          await appointmentService.saveFavoriteDoctors(favStorageKey, updated);
        }
      }

      await addAppointment({
        doctorName: doctorName.trim(),
        department: formatDepartmentName(department.trim() || 'ตรวจสุขภาพ'),
        hospital: formatHospitalName(hospital.trim() || 'โรงพยาบาล'),
        date: finalDate,
        time: finalTime,
        details: details.trim(),
        status: 'confirmed',
      });

      setSelectedDoctorId(null);
      setDoctorName('');
      setDepartment('');
      setHospital('');
      setSaveAsFavorite(false);

      Alert.alert('สำเร็จ', 'บันทึกนัดหมายแพทย์เรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => {
            router.replace('/(tabs)/appointments' as any);
          },
        },
      ]);
    } catch (err) {
      console.warn('Error saving appointment:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกนัดหมายได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    doctorName,
    isDuplicateDoctor,
    date,
    time,
    now,
    appointments,
    saveAsFavorite,
    favoriteDoctors,
    department,
    hospital,
    favStorageKey,
    addAppointment,
    details,
    router,
  ]);

  return {
    favoriteDoctors,
    selectedDoctorId,
    saveAsFavorite,
    setSaveAsFavorite,
    editDocName,
    setEditDocName,
    editDocDept,
    setEditDocDept,
    editDocHosp,
    setEditDocHosp,
    showEditDocModal,
    setShowEditDocModal,
    doctorName,
    handleDoctorNameChange,
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
    quickTimePresets: ADD_APPOINTMENT_QUICK_TIME_PRESETS,
    isDuplicateDoctor,
    handleSelectDoctor,
    handleAddNewDoctor,
    handleDeleteFavoriteDoctor,
    handleOpenEditDoc,
    handleSaveEditDoc,
    openTimeModal,
    handleSaveTime,
    handleSubmit,
    pad: padTwoDigits,
  };
}
