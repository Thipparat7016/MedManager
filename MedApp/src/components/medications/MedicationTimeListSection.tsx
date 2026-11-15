import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface MedicationTimeListSectionProps {
  title: string;
  required?: boolean;
  headerBottomMargin?: number;
  timesList: string[];
  error?: string;
  showEmptyState?: boolean;
  formatDoseLabel: (time: string) => string;
  onAddTime: () => void;
  onEditTime: (index: number) => void;
  onDeleteTime: (index: number) => void;
}

/** Renders the dose-times header, optional empty state, validation error, and scheduled time cards. */
export function MedicationTimeListSection({
  title,
  required = false,
  headerBottomMargin = 10,
  timesList,
  error,
  showEmptyState = false,
  formatDoseLabel,
  onAddTime,
  onEditTime,
  onDeleteTime,
}: MedicationTimeListSectionProps) {
  return (
    <>
      <View style={[styles.timesHeaderRow, headerBottomMargin > 0 && { marginBottom: headerBottomMargin }]}>
        <Text style={styles.sectionLabel}>
          {title}
          {required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
        </Text>
        <TouchableOpacity onPress={onAddTime} activeOpacity={0.7}>
          <Text style={styles.addTimeLink}>+ เพิ่มเวลา</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={[styles.fieldErrorText, styles.sectionErrorText]}>{error}</Text>
      ) : null}

      {showEmptyState && timesList.length === 0 ? (
        <View style={styles.emptyTimesBox}>
          <Feather name="clock" size={28} color="#94A3B8" />
          <Text style={styles.emptyTimesTitle}>ยังไม่ได้ระบุเวลารับประทาน</Text>
          <Text style={styles.emptyTimesSubtitle}>
            กดปุ่มด้านล่างเพื่อเพิ่มเวลาเตือนรับประทานยา
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={onAddTime}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyAddBtnText}>+ เพิ่มเวลารับประทาน</Text>
          </TouchableOpacity>
        </View>
      ) : (
        timesList.map((time, idx) => (
          <View key={idx} style={styles.timeItemCard}>
            <View>
              <Text style={styles.timeItemTime}>{time} น.</Text>
              <Text style={styles.timeItemDose}>{formatDoseLabel(time)}</Text>
            </View>
            <View style={styles.timeItemActions}>
              <TouchableOpacity
                style={styles.timeItemActionIcon}
                onPress={() => onEditTime(idx)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="edit-2" size={17} color="#8B95F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeItemActionIcon}
                onPress={() => onDeleteTime(idx)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  timesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addTimeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B95F6',
  },
  emptyTimesBox: {
    backgroundColor: '#FAFAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTimesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptyTimesSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyAddBtn: {
    marginTop: 12,
    backgroundColor: '#8B95F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  timeItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: '#EEF0F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  timeItemTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeItemDose: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  timeItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timeItemActionIcon: {
    padding: 6,
  },
});
