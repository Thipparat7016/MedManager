import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SideEffectLog } from '@/utils/types';
import { formatCleanDrugName } from '@/utils/interactionMatcher';

export interface SideEffectHistoryListProps {
  sideEffects: SideEffectLog[];
}

/** Displays the user's logged side-effect history cards below the submission form. */
export function SideEffectHistoryList({ sideEffects }: SideEffectHistoryListProps) {
  return (
    <>
      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ประวัติการบันทึก</Text>
      {sideEffects.length === 0 ? (
        <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
          ยังไม่มีประวัติการบันทึกผลข้างเคียง
        </Text>
      ) : (
        sideEffects.map(item => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDrug} numberOfLines={1}>
                {item.date} {item.time ? `• ${item.time}` : ''} • {formatCleanDrugName(item.medicationName)}
              </Text>
              <View style={styles.badgeWrap}>
                <StatusBadge
                  label={item.severity}
                  variant={
                    item.severity === 'สูง'
                      ? 'high'
                      : item.severity === 'กลาง'
                        ? 'medium'
                        : 'low'
                  }
                  size="sm"
                />
              </View>
            </View>
            <Text style={styles.historySymptoms}>{item.symptoms.join(', ')}</Text>
            {item.details ? (
              <Text style={styles.historyDetails}>{item.details}</Text>
            ) : null}
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
    marginBottom: 8,
  },
  historyCard: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDrug: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  badgeWrap: {
    flexShrink: 0,
  },
  historySymptoms: {
    fontSize: 13,
    color: '#475569',
  },
  historyDetails: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
