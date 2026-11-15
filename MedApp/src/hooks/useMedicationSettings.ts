import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { THAI_MONTHS_FULL } from '@/utils/dateUtils';
import { padTwoDigits } from '@/utils/formatUtils';
import { buildCalendarMonthCells, getDefaultTimesForFrequency } from '@/utils/scheduleUtils';

/** State and handlers for the standalone MedicationSettings screen. */
export function useMedicationSettings() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { saveMedication } = useApp();

  const now = new Date();

  const drugName = (params.name as string) || '';
  const drugCategory =
    (params.category as 'ยา' | 'อาหารเสริม') ||
    (params.type === 'อาหารเสริม' ? 'อาหารเสริม' : 'ยา');
  const drugType = (params.type as any) || 'เม็ด';
  const drugDose = (params.dosage as string) || '1';
  const drugUnit = (params.unit as string) || 'เม็ด';
  const drugNotes = (params.notes as string) || '';
  const drugImageUrl = (params.imageUrl as string) || '';

  const [frequencyCount, setFrequencyCount] = useState<number>(1);
  const [durationMode, setDurationMode] = useState<'ต่อเนื่อง' | 'กำหนดเอง' | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);

  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarTab, setCalendarTab] = useState<'week' | 'dates' | 'month'>('week');
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [selectedCalendarDates, setSelectedCalendarDates] = useState<number[]>([]);
  const [selectedMonthDates, setSelectedMonthDates] = useState<number[]>([]);
  const [customScheduleDesc, setCustomScheduleDesc] = useState<string>('');

  const [calYear, setCalYear] = useState<number>(now.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(now.getMonth());

  const [timesList, setTimesList] = useState<string[]>([]);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [modalHour, setModalHour] = useState<number>(8);
  const [modalMinute, setModalMinute] = useState<number>(0);

  const [mealTiming, setMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | 'ก่อนนอน' | null>(null);

  const [currentStock, setCurrentStock] = useState<string>('');
  const [lowStockAlert, setLowStockAlert] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [precautions, setPrecautions] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAddTime = () => {
    setEditingTimeIndex(null);
    setModalHour(8);
    setModalMinute(0);
    setShowTimeModal(true);
  };

  const handleOpenEditTime = (index: number) => {
    const target = timesList[index];
    if (target) {
      const clean = target.replace(' น.', '').trim();
      const parts = clean.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      setModalHour(!isNaN(h) ? h : 8);
      setModalMinute(!isNaN(m) ? m : 0);
    }
    setEditingTimeIndex(index);
    setShowTimeModal(true);
  };

  const handleSaveTime = () => {
    const formatted = `${padTwoDigits(modalHour)}:${padTwoDigits(modalMinute)}`;
    if (editingTimeIndex !== null) {
      const updated = [...timesList];
      updated[editingTimeIndex] = formatted;
      setTimesList(updated);
    } else if (!timesList.includes(formatted)) {
      setTimesList([...timesList, formatted].sort());
    } else {
      setTimesList([...timesList, formatted]);
    }
    setShowTimeModal(false);
  };

  const handleDeleteTime = (index: number) => {
    setTimesList(timesList.filter((_, i) => i !== index));
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const toggleWeekday = (id: string) => {
    if (selectedWeekdays.includes(id)) {
      setSelectedWeekdays(selectedWeekdays.filter(w => w !== id));
    } else {
      setSelectedWeekdays([...selectedWeekdays, id]);
    }
  };

  const toggleCalendarDate = (dateNum: number) => {
    if (selectedCalendarDates.includes(dateNum)) {
      setSelectedCalendarDates(selectedCalendarDates.filter(d => d !== dateNum));
    } else {
      setSelectedCalendarDates([...selectedCalendarDates, dateNum].sort((a, b) => a - b));
    }
  };

  const toggleMonthDate = (dayNum: number) => {
    if (selectedMonthDates.includes(dayNum)) {
      setSelectedMonthDates(selectedMonthDates.filter(d => d !== dayNum));
    } else {
      setSelectedMonthDates([...selectedMonthDates, dayNum].sort((a, b) => a - b));
    }
  };

  const handleConfirmCalendar = () => {
    let summary = '';
    if (calendarTab === 'week') {
      if (selectedWeekdays.length === 7) {
        summary = 'ทุกวัน';
      } else if (selectedWeekdays.length > 0) {
        summary = `ทุกวัน ${selectedWeekdays.join(', ')}`;
      } else {
        summary = 'ทุกวัน';
        setSelectedWeekdays(['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.']);
      }
    } else if (calendarTab === 'dates') {
      if (selectedCalendarDates.length > 0) {
        summary = `เลือก ${selectedCalendarDates.length} วัน (${THAI_MONTHS_FULL[calMonth]} ${calYear + 543})`;
      } else {
        summary = `เลือกวันที่ในเดือน ${THAI_MONTHS_FULL[calMonth]}`;
      }
    } else {
      if (selectedMonthDates.length > 0) {
        summary = `ทุกวันที่ ${selectedMonthDates.join(', ')} ของเดือน`;
      } else {
        summary = 'ทุกวันที่ 1 ของเดือน';
        setSelectedMonthDates([1]);
      }
    }
    setCustomScheduleDesc(summary);
    setDurationMode('กำหนดเอง');
    setShowCalendarModal(false);
  };

  const handleSave = async (createSchedule: boolean = true) => {
    setIsSaving(true);
    try {
      const formattedStartDate = `${padTwoDigits(now.getDate())}/${padTwoDigits(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
      let durationNote = '';
      if (durationMode === 'ต่อเนื่อง') {
        durationNote = `ต่อเนื่อง ${durationDays} วัน`;
      } else if (durationMode === 'กำหนดเอง') {
        durationNote = customScheduleDesc || 'กำหนดเอง';
      }

      const effectiveTimes = createSchedule
        ? timesList.length > 0
          ? timesList
          : getDefaultTimesForFrequency(frequencyCount)
        : [];

      await saveMedication({
        id: `med-${Date.now()}`,
        name: drugName,
        type: drugType,
        category: drugCategory,
        dosage: drugDose,
        unit: drugUnit,
        frequency: frequencyCount,
        remaining: parseInt(currentStock, 10) || 0,
        lowStockThreshold: parseInt(lowStockAlert, 10) || 0,
        status: createSchedule ? 'active' : 'inactive',
        times: effectiveTimes,
        mealTiming: mealTiming || undefined,
        startDate: formattedStartDate,
        instructions: [drugNotes, durationNote].filter(Boolean).join(' • '),
        precautions,
        imageUrl: drugImageUrl,
      });

      setIsSaving(false);
      router.replace({
        pathname: '/saved-success' as any,
        params: {
          name: drugName,
          dosage: drugDose,
          unit: drugUnit,
          times:
            effectiveTimes.length > 0
              ? effectiveTimes.map(t => `${t.replace(' น.', '')} น.`).join(' • ')
              : 'บันทึกเฉพาะข้อมูลยา (ไม่สร้างตาราง)',
          remaining: currentStock || '0',
          lowStock: lowStockAlert || '0',
          startDate: formattedStartDate,
        },
      });
    } catch {
      setIsSaving(false);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calendarCells = useMemo(
    () => buildCalendarMonthCells(calYear, calMonth),
    [calYear, calMonth]
  );

  return {
    drugName,
    drugType,
    drugDose,
    drugUnit,
    drugImageUrl,
    frequencyCount,
    setFrequencyCount,
    durationMode,
    setDurationMode,
    durationDays,
    setDurationDays,
    showCalendarModal,
    setShowCalendarModal,
    calendarTab,
    setCalendarTab,
    selectedWeekdays,
    setSelectedWeekdays,
    selectedCalendarDates,
    setSelectedCalendarDates,
    selectedMonthDates,
    setSelectedMonthDates,
    customScheduleDesc,
    calYear,
    calMonth,
    daysInMonth,
    calendarCells,
    timesList,
    showTimeModal,
    setShowTimeModal,
    editingTimeIndex,
    modalHour,
    setModalHour,
    modalMinute,
    setModalMinute,
    mealTiming,
    setMealTiming,
    currentStock,
    setCurrentStock,
    lowStockAlert,
    setLowStockAlert,
    expiryDate,
    setExpiryDate,
    precautions,
    setPrecautions,
    isSaving,
    handleOpenAddTime,
    handleOpenEditTime,
    handleSaveTime,
    handleDeleteTime,
    handlePrevMonth,
    handleNextMonth,
    toggleWeekday,
    toggleCalendarDate,
    toggleMonthDate,
    handleConfirmCalendar,
    handleSave,
  };
}
