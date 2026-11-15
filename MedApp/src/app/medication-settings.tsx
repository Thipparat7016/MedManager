import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { MedicationTimeListSection } from '@/components/medications/MedicationTimeListSection';
import { SettingsTimePickerModal } from '@/components/medications/SettingsTimePickerModal';
import { SettingsRecurrenceModal } from '@/components/medications/SettingsRecurrenceModal';
import { useMedicationSettings } from '@/hooks/useMedicationSettings';

export default function MedicationSettingsScreen() {
  const {
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
  } = useMedicationSettings();

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
        <MedicationTimeListSection
          title="เวลารับประทาน"
          headerBottomMargin={0}
          showEmptyState
          timesList={timesList}
          formatDoseLabel={() => `1 ${drugType} (${drugDose} ${drugUnit})`}
          onAddTime={handleOpenAddTime}
          onEditTime={handleOpenEditTime}
          onDeleteTime={handleDeleteTime}
        />

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
          <Text style={styles.sectionLabel}>ข้อควรระวัง / ผลข้างเคียง</Text>
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

      <SettingsTimePickerModal
        visible={showTimeModal}
        editingTimeIndex={editingTimeIndex}
        modalHour={modalHour}
        modalMinute={modalMinute}
        onChangeHour={setModalHour}
        onChangeMinute={setModalMinute}
        onClose={() => setShowTimeModal(false)}
        onSave={handleSaveTime}
      />

      <SettingsRecurrenceModal
        visible={showCalendarModal}
        calendarTab={calendarTab}
        selectedWeekdays={selectedWeekdays}
        selectedCalendarDates={selectedCalendarDates}
        selectedMonthDates={selectedMonthDates}
        calYear={calYear}
        calMonth={calMonth}
        daysInMonth={daysInMonth}
        calendarCells={calendarCells}
        onChangeTab={setCalendarTab}
        onSetWeekdays={setSelectedWeekdays}
        onToggleWeekday={toggleWeekday}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSetCalendarDates={setSelectedCalendarDates}
        onToggleCalendarDate={toggleCalendarDate}
        onSetMonthDates={setSelectedMonthDates}
        onToggleMonthDate={toggleMonthDate}
        onClose={() => setShowCalendarModal(false)}
        onConfirm={handleConfirmCalendar}
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
});
