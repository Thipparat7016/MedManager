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
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppHeader } from '@/components/ui/AppHeader';
import { CalendarModal } from '@/components/ui/CalendarModal';
import { useApp } from '@/context/AppContext';

interface FavoriteDoctor {
  id: string;
  name: string;
  department: string;
  hospital: string;
}

export default function AddAppointmentScreen() {
  const router = useRouter();
  const { addAppointment } = useApp();

  const now = useMemo(() => new Date(), []);
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Favorite Doctors State (Starts empty, only shows user's saved doctors)
  const [favoriteDoctors, setFavoriteDoctors] = useState<FavoriteDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [saveAsFavorite, setSaveAsFavorite] = useState<boolean>(false);

  // Form Fields State
  const [doctorName, setDoctorName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Date State & Calendar Modal (Opens on tap)
  const [date, setDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Time State & Time Picker Modal (Opens on tap, styled in green)
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

  // Load persisted favorite doctors on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('favorite_doctors');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFavoriteDoctors(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load favorite doctors:', e);
      }
    })();
  }, []);

  // Handle selecting a favorite doctor
  const handleSelectDoctor = (doc: FavoriteDoctor) => {
    if (selectedDoctorId === doc.id) {
      setSelectedDoctorId(null);
      setDoctorName('');
      setDepartment('');
      setHospital('');
    } else {
      setSelectedDoctorId(doc.id);
      setDoctorName(doc.name);
      setDepartment(doc.department);
      setHospital(doc.hospital);
    }
  };

  // Handle clicking "+ เพิ่มแพทย์ใหม่"
  const handleAddNewDoctor = () => {
    setSelectedDoctorId(null);
    setDoctorName('');
    setDepartment('');
    setHospital('');
  };

  const handleSaveTime = () => {
    const formatted = `${pad(modalHour)}:${pad(modalMinute)} น.`;
    setTime(formatted);
    setShowTimeModal(false);
  };

  const handleSubmit = async () => {
    if (!doctorName.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อแพทย์');
      return;
    }

    const finalDate = date || `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
    const finalTime = time.trim() || '14:00 น.';

    setIsSubmitting(true);

    // Save doctor into favorites if star is active and not already saved
    if (saveAsFavorite && doctorName.trim()) {
      const exists = favoriteDoctors.some(
        d => d.name.trim().toLowerCase() === doctorName.trim().toLowerCase()
      );
      if (!exists) {
        const newDoc: FavoriteDoctor = {
          id: `fav-${Date.now()}`,
          name: doctorName.trim(),
          department: department.trim() || 'ตรวจสุขภาพทั่วไป',
          hospital: hospital.trim() || 'โรงพยาบาล',
        };
        const updated = [...favoriteDoctors, newDoc];
        setFavoriteDoctors(updated);
        try {
          await AsyncStorage.setItem('favorite_doctors', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save favorite doctor:', e);
        }
      }
    }

    await addAppointment({
      doctorName: doctorName.trim(),
      department: department.trim() || 'ตรวจสุขภาพ',
      hospital: hospital.trim() || 'โรงพยาบาล',
      date: finalDate,
      time: finalTime,
      details: details.trim(),
      status: 'confirmed',
    });
    setIsSubmitting(false);

    Alert.alert('สำเร็จ', 'บันทึกนัดหมายแพทย์เรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)/appointments' as any) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="เพิ่มนัดหมายใหม่" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================================= */}
        {/* Section: แพทย์ที่ใช้บ่อย (Favorite Doctors - Shown only if user has added) */}
        {/* ========================================================================= */}
        {favoriteDoctors.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="star" size={16} color="#EAB308" />
              <Text style={styles.sectionHeaderTitle}>แพทย์ที่ใช้บ่อย</Text>
            </View>

            {/* Favorite Doctor Cards List */}
            {favoriteDoctors.map(doc => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[
                    styles.doctorCard,
                    isSelected && styles.doctorCardActive,
                  ]}
                  onPress={() => handleSelectDoctor(doc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.doctorCardName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.doctorCardMeta} numberOfLines={1}>
                    {doc.department} • {doc.hospital}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* + เพิ่มแพทย์ใหม่ (Dashed Card) */}
            <TouchableOpacity
              style={styles.addDoctorDashedCard}
              onPress={handleAddNewDoctor}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color="#3D7B54" />
              <Text style={styles.addDoctorDashedText}>เพิ่มแพทย์ใหม่</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* Section: ฟอร์มระบุข้อมูลแพทย์ (Doctor Details Form)                         */}
        {/* ========================================================================= */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อแพทย์</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น นพ. สมศักดิ์ วิทยากรณ์"
            placeholderTextColor="#94A3B8"
            value={doctorName}
            onChangeText={txt => {
              setDoctorName(txt);
              if (selectedDoctorId) setSelectedDoctorId(null);
            }}
          />
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

        {/* Favorite Star Toggle (กดดาวเอา: ไม่กด = ดาวเปล่าๆ ไม่มีสี, กด = ดาวมีสีทอง) */}
        <TouchableOpacity
          style={styles.favoriteToggleCard}
          onPress={() => setSaveAsFavorite(!saveAsFavorite)}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteToggleLabel}>
            เก็บเป็นแพทย์ที่ใช้บ่อย (ไม่ต้องกรอกใหม่ครั้งหน้า)
          </Text>
          <Ionicons
            name={saveAsFavorite ? 'star' : 'star-outline'}
            size={22}
            color={saveAsFavorite ? '#EAB308' : '#94A3B8'}
          />
        </TouchableOpacity>

        {/* ========================================================================= */}
        {/* Section: วันที่นัดหมาย & เวลานัดหมาย (กดแล้วเปิด Popup ทั้งสอง)             */}
        {/* ========================================================================= */}
        <View style={styles.rowInputs}>
          {/* วันที่นัดหมาย (กดแล้วเปิด Calendar Modal) */}
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

          {/* เวลานัดหมาย (กดแล้วเปิด Time Picker Popup Modal) */}
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

        {/* ========================================================================= */}
        {/* Section: รายละเอียด / การเตรียมตัว                                        */}
        {/* ========================================================================= */}
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
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกนัดหมาย'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. CALENDAR MODAL (กดวันที่แล้วเปิด Popup ปฏิทิน)                          */}
      {/* ========================================================================= */}
      <CalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setDate}
        initialDate={date}
        title="เลือกวันที่นัดหมาย"
      />

      {/* ========================================================================= */}
      {/* 2. TIME PICKER MODAL (กดเวลาแล้วเปิด Popup ในธีมสีเขียวเดิม)                 */}
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
                    setSelectedQuickTime(null);
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
                    setSelectedQuickTime(null);
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
                    setSelectedQuickTime(null);
                  }}
                >
                  <Feather name="chevron-down" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.timeUnitSub}>นาที</Text>
              </View>
            </View>

            {/* Quick Time Presets */}
            <Text style={styles.quickTimeHeader}>เวลาแนะนำ:</Text>
            <View style={styles.quickTimesGrid}>
              {quickTimePresets.map(preset => {
                const isSelected =
                  selectedQuickTime === preset.label ||
                  (modalHour === preset.hour && modalMinute === preset.minute);
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.quickTimeChip,
                      isSelected && styles.quickTimeChipActive,
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
                        styles.quickTimeText,
                        isSelected && styles.quickTimeTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalConfirmText}>ตกลง</Text>
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
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
  },

  // Favorite Doctor Cards
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  doctorCardActive: {
    borderColor: '#6FA07E',
    backgroundColor: '#F0FDF4',
  },
  doctorCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  doctorCardMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  // Add New Doctor Dashed Card
  addDoctorDashedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#6FA07E',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  addDoctorDashedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D7B54',
    marginLeft: 6,
  },

  // Form Inputs
  inputGroup: {
    marginBottom: 16,
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
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFCFA',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },

  // Favorite Star Toggle Card
  favoriteToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFA',
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  favoriteToggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },

  // Date & Time Picker Input Boxes
  pickerInputBox: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFA',
  },
  pickerInputText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
  },

  // Details Textarea & Save Button
  textArea: {
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    height: 110,
    backgroundColor: '#FAFCFA',
  },
  saveBtn: {
    height: 52,
    backgroundColor: '#6FA07E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6FA07E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Time Picker Modal Styles (Green Appointment Theme)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timeModalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  digitalClockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  timeBoxCol: {
    alignItems: 'center',
  },
  timeStepBtn: {
    padding: 6,
  },
  timeDigitBox: {
    width: 64,
    height: 60,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigitText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#275238',
  },
  timeUnitSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  timeColonText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#275238',
    marginHorizontal: 12,
    paddingBottom: 20,
  },
  quickTimeHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 8,
  },
  quickTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickTimeChip: {
    flexBasis: '48%',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  quickTimeChipActive: {
    backgroundColor: '#D1E7DD',
    borderColor: '#6FA07E',
  },
  quickTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickTimeTextActive: {
    color: '#275238',
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#6FA07E',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
