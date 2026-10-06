import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const WEEKDAYS = [
  { id: 'จ.', label: 'จันทร์', full: 'วันจันทร์', short: 'จ.' },
  { id: 'อ.', label: 'อังคาร', full: 'วันอังคาร', short: 'อ.' },
  { id: 'พ.', label: 'พุธ', full: 'วันพุธ', short: 'พ.' },
  { id: 'พฤ.', label: 'พฤหัสฯ', full: 'วันพฤหัสบดี', short: 'พฤ.' },
  { id: 'ศ.', label: 'ศุกร์', full: 'วันศุกร์', short: 'ศ.' },
  { id: 'ส.', label: 'เสาร์', full: 'วันเสาร์', short: 'ส.' },
  { id: 'อา.', label: 'อาทิตย์', full: 'วันอาทิตย์', short: 'อา.' },
];

const QUICK_TIMES = [
  { label: '07:00 (เช้าตรู่)', h: 7, m: 0 },
  { label: '08:00 (เช้า)', h: 8, m: 0 },
  { label: '12:00 (เที่ยง)', h: 12, m: 0 },
  { label: '13:00 (บ่าย)', h: 13, m: 0 },
  { label: '18:00 (เย็น)', h: 18, m: 0 },
  { label: '20:00 (ค่ำ)', h: 20, m: 0 },
  { label: '21:00 (ก่อนนอน)', h: 21, m: 0 },
];

