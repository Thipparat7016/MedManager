import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { CalendarModal } from '@/components/ui/CalendarModal';
import { AppointmentTimeModal } from '@/components/appointments/AppointmentTimeModal';
import { useEditAppointment } from '@/hooks/useEditAppointment';

export default function EditAppointmentScreen() {
  const {
    doctorName,
    setDoctorName,
    department,
    setDepartment,
    hospital,
    setHospital,
    details,
    setDetails,
    isSubmitting,
    date,
    setDate,
    showDatePicker,
    setShowDatePicker,
    time,
    showTimeModal,
    setShowTimeModal,
    modalHour,
    setModalHour,
    modalMinute,
    setModalMinute,
    selectedQuickTime,
    setSelectedQuickTime,
    quickTimePresets,
    isDuplicateDoctor,
    openTimeModal,
    handleSaveTime,
    handleSubmit,
    pad,
  } = useEditAppointment();

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
              onPress={openTimeModal}
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
        theme="sage"
      />

      {/* Time Picker Modal */}
      <AppointmentTimeModal
        visible={showTimeModal}
        modalHour={modalHour}
        modalMinute={modalMinute}
        selectedQuickTime={selectedQuickTime}
        quickTimePresets={quickTimePresets}
        pad={pad}
        onChangeHour={setModalHour}
        onChangeMinute={setModalMinute}
        onSelectQuickTime={setSelectedQuickTime}
        onClose={() => setShowTimeModal(false)}
        onSave={handleSaveTime}
      />
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
});
