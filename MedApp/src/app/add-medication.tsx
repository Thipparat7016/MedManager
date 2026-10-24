import React, { useState, useMemo, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/services/medService';
import { formatCleanDrugName, extractDrugDetails } from '@/services/interactionMatcher';
import { CalendarModal } from '@/components/ui/CalendarModal';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const MEAL_TIMES = [
  { id: 'เช้า', label: 'เช้า', h: 8, m: 0, defaultFormatted: '08:00' },
  { id: 'กลางวัน', label: 'กลางวัน', h: 12, m: 0, defaultFormatted: '12:00' },
  { id: 'เย็น', label: 'เย็น', h: 18, m: 0, defaultFormatted: '18:00' },
  { id: 'ก่อนนอน', label: 'ก่อนนอน', h: 21, m: 0, defaultFormatted: '21:00' },
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const { masterMedications, saveMedication, refreshData } = useApp();

  // Re-sync master medications from AdminMed whenever this screen is opened/focused
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Helper to resolve images (Base64 data URIs, http URLs, or local server paths)
  const resolveImageUri = (uri?: string) => {
    if (!uri) return null;
    if (uri.startsWith('data:') || uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }
    if (uri.startsWith('/')) {
      return `http://10.0.2.2:5173${uri}`;
    }
    return uri;
  };

  // 1. Medication State
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<'ยา' | 'อาหารเสริม'>('ยา');
  const [type, setType] = useState<'เม็ด' | 'แคปซูล' | 'ยาน้ำ' | string>('เม็ด');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState('เม็ด');
  const [notes, setNotes] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFromMaster, setSelectedFromMaster] = useState<string | null>(null);

  // 2. Schedule Settings State (Default null, no pre-selected option)
  const [frequencyCount, setFrequencyCount] = useState<number>(1);
  const [durationMode, setDurationMode] = useState<'ทุกวัน' | 'กำหนดเอง' | null>(null);
  const [selectedMonthDates, setSelectedMonthDates] = useState<number[]>([]);
  const [showCustomDaysModal, setShowCustomDaysModal] = useState<boolean>(false);
  const [tempSelectedMonthDates, setTempSelectedMonthDates] = useState<number[]>([]);

  // 3. Times & Meal Timing State (Default empty, no pre-selected action)
  const [timesList, setTimesList] = useState<string[]>([]);
  const [mealTiming, setMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | null>(null);

  // Time Picker Modal State (Default clean, no pre-selected quick times or meal timing)
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [modalHour, setModalHour] = useState<number>(8);
  const [modalMinute, setModalMinute] = useState<number>(0);
  const [selectedQuickTimeId, setSelectedQuickTimeId] = useState<string | null>(null);
  const [modalMealTiming, setModalMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | null>(null);

  // 4. Stock Tracking & Precautions State
  const [currentStock, setCurrentStock] = useState<string>('');
  const [lowStockAlert, setLowStockAlert] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState<boolean>(false);
  const [precautions, setPrecautions] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter master catalog by search query (matches clean name, raw formula, code, or category)
  const filteredCatalog = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) {
      return masterMedications.slice(0, 10);
    }
    return masterMedications.filter(m => {
      const cleanName = formatCleanDrugName(m.name).toLowerCase();
      const rawName = (m.name || '').toLowerCase();
      const code = (m.code || '').toLowerCase();
      const cat = (m.category || '').toLowerCase();
      const inst = (m.instructions || '').toLowerCase();
      const prec = (m.precautions || '').toLowerCase();
      return (
        cleanName.includes(q) ||
        rawName.includes(q) ||
        code.includes(q) ||
        cat.includes(q) ||
        inst.includes(q) ||
        prec.includes(q)
      );
    });
  }, [name, masterMedications]);

  // Handle selecting a master medication from the backend
  const handleSelectMasterMed = (item: Medication) => {
    const cleanName = formatCleanDrugName(item.name);

    setName(cleanName);
    setCategory((item.category as 'ยา' | 'อาหารเสริม') || 'ยา');
    setType(item.type || 'เม็ด');
    setDosage(item.dosage || '100');
    setUnit(item.unit || 'mg');

    // Do NOT auto-fill precautions or notes; leave blank for user to enter manually
    setPrecautions('');
    setNotes('');

    if (item.imageUrl) {
      setImageUri(item.imageUrl);
    } else {
      setImageUri(null);
    }
    setSelectedFromMaster(cleanName);
    setShowDropdown(false);
  };

  // Time Modal Handlers
  const handleOpenAddTime = () => {
    setEditingTimeIndex(null);
    setModalHour(8);
    setModalMinute(0);
    setSelectedQuickTimeId(null);
    setModalMealTiming(null);
    setShowTimeModal(true);
  };

  const handleOpenEditTime = (index: number) => {
    const target = timesList[index];
    if (target) {
      const clean = target.replace(' น.', '').trim();
      const parts = clean.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const validH = !isNaN(h) ? h : 8;
      const validM = !isNaN(m) ? m : 0;
      setModalHour(validH);
      setModalMinute(validM);
      const matched = MEAL_TIMES.find(meal => meal.h === validH && meal.m === validM);
      setSelectedQuickTimeId(matched ? matched.id : null);
    }
    setModalMealTiming(mealTiming);
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
    setMealTiming(modalMealTiming);
    setShowTimeModal(false);
  };

  const handleDeleteTime = (index: number) => {
    setTimesList(timesList.filter((_, i) => i !== index));
  };

  // Custom Days Modal Handlers
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

  const oddDaysList = useMemo(() => {
    const odd: number[] = [];
    for (let d = 1; d <= daysInCurrentMonth; d += 2) {
      odd.push(d);
    }
    return odd;
  }, [daysInCurrentMonth]);

  const every3DaysList = useMemo(() => {
    const every3: number[] = [];
    for (let d = 1; d <= daysInCurrentMonth; d += 3) {
      every3.push(d);
    }
    return every3;
  }, [daysInCurrentMonth]);

  const isOddSelected =
    tempSelectedMonthDates.length === oddDaysList.length &&
    oddDaysList.every(d => tempSelectedMonthDates.includes(d));

  const isEvery3Selected =
    tempSelectedMonthDates.length === every3DaysList.length &&
    every3DaysList.every(d => tempSelectedMonthDates.includes(d));

  const handleSelectOddDays = () => {
    if (isOddSelected) {
      setTempSelectedMonthDates([]);
    } else {
      setTempSelectedMonthDates([...oddDaysList]);
    }
  };

  const handleSelectEvery3Days = () => {
    if (isEvery3Selected) {
      setTempSelectedMonthDates([]);
    } else {
      setTempSelectedMonthDates([...every3DaysList]);
    }
  };

  const handleConfirmCustomDays = () => {
    setSelectedMonthDates(tempSelectedMonthDates);
    setShowCustomDaysModal(false);
  };

  // Save handler (directly saves and redirects to saved-success)
  const handleSave = async (createSchedule: boolean) => {
    if (!name.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อยาหรืออาหารเสริม');
      return;
    }

    setIsSaving(true);
    try {
      const formattedStartDate = `${now.getDate()} ${THAI_MONTHS[currentMonth]} ${currentYear + 543}`;
      let durationNote = 'ทุกวัน';
      if (durationMode === 'กำหนดเอง') {
        durationNote = selectedMonthDates.length > 0
          ? `วันที่ ${selectedMonthDates.join(', ')} ในเดือน${THAI_MONTHS[currentMonth]}`
          : 'กำหนดวันเอง';
      }

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

      const cleanMedName = formatCleanDrugName(name.trim());

      await saveMedication({
        id: `med-${Date.now()}`,
        name: cleanMedName,
        type: type as any,
        category: category,
        dosage: dosage,
        unit: unit,
        frequency: frequencyCount,
        remaining: parseInt(currentStock, 10) || 0,
        lowStockThreshold: parseInt(lowStockAlert, 10) || 0,
        status: createSchedule ? 'active' : 'inactive',
        times: effectiveTimes,
        mealTiming: mealTiming || undefined,
        startDate: formattedStartDate,
        instructions: durationNote,
        precautions: precautions.trim() || undefined,
        imageUrl: imageUri || undefined,
      });

      setIsSaving(false);
      router.replace({
        pathname: '/saved-success' as any,
        params: {
          name: cleanMedName,
          dosage: dosage,
          unit: unit,
          times: effectiveTimes.length > 0
            ? effectiveTimes.map(t => `${t} น.`).join(' • ')
            : 'บันทึกเฉพาะข้อมูลยา (ไม่สร้างตาราง)',
          remaining: currentStock || '0',
          lowStock: lowStockAlert || '0',
          startDate: formattedStartDate,
        },
      });
    } catch (e: any) {
      setIsSaving(false);
      Alert.alert('ข้อผิดพลาด', e?.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="เพิ่มยาใหม่" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ========================================================================= */}
        {/* 2. ชื่อยา / อาหารเสริม * พร้อม Dropdown / Hint ดึงจาก Backend */}
        {/* ========================================================================= */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อยา / อาหารเสริม *</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น แอสไพริน, Aspirin"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {/* Hint / Dropdown list from Backend (AdminMed) */}
          {showDropdown && filteredCatalog.length > 0 && (
            <View style={styles.masterCatalogList}>
              <View style={styles.dropdownHeaderRow}>
                <Text style={styles.masterCatalogHeader}>
                  รายการยา
                </Text>
                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                  <Text style={styles.dropdownCloseText}>ปิด</Text>
                </TouchableOpacity>
              </View>

              {filteredCatalog.map((item, idx) => {
                const itemUri = resolveImageUri(item.imageUrl);
                return (
                  <TouchableOpacity
                    key={item.id || item.name + idx}
                    style={styles.masterItemCard}
                    onPress={() => handleSelectMasterMed(item)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {itemUri ? (
                        <Image
                          source={{ uri: itemUri }}
                          style={styles.dropdownThumbImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <PillIcon type={item.type || 'เม็ด'} size={18} containerSize={36} />
                      )}
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.masterItemName} numberOfLines={1}>
                          {formatCleanDrugName(item.name)}
                        </Text>
                        <Text style={styles.masterItemMeta} numberOfLines={1}>
                          {item.category || 'ยา'} • {item.type || 'เม็ด'} • {item.dosage || ''} {item.unit || ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.masterItemCategoryBadge}>
                      <Text style={styles.masterItemCategoryText}>
                        {item.category || 'ยา'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 3. ตั้งค่าการรับประทาน (นำหน้าเดิมมาต่อลงมาในหน้าเดียว) */}
        {/* ========================================================================= */}

        {/* จำนวนต่อครั้ง (Original counter from medication-settings.tsx) */}
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

        {/* ระยะเวลา (ทุกวัน vs กำหนดเอง) */}
        <Text style={styles.sectionLabel}>ระยะเวลา</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, durationMode === 'ทุกวัน' && styles.chipActive]}
            onPress={() => setDurationMode(durationMode === 'ทุกวัน' ? null : 'ทุกวัน')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, durationMode === 'ทุกวัน' && styles.chipTextActive]}
            >
              ทุกวัน
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, durationMode === 'กำหนดเอง' && styles.chipActive]}
            onPress={() => {
              setDurationMode('กำหนดเอง');
              handleOpenCustomDaysModal();
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

        {/* ========================================================================= */}
        {/* เวลารับประทาน (แสดงรายการเวลาที่เลือก + ปุ่มเพิ่มเวลาเปิด Popup) */}
        {/* ========================================================================= */}
        <View style={styles.timesHeaderRow}>
          <Text style={styles.sectionLabel}>เวลารับประทาน</Text>
          <TouchableOpacity onPress={handleOpenAddTime} activeOpacity={0.7}>
            <Text style={styles.addTimeLink}>+ เพิ่มเวลา</Text>
          </TouchableOpacity>
        </View>

        {timesList.length > 0 &&
          timesList.map((time, idx) => (
            <View key={idx} style={styles.timeItemCard}>
              <View>
                <Text style={styles.timeItemTime}>{time} น.</Text>
                <Text style={styles.timeItemDose}>
                  {frequencyCount} {type || 'เม็ด'} {dosage ? `(${dosage} ${unit})` : ''}
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
          ))}

        {/* ========================================================================= */}
        {/* ติดตามจำนวนยาคงเหลือ (from previous medication-settings.tsx) */}
        {/* ========================================================================= */}
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
            <TouchableOpacity
              style={[styles.stockInput, { justifyContent: 'center' }]}
              onPress={() => setShowExpiryDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.stockDateText,
                  !expiryDate && styles.stockPlaceholderText,
                ]}
                numberOfLines={1}
              >
                {expiryDate || 'วัน/เดือน/ปี เช่น 31/12/2026'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* คำเตือน / ข้อควรระวัง (ไม่ auto-fill ปล่อยว่างให้ผู้ใช้พิมพ์เอง) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>คำเตือน / ข้อควรระวัง</Text>
          <TextInput
            style={styles.textArea}
            placeholder="เช่น ห้ามรับประทานพร้อมยาลดกรด..."
            placeholderTextColor="#94A3B8"
            value={precautions}
            onChangeText={setPrecautions}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons (from previous medication-settings.tsx) */}
        <TouchableOpacity
          style={[styles.savePrimaryButton, isSaving && styles.disabledBtn]}
          onPress={() => handleSave(true)}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <Text style={styles.savePrimaryButtonText}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกและสร้างตาราง ->'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveOutlineButton, isSaving && styles.disabledBtn]}
          onPress={() => handleSave(false)}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <Text style={styles.saveOutlineButtonText}>บันทึกเฉพาะข้อมูลยา</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. TIME PICKER MODAL (เวลาแนะนำจัดสมดุล 2x2 + วิธีรับประทานอยู่ด้านล่าง) */}
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
                  onPress={() => {
                    setModalHour(h => (h + 1) % 24);
                    setSelectedQuickTimeId(null);
                  }}
                >
                  <Feather name="chevron-up" size={20} color="#475569" />
                </TouchableOpacity>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{pad(modalHour)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalHour(h => (h - 1 + 24) % 24);
                    setSelectedQuickTimeId(null);
                  }}
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
                  onPress={() => {
                    setModalMinute(m => (m + 5) % 60);
                    setSelectedQuickTimeId(null);
                  }}
                >
                  <Feather name="chevron-up" size={20} color="#475569" />
                </TouchableOpacity>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{pad(modalMinute)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalMinute(m => (m - 5 + 60) % 60);
                    setSelectedQuickTimeId(null);
                  }}
                >
                  <Feather name="chevron-down" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.timeUnitSub}>นาที</Text>
              </View>
            </View>

            {/* เวลาแนะนำ: จัดให้อยู่แถวเดียวกัน พร้อมจัด layout ให้สมดุล */}
            <Text style={styles.modalSubLabel}>เวลาแนะนำ</Text>
            <View style={styles.quickTimeRow}>
              {MEAL_TIMES.map((meal) => {
                const isSelected = selectedQuickTimeId === meal.id;
                return (
                  <TouchableOpacity
                    key={meal.id}
                    style={[
                      styles.quickTimeCell,
                      isSelected && styles.quickTimeChipActive,
                    ]}
                    onPress={() => {
                      if (selectedQuickTimeId === meal.id) {
                        setSelectedQuickTimeId(null);
                      } else {
                        setSelectedQuickTimeId(meal.id);
                        setModalHour(meal.h);
                        setModalMinute(meal.m);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickTimeText,
                        isSelected && styles.quickTimeTextActive,
                      ]}
                    >
                      {meal.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* วิธีรับประทาน: ดีไซน์เดียวกับปุ่มเวลาแนะนำ จัด Layout ให้สมดุล ไม่ใหญ่เต็มหน้า */}
            <Text style={[styles.modalSubLabel, { marginTop: 10 }]}>วิธีรับประทาน</Text>
            <View style={styles.modalMealTimingRow}>
              {(['ก่อนอาหาร', 'หลังอาหาร'] as const).map((m) => {
                const isSelected = modalMealTiming === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modalMealTimingChip,
                      isSelected && styles.modalMealTimingChipActive,
                    ]}
                    onPress={() => setModalMealTiming(modalMealTiming === m ? null : m)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalMealTimingText,
                        isSelected && styles.modalMealTimingTextActive,
                      ]}
                    >
                      {m}
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
      {/* 2. CUSTOM DAYS MODAL (Popup กำหนดวัน 30/31 วัน + Hint Icon + ถังขยะต่อท้าย) */}
      {/* ========================================================================= */}
      <Modal
        visible={showCustomDaysModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomDaysModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCustomDaysModal(false)}
        >
          <Pressable style={styles.customDaysModalContainer} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>กำหนดวันรับประทานยา</Text>
                <Text style={styles.modalSubtitle}>
                  เลือกวันที่ในเดือนนี้ ({THAI_MONTHS[currentMonth]} {currentYear + 543})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCustomDaysModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* 30/31 วันในเดือนนี้: จัด 7 คอลัมน์ให้สมดุลเต็มความกว้าง modal */}
            <View style={styles.monthDaysGrid}>
              {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => {
                const isSelected = tempSelectedMonthDates.includes(d);
                return (
                  <View key={d} style={styles.monthDayCell}>
                    <TouchableOpacity
                      style={[
                        styles.monthDayChip,
                        isSelected && styles.monthDayChipActive,
                      ]}
                      onPress={() => toggleTempMonthDate(d)}
                      activeOpacity={0.7}
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
                  </View>
                );
              })}
            </View>

            {/* คำแนะนำเพิ่มเติม: สไตล์เดียวกับปุ่มเวลาแนะนำ จัด Layout ให้สมดุลเท่ากัน */}
            <Text style={[styles.modalSubLabel, { marginTop: 10 }]}>แนะนำเพิ่มเติม</Text>
            <View style={styles.quickDatesActionsRow}>
              {/* ปุ่มกินวันเว้นวันทั้งเดือน */}
              <TouchableOpacity
                style={[
                  styles.quickPresetChip,
                  isOddSelected && styles.quickPresetChipActive,
                ]}
                onPress={handleSelectOddDays}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickPresetText,
                    isOddSelected && styles.quickPresetTextActive,
                  ]}
                  numberOfLines={1}
                >
                  กินวันเว้นวัน
                </Text>
              </TouchableOpacity>

              {/* ปุ่มกิน 1 วัน เว้น 2 วัน ทั้งเดือน */}
              <TouchableOpacity
                style={[
                  styles.quickPresetChip,
                  isEvery3Selected && styles.quickPresetChipActive,
                ]}
                onPress={handleSelectEvery3Days}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickPresetText,
                    isEvery3Selected && styles.quickPresetTextActive,
                  ]}
                  numberOfLines={1}
                >
                  กิน 1 วัน เว้น 2 วัน
                </Text>
              </TouchableOpacity>

              {/* Icon ถังขยะล้างที่เลือกต่อท้าย */}
              <TouchableOpacity
                style={[
                  styles.trashChip,
                  tempSelectedMonthDates.length === 0 && { opacity: 0.4 },
                ]}
                onPress={() => setTempSelectedMonthDates([])}
                activeOpacity={0.7}
                disabled={tempSelectedMonthDates.length === 0}
              >
                <Feather name="trash-2" size={17} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCustomDaysModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmCustomDays}
              >
                <Text style={styles.modalConfirmBtnText}>ตกลง / บันทึกวัน</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. EXPIRY DATE CALENDAR MODAL */}
      {/* ========================================================================= */}
      <CalendarModal
        visible={showExpiryDatePicker}
        onClose={() => setShowExpiryDatePicker(false)}
        onSelectDate={setExpiryDate}
        initialDate={expiryDate}
        title="เลือกวันหมดอายุ"
      />
    </View>
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  photoUploadBox: {
    height: 150,
    borderRadius: 18,
    backgroundColor: '#F1F3FE',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPlaceholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoUploadPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  inputGroup: {
    marginBottom: 18,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
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

  // Dropdown List from master catalog
  masterCatalogList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  masterCatalogHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  dropdownCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B95F6',
  },
  masterItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  dropdownThumbImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  masterItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  masterItemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  masterItemCategoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  masterItemCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Stepper: Counter Row from medication-settings.tsx
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

  // Chips Row from medication-settings.tsx
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

  // Custom Schedule Summary Card on Main Screen
  customScheduleSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
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

  // Times Section from medication-settings.tsx
  timesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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

  // Stock Tracking from medication-settings.tsx
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
  stockDateText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  stockPlaceholderText: {
    color: '#94A3B8',
  },

  // Textarea from medication-settings.tsx
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

  // Save Buttons from medication-settings.tsx
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
    flex: 1,
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

  // 1-Row Grid for Meal Times in Time Modal
  quickTimeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  quickTimeCell: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Meal Timing Chips inside Time Modal (same design as quickTimeCell, not stretching full width)
  modalMealTimingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modalMealTimingChip: {
    paddingHorizontal: 20,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMealTimingChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B95F6',
  },
  modalMealTimingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  modalMealTimingTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },

  // Custom Days Modal Styles
  customDaysModalContainer: {
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
  monthDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  monthDayCell: {
    width: '14.2857%', // 100% / 7 columns edge-to-edge symmetry
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthDayChip: {
    width: 38,
    height: 38,
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

  // Quick Presets Row in Custom Days Modal (same design as quickTimeCell)
  quickDatesActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  quickPresetChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPresetChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B95F6',
  },
  quickPresetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickPresetTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  trashChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
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