export default function MedicationSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { saveMedication } = useApp();

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const drugName = (params.name as string) || '';
  const drugCategory = (params.category as 'ยา' | 'อาหารเสริม') || (params.type === 'อาหารเสริม' ? 'อาหารเสริม' : 'ยา');
  const drugType = (params.type as any) || 'เม็ด';
  const drugDose = (params.dosage as string) || '1';
  const drugUnit = (params.unit as string) || 'เม็ด';
  const drugNotes = (params.notes as string) || '';
  const drugImageUrl = (params.imageUrl as string) || '';

  // Default clean state (no pre-selected actions)
  const [frequencyCount, setFrequencyCount] = useState<number>(1);
  const [durationMode, setDurationMode] = useState<'ต่อเนื่อง' | 'กำหนดเอง' | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);

  // Custom Calendar Modal State
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarTab, setCalendarTab] = useState<'week' | 'dates' | 'month'>('week');
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [selectedCalendarDates, setSelectedCalendarDates] = useState<number[]>([]);
  const [selectedMonthDates, setSelectedMonthDates] = useState<number[]>([]);
  const [customScheduleDesc, setCustomScheduleDesc] = useState<string>('');

  const [calYear, setCalYear] = useState<number>(now.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(now.getMonth());

  // Times List & Time Picker Modal State
  const [timesList, setTimesList] = useState<string[]>([]);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [modalHour, setModalHour] = useState<number>(8);
  const [modalMinute, setModalMinute] = useState<number>(0);

  // Meal timing (default null: unselected)
  const [mealTiming, setMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | 'ก่อนนอน' | null>(null);

  // Stock tracking (default blank)
  const [currentStock, setCurrentStock] = useState<string>('');
  const [lowStockAlert, setLowStockAlert] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [precautions, setPrecautions] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Time Modal Handlers
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
    const formatted = `${pad(modalHour)}:${pad(modalMinute)}`;
    if (editingTimeIndex !== null) {
      const updated = [...timesList];
      updated[editingTimeIndex] = formatted;
      setTimesList(updated);
    } else {
      if (!timesList.includes(formatted)) {
        setTimesList([...timesList, formatted].sort());
      } else {
        setTimesList([...timesList, formatted]);
      }
    }
    setShowTimeModal(false);
  };

  const handleDeleteTime = (index: number) => {
    setTimesList(timesList.filter((_, i) => i !== index));
  };

  // Calendar Modal Handlers
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
        summary = `เลือก ${selectedCalendarDates.length} วัน (${THAI_MONTHS[calMonth]} ${calYear + 543})`;
      } else {
        summary = `เลือกวันที่ในเดือน ${THAI_MONTHS[calMonth]}`;
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

  // Main Save Handler
  const handleSave = async (createSchedule: boolean = true) => {
    setIsSaving(true);
    try {
      const formattedStartDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
      let durationNote = '';
      if (durationMode === 'ต่อเนื่อง') {
        durationNote = `ต่อเนื่อง ${durationDays} วัน`;
      } else if (durationMode === 'กำหนดเอง') {
        durationNote = customScheduleDesc || 'กำหนดเอง';
      }

      // If user chose "บันทึกและสร้างตาราง" (createSchedule = true):
      // If user specified times, use them.
      // If timesList is empty, automatically assign standard times based on frequencyCount!
      let effectiveTimes: string[] = [];
      if (createSchedule) {
        if (timesList.length > 0) {
          effectiveTimes = timesList;
        } else {
          switch (frequencyCount) {
            case 1:
              effectiveTimes = ['08:00'];
              break;
            case 2:
              effectiveTimes = ['08:00', '20:00'];
              break;
            case 3:
              effectiveTimes = ['08:00', '12:00', '20:00'];
              break;
            case 4:
              effectiveTimes = ['08:00', '12:00', '18:00', '21:00'];
              break;
            default:
              effectiveTimes = ['08:00'];
              break;
          }
        }
      }

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
          times: effectiveTimes.length > 0 ? effectiveTimes.map(t => `${t.replace(' น.', '')} น.`).join(' • ') : 'บันทึกเฉพาะข้อมูลยา (ไม่สร้างตาราง)',
          remaining: currentStock || '0',
          lowStock: lowStockAlert || '0',
          startDate: formattedStartDate,
        },
      });
    } catch (e) {
      setIsSaving(false);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Days grid generation for Calendar
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 is Sunday
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ตั้งค่าการรับประทาน" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Drug Preview Card */}
        <View style={styles.previewCard}>
          {drugImageUrl ? (
            <Image
              source={{ uri: drugImageUrl }}
              style={styles.previewImage}
            />
          ) : (
            <PillIcon type={drugType} />
          )}
          <View style={styles.previewDetails}>
            <Text style={styles.previewName}>{drugName || 'ยังไม่ระบุชื่อยา'}</Text>
            <Text style={styles.previewMeta}>
              {drugDose} {drugUnit} • {drugType}
            </Text>
          </View>
        </View>

        {/* Counter: Times per day */}
        <Text style={styles.sectionLabel}>จำนวนต่อครั้ง</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setFrequencyCount(Math.max(1, frequencyCount - 1))}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={18} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{frequencyCount}</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setFrequencyCount(frequencyCount + 1)}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={18} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.counterUnit}>ครั้ง / วัน</Text>
        </View>

        {/* Duration Section (Replaces Frequency) */}
        <Text style={styles.sectionLabel}>ระยะเวลา</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, durationMode === 'ต่อเนื่อง' && styles.chipActive]}
            onPress={() => setDurationMode('ต่อเนื่อง')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, durationMode === 'ต่อเนื่อง' && styles.chipTextActive]}
            >
              ต่อเนื่อง
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, durationMode === 'กำหนดเอง' && styles.chipActive]}
            onPress={() => {
              setDurationMode('กำหนดเอง');
              setShowCalendarModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, durationMode === 'กำหนดเอง' && styles.chipTextActive]}
            >
              กำหนดเอง
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continuous Duration View */}
        {durationMode === 'ต่อเนื่อง' && (
          <View style={styles.durationContinuousCard}>
            <Text style={styles.durationSubLabel}>เลือกจำนวนวันต่อเนื่อง</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setDurationDays(Math.max(1, durationDays - 1))}
                activeOpacity={0.7}
              >
                <Feather name="minus" size={18} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{durationDays}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setDurationDays(durationDays + 1)}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={18} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.counterUnit}>วัน</Text>
            </View>

            {/* Quick Day Presets */}
            <View style={styles.quickDaysRow}>
              {[3, 5, 7, 14, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.quickDayChip,
                    durationDays === days && styles.quickDayChipActive,
                  ]}
                  onPress={() => setDurationDays(days)}
                >
                  <Text
                    style={[
                      styles.quickDayText,
                      durationDays === days && styles.quickDayTextActive,
                    ]}
                  >
                    {days} วัน
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Custom Duration Summary Card */}
        {durationMode === 'กำหนดเอง' && (
          <TouchableOpacity
            style={styles.customScheduleSummaryCard}
            onPress={() => setShowCalendarModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.customScheduleLeft}>
              <View style={styles.customScheduleIconCircle}>
                <Ionicons name="calendar" size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customScheduleTitle}>กำหนดวันรับประทานยา</Text>
                <Text style={styles.customScheduleText}>
                  {customScheduleDesc || 'แตะเพื่อเลือก วัน / สัปดาห์ / เดือน'}
                </Text>
              </View>
            </View>
            <View style={styles.customScheduleEditBadge}>
              <Feather name="edit-2" size={13} color="#6366F1" />
              <Text style={styles.customScheduleEditText}>แก้ไข</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Times List Section */}
        <View style={styles.timesHeaderRow}>
          <Text style={styles.sectionLabel}>เวลารับประทาน</Text>
          <TouchableOpacity onPress={handleOpenAddTime} activeOpacity={0.7}>
            <Text style={styles.addTimeLink}>+ เพิ่มเวลา</Text>
          </TouchableOpacity>
        </View>

        {timesList.length === 0 ? (
          <View style={styles.emptyTimesBox}>
            <Feather name="clock" size={28} color="#94A3B8" />
            <Text style={styles.emptyTimesTitle}>ยังไม่ได้ระบุเวลารับประทาน</Text>
            <Text style={styles.emptyTimesSubtitle}>
              กดปุ่มด้านล่างเพื่อเพิ่มเวลาเตือนรับประทานยา
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={handleOpenAddTime}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyAddBtnText}>+ เพิ่มเวลารับประทาน</Text>
            </TouchableOpacity>
          </View>
        ) : (
          timesList.map((time, idx) => (
            <View key={idx} style={styles.timeItemCard}>
              <View>
                <Text style={styles.timeItemTime}>{time} น.</Text>
                <Text style={styles.timeItemDose}>
                  1 {drugType} ({drugDose} {drugUnit})
                </Text>
              </View>
              <View style={styles.timeItemActions}>
                <TouchableOpacity
                  style={styles.timeItemActionIcon}
                  onPress={() => handleOpenEditTime(idx)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="edit-2" size={17} color="#8B95F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeItemActionIcon}
                  onPress={() => handleDeleteTime(idx)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Meal Timing Chips (Default unselected) */}
        <Text style={styles.sectionLabel}>วิธีรับประทาน</Text>
        <View style={styles.chipsRow}>
          {(['ก่อนอาหาร', 'หลังอาหาร', 'ก่อนนอน'] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, mealTiming === m && styles.chipActive]}
              onPress={() => setMealTiming(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, mealTiming === m && styles.chipTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stock Tracking Box */}
        <View style={styles.stockTrackingCard}>
          <Text style={styles.stockTrackingTitle}>ติดตามจำนวนยาคงเหลือ</Text>

          <View style={styles.stockInputGroup}>
            <Text style={styles.stockInputLabel}>จำนวนปัจจุบัน</Text>
            <TextInput
              style={styles.stockInput}
              placeholder="เช่น 30 เม็ด"
              placeholderTextColor="#94A3B8"
              value={currentStock}
              onChangeText={setCurrentStock}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.stockInputGroup}>
            <Text style={styles.stockInputLabel}>แจ้งเตือนเมื่อเหลือ</Text>
            <TextInput
              style={styles.stockInput}
              placeholder="เช่น 7 เม็ด"
              placeholderTextColor="#94A3B8"
              value={lowStockAlert}
              onChangeText={setLowStockAlert}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.stockInputGroup}>
            <Text style={styles.stockInputLabel}>วันหมดอายุ</Text>
            <TextInput
              style={styles.stockInput}
              placeholder="วัน/เดือน/ปี"
              placeholderTextColor="#94A3B8"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
          </View>
        </View>

        {/* Warnings / Precautions Textarea */}
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>คำเตือน / ข้อควรระวัง</Text>
          <TextInput
            style={styles.textArea}
            placeholder="เช่น ห้ามรับประทานพร้อมยาชนิด..."
            placeholderTextColor="#94A3B8"
            value={precautions}
            onChangeText={setPrecautions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save and Create Schedule Button */}
        <TouchableOpacity
          style={[styles.savePrimaryButton, isSaving && styles.disabledBtn]}
          onPress={() => handleSave(true)}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <Text style={styles.savePrimaryButtonText}>บันทึกและสร้างตาราง →</Text>
        </TouchableOpacity>

        {/* Save Only Info Button */}
        <TouchableOpacity
          style={styles.saveOutlineButton}
          onPress={() => handleSave(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.saveOutlineButtonText}>บันทึกเฉพาะข้อมูลยา</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================================= */}
      {/* TIME PICKER MODAL (Add & Edit Time) */}
      {/* ========================================================================= */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimeModal(false)}
        >
          <Pressable style={styles.timeModalContainer} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTimeIndex !== null ? 'แก้ไขเวลารับประทาน' : 'เพิ่มเวลารับประทาน'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimeModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Digital Clock Display with Steppers */}
            <View style={styles.digitalClockRow}>
              {/* Hours */}
              <View style={styles.timeBoxCol}>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => setModalHour(h => (h + 1) % 24)}
                >
                  <Feather name="chevron-up" size={20} color="#475569" />
                </TouchableOpacity>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{pad(modalHour)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => setModalHour(h => (h - 1 + 24) % 24)}
                >
                  <Feather name="chevron-down" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.timeUnitSub}>ชั่วโมง</Text>
              </View>

              <Text style={styles.timeColonText}>:</Text>

              {/* Minutes */}
              <View style={styles.timeBoxCol}>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => setModalMinute(m => (m + 5) % 60)}
                >
                  <Feather name="chevron-up" size={20} color="#475569" />
                </TouchableOpacity>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{pad(modalMinute)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => setModalMinute(m => (m - 5 + 60) % 60)}
                >
                  <Feather name="chevron-down" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.timeUnitSub}>นาที</Text>
              </View>
            </View>

            {/* Quick Presets */}
            <Text style={styles.modalSubLabel}>เวลาแนะนำ</Text>
            <View style={styles.quickTimeChipsRow}>
              {QUICK_TIMES.map((qt, i) => {
                const isSelected = modalHour === qt.h && modalMinute === qt.m;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.quickTimeChip,
                      isSelected && styles.quickTimeChipActive,
                    ]}
                    onPress={() => {
                      setModalHour(qt.h);
                      setModalMinute(qt.m);
                    }}
                  >
                    <Text
                      style={[
                        styles.quickTimeText,
                        isSelected && styles.quickTimeTextActive,
                      ]}
                    >
                      {qt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalConfirmBtnText}>
                  {editingTimeIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มเวลานี้'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ========================================================================= */}
      {/* CALENDAR & RECURRENCE MODAL (Custom Dates / Weekdays / Months) */}
      {/* ========================================================================= */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCalendarModal(false)}
        >
          <Pressable style={styles.calendarModalContainer} onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>กำหนดวันรับประทานยา</Text>
                <Text style={styles.modalSubtitle}>เลือก วัน / สัปดาห์ / เดือน ที่ต้องการ</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCalendarModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Segmented Control / Tabs */}
            <View style={styles.calendarTabHeader}>
              <TouchableOpacity
                style={[styles.calTabBtn, calendarTab === 'week' && styles.calTabBtnActive]}
                onPress={() => setCalendarTab('week')}
              >
                <Text
                  style={[
                    styles.calTabBtnText,
                    calendarTab === 'week' && styles.calTabBtnTextActive,
                  ]}
                >
                  วันในสัปดาห์
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.calTabBtn, calendarTab === 'dates' && styles.calTabBtnActive]}
                onPress={() => setCalendarTab('dates')}
              >
                <Text
                  style={[
                    styles.calTabBtnText,
                    calendarTab === 'dates' && styles.calTabBtnTextActive,
                  ]}
                >
                  ปฏิทินระบุวัน
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.calTabBtn, calendarTab === 'month' && styles.calTabBtnActive]}
                onPress={() => setCalendarTab('month')}
              >
                <Text
                  style={[
                    styles.calTabBtnText,
                    calendarTab === 'month' && styles.calTabBtnTextActive,
                  ]}
                >
                  รอบประจำเดือน
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
            >
              {/* TAB 1: Weekdays */}
              {calendarTab === 'week' && (
                <View style={styles.tabContentBox}>
                  {/* Quick presets */}
                  <View style={styles.quickWeekPresetsRow}>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => setSelectedWeekdays(['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'])}
                    >
                      <Text style={styles.quickPresetText}>ทุกวัน</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => setSelectedWeekdays(['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.'])}
                    >
                      <Text style={styles.quickPresetText}>จันทร์ - ศุกร์</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => setSelectedWeekdays(['ส.', 'อา.'])}
                    >
                      <Text style={styles.quickPresetText}>เสาร์ - อาทิตย์</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => setSelectedWeekdays(['จ.', 'พ.', 'ศ.', 'อา.'])}
                    >
                      <Text style={styles.quickPresetText}>วันเว้นวัน</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day Pills */}
                  <View style={styles.weekdaysGrid}>
                    {WEEKDAYS.map(w => {
                      const isSelected = selectedWeekdays.includes(w.id);
                      return (
                        <TouchableOpacity
                          key={w.id}
                          style={[
                            styles.weekdayCard,
                            isSelected && styles.weekdayCardActive,
                          ]}
                          onPress={() => toggleWeekday(w.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.weekdayShort,
                              isSelected && styles.weekdayShortActive,
                            ]}
                          >
                            {w.short}
                          </Text>
                          <Text
                            style={[
                              styles.weekdayFull,
                              isSelected && styles.weekdayFullActive,
                            ]}
                          >
                            {w.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.calendarSelectionBanner}>
                    <Ionicons name="information-circle-outline" size={18} color="#6366F1" />
                    <Text style={styles.calendarSelectionBannerText}>
                      {selectedWeekdays.length === 0
                        ? 'ยังไม่ได้เลือกวัน (แตะเลือกวันด้านบน)'
                        : `เลือก ${selectedWeekdays.length} วัน: ${selectedWeekdays.join(', ')}`}
                    </Text>
                  </View>
                </View>
              )}

              {/* TAB 2: Specific Dates on Calendar */}
              {calendarTab === 'dates' && (
                <View style={styles.tabContentBox}>
                  {/* Month Switcher */}
                  <View style={styles.monthNavRow}>
                    <TouchableOpacity style={styles.monthNavBtn} onPress={handlePrevMonth}>
                      <Feather name="chevron-left" size={20} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.monthTitleText}>
                      {THAI_MONTHS[calMonth]} {calYear + 543}
                    </Text>
                    <TouchableOpacity style={styles.monthNavBtn} onPress={handleNextMonth}>
                      <Feather name="chevron-right" size={20} color="#1E293B" />
                    </TouchableOpacity>
                  </View>

                  {/* Calendar Days Header */}
                  <View style={styles.calGridHeader}>
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((h, i) => (
                      <Text key={i} style={styles.calGridHeaderCell}>{h}</Text>
                    ))}
                  </View>

                  {/* Calendar Dates Grid */}
                  <View style={styles.calDatesGrid}>
                    {calendarCells.map((dayNum, idx) => {
                      if (dayNum === null) {
                        return <View key={idx} style={styles.calCellEmpty} />;
                      }
                      const isSelected = selectedCalendarDates.includes(dayNum);
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={styles.calCell}
                          onPress={() => toggleCalendarDate(dayNum)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.calDayCircle,
                              isSelected && styles.calDayCircleActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.calDayText,
                                isSelected && styles.calDayTextActive,
                              ]}
                            >
                              {dayNum}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Quick Presets for Month Grid */}
                  <View style={styles.quickDatesActionsRow}>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => {
                        const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                        setSelectedCalendarDates(allDays);
                      }}
                    >
                      <Text style={styles.quickPresetText}>เลือกทั้งเดือน</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => {
                        const even = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => d % 2 === 0);
                        setSelectedCalendarDates(even);
                      }}
                    >
                      <Text style={styles.quickPresetText}>วันคู่</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => {
                        const odd = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => d % 2 !== 0);
                        setSelectedCalendarDates(odd);
                      }}
                    >
                      <Text style={styles.quickPresetText}>วันคี่</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickPresetChip}
                      onPress={() => setSelectedCalendarDates([])}
                    >
                      <Text style={[styles.quickPresetText, { color: '#EF4444' }]}>ล้างที่เลือก</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarSelectionBanner}>
                    <Ionicons name="calendar-outline" size={18} color="#6366F1" />
                    <Text style={styles.calendarSelectionBannerText}>
                      {selectedCalendarDates.length === 0
                        ? 'ยังไม่ได้เลือกวันที่ (แตะบนปฏิทินเพื่อเลือก)'
                        : `เลือกแล้ว ${selectedCalendarDates.length} วัน ในเดือน ${THAI_MONTHS[calMonth]}`}
                    </Text>
                  </View>
                </View>
              )}

              {/* TAB 3: Monthly Recurrence */}
              {calendarTab === 'month' && (
                <View style={styles.tabContentBox}>
                  {/* Presets */}
                  <View style={styles.recurringPresetsCol}>
                    {[
                      { label: 'ทุกวันที่ 1 ของเดือน', days: [1] },
                      { label: 'ทุกวันที่ 1 และ 16 ของเดือน (ต้นเดือน/กลางเดือน)', days: [1, 16] },
                      { label: 'ทุกวันที่ 15 และ สิ้นเดือน (30)', days: [15, 30] },
                      { label: 'ทุกวันสิ้นเดือน (30)', days: [30] },
                    ].map((item, i) => {
                      const isMatch =
                        selectedMonthDates.length === item.days.length &&
                        item.days.every(d => selectedMonthDates.includes(d));
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.recurringPresetCard,
                            isMatch && styles.recurringPresetCardActive,
                          ]}
                          onPress={() => setSelectedMonthDates(item.days)}
                        >
                          <Ionicons
                            name={isMatch ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={isMatch ? '#6366F1' : '#94A3B8'}
                          />
                          <Text
                            style={[
                              styles.recurringPresetText,
                              isMatch && styles.recurringPresetTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.modalSubLabel, { marginTop: 14 }]}>
                    หรือเลือกวันที่ระบุในแต่ละเดือน (1 - 31):
                  </Text>
                  <View style={styles.monthDaysGrid}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                      const isSelected = selectedMonthDates.includes(d);
                      return (
                        <TouchableOpacity
                          key={d}
                          style={[
                            styles.monthDayChip,
                            isSelected && styles.monthDayChipActive,
                          ]}
                          onPress={() => toggleMonthDate(d)}
                        >
                          <Text
                            style={[
                              styles.monthDayText,
                              isSelected && styles.monthDayTextActive,
                            ]}
                          >
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.calendarSelectionBanner}>
                    <Ionicons name="repeat-outline" size={18} color="#6366F1" />
                    <Text style={styles.calendarSelectionBannerText}>
                      {selectedMonthDates.length === 0
                        ? 'ยังไม่ได้เลือกวัน'
                        : `แจ้งเตือนทุกวันที่ ${selectedMonthDates.join(', ')} ของทุกเดือน`}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCalendarModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmCalendar}
              >
                <Text style={styles.modalConfirmBtnText}>ตกลง / บันทึกวัน</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 16,
    marginBottom: 20,
  },
  previewImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  previewDetails: {
    marginLeft: 14,
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginHorizontal: 16,
  },
  counterUnit: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chipActive: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  durationContinuousCard: {
    backgroundColor: '#F8F9FE',
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  durationSubLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  quickDaysRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickDayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  quickDayChipActive: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  quickDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customScheduleSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  customScheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  customScheduleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customScheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  customScheduleText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 2,
  },
  customScheduleEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginLeft: 8,
  },
  customScheduleEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  timesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addTimeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B95F6',
  },
  emptyTimesBox: {
    backgroundColor: '#FAFAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTimesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptyTimesSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyAddBtn: {
    marginTop: 12,
    backgroundColor: '#8B95F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  timeItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: '#EEF0F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  timeItemTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeItemDose: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  timeItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timeItemActionIcon: {
    padding: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  stockTrackingCard: {
    backgroundColor: '#F8F9FE',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  stockTrackingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  stockInputGroup: {
    marginBottom: 12,
  },
  stockInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  stockInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    height: 90,
    backgroundColor: '#FAFAFC',
  },
  savePrimaryButton: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  savePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveOutlineButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  saveOutlineButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalSubLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#8B95F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Time Modal Styles
  timeModalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  digitalClockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  timeBoxCol: {
    alignItems: 'center',
  },
  timeStepBtn: {
    padding: 6,
  },
  timeDigitBox: {
    width: 72,
    height: 64,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigitText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeColonText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#64748B',
    marginHorizontal: 12,
    marginTop: -16,
  },
  timeUnitSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  quickTimeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  quickTimeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  quickTimeChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B95F6',
  },
  quickTimeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  quickTimeTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },

  // Calendar Modal Styles
  calendarModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  calendarTabHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  calTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  calTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  calTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calTabBtnTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  tabContentBox: {
    paddingVertical: 4,
  },
  quickWeekPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  quickPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPresetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  weekdaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  weekdayCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  weekdayCardActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B95F6',
  },
  weekdayShort: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  weekdayShortActive: {
    backgroundColor: '#8B95F6',
    color: '#FFFFFF',
  },
  weekdayFull: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  weekdayFullActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  calGridHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calGridHeaderCell: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calDatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  calCellEmpty: {
    width: '14.28%',
    height: 36,
  },
  calCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayCircleActive: {
    backgroundColor: '#8B95F6',
  },
  calDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  calDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  quickDatesActionsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  recurringPresetsCol: {
    gap: 8,
    marginBottom: 10,
  },
  recurringPresetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  recurringPresetCardActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B95F6',
  },
  recurringPresetText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  recurringPresetTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  monthDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  monthDayChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayChipActive: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  monthDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  monthDayTextActive: {
    color: '#FFFFFF',
  },
  calendarSelectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  calendarSelectionBannerText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    flex: 1,
  },
});
