import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface HomeProgressCardProps {
  takenCount: number;
  totalCount: number;
  progressPercent: number;
  remainingCount: number;
}

/** Displays the daily medication adherence progress bar and dose counter card on HomeScreen. */
export function HomeProgressCard({
  takenCount,
  totalCount,
  progressPercent,
  remainingCount,
}: HomeProgressCardProps) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>ความคืบหน้าวันนี้</Text>
        <Text style={styles.progressFraction}>
          {takenCount} / {totalCount} รายการ
        </Text>
      </View>
      {/* Progress Bar Track */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${totalCount > 0 ? Math.min(100, Math.max(5, progressPercent)) : 0}%` },
          ]}
        />
      </View>
      <Text style={styles.progressSubtext}>
        {totalCount === 0
          ? 'ยังไม่มีตารางรับประทานยาสำหรับวันนี้'
          : remainingCount === 0
          ? `กิน ${takenCount} ครั้ง • ครบทุกมื้อแล้ว • ทำได้ดี!`
          : `กิน ${takenCount} ครั้ง • เหลืออีก ${remainingCount} ครั้ง • ทำได้ดี!`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressFraction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B95F6',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
