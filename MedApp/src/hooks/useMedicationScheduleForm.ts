import { useState, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { THAI_MONTHS_FULL } from '@/utils/dateUtils';
import { padTwoDigits } from '@/utils/formatUtils';
import { MEDICATION_MEAL_TIMES, buildMonthStepDays } from '@/utils/scheduleUtils';

export interface MedicationFormErrors {
  name?: string;
  frequency?: string;
  duration?: string;
  times?: string;
  currentStock?: string;
  expiryDate?: string;
}

/** Shared schedule, time-slot modal, custom-days modal, and stock field state used by Add & Edit Medication screens. */
export function useMedicationScheduleForm() {
  const scrollViewRef = useRef<ScrollView>(null);
  const stockSectionYRef = useRef<number>(0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const [frequencyCount, setFrequencyCount] = useState<number>(1);
  const [durationMode, setDurationMode] = useState<'ทุกวัน' | 'กำหนดเอง' | null>(null);
  const [selectedMonthDates, setSelectedMonthDates] = useState<number[]>([]);
  const [showCustomDaysModal, setShowCustomDaysModal] = useState<boolean>(false);
  const [tempSelectedMonthDates, setTempSelectedMonthDates] = useState<number[]>([]);

  const [timesList, setTimesList] = useState<string[]>([]);
  const [mealTiming, setMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | null>(null);
  const [timeMealTimings, setTimeMealTimings] = useState<
    Record<string, 'ก่อนอาหาร' | 'หลังอาหาร'>
  >({});

  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [modalHour, setModalHour] = useState<number>(8);
  const [modalMinute, setModalMinute] = useState<number>(0);
  const [selectedQuickTimeId, setSelectedQuickTimeId] = useState<string | null>(null);
  const [modalMealTiming, setModalMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | null>(null);
  const [modalMealTimingError, setModalMealTimingError] = useState<string | undefined>(undefined);

  const [currentStock, setCurrentStock] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState<boolean>(false);
  const [precautions, setPrecautions] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<MedicationFormErrors>({});
  const [previewMedImage, setPreviewMedImage] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  const handleOpenAddTime = () => {
    setEditingTimeIndex(null);
    setModalHour(8);
    setModalMinute(0);
    setSelectedQuickTimeId(null);
    setModalMealTiming(null);
    setModalMealTimingError(undefined);
    setShowTimeModal(true);
  };

  const handleOpenEditTime = (index: number) => {
    const target = timesList[index];
    let savedSlotMeal: 'ก่อนอาหาร' | 'หลังอาหาร' | null = null;
    if (target) {
      const clean = target.replace(' น.', '').trim();
      const parts = clean.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const validH = !isNaN(h) ? h : 8;
      const validM = !isNaN(m) ? m : 0;
      setModalHour(validH);
      setModalMinute(validM);
      const matched = MEDICATION_MEAL_TIMES.find(meal => meal.h === validH && meal.m === validM);
      setSelectedQuickTimeId(matched ? matched.id : null);
      savedSlotMeal = timeMealTimings[clean] || mealTiming || null;
    }
    setModalMealTiming(savedSlotMeal);
    setModalMealTimingError(undefined);
    setEditingTimeIndex(index);
    setShowTimeModal(true);
  };

  const handleSaveTime = () => {
    if (!modalMealTiming) {
      setModalMealTimingError('กรุณาเลือกวิธีรับประทาน');
      return;
    }
    setModalMealTimingError(undefined);

    const formatted = `${padTwoDigits(modalHour)}:${padTwoDigits(modalMinute)}`;
    let nextTimes: string[];
    if (editingTimeIndex !== null) {
      const updated = [...timesList];
      const prevTime = updated[editingTimeIndex]?.replace(' น.', '').trim();
      updated[editingTimeIndex] = formatted;
      nextTimes = updated;
      setTimesList(nextTimes);
      setTimeMealTimings(prev => {
        const nextMap = { ...prev, [formatted]: modalMealTiming };
        if (prevTime && prevTime !== formatted && !nextTimes.includes(prevTime)) {
          delete nextMap[prevTime];
        }
        return nextMap;
      });
    } else {
      if (!timesList.includes(formatted)) {
        nextTimes = [...timesList, formatted].sort();
      } else {
        nextTimes = [...timesList, formatted];
      }
      setTimesList(nextTimes);
      setTimeMealTimings(prev => ({ ...prev, [formatted]: modalMealTiming }));
    }
    setMealTiming(modalMealTiming);
    setShowTimeModal(false);
    setFormErrors(prev => (prev.times ? { ...prev, times: undefined } : prev));
  };

  const handleDeleteTime = (index: number) => {
    const removed = timesList[index]?.replace(' น.', '').trim();
    const nextTimes = timesList.filter((_, i) => i !== index);
    setTimesList(nextTimes);
    if (removed && !nextTimes.includes(removed)) {
      setTimeMealTimings(prev => {
        const nextMap = { ...prev };
        delete nextMap[removed];
        return nextMap;
      });
    }
  };

  const handleOpenCustomDaysModal = () => {
    setTempSelectedMonthDates([...selectedMonthDates]);
    setShowCustomDaysModal(true);
  };

  const toggleTempMonthDate = (dayNum: number) => {
    if (tempSelectedMonthDates.includes(dayNum)) {
      setTempSelectedMonthDates(tempSelectedMonthDates.filter(d => d !== dayNum));
    } else {
      setTempSelectedMonthDates([...tempSelectedMonthDates, dayNum].sort((a, b) => a - b));
    }
  };

  const oddDaysList = useMemo(() => buildMonthStepDays(daysInCurrentMonth, 2), [daysInCurrentMonth]);
  const every3DaysList = useMemo(() => buildMonthStepDays(daysInCurrentMonth, 3), [daysInCurrentMonth]);

  const isOddSelected =
    tempSelectedMonthDates.length === oddDaysList.length &&
    oddDaysList.every(d => tempSelectedMonthDates.includes(d));

  const isEvery3Selected =
    tempSelectedMonthDates.length === every3DaysList.length &&
    every3DaysList.every(d => tempSelectedMonthDates.includes(d));

  const handleSelectOddDays = () => {
    setTempSelectedMonthDates(isOddSelected ? [] : [...oddDaysList]);
  };

  const handleSelectEvery3Days = () => {
    setTempSelectedMonthDates(isEvery3Selected ? [] : [...every3DaysList]);
  };

  const handleConfirmCustomDays = () => {
    setSelectedMonthDates(tempSelectedMonthDates);
    setShowCustomDaysModal(false);
    if (tempSelectedMonthDates.length > 0) {
      setFormErrors(prev => (prev.duration ? { ...prev, duration: undefined } : prev));
    }
  };

  const handleToggleDailyDuration = () => {
    const nextMode = durationMode === 'ทุกวัน' ? null : 'ทุกวัน';
    setDurationMode(nextMode);
    if (nextMode === 'ทุกวัน') {
      setFormErrors(prev => (prev.duration ? { ...prev, duration: undefined } : prev));
    }
  };

  const handleOpenCustomDuration = () => {
    setDurationMode('กำหนดเอง');
    handleOpenCustomDaysModal();
  };

  const handleCurrentStockChange = (val: string) => {
    setCurrentStock(val);
    if (val.trim()) {
      setFormErrors(prev => (prev.currentStock ? { ...prev, currentStock: undefined } : prev));
    }
  };

  const handleSelectExpiryDate = (dateVal: string) => {
    setExpiryDate(dateVal);
    if (dateVal && dateVal.trim()) {
      setFormErrors(prev => (prev.expiryDate ? { ...prev, expiryDate: undefined } : prev));
    }
  };

  const scrollToValidationErrors = (errors: MedicationFormErrors) => {
    if (errors.name || errors.frequency || errors.duration || errors.times) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, stockSectionYRef.current - 20),
        animated: true,
      });
    }
  };

  const currentMonthThaiYearLabel = `${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`;

  return {
    scrollViewRef,
    stockSectionYRef,
    now,
    currentMonth,
    currentYear,
    daysInCurrentMonth,
    currentMonthThaiYearLabel,
    frequencyCount,
    setFrequencyCount,
    durationMode,
    setDurationMode,
    selectedMonthDates,
    setSelectedMonthDates,
    showCustomDaysModal,
    setShowCustomDaysModal,
    tempSelectedMonthDates,
    setTempSelectedMonthDates,
    timesList,
    setTimesList,
    mealTiming,
    setMealTiming,
    timeMealTimings,
    setTimeMealTimings,
    showTimeModal,
    setShowTimeModal,
    editingTimeIndex,
    modalHour,
    setModalHour,
    modalMinute,
    setModalMinute,
    selectedQuickTimeId,
    setSelectedQuickTimeId,
    modalMealTiming,
    setModalMealTiming,
    modalMealTimingError,
    setModalMealTimingError,
    currentStock,
    setCurrentStock,
    expiryDate,
    setExpiryDate,
    showExpiryDatePicker,
    setShowExpiryDatePicker,
    precautions,
    setPrecautions,
    isSaving,
    setIsSaving,
    formErrors,
    setFormErrors,
    previewMedImage,
    setPreviewMedImage,
    isOddSelected,
    isEvery3Selected,
    handleOpenAddTime,
    handleOpenEditTime,
    handleSaveTime,
    handleDeleteTime,
    handleOpenCustomDaysModal,
    toggleTempMonthDate,
    handleSelectOddDays,
    handleSelectEvery3Days,
    handleConfirmCustomDays,
    handleToggleDailyDuration,
    handleOpenCustomDuration,
    handleCurrentStockChange,
    handleSelectExpiryDate,
    scrollToValidationErrors,
  };
}
