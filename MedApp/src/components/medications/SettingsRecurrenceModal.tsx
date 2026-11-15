import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { THAI_MONTHS_FULL } from '@/utils/dateUtils';
import { MEDICATION_WEEKDAYS } from '@/utils/scheduleUtils';

export interface SettingsRecurrenceModalProps {
  visible: boolean;
  calendarTab: 'week' | 'dates' | 'month';
  selectedWeekdays: string[];
  selectedCalendarDates: number[];
  selectedMonthDates: number[];
  calYear: number;
  calMonth: number;
  daysInMonth: number;
  calendarCells: (number | null)[];
  onChangeTab: (tab: 'week' | 'dates' | 'month') => void;
  onSetWeekdays: (days: string[]) => void;
  onToggleWeekday: (id: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSetCalendarDates: (dates: number[]) => void;
  onToggleCalendarDate: (dayNum: number) => void;
  onSetMonthDates: (dates: number[]) => void;
  onToggleMonthDate: (dayNum: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const MONTHLY_PRESETS = [
  { label: 'ทุกวันที่ 1 ของเดือน', days: [1] },
  { label: 'ทุกวันที่ 1 และ 16 ของเดือน (ต้นเดือน/กลางเดือน)', days: [1, 16] },
  { label: 'ทุกวันที่ 15 และ สิ้นเดือน (30)', days: [15, 30] },
  { label: 'ทุกวันสิ้นเดือน (30)', days: [30] },
];

/** 3-tab recurrence modal (weekdays, calendar dates, monthly interval) used on MedicationSettings. */
export function SettingsRecurrenceModal({
  visible,
  calendarTab,
  selectedWeekdays,
  selectedCalendarDates,
  selectedMonthDates,
  calYear,
  calMonth,
  daysInMonth,
  calendarCells,
  onChangeTab,
  onSetWeekdays,
  onToggleWeekday,
  onPrevMonth,
  onNextMonth,
  onSetCalendarDates,
  onToggleCalendarDate,
  onSetMonthDates,
  onToggleMonthDate,
  onClose,
  onConfirm,
}: SettingsRecurrenceModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.calendarModalContainer} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>กำหนดวันรับประทานยา</Text>
              <Text style={styles.modalSubtitle}>เลือก วัน / สัปดาห์ / เดือน ที่ต้องการ</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Segmented Control / Tabs */}
          <View style={styles.calendarTabHeader}>
            <TouchableOpacity
              style={[styles.calTabBtn, calendarTab === 'week' && styles.calTabBtnActive]}
              onPress={() => onChangeTab('week')}
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
              onPress={() => onChangeTab('dates')}
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
              onPress={() => onChangeTab('month')}
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
                <View style={styles.quickWeekPresetsRow}>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => onSetWeekdays(['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'])}
                  >
                    <Text style={styles.quickPresetText}>ทุกวัน</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => onSetWeekdays(['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.'])}
                  >
                    <Text style={styles.quickPresetText}>จันทร์ - ศุกร์</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => onSetWeekdays(['ส.', 'อา.'])}
                  >
                    <Text style={styles.quickPresetText}>เสาร์ - อาทิตย์</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => onSetWeekdays(['จ.', 'พ.', 'ศ.', 'อา.'])}
                  >
                    <Text style={styles.quickPresetText}>วันเว้นวัน</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.weekdaysGrid}>
                  {MEDICATION_WEEKDAYS.map(w => {
                    const isSelected = selectedWeekdays.includes(w.id);
                    return (
                      <TouchableOpacity
                        key={w.id}
                        style={[
                          styles.weekdayCard,
                          isSelected && styles.weekdayCardActive,
                        ]}
                        onPress={() => onToggleWeekday(w.id)}
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
                <View style={styles.monthNavRow}>
                  <TouchableOpacity style={styles.monthNavBtn} onPress={onPrevMonth}>
                    <Feather name="chevron-left" size={20} color="#1E293B" />
                  </TouchableOpacity>
                  <Text style={styles.monthTitleText}>
                    {THAI_MONTHS_FULL[calMonth]} {calYear + 543}
                  </Text>
                  <TouchableOpacity style={styles.monthNavBtn} onPress={onNextMonth}>
                    <Feather name="chevron-right" size={20} color="#1E293B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.calGridHeader}>
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((h, i) => (
                    <Text key={i} style={styles.calGridHeaderCell}>{h}</Text>
                  ))}
                </View>

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
                        onPress={() => onToggleCalendarDate(dayNum)}
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

                <View style={styles.quickDatesActionsRow}>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => {
                      const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                      onSetCalendarDates(allDays);
                    }}
                  >
                    <Text style={styles.quickPresetText}>เลือกทั้งเดือน</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => {
                      const even = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => d % 2 === 0);
                      onSetCalendarDates(even);
                    }}
                  >
                    <Text style={styles.quickPresetText}>วันคู่</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => {
                      const odd = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => d % 2 !== 0);
                      onSetCalendarDates(odd);
                    }}
                  >
                    <Text style={styles.quickPresetText}>วันคี่</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickPresetChip}
                    onPress={() => onSetCalendarDates([])}
                  >
                    <Text style={[styles.quickPresetText, { color: '#EF4444' }]}>ล้างที่เลือก</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarSelectionBanner}>
                  <Ionicons name="calendar-outline" size={18} color="#6366F1" />
                  <Text style={styles.calendarSelectionBannerText}>
                    {selectedCalendarDates.length === 0
                      ? 'ยังไม่ได้เลือกวันที่ (แตะบนปฏิทินเพื่อเลือก)'
                      : `เลือกแล้ว ${selectedCalendarDates.length} วัน ในเดือน ${THAI_MONTHS_FULL[calMonth]}`}
                  </Text>
                </View>
              </View>
            )}

            {/* TAB 3: Monthly Recurrence */}
            {calendarTab === 'month' && (
              <View style={styles.tabContentBox}>
                <View style={styles.recurringPresetsCol}>
                  {MONTHLY_PRESETS.map((item, i) => {
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
                        onPress={() => onSetMonthDates(item.days)}
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
                        onPress={() => onToggleMonthDate(d)}
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
              onPress={onClose}
            >
              <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={onConfirm}
            >
              <Text style={styles.modalConfirmBtnText}>ตกลง / บันทึกวัน</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
