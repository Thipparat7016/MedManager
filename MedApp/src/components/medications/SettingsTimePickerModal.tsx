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
import { MEDICATION_QUICK_TIMES } from '@/utils/scheduleUtils';
import { padTwoDigits } from '@/utils/formatUtils';

export interface SettingsTimePickerModalProps {
  visible: boolean;
  editingTimeIndex: number | null;
  modalHour: number;
  modalMinute: number;
  onChangeHour: React.Dispatch<React.SetStateAction<number>>;
  onChangeMinute: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onSave: () => void;
}

/** Digital clock and quick-chip time picker modal used on the MedicationSettings screen. */
export function SettingsTimePickerModal({
  visible,
  editingTimeIndex,
  modalHour,
  modalMinute,
  onChangeHour,
  onChangeMinute,
  onClose,
  onSave,
}: SettingsTimePickerModalProps) {
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
              {editingTimeIndex !== null ? 'แก้ไขเวลารับประทาน' : 'เพิ่มเวลารับประทาน'}
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
                onPress={() => onChangeHour(h => (h + 1) % 24)}
              >
                <Feather name="chevron-up" size={20} color="#475569" />
              </TouchableOpacity>
              <View style={styles.timeDigitBox}>
                <Text style={styles.timeDigitText}>{padTwoDigits(modalHour)}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => onChangeHour(h => (h - 1 + 24) % 24)}
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
                onPress={() => onChangeMinute(m => (m + 5) % 60)}
              >
                <Feather name="chevron-up" size={20} color="#475569" />
              </TouchableOpacity>
              <View style={styles.timeDigitBox}>
                <Text style={styles.timeDigitText}>{padTwoDigits(modalMinute)}</Text>
              </View>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => onChangeMinute(m => (m - 5 + 60) % 60)}
              >
                <Feather name="chevron-down" size={20} color="#475569" />
              </TouchableOpacity>
              <Text style={styles.timeUnitSub}>นาที</Text>
            </View>
          </View>

          {/* Quick Presets */}
          <Text style={styles.modalSubLabel}>เวลาแนะนำ</Text>
          <View style={styles.quickTimeChipsRow}>
            {MEDICATION_QUICK_TIMES.map((qt, i) => {
              const isSelected = modalHour === qt.h && modalMinute === qt.m;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.quickTimeChip,
                    isSelected && styles.quickTimeChipActive,
                  ]}
                  onPress={() => {
                    onChangeHour(qt.h);
                    onChangeMinute(qt.m);
                  }}
                >
                  <Text
                    style={[
                      styles.quickTimeText,
                      isSelected && styles.quickTimeTextActive,
                    ]}
                  >
                    {qt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
  quickTimeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  quickTimeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
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
});
