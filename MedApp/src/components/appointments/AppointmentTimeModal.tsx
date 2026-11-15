import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface QuickTimePresetOption {
  label: string;
  hour: number;
  minute: number;
}

export interface AppointmentTimeModalProps {
  visible: boolean;
  modalHour: number;
  modalMinute: number;
  selectedQuickTime: string | null;
  quickTimePresets: QuickTimePresetOption[];
  pad: (n: number) => string;
  onChangeHour: React.Dispatch<React.SetStateAction<number>>;
  onChangeMinute: React.Dispatch<React.SetStateAction<number>>;
  onSelectQuickTime: React.Dispatch<React.SetStateAction<string | null>>;
  onClose: () => void;
  onSave: () => void;
}

/** Digital clock stepper modal styled specifically for EditAppointmentScreen. */
export function AppointmentTimeModal({
  visible,
  modalHour,
  modalMinute,
  selectedQuickTime,
  quickTimePresets,
  pad,
  onChangeHour,
  onChangeMinute,
  onSelectQuickTime,
  onClose,
  onSave,
}: AppointmentTimeModalProps) {
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
            <Text style={styles.modalTitle}>เลือกเวลานัดหมาย</Text>
            <TouchableOpacity
              onPress={onClose}
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
                  onChangeHour(h => (h + 1) % 24);
                  onSelectQuickTime(null);
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
                  onChangeHour(h => (h - 1 + 24) % 24);
                  onSelectQuickTime(null);
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
                  onChangeMinute(m => (m + 5) % 60);
                  onSelectQuickTime(null);
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
                  onChangeMinute(m => (m - 5 + 60) % 60);
                  onSelectQuickTime(null);
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
                      onChangeHour(preset.hour);
                      onChangeMinute(preset.minute);
                      onSelectQuickTime(preset.label);
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
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.timeCancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeConfirmBtn}
              onPress={onSave}
              activeOpacity={0.8}
            >
              <Text style={styles.timeConfirmBtnText}>เลือกเวลานี้</Text>
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
