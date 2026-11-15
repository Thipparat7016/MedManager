import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/utils/types';
import { formatCleanDrugName } from '@/utils/interactionMatcher';
import { THAI_MONTHS_FULL } from '@/utils/dateUtils';
import {
  getMedicationDurationMode,
  extractCustomDaysFromMedication,
  filterMasterMedications,
} from '@/utils/scheduleUtils';
import { useMedicationScheduleForm, MedicationFormErrors } from './useMedicationScheduleForm';

/** State, record hydration, catalog lookup, and save/cancel handlers for EditMedicationScreen. */
export function useEditMedication() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initializedIdRef = useRef<string | null>(null);
  const { medications, masterMedications, saveMedication, refreshData } = useApp();
  const scheduleForm = useMedicationScheduleForm();

  const medId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const existingMed = useMemo(() => medications.find(m => m.id === medId), [medications, medId]);

  useFocusEffect(
    useCallback(() => {
      initializedIdRef.current = null;
      refreshData();
      return () => {
        initializedIdRef.current = null;
      };
    }, [refreshData])
  );

  const [name, setName] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<'ยา' | 'อาหารเสริม'>('ยา');
  const [type, setType] = useState<'เม็ด' | 'แคปซูล' | 'ยาน้ำ' | string>('เม็ด');
  const [dosage, setDosage] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Hydrate form fields from the saved medication once loaded
  useEffect(() => {
    if (!existingMed) return;
    if (initializedIdRef.current === existingMed.id) return;
    initializedIdRef.current = existingMed.id;

    setName(formatCleanDrugName(existingMed.name) || '');
    setImageUri(existingMed.imageUrl || null);
    setCategory(existingMed.category || 'ยา');
    setType(existingMed.type || 'เม็ด');
    setDosage(existingMed.dosage ?? '');
    setUnit(existingMed.unit ?? '');
    scheduleForm.setFrequencyCount(
      existingMed.frequency && existingMed.frequency >= 1 ? existingMed.frequency : 1
    );

    const savedDurationMode =
      existingMed.status === 'inactive' && !existingMed.durationMode
        ? null
        : getMedicationDurationMode(existingMed);
    scheduleForm.setDurationMode(savedDurationMode);
    scheduleForm.setSelectedMonthDates(extractCustomDaysFromMedication(existingMed));

    const savedTimes = Array.isArray(existingMed.times)
      ? existingMed.times.map(t => t.replace(' น.', '').trim()).filter(Boolean)
      : [];
    scheduleForm.setTimesList(savedTimes);

    if (existingMed.mealTiming === 'ก่อนอาหาร' || existingMed.mealTiming === 'หลังอาหาร') {
      scheduleForm.setMealTiming(existingMed.mealTiming);
    } else {
      scheduleForm.setMealTiming(null);
    }

    if (existingMed.timeMealTimings && typeof existingMed.timeMealTimings === 'object') {
      scheduleForm.setTimeMealTimings({ ...existingMed.timeMealTimings });
    } else if (
      existingMed.mealTiming === 'ก่อนอาหาร' ||
      existingMed.mealTiming === 'หลังอาหาร'
    ) {
      const fallbackMap: Record<string, 'ก่อนอาหาร' | 'หลังอาหาร'> = {};
      savedTimes.forEach(t => {
        fallbackMap[t] = existingMed.mealTiming as 'ก่อนอาหาร' | 'หลังอาหาร';
      });
      scheduleForm.setTimeMealTimings(fallbackMap);
    } else {
      scheduleForm.setTimeMealTimings({});
    }

    scheduleForm.setCurrentStock(
      existingMed.remaining !== undefined && existingMed.remaining !== null
        ? String(existingMed.remaining)
        : ''
    );
    scheduleForm.setExpiryDate(existingMed.expiryDate || '');
    scheduleForm.setPrecautions(existingMed.precautions || '');
  }, [existingMed]);

  const filteredCatalog = useMemo(
    () => filterMasterMedications(masterMedications, name, formatCleanDrugName),
    [name, masterMedications]
  );

  const handleNameChange = (text: string) => {
    setName(text);
    setShowDropdown(true);
    if (text.trim()) {
      scheduleForm.setFormErrors(prev => (prev.name ? { ...prev, name: undefined } : prev));
    }
  };

  const handleSelectMasterMed = (item: Medication) => {
    const cleanName = formatCleanDrugName(item.name);
    setName(cleanName);
    setCategory((item.category as 'ยา' | 'อาหารเสริม') || 'ยา');
    setType(item.type || 'เม็ด');
    setDosage(item.dosage ?? '');
    setUnit(item.unit ?? '');
    setImageUri(item.imageUrl || null);
    setShowDropdown(false);
    scheduleForm.setFormErrors(prev => (prev.name ? { ...prev, name: undefined } : prev));
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/medications');
    }
  };

  const handleSave = async () => {
    const newErrors: MedicationFormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'กรุณากรอกหรือเลือกชื่อยา / อาหารเสริม';
    }
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
        newErrors.times = 'กรุณากดแก้ไขเวลาเพื่อเลือกวิธีรับประทาน (ก่อนอาหาร / หลังอาหาร)';
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
      const formattedStartDate =
        existingMed?.startDate ||
        `${scheduleForm.now.getDate()} ${THAI_MONTHS_FULL[scheduleForm.currentMonth]} ${scheduleForm.currentYear + 543}`;

      let durationNote = 'ทุกวัน';
      if (scheduleForm.durationMode === 'กำหนดเอง') {
        durationNote =
          scheduleForm.selectedMonthDates.length > 0
            ? `วันที่ ${scheduleForm.selectedMonthDates.join(', ')} ในเดือน${THAI_MONTHS_FULL[scheduleForm.currentMonth]}`
            : 'กำหนดวันเอง';
      }

      const effectiveTimes = [...scheduleForm.timesList];
      const cleanMedName = formatCleanDrugName(name.trim());
      const validRemaining = parsedRemaining;
      const primaryMealTiming =
        (effectiveTimes.length > 0 && scheduleForm.timeMealTimings[effectiveTimes[0]]) ||
        scheduleForm.mealTiming ||
        undefined;

      await saveMedication({
        ...(existingMed || {}),
        id: existingMed?.id || medId || `med-${Date.now()}`,
        name: cleanMedName,
        type: type as any,
        category,
        dosage,
        unit,
        frequency: scheduleForm.frequencyCount,
        remaining: validRemaining,
        lowStockThreshold: undefined,
        expiryDate: scheduleForm.expiryDate.trim(),
        durationMode: scheduleForm.durationMode || undefined,
        customDays:
          scheduleForm.durationMode === 'กำหนดเอง' ? scheduleForm.selectedMonthDates : undefined,
        status: 'active',
        times: effectiveTimes,
        mealTiming: primaryMealTiming,
        timeMealTimings:
          Object.keys(scheduleForm.timeMealTimings).length > 0
            ? scheduleForm.timeMealTimings
            : undefined,
        startDate: formattedStartDate,
        createdAt:
          existingMed?.status === 'inactive' || !existingMed?.createdAt
            ? new Date().toISOString()
            : existingMed.createdAt,
        instructions: durationNote,
        precautions: scheduleForm.precautions.trim() || undefined,
        imageUrl: imageUri || undefined,
      });

      scheduleForm.setIsSaving(false);
      router.replace('/(tabs)/medications');
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
    showDropdown,
    setShowDropdown,
    filteredCatalog,
    handleNameChange,
    handleSelectMasterMed,
    handleCancel,
    handleSave,
  };
}
