import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { formatCleanDrugName, isMedicationMatch } from '@/utils/interactionMatcher';

export const COMMON_SIDE_EFFECT_SYMPTOMS = [
  'คลื่นไส้',
  'อาเจียน',
  'ปวดท้อง',
  'ปวดหัว',
  'วิงเวียน',
  'ผื่นคัน',
  'หายใจหอบ',
  'ใจสั่น',
  'นอนไม่หลับ',
  'ท้องเสีย',
  'ท้องผูก',
  'ง่วงซึม',
  'แน่นหน้าอก',
  'เบื่ออาหาร',
  'ปากแห้ง / คอแห้ง',
];

export const SIDE_EFFECT_QUICK_TIME_PRESETS = [
  { label: 'เช้า (08:00)', hour: 8, minute: 0 },
  { label: 'กลางวัน (12:00)', hour: 12, minute: 0 },
  { label: 'เย็น (18:00)', hour: 18, minute: 0 },
  { label: 'ก่อนนอน (21:00)', hour: 21, minute: 0 },
];

const padTwoDigits = (n: number) => n.toString().padStart(2, '0');

/** Custom hook managing side-effect logging state, drug precautions lookup, and submission. */
export function useLogSideEffect() {
  const router = useRouter();
  const { sideEffects, addSideEffect, medications, masterMedications } = useApp();

  const initialNow = useMemo(() => new Date(), []);
  const defaultDate = `${padTwoDigits(initialNow.getDate())}/${padTwoDigits(initialNow.getMonth() + 1)}/${initialNow.getFullYear() + 543}`;
  const defaultTime = `${padTwoDigits(initialNow.getHours())}:${padTwoDigits(initialNow.getMinutes())} น.`;

  // 1. Date & Calendar State
  const [date, setDate] = useState<string>(defaultDate);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // 2. Time & Time Picker Popup State
  const [time, setTime] = useState<string>(defaultTime);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [modalHour, setModalHour] = useState<number>(initialNow.getHours());
  const [modalMinute, setModalMinute] = useState<number>(
    Math.floor(initialNow.getMinutes() / 5) * 5
  );
  const [selectedQuickTime, setSelectedQuickTime] = useState<string | null>(null);

  // 3. Related Drug Dropdown State
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [showDrugDropdown, setShowDrugDropdown] = useState<boolean>(false);

  // 4. Symptoms Dropdown State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomDropdown, setShowSymptomDropdown] = useState<boolean>(false);
  const [showCustomSymptomInput, setShowCustomSymptomInput] = useState<boolean>(false);
  const [customSymptomText, setCustomSymptomText] = useState<string>('');

  // 5. Severity & Details
  const [severity, setSeverity] = useState<'สูง' | 'กลาง' | 'ต่ำ' | null>(null);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const userDrugList = useMemo(() => {
    const list: typeof medications = [];
    const seen = new Set<string>();
    for (const m of medications) {
      const clean = formatCleanDrugName(m.name).toLowerCase();
      if (!seen.has(clean)) {
        seen.add(clean);
        list.push(m);
      }
    }
    return list;
  }, [medications]);

  const backendDrugInfo = useMemo(() => {
    if (!selectedDrug) return null;

    const userMatch = medications.find(
      m => m.name === selectedDrug || isMedicationMatch(selectedDrug, m.name)
    );
    if (userMatch?.precautions) {
      return {
        drugName: userMatch.name,
        precautions: userMatch.precautions,
      };
    }

    const masterMatch = masterMedications.find(
      m => m.name === selectedDrug || isMedicationMatch(selectedDrug, m.name)
    );
    if (masterMatch?.precautions) {
      return {
        drugName: masterMatch.name,
        precautions: masterMatch.precautions,
      };
    }

    return null;
  }, [selectedDrug, medications, masterMedications]);

  const suggestedSymptomsForDrug = useMemo(() => {
    if (!selectedDrug) return [];
    const text = (backendDrugInfo?.precautions || selectedDrug).toLowerCase();

    const matches: string[] = [];
    if (text.includes('ง่วง') || text.includes('ซึม')) matches.push('ง่วงซึม');
    if (text.includes('คลื่นไส้')) matches.push('คลื่นไส้');
    if (text.includes('อาเจียน')) matches.push('อาเจียน');
    if (text.includes('กระเพาะ') || text.includes('ปวดท้อง')) matches.push('ปวดท้อง');
    if (text.includes('ปวดหัว') || text.includes('ศีรษะ')) matches.push('ปวดหัว');
    if (text.includes('วิงเวียน')) matches.push('วิงเวียน');
    if (text.includes('ผื่น') || text.includes('คัน')) matches.push('ผื่นคัน');
    if (text.includes('ใจสั่น')) matches.push('ใจสั่น');
    if (text.includes('นอนไม่หลับ')) matches.push('นอนไม่หลับ');
    if (text.includes('ท้องเสีย')) matches.push('ท้องเสีย');
    if (text.includes('ท้องผูก')) matches.push('ท้องผูก');
    if (text.includes('ปากแห้ง') || text.includes('คอแห้ง')) matches.push('ปากแห้ง / คอแห้ง');

    if (matches.length === 0) {
      return ['ง่วงซึม', 'คลื่นไส้', 'วิงเวียน', 'ปวดท้อง'];
    }
    return Array.from(new Set(matches));
  }, [selectedDrug, backendDrugInfo]);

  const toggleSymptom = useCallback((symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  }, []);

  const handleAddCustomSymptom = useCallback(() => {
    const trimmed = customSymptomText.trim();
    if (!trimmed) return;
    setSelectedSymptoms(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCustomSymptomText('');
    setShowCustomSymptomInput(false);
  }, [customSymptomText]);

  const openTimeModal = useCallback(() => {
    const match = time.match(/(\d+):(\d+)/);
    if (match) {
      setModalHour(parseInt(match[1], 10));
      setModalMinute(parseInt(match[2], 10));
    }
    setShowTimeModal(true);
  }, [time]);

  const handleSaveTime = useCallback(() => {
    const formatted = `${padTwoDigits(modalHour)}:${padTwoDigits(modalMinute)} น.`;
    setTime(formatted);
    setShowTimeModal(false);
  }, [modalHour, modalMinute]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDrug || selectedSymptoms.length === 0) {
      Alert.alert(
        'ข้อมูลไม่ครบถ้วน',
        'กรุณาระบุยาที่เกี่ยวข้องและเลือกอาการที่พบอย่างน้อย 1 อย่าง'
      );
      return;
    }

    setIsSubmitting(true);
    await addSideEffect({
      date,
      time,
      medicationName: selectedDrug,
      symptoms: selectedSymptoms,
      severity: severity || 'กลาง',
      details,
    });
    setIsSubmitting(false);

    Alert.alert('สำเร็จ', 'บันทึกข้อมูลผลข้างเคียงเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  }, [selectedDrug, selectedSymptoms, addSideEffect, date, time, severity, details, router]);

  return {
    sideEffects,
    date,
    setDate,
    showCalendar,
    setShowCalendar,
    time,
    showTimeModal,
    setShowTimeModal,
    modalHour,
    setModalHour,
    modalMinute,
    setModalMinute,
    selectedQuickTime,
    setSelectedQuickTime,
    selectedDrug,
    setSelectedDrug,
    showDrugDropdown,
    setShowDrugDropdown,
    selectedSymptoms,
    showSymptomDropdown,
    setShowSymptomDropdown,
    showCustomSymptomInput,
    setShowCustomSymptomInput,
    customSymptomText,
    setCustomSymptomText,
    severity,
    setSeverity,
    details,
    setDetails,
    isSubmitting,
    commonSymptoms: COMMON_SIDE_EFFECT_SYMPTOMS,
    quickTimePresets: SIDE_EFFECT_QUICK_TIME_PRESETS,
    userDrugList,
    backendDrugInfo,
    suggestedSymptomsForDrug,
    toggleSymptom,
    handleAddCustomSymptom,
    openTimeModal,
    handleSaveTime,
    handleSubmit,
    pad: padTwoDigits,
  };
}
