import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/utils/types';
import { formatCleanDrugName, cleanDrugText } from '@/utils/interactionMatcher';
import { THAI_MONTHS_FULL } from '@/utils/dateUtils';
import { filterMasterMedications } from '@/utils/scheduleUtils';
import { useMedicationScheduleForm, MedicationFormErrors } from './useMedicationScheduleForm';

/** State, master catalog filtering, duplicate checks, and save handler for AddMedicationScreen. */
export function useAddMedication() {
  const router = useRouter();
  const { medications, masterMedications, saveMedication, refreshData } = useApp();
  const scheduleForm = useMedicationScheduleForm();

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<'ยา' | 'อาหารเสริม'>('ยา');
  const [type, setType] = useState<'เม็ด' | 'แคปซูล' | 'ยาน้ำ' | string>('เม็ด');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState('เม็ด');
  const [notes, setNotes] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCatalog = useMemo(
    () => filterMasterMedications(masterMedications, name, formatCleanDrugName),
    [name, masterMedications]
  );

  const isMedAlreadyAdded = useCallback(
    (drugName?: string) => {
      if (!drugName) return false;
      const target = cleanDrugText(formatCleanDrugName(drugName));
      if (!target) return false;
      return medications.some(m => cleanDrugText(formatCleanDrugName(m.name)) === target);
    },
    [medications]
  );

  const handleNameChange = (text: string) => {
    setName(text);
    setShowDropdown(true);
    if (text.trim()) {
      if (isMedAlreadyAdded(text)) {
        scheduleForm.setFormErrors(prev => ({
          ...prev,
          name: 'คุณมียานี้ใน "ยาของฉัน" แล้ว หากต้องการเพิ่มจำนวนหรือแก้ไขข้อมูล กรุณาไปที่ปุ่มแก้ไข',
        }));
      } else {
        scheduleForm.setFormErrors(prev => (prev.name ? { ...prev, name: undefined } : prev));
      }
    } else {
      scheduleForm.setFormErrors(prev => (prev.name ? { ...prev, name: undefined } : prev));
    }
  };

  const handleSelectMasterMed = (item: Medication) => {
    const cleanName = formatCleanDrugName(item.name);

    if (isMedAlreadyAdded(item.name)) {
      setShowDropdown(false);
      scheduleForm.setFormErrors(prev => ({
        ...prev,
        name: `คุณมียา "${cleanName}" ใน "ยาของฉัน" แล้ว หากต้องการเพิ่มจำนวนหรือแก้ไขข้อมูล กรุณาไปที่ปุ่มแก้ไข`,
      }));
      Alert.alert(
        'มียานี้ในระบบแล้ว',
        `คุณได้เพิ่มยา "${cleanName}" ในรายการ "ยาของฉัน" แล้ว\nหากต้องการเพิ่มจำนวนยาหรือแก้ไขข้อมูล กรุณาไปทำที่ปุ่ม "แก้ไข" ในหน้ารายการยา`
      );
      return;
    }

    setName(cleanName);
    setCategory((item.category as 'ยา' | 'อาหารเสริม') || 'ยา');
    setType(item.type || 'เม็ด');
    setDosage(item.dosage || '100');
    setUnit(item.unit || 'mg');

    // Do NOT auto-fill precautions or notes; leave blank for user to enter manually
    scheduleForm.setPrecautions('');
    setNotes('');
    setImageUri(item.imageUrl || null);
    setShowDropdown(false);
    scheduleForm.setFormErrors(prev => (prev.name ? { ...prev, name: undefined } : prev));
  };

  const handleSave = async (createSchedule: boolean) => {
    const newErrors: MedicationFormErrors = {};
    const cleanMedName = formatCleanDrugName(name.trim());

    if (!name.trim()) {
      newErrors.name = 'กรุณากรอกหรือเลือกชื่อยา / อาหารเสริม';
    } else if (isMedAlreadyAdded(cleanMedName)) {
      newErrors.name =
        'คุณมียานี้ใน "ยาของฉัน" แล้ว หากต้องการเพิ่มจำนวนหรือแก้ไขข้อมูล กรุณาไปที่ปุ่มแก้ไข';
      scheduleForm.setFormErrors(newErrors);
      scheduleForm.scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert(
        'ไม่สามารถเพิ่มยาซ้ำได้',
        `คุณมียา "${cleanMedName}" ในรายการ "ยาของฉัน" แล้ว\nหากต้องการเพิ่มจำนวนยาหรือแก้ไขข้อมูล กรุณาไปทำที่ปุ่ม "แก้ไข" ในหน้ารายการยา`
      );
      return;
    }

    if (createSchedule) {
      if (!scheduleForm.frequencyCount || scheduleForm.frequencyCount < 1) {
        newErrors.frequency = 'กรุณาเลือกจำนวนต่อครั้ง';
      }
      if (!scheduleForm.durationMode) {
        newErrors.duration = 'กรุณาเลือกระยะเวลา';
      } else if (
        scheduleForm.durationMode === 'กำหนดเอง' &&
        scheduleForm.selectedMonthDates.length === 0
      ) {
        newErrors.duration = 'กรุณาเลือกวันที่รับประทานยาอย่างน้อย 1 วัน';
      }
      if (scheduleForm.timesList.length === 0) {
        newErrors.times = 'กรุณาเลือกเวลารับประทานยาอย่างน้อย 1 เวลา';
      } else {
        const missingMeal = scheduleForm.timesList.some(t => {
          const clean = t.replace(' น.', '').trim();
          return !scheduleForm.timeMealTimings[clean] && !scheduleForm.mealTiming;
        });
        if (missingMeal) {
          newErrors.times = 'กรุณาเลือกวิธีรับประทาน (ก่อนอาหาร / หลังอาหาร)';
        }
      }
    }

    const trimmedStock = scheduleForm.currentStock.trim();
    const parsedRemaining = trimmedStock !== '' ? parseInt(trimmedStock, 10) : NaN;
    if (trimmedStock === '' || isNaN(parsedRemaining) || parsedRemaining < 0) {
      newErrors.currentStock = 'กรุณากรอกจำนวนปัจจุบัน';
    }

    if (!scheduleForm.expiryDate.trim()) {
      newErrors.expiryDate = 'กรุณาเลือกวันหมดอายุ';
    }

    if (Object.keys(newErrors).length > 0) {
      scheduleForm.setFormErrors(newErrors);
      scheduleForm.scrollToValidationErrors(newErrors);
      return;
    }
    scheduleForm.setFormErrors({});

    scheduleForm.setIsSaving(true);
    try {
      const formattedStartDate = `${scheduleForm.now.getDate()} ${THAI_MONTHS_FULL[scheduleForm.currentMonth]} ${scheduleForm.currentYear + 543}`;
      let durationNote = createSchedule ? 'ทุกวัน' : 'บันทึกเฉพาะข้อมูลยา';
      if (scheduleForm.durationMode === 'ทุกวัน') {
        durationNote = 'ทุกวัน';
      } else if (scheduleForm.durationMode === 'กำหนดเอง') {
        durationNote =
          scheduleForm.selectedMonthDates.length > 0
            ? `วันที่ ${scheduleForm.selectedMonthDates.join(', ')} ในเดือน${THAI_MONTHS_FULL[scheduleForm.currentMonth]}`
            : 'กำหนดวันเอง';
      }

      const effectiveTimes = [...scheduleForm.timesList];
      const validRemaining = parsedRemaining;
      const primaryMealTiming =
        (effectiveTimes.length > 0 && scheduleForm.timeMealTimings[effectiveTimes[0]]) ||
        scheduleForm.mealTiming ||
        undefined;

      await saveMedication({
        id: `med-${Date.now()}`,
        name: cleanMedName,
        type: type as any,
        category,
        dosage,
        unit,
        frequency: scheduleForm.frequencyCount || 1,
        remaining: validRemaining,
        expiryDate: scheduleForm.expiryDate.trim(),
        durationMode: scheduleForm.durationMode || undefined,
        customDays:
          scheduleForm.durationMode === 'กำหนดเอง' ? scheduleForm.selectedMonthDates : undefined,
        status: createSchedule ? 'active' : 'inactive',
        times: effectiveTimes,
        mealTiming: primaryMealTiming,
        timeMealTimings:
          Object.keys(scheduleForm.timeMealTimings).length > 0
            ? scheduleForm.timeMealTimings
            : undefined,
        startDate: formattedStartDate,
        createdAt: new Date().toISOString(),
        instructions: durationNote,
        precautions: scheduleForm.precautions.trim() || undefined,
        imageUrl: imageUri || undefined,
      });

      scheduleForm.setIsSaving(false);
      router.replace({
        pathname: '/saved-success' as any,
        params: {
          name: cleanMedName,
          dosage,
          unit,
          times: createSchedule
            ? effectiveTimes.map(t => `${t} น.`).join(' • ')
            : 'บันทึกเฉพาะข้อมูลยา (ไม่สร้างตาราง)',
          remaining: validRemaining !== undefined ? String(validRemaining) : '',
          lowStock: '',
          startDate: formattedStartDate,
          duration: durationNote,
        },
      });
    } catch (e: any) {
      scheduleForm.setIsSaving(false);
      Alert.alert('ข้อผิดพลาด', e?.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return {
    ...scheduleForm,
    name,
    type,
    dosage,
    unit,
    notes,
    showDropdown,
    setShowDropdown,
    filteredCatalog,
    isMedAlreadyAdded,
    handleNameChange,
    handleSelectMasterMed,
    handleSave,
  };
}
