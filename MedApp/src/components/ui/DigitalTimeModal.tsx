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

export interface DigitalTimePreset {
  label: string;
  hour: number;
  minute: number;
}

export interface DigitalTimeModalProps {
  visible: boolean;
  title: string;
  theme?: 'sage' | 'coral';
  modalHour: number;
  modalMinute: number;
  selectedQuickTime: string | null;
  quickTimePresets: DigitalTimePreset[];
  matchPresetByTime?: boolean;
  pad: (n: number) => string;
  onChangeHour: React.Dispatch<React.SetStateAction<number>>;
  onChangeMinute: React.Dispatch<React.SetStateAction<number>>;
  onSelectQuickTime: React.Dispatch<React.SetStateAction<string | null>>;
  onClose: () => void;
  onSave: () => void;
}

const TIME_THEME = {
  sage: {
    digitBoxBg: '#F0FDF4',
    digitBoxBorder: '#D1E7DD',
    accentText: '#275238',
    chipActiveBg: '#D1E7DD',
    chipActiveBorder: '#6FA07E',
    confirmBg: '#6FA07E',
    quickHeaderSpacing: 10,
  },
  coral: {
    digitBoxBg: '#FFF5F5',
    digitBoxBorder: '#FECACA',
    accentText: '#DC2626',
    chipActiveBg: '#FEE2E2',
    chipActiveBorder: '#F87171',
    confirmBg: '#F87171',
    quickHeaderSpacing: 8,
  },
} as const;

/** Shared digital clock time picker modal preserving exact sage (AddAppointment) and coral (LogSideEffect) themes. */
export function DigitalTimeModal({
  visible,
  title,
  theme = 'sage',
  modalHour,
  modalMinute,
  selectedQuickTime,
  quickTimePresets,
  matchPresetByTime = false,
  pad,
  onChangeHour,
  onChangeMinute,
  onSelectQuickTime,
  onClose,
  onSave,
}: DigitalTimeModalProps) {
  const palette = TIME_THEME[theme];

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
            <Text style={styles.modalTitle}>{title}</Text>
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
              >
                <Feather name="chevron-up" size={20} color="#475569" />
              </TouchableOpacity>
              <View
                style={[
                  styles.timeDigitBox,
                  {
                    backgroundColor: palette.digitBoxBg,
                    borderColor: palette.digitBoxBorder,
                  },
                ]}
              >
                <Text style={[styles.timeDigitText, { color: palette.accentText }]}>
                  {pad(modalHour)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => {
                  onChangeHour(h => (h - 1 + 24) % 24);
                  onSelectQuickTime(null);
                }}
              >
                <Feather name="chevron-down" size={20} color="#475569" />
              </TouchableOpacity>
              <Text style={styles.timeUnitSub}>ชั่วโมง</Text>
            </View>

            <Text style={[styles.timeColonText, { color: palette.accentText }]}>:</Text>

            {/* Minutes */}
            <View style={styles.timeBoxCol}>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => {
                  onChangeMinute(m => (m + 5) % 60);
                  onSelectQuickTime(null);
                }}
              >
                <Feather name="chevron-up" size={20} color="#475569" />
              </TouchableOpacity>
              <View
                style={[
                  styles.timeDigitBox,
                  {
                    backgroundColor: palette.digitBoxBg,
                    borderColor: palette.digitBoxBorder,
                  },
                ]}
              >
                <Text style={[styles.timeDigitText, { color: palette.accentText }]}>
                  {pad(modalMinute)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.timeStepBtn}
                onPress={() => {
                  onChangeMinute(m => (m - 5 + 60) % 60);
                  onSelectQuickTime(null);
                }}
              >
                <Feather name="chevron-down" size={20} color="#475569" />
              </TouchableOpacity>
              <Text style={styles.timeUnitSub}>นาที</Text>
            </View>
          </View>

          {/* Quick Time Presets */}
          <Text
            style={[
              styles.quickTimeHeader,
              {
                marginTop: palette.quickHeaderSpacing,
                marginBottom: palette.quickHeaderSpacing,
              },
            ]}
          >
            เวลาแนะนำ:
          </Text>
          <View style={styles.quickTimesGrid}>
            {quickTimePresets.map(preset => {
              const isSelected = matchPresetByTime
                ? selectedQuickTime === preset.label ||
                  (modalHour === preset.hour && modalMinute === preset.minute)
                : selectedQuickTime === preset.label;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[
                    styles.quickTimeChip,
                    isSelected && {
                      backgroundColor: palette.chipActiveBg,
                      borderColor: palette.chipActiveBorder,
                    },
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
                      styles.quickTimeText,
                      isSelected && {
                        color: palette.accentText,
                        fontWeight: '700',
                      },
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
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, { backgroundColor: palette.confirmBg }]}
              onPress={onSave}
            >
              <Text style={styles.modalConfirmText}>ตกลง</Text>
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
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigitText: {
    fontSize: 26,
    fontWeight: '800',
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
    marginHorizontal: 12,
    paddingBottom: 20,
  },
  quickTimeHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
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
  quickTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
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
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
