import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';

export default function MedicationSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { saveMedication } = useApp();

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const defaultDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear() + 543}`;

  const drugName = (params.name as string) || '';
  const drugType = (params.type as any) || 'เม็ด';
  const drugDose = (params.dosage as string) || '1';
  const drugUnit = (params.unit as string) || 'เม็ด';
  const drugNotes = (params.notes as string) || '';

  const [frequencyCount, setFrequencyCount] = useState<number>(3);
  const [frequencyType, setFrequencyType] = useState<'ทุกวัน' | 'รายสัปดาห์' | 'รายเดือน'>('ทุกวัน');
  const [timesList, setTimesList] = useState<string[]>(['08:00', '14:00', '20:00']);
  const [mealTiming, setMealTiming] = useState<'ก่อนอาหาร' | 'หลังอาหาร' | 'ก่อนนอน'>('หลังอาหาร');
  const [duration, setDuration] = useState<'ต่อเนื่อง' | 'กำหนดวัน' | 'จำนวนวัน'>('ต่อเนื่อง');
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState('ไม่จำกัด');

  // Stock tracking
  const [currentStock, setCurrentStock] = useState('30');
  const [lowStockAlert, setLowStockAlert] = useState('7');
  const [expiryDate, setExpiryDate] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTime = () => {
    if (typeof Alert.prompt === 'function') {
      Alert.prompt('เพิ่มเวลารับประทาน', 'กรอกเวลา เช่น 12:00', [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'เพิ่ม',
          onPress: (text?: string) => {
            if (text) setTimesList([...timesList, text]);
          },
        },
      ]);
    } else {
      setTimesList([...timesList, '12:00']);
    }
  };

  const handleDeleteTime = (index: number) => {
    setTimesList(timesList.filter((_, i) => i !== index));
  };

  const handleSave = async (createSchedule: boolean = true) => {
    setIsSaving(true);
    try {
      await saveMedication({
        id: `med-${Date.now()}`,
        name: drugName,
        type: drugType,
        category: drugType === 'อาหารเสริม' ? 'อาหารเสริม' : 'ยา',
        dosage: drugDose,
        unit: drugUnit,
        frequency: frequencyCount,
        remaining: parseInt(currentStock, 10) || 30,
        lowStockThreshold: parseInt(lowStockAlert, 10) || 7,
        status: 'active',
        times: timesList,
        mealTiming,
        startDate,
        endDate: duration === 'ต่อเนื่อง' ? undefined : endDate,
        instructions: drugNotes,
        precautions,
      });

      setIsSaving(false);
      router.replace({
        pathname: '/saved-success' as any,
        params: {
          name: drugName,
          dosage: drugDose,
          unit: drugUnit,
          times: timesList.join(' • '),
          remaining: currentStock,
          lowStock: lowStockAlert,
          startDate,
        },
      });
    } catch (e) {
      setIsSaving(false);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ตั้งค่าการรับประทาน" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Drug Preview Card */}
        <View style={styles.previewCard}>
          <PillIcon type={drugType} />
          <View style={styles.previewDetails}>
            <Text style={styles.previewName}>{drugName}</Text>
            <Text style={styles.previewMeta}>{drugDose}{drugUnit} • {drugType}</Text>
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

        {/* Frequency Chips */}
        <Text style={styles.sectionLabel}>ความถี่</Text>
        <View style={styles.chipsRow}>
          {(['ทุกวัน', 'รายสัปดาห์', 'รายเดือน'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, frequencyType === f && styles.chipActive]}
              onPress={() => setFrequencyType(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, frequencyType === f && styles.chipTextActive]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Times List */}
        <View style={styles.timesHeaderRow}>
          <Text style={styles.sectionLabel}>เวลารับประทาน</Text>
          <TouchableOpacity onPress={handleAddTime}>
            <Text style={styles.addTimeLink}>+ เพิ่มเวลา</Text>
          </TouchableOpacity>
        </View>

        {timesList.map((time, idx) => (
          <View key={idx} style={styles.timeItemCard}>
            <View>
              <Text style={styles.timeItemTime}>{time} น.</Text>
              <Text style={styles.timeItemDose}>1 {drugType}</Text>
            </View>
            <View style={styles.timeItemActions}>
              <TouchableOpacity
                style={styles.timeItemActionIcon}
                onPress={() => Alert.alert('แก้ไขเวลา', `แก้ไขเวลา ${time}`)}
              >
                <Feather name="edit-2" size={16} color="#8B95F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeItemActionIcon}
                onPress={() => handleDeleteTime(idx)}
              >
                <Feather name="x" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Meal Timing Chips */}
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

        {/* Duration */}
        <Text style={styles.sectionLabel}>ระยะเวลา</Text>
        <View style={styles.chipsRow}>
          {(['ต่อเนื่อง', 'กำหนดวัน', 'จำนวนวัน'] as const).map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, duration === d && styles.chipActive]}
              onPress={() => setDuration(d)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabelSmall}>วันเริ่มต้น</Text>
            <TextInput
              style={styles.smallInput}
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabelSmall}>วันสิ้นสุด</Text>
            <TextInput
              style={styles.smallInput}
              value={endDate}
              onChangeText={setEndDate}
              editable={duration !== 'ต่อเนื่อง'}
            />
          </View>
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
  previewDetails: {
    marginLeft: 14,
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
    marginBottom: 20,
  },
  counterBtn: {
    width: 40,
    height: 40,
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
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
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
    fontSize: 15,
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
    gap: 12,
  },
  timeItemActionIcon: {
    padding: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  smallInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFAFC',
  },
  stockTrackingCard: {
    backgroundColor: '#F8F9FE',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginBottom: 20,
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
});
