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

export interface MedicationCustomDaysModalProps {
  visible: boolean;
  monthLabel: string;
  daysInCurrentMonth: number;
  tempSelectedMonthDates: number[];
  isOddSelected: boolean;
  isEvery3Selected: boolean;
  onToggleDay: (dayNum: number) => void;
  onSelectOddDays: () => void;
  onSelectEvery3Days: () => void;
  onClearAll: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

/** 7-column day-of-month picker modal with quick alternating/interval presets shared by Add & Edit Medication. */
export function MedicationCustomDaysModal({
  visible,
  monthLabel,
  daysInCurrentMonth,
  tempSelectedMonthDates,
  isOddSelected,
  isEvery3Selected,
  onToggleDay,
  onSelectOddDays,
  onSelectEvery3Days,
  onClearAll,
  onClose,
  onConfirm,
}: MedicationCustomDaysModalProps) {
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
        <Pressable style={styles.customDaysModalContainer} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>กำหนดวันรับประทานยา</Text>
              <Text style={styles.modalSubtitle}>
                เลือกวันที่ในเดือนนี้ ({monthLabel})
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.monthDaysGrid}>
            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => {
              const isSelected = tempSelectedMonthDates.includes(d);
              return (
                <View key={d} style={styles.monthDayCell}>
                  <TouchableOpacity
                    style={[
                      styles.monthDayChip,
                      isSelected && styles.monthDayChipActive,
                    ]}
                    onPress={() => onToggleDay(d)}
                    activeOpacity={0.7}
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
                </View>
              );
            })}
          </View>

          <Text style={[styles.modalSubLabel, { marginTop: 10 }]}>แนะนำเพิ่มเติม</Text>
          <View style={styles.quickDatesActionsRow}>
            <TouchableOpacity
              style={[
                styles.quickPresetChip,
                isOddSelected && styles.quickPresetChipActive,
              ]}
              onPress={onSelectOddDays}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickPresetText,
                  isOddSelected && styles.quickPresetTextActive,
                ]}
                numberOfLines={1}
              >
                กินวันเว้นวัน
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickPresetChip,
                isEvery3Selected && styles.quickPresetChipActive,
              ]}
              onPress={onSelectEvery3Days}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickPresetText,
                  isEvery3Selected && styles.quickPresetTextActive,
                ]}
                numberOfLines={1}
              >
                กิน 1 วัน เว้น 2 วัน
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.trashChip,
                tempSelectedMonthDates.length === 0 && { opacity: 0.4 },
              ]}
              onPress={onClearAll}
              activeOpacity={0.7}
              disabled={tempSelectedMonthDates.length === 0}
            >
              <Feather name="trash-2" size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>

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
  customDaysModalContainer: {
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
  monthDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  monthDayCell: {
    width: '14.2857%', // 100% / 7 columns edge-to-edge symmetry
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthDayChip: {
    width: 38,
    height: 38,
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
  quickDatesActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  quickPresetChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPresetChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B95F6',
  },
  quickPresetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickPresetTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  trashChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
