import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MEDICATION_MEAL_TIMES } from '@/utils/scheduleUtils';
import { padTwoDigits } from '@/utils/formatUtils';

export interface MedicationTimeSlotModalProps {
  visible: boolean;
  editingTimeIndex: number | null;
  modalHour: number;
  modalMinute: number;
  selectedQuickTimeId: string | null;
  modalMealTiming: 'ก่อนอาหาร' | 'หลังอาหาร' | null;
  modalMealTimingError?: string;
  onChangeHour: React.Dispatch<React.SetStateAction<number>>;
  onChangeMinute: React.Dispatch<React.SetStateAction<number>>;
  onSelectQuickTimeId: (id: string | null) => void;
  onSelectMealTiming: (timing: 'ก่อนอาหาร' | 'หลังอาหาร' | null) => void;
  onClearMealTimingError: () => void;
  onClose: () => void;
  onSave: () => void;
}

/** Time-slot modal with digital steppers, quick meal presets, and required meal-timing chips. */
export function MedicationTimeSlotModal({
  visible,
  editingTimeIndex,
  modalHour,
  modalMinute,
  selectedQuickTimeId,
  modalMealTiming,
  modalMealTimingError,
  onChangeHour,
  onChangeMinute,
  onSelectQuickTimeId,
  onSelectMealTiming,
  onClearMealTimingError,
  onClose,
  onSave,
}: MedicationTimeSlotModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.timeModalContainer} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTimeIndex !== null ? 'แก้ไขเวลารับประทานยา' : 'เพิ่มเวลารับประทานยา'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
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
                  onChangeHour(h => (h + 1) % 24);
                  onSelectQuickTimeId(null);
                }}
              >
                <Feather name="chevron-up" size={20} color="#475569" />
              </TouchableOpacity>
              <View style={styles.timeDigitBox}>
                <Text style={styles.timeDigitText}>{padTwoDigits(modalHour)}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => {
                  onChangeHour(h => (h - 1 + 24) % 24);
                  onSelectQuickTimeId(null);
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
                  onChangeMinute(m => (m + 5) % 60);
                  onSelectQuickTimeId(null);
                }}
              >
                <Feather name="chevron-up" size={20} color="#475569" />
              </TouchableOpacity>
              <View style={styles.timeDigitBox}>
                <Text style={styles.timeDigitText}>{padTwoDigits(modalMinute)}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => {
                  onChangeMinute(m => (m - 5 + 60) % 60);
                  onSelectQuickTimeId(null);
                }}
              >
                <Feather name="chevron-down" size={20} color="#475569" />
              </TouchableOpacity>
              <Text style={styles.timeUnitSub}>นาที</Text>
            </View>
          </View>

          {/* เวลาแนะนำ */}
          <Text style={styles.modalSubLabel}>เวลาแนะนำ</Text>
          <View style={styles.quickTimeRow}>
            {MEDICATION_MEAL_TIMES.map(meal => {
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
                      onSelectQuickTimeId(null);
                    } else {
                      onSelectQuickTimeId(meal.id);
                      onChangeHour(meal.h);
                      onChangeMinute(meal.m);
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

          {/* วิธีรับประทาน */}
          <Text style={[styles.modalSubLabel, { marginTop: 10 }]}>
            วิธีรับประทาน <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.modalMealTimingRow}>
            {(['ก่อนอาหาร', 'หลังอาหาร'] as const).map(m => {
              const isSelected = modalMealTiming === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modalMealTimingChip,
                    isSelected && styles.modalMealTimingChipActive,
                  ]}
                  onPress={() => {
                    const nextVal = modalMealTiming === m ? null : m;
                    onSelectMealTiming(nextVal);
                    if (nextVal) {
                      onClearMealTimingError();
                    }
                  }}
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
          {modalMealTimingError ? (
            <Text style={[styles.fieldErrorText, { marginTop: -8, marginBottom: 4 }]}>
              {modalMealTimingError}
            </Text>
          ) : null}

          {/* Modal Actions */}
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onClose}
            >
              <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={onSave}
            >
              <Text style={styles.modalConfirmBtnText}>
                {editingTimeIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มเวลานี้'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
