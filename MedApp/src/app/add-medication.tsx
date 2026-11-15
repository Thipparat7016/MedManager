import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { CalendarModal } from '@/components/ui/CalendarModal';
import { MasterCatalogDropdown } from '@/components/medications/MasterCatalogDropdown';
import { MedicationTimeListSection } from '@/components/medications/MedicationTimeListSection';
import { MedicationTimeSlotModal } from '@/components/medications/MedicationTimeSlotModal';
import { MedicationCustomDaysModal } from '@/components/medications/MedicationCustomDaysModal';
import { MedicationImagePreviewModal } from '@/components/medications/MedicationImagePreviewModal';
import { useAddMedication } from '@/hooks/useAddMedication';

export default function AddMedicationScreen() {
  const {
    scrollViewRef,
    stockSectionYRef,
    daysInCurrentMonth,
    currentMonthThaiYearLabel,
    name,
    type,
    dosage,
    unit,
    showDropdown,
    setShowDropdown,
    filteredCatalog,
    isMedAlreadyAdded,
    handleNameChange,
    handleSelectMasterMed,
    frequencyCount,
    setFrequencyCount,
    durationMode,
    handleToggleDailyDuration,
    handleOpenCustomDuration,
    timesList,
    mealTiming,
    timeMealTimings,
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
    handleOpenAddTime,
    handleOpenEditTime,
    handleSaveTime,
    handleDeleteTime,
    showCustomDaysModal,
    setShowCustomDaysModal,
    tempSelectedMonthDates,
    setTempSelectedMonthDates,
    isOddSelected,
    isEvery3Selected,
    toggleTempMonthDate,
    handleSelectOddDays,
    handleSelectEvery3Days,
    handleConfirmCustomDays,
    currentStock,
    handleCurrentStockChange,
    expiryDate,
    showExpiryDatePicker,
    setShowExpiryDatePicker,
    handleSelectExpiryDate,
    precautions,
    setPrecautions,
    isSaving,
    formErrors,
    previewMedImage,
    setPreviewMedImage,
    handleSave,
  } = useAddMedication();

  return (
    <View style={styles.safeArea}>
      <AppHeader title="เพิ่มยาใหม่" />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================================= */}
        {/* 2. ชื่อยา / อาหารเสริม * พร้อม Dropdown / Hint ดึงจาก Backend */}
        {/* ========================================================================= */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            ชื่อยา / อาหารเสริม <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น แอสไพริน, Aspirin"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={handleNameChange}
            onFocus={() => setShowDropdown(true)}
          />
          {formErrors.name ? (
            <Text style={styles.fieldErrorText}>{formErrors.name}</Text>
          ) : null}

          <MasterCatalogDropdown
            visible={showDropdown}
            catalog={filteredCatalog}
            showAddedBadge
            isMedAlreadyAdded={isMedAlreadyAdded}
            onClose={() => setShowDropdown(false)}
            onSelect={handleSelectMasterMed}
            onPreviewImage={setPreviewMedImage}
          />
        </View>

        {/* ========================================================================= */}
        {/* 3. ตั้งค่าการรับประทาน (นำหน้าเดิมมาต่อลงมาในหน้าเดียว) */}
        {/* ========================================================================= */}
        <Text style={styles.sectionLabel}>
          จำนวนต่อครั้ง <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
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
        {formErrors.frequency ? (
          <Text style={[styles.fieldErrorText, styles.sectionErrorText]}>
            {formErrors.frequency}
          </Text>
        ) : null}

        {/* ระยะเวลา (ทุกวัน vs กำหนดเอง) */}
        <Text style={styles.sectionLabel}>
          ระยะเวลา <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, durationMode === 'ทุกวัน' && styles.chipActive]}
            onPress={handleToggleDailyDuration}
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
            onPress={handleOpenCustomDuration}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, durationMode === 'กำหนดเอง' && styles.chipTextActive]}
            >
              กำหนดเอง
            </Text>
          </TouchableOpacity>
        </View>
        {formErrors.duration ? (
          <Text style={[styles.fieldErrorText, styles.sectionErrorText]}>
            {formErrors.duration}
          </Text>
        ) : null}

        {/* ========================================================================= */}
        {/* เวลารับประทาน */}
        {/* ========================================================================= */}
        <MedicationTimeListSection
          title="เวลารับประทานยา"
          required
          timesList={timesList}
          error={formErrors.times}
          formatDoseLabel={time => {
            const slotMeal = timeMealTimings[time.replace(' น.', '').trim()] || mealTiming;
            return `${frequencyCount} ${type || 'เม็ด'} ${dosage ? `(${dosage} ${unit})` : ''}${slotMeal ? ` • ${slotMeal}` : ''}`;
          }}
          onAddTime={handleOpenAddTime}
          onEditTime={handleOpenEditTime}
          onDeleteTime={handleDeleteTime}
        />

        {/* ========================================================================= */}
        {/* ติดตามจำนวนยาคงเหลือ * (จำนวนปัจจุบัน และ วันหมดอายุ) */}
        {/* ========================================================================= */}
        <View
          style={styles.stockTrackingCard}
          onLayout={e => {
            stockSectionYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.stockTrackingTitle}>
            ติดตามจำนวนยาคงเหลือ <Text style={styles.requiredAsterisk}>*</Text>
          </Text>

          <View style={styles.stockInputGroup}>
            <Text style={styles.stockInputLabel}>
              จำนวนปัจจุบัน <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.stockInput}
              placeholder="เช่น 30 เม็ด"
              placeholderTextColor="#94A3B8"
              value={currentStock}
              onChangeText={handleCurrentStockChange}
              keyboardType="numeric"
            />
            {formErrors.currentStock ? (
              <Text style={styles.fieldErrorText}>{formErrors.currentStock}</Text>
            ) : null}
          </View>

          <View style={styles.stockInputGroup}>
            <Text style={styles.stockInputLabel}>
              วันหมดอายุ <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
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
            {formErrors.expiryDate ? (
              <Text style={styles.fieldErrorText}>{formErrors.expiryDate}</Text>
            ) : null}
          </View>
        </View>

        {/* คำเตือน / ข้อควรระวัง */}
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

        {/* Action Buttons */}
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

      <MedicationTimeSlotModal
        visible={showTimeModal}
        editingTimeIndex={editingTimeIndex}
        modalHour={modalHour}
        modalMinute={modalMinute}
        selectedQuickTimeId={selectedQuickTimeId}
        modalMealTiming={modalMealTiming}
        modalMealTimingError={modalMealTimingError}
        onChangeHour={setModalHour}
        onChangeMinute={setModalMinute}
        onSelectQuickTimeId={setSelectedQuickTimeId}
        onSelectMealTiming={setModalMealTiming}
        onClearMealTimingError={() => setModalMealTimingError(undefined)}
        onClose={() => setShowTimeModal(false)}
        onSave={handleSaveTime}
      />

      <MedicationCustomDaysModal
        visible={showCustomDaysModal}
        monthLabel={currentMonthThaiYearLabel}
        daysInCurrentMonth={daysInCurrentMonth}
        tempSelectedMonthDates={tempSelectedMonthDates}
        isOddSelected={isOddSelected}
        isEvery3Selected={isEvery3Selected}
        onToggleDay={toggleTempMonthDate}
        onSelectOddDays={handleSelectOddDays}
        onSelectEvery3Days={handleSelectEvery3Days}
        onClearAll={() => setTempSelectedMonthDates([])}
        onClose={() => setShowCustomDaysModal(false)}
        onConfirm={handleConfirmCustomDays}
      />

      <CalendarModal
        visible={showExpiryDatePicker}
        onClose={() => setShowExpiryDatePicker(false)}
        onSelectDate={handleSelectExpiryDate}
        initialDate={expiryDate}
        title="เลือกวันหมดอายุ"
        theme="purple"
      />

      <MedicationImagePreviewModal
        previewMedImage={previewMedImage}
        onClose={() => setPreviewMedImage(null)}
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
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: '700',
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 6,
  },
  sectionErrorText: {
    marginTop: -8,
    marginBottom: 14,
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
