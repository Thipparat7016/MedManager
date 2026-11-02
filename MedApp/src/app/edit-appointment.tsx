import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { CalendarModal } from '@/components/ui/CalendarModal';
import { useApp } from '@/context/AppContext';
import { formatHospitalName, formatDepartmentName } from '@/services/medService';

// Helper to normalize Thai doctor names for duplicate detection (removes title prefixes and collapses spaces)
const normalizeDoctorName = (name: string): string => {
  return name
    .trim()
    .replace(/^(นพ\.|พญ\.|ทพ\.|ทพญ\.|ดร\.|นพ|พญ|ทพ|ทพญ|ดร)\s*/i, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

export default function EditAppointmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { appointments, updateAppointment } = useApp();

  const currentApt = useMemo(
    () => appointments.find(a => a.id === id),
    [appointments, id]
  );

  const now = useMemo(() => new Date(), []);
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Form Fields State (เฉพาะข้อมูลของแพทย์และนัดหมายที่กำลังแก้ไข)
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

  const quickTimePresets = [
    { label: 'เช้า (08:00)', hour: 8, minute: 0 },
    { label: 'กลางวัน (12:00)', hour: 12, minute: 0 },
    { label: 'บ่าย (14:00)', hour: 14, minute: 0 },
    { label: 'เย็น (16:00)', hour: 16, minute: 0 },
  ];

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

  const handleSaveTime = () => {
    const formatted = `${pad(modalHour)}:${pad(modalMinute)} น.`;
    setTime(formatted);
    setShowTimeModal(false);
  };

  // Check if doctor name (both first and last name) duplicates another existing appointment
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

  const handleSubmit = async () => {
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
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="แก้ไขนัดหมาย" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Doctor Details Form */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อแพทย์</Text>
          <TextInput
            style={[styles.input, isDuplicateDoctor && styles.inputError]}
            placeholder="เช่น นพ. สมศักดิ์ วิทยากรณ์"
            placeholderTextColor="#94A3B8"
            value={doctorName}
            onChangeText={setDoctorName}
          />
          {isDuplicateDoctor && (
            <Text style={styles.duplicateWarningText}>
              * มีนัดหมายของแพทย์ท่านนี้ในระบบแล้ว ไม่สามารถเปลี่ยนชื่อซ้ำได้
            </Text>
          )}
        </View>

        {/* แผนก & โรงพยาบาล */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>แผนก</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น อายุรกรรมทั่วไป"
              placeholderTextColor="#94A3B8"
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>โรงพยาบาล</Text>
            <TextInput
              style={styles.input}
              placeholder="โรงพยาบาล A"
              placeholderTextColor="#94A3B8"
              value={hospital}
              onChangeText={setHospital}
            />
          </View>
        </View>

        {/* วันที่นัดหมาย & เวลานัดหมาย */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>วันที่นัดหมาย</Text>
            <TouchableOpacity
              style={styles.pickerInputBox}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerInputText,
                  !date && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {date || 'วว/ดด/ปปปป'}
              </Text>
              <Feather name="calendar" size={18} color="#6FA07E" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>เวลานัดหมาย</Text>
            <TouchableOpacity
              style={styles.pickerInputBox}
              onPress={() => {
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
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerInputText,
                  !time && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {time || '14:00 น.'}
              </Text>
              <Feather name="clock" size={18} color="#6FA07E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* รายละเอียด / การเตรียมตัว */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>รายละเอียด / การเตรียมตัว</Text>
          <TextInput
            style={styles.textArea}
            placeholder="เช่น ตรวจเบาหวานประจำปี-งดน้ำและอาหาร..."
            placeholderTextColor="#94A3B8"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.saveBtnText}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setDate}
        initialDate={date}
        title="เลือกวันที่นัดหมาย"
      />

      {/* Time Picker Modal */}
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
              <Text style={styles.modalTitle}>เลือกเวลานัดหมาย</Text>
              <TouchableOpacity
                onPress={() => setShowTimeModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Digital Clock Steppers */}
            <View style={styles.digitalClockRow}>
              {/* Hours */}
              <View style={styles.timeBoxCol}>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalHour(h => (h + 1) % 24);
                    setSelectedQuickTime(null);
                  }}
                  activeOpacity={0.6}
                >
                  <Feather name="chevron-up" size={22} color="#275238" />
                </TouchableOpacity>

                <View style={styles.digitalBox}>
                  <Text style={styles.digitalText}>{pad(modalHour)}</Text>
                  <Text style={styles.digitalUnit}>ชั่วโมง</Text>
                </View>

                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalHour(h => (h - 1 + 24) % 24);
                    setSelectedQuickTime(null);
                  }}
                  activeOpacity={0.6}
                >
                  <Feather name="chevron-down" size={22} color="#275238" />
                </TouchableOpacity>
              </View>

              <Text style={styles.digitalColon}>:</Text>

              {/* Minutes */}
              <View style={styles.timeBoxCol}>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalMinute(m => (m + 5) % 60);
                    setSelectedQuickTime(null);
                  }}
                  activeOpacity={0.6}
                >
                  <Feather name="chevron-up" size={22} color="#275238" />
                </TouchableOpacity>

                <View style={styles.digitalBox}>
                  <Text style={styles.digitalText}>{pad(modalMinute)}</Text>
                  <Text style={styles.digitalUnit}>นาที</Text>
                </View>

                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalMinute(m => (m - 5 + 60) % 60);
                    setSelectedQuickTime(null);
                  }}
                  activeOpacity={0.6}
                >
                  <Feather name="chevron-down" size={22} color="#275238" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Presets */}
            <View style={styles.quickTimeSection}>
              <Text style={styles.quickTimeTitle}>ช่วงเวลาแนะนำ</Text>
              <View style={styles.quickTimeGrid}>
                {quickTimePresets.map(preset => {
                  const isMatch = selectedQuickTime === preset.label;

                  return (
                    <TouchableOpacity
                      key={preset.label}
                      style={[
                        styles.quickTimeChip,
                        isMatch && styles.quickTimeChipActive,
                      ]}
                      onPress={() => {
                        setModalHour(preset.hour);
                        setModalMinute(preset.minute);
                        setSelectedQuickTime(preset.label);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.quickTimeChipText,
                          isMatch && styles.quickTimeChipTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.timeModalActions}>
              <TouchableOpacity
                style={styles.timeCancelBtn}
                onPress={() => setShowTimeModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.timeCancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeConfirmBtn}
                onPress={handleSaveTime}
                activeOpacity={0.8}
              >
                <Text style={styles.timeConfirmBtnText}>เลือกเวลานี้</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFCFA',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  duplicateWarningText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '600',
  },
  pickerInputBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFA',
  },
  pickerInputText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  textArea: {
    minHeight: 88,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFCFA',
  },
  saveBtn: {
    height: 52,
    backgroundColor: '#6FA07E',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#6FA07E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  timeModalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  digitalClockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  timeBoxCol: {
    alignItems: 'center',
    gap: 8,
  },
  digitalBox: {
    width: 80,
    height: 72,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
  },
  digitalText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#275238',
  },
  digitalUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: -2,
  },
  digitalColon: {
    fontSize: 32,
    fontWeight: '900',
    color: '#275238',
    marginBottom: 8,
  },
  timeStepBtn: {
    width: 44,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTimeSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  quickTimeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  quickTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTimeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  quickTimeChipActive: {
    backgroundColor: '#D1E7DD',
    borderColor: '#6FA07E',
  },
  quickTimeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickTimeChipTextActive: {
    color: '#275238',
    fontWeight: '800',
  },
  timeModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timeCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  timeCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  timeConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#6FA07E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeConfirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
