import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Medication, ScheduleItem } from '@/utils/types';
import {
  formatCleanDrugName,
  resolveMedicationImageUri,
} from '@/utils/interactionMatcher';

export interface ScheduleDoseCardProps {
  item: ScheduleItem;
  masterMedications: Medication[];
  medications: Medication[];
  onPreviewImage: (preview: { uri: string; name: string }) => void;
}

/** Displays a single scheduled medication dose card with thumbnail preview and intake status badge. */
export function ScheduleDoseCard({
  item,
  masterMedications,
  medications,
  onPreviewImage,
}: ScheduleDoseCardProps) {
  const imgUri = resolveMedicationImageUri(
    { id: item.medicationId, name: item.medicationName },
    masterMedications,
    medications
  );
  const cleanName = formatCleanDrugName(item.medicationName);
  const dosageDisplay = item.dosage
    ? item.unit && !item.dosage.includes(item.unit)
      ? `${item.dosage} ${item.unit}`
      : item.dosage
    : '';
  const doseCount = item.doseCount || 1;
  const metaParts = [
    dosageDisplay,
    `${doseCount} ${item.type || 'เม็ด'}`,
    item.mealTiming,
  ].filter(Boolean);

  const statusLabel = item.isTaken
    ? 'ยืนยันแล้ว'
    : item.isChecked
    ? 'รอยืนยัน'
    : 'ยังไม่ได้กินยา';

  return (
    <View style={styles.itemCard}>
      {imgUri ? (
        <TouchableOpacity
          onPress={() =>
            onPreviewImage({
              uri: imgUri,
              name: cleanName,
            })
          }
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Image
            source={{ uri: imgUri }}
            style={styles.medThumbImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      <View style={[styles.itemDetails, !imgUri && { marginLeft: 0 }]}>
        <Text style={styles.itemName} numberOfLines={1}>
          {cleanName}
        </Text>
        <Text style={styles.itemMeta}>{metaParts.join(' • ')}</Text>
      </View>

      <View
        style={[
          styles.intakeStatusBadge,
          item.isTaken
            ? styles.intakeStatusTaken
            : item.isChecked
            ? styles.intakeStatusPending
            : styles.intakeStatusUntaken,
        ]}
      >
        <Text
          style={[
            styles.intakeStatusText,
            item.isTaken
              ? styles.intakeStatusTextTaken
              : item.isChecked
              ? styles.intakeStatusTextPending
              : styles.intakeStatusTextUntaken,
          ]}
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBFC',
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C8EBD2',
    paddingVertical: 18,
    paddingHorizontal: 14,
    minHeight: 86,
    marginBottom: 10,
    position: 'relative',
  },
  medThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
    marginRight: 84,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  intakeStatusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeStatusTaken: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  intakeStatusPending: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FEF08A',
  },
  intakeStatusUntaken: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  intakeStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  intakeStatusTextTaken: {
    color: '#16A34A',
  },
  intakeStatusTextPending: {
    color: '#D97706',
  },
  intakeStatusTextUntaken: {
    color: '#64748B',
  },
});
