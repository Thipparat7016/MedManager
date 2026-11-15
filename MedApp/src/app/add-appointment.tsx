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
import { Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { CalendarModal } from '@/components/ui/CalendarModal';
import { DigitalTimeModal } from '@/components/ui/DigitalTimeModal';
import { FavoriteDoctorsSection } from '@/components/appointments/FavoriteDoctorsSection';
import { EditFavoriteDoctorModal } from '@/components/appointments/EditFavoriteDoctorModal';
import { useAddAppointment } from '@/hooks/useAddAppointment';

export default function AddAppointmentScreen() {
  const {
    favoriteDoctors,
    selectedDoctorId,
    saveAsFavorite,
    setSaveAsFavorite,
    editDocName,
    setEditDocName,
    editDocDept,
    setEditDocDept,
    editDocHosp,
    setEditDocHosp,
    showEditDocModal,
    setShowEditDocModal,
    doctorName,
    handleDoctorNameChange,
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
    handleSelectDoctor,
    handleAddNewDoctor,
    handleDeleteFavoriteDoctor,
    handleOpenEditDoc,
    handleSaveEditDoc,
    openTimeModal,
    handleSaveTime,
    handleSubmit,
    pad,
  } = useAddAppointment();

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
        <FavoriteDoctorsSection
          favoriteDoctors={favoriteDoctors}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={handleSelectDoctor}
          onEditDoctor={handleOpenEditDoc}
          onDeleteDoctor={handleDeleteFavoriteDoctor}
          onAddNewDoctor={handleAddNewDoctor}
        />

        {/* ========================================================================= */}
        {/* Section: ฟอร์มระบุข้อมูลแพทย์ (Doctor Details Form)                         */}
        {/* ========================================================================= */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อแพทย์</Text>
          <TextInput
            style={[styles.input, isDuplicateDoctor && styles.inputError]}
            placeholder="เช่น นพ. สมศักดิ์ วิทยากรณ์"
            placeholderTextColor="#94A3B8"
            value={doctorName}
            onChangeText={handleDoctorNameChange}
          />
          {isDuplicateDoctor && (
            <Text style={styles.duplicateWarningText}>
              * มีแพทย์ท่านนี้ในระบบแล้ว ไม่สามารถเพิ่มแพทย์ชื่อซ้ำได้
            </Text>
          )}
        </View>

        {/* แผนก & โรงพยาบาล */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>แผนก</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น อายุรกรรม"
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

        {/* Favorite Star Toggle */}
        <TouchableOpacity
          style={styles.favoriteToggleCard}
          onPress={() => setSaveAsFavorite(!saveAsFavorite)}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteToggleLabel}>
            แพทย์ที่นัดประจำ
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

      {/* 1. CALENDAR MODAL */}
      <CalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setDate}
        initialDate={date}
        title="เลือกวันที่นัดหมาย"
        theme="sage"
      />

      {/* 2. TIME PICKER MODAL */}
      <DigitalTimeModal
        visible={showTimeModal}
        title="เลือกเวลานัดหมาย"
        theme="sage"
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

      {/* 3. EDIT FAVORITE DOCTOR MODAL */}
      <EditFavoriteDoctorModal
        visible={showEditDocModal}
        doctorName={editDocName}
        department={editDocDept}
        hospital={editDocHosp}
        onChangeDoctorName={setEditDocName}
        onChangeDepartment={setEditDocDept}
        onChangeHospital={setEditDocHosp}
        onClose={() => setShowEditDocModal(false)}
        onSave={handleSaveEditDoc}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
  inputError: {
    borderColor: '#EF4444',
  },
  duplicateWarningText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '600',
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
    marginLeft: -4,
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
});
