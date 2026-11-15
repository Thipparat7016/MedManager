import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCleanDrugName } from '@/utils/interactionMatcher';

export interface DrugPrecautionCardProps {
  selectedDrug: string;
  precautions?: string;
  suggestedSymptomsForDrug: string[];
}

/** Displays medication precaution hints and common expected symptoms for the selected drug. */
export function DrugPrecautionCard({
  selectedDrug,
  precautions,
  suggestedSymptomsForDrug,
}: DrugPrecautionCardProps) {
  return (
    <View style={styles.recommendSectionCard}>
      <View style={styles.recommendHeaderRow}>
        <Text style={styles.recommendHeaderTitle}>
          {selectedDrug
            ? `ผลข้างเคียงที่อาจพบ • ${formatCleanDrugName(selectedDrug)}`
            : 'ผลข้างเคียงที่อาจพบได้'}
        </Text>
      </View>

      {selectedDrug ? (
        <View style={styles.recommendBody}>
          {precautions ? (
            <Text style={styles.recommendPrecautionText}>
              {precautions}
            </Text>
          ) : (
            <Text style={styles.recommendPrecautionText}>
              ข้อควรระวังทั่วไป: หากมีอาการวิงเวียน ผื่นคัน แน่นหน้าอก หรืออาการผิดปกติรุนแรง ควรหยุดยาและปรึกษาแพทย์
            </Text>
          )}

          {/* Potential side effects list for this drug */}
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionTitle}>
              ผลข้างเคียงที่อาจเกิดขึ้น:
            </Text>
            <View style={styles.suggestionBulletList}>
              {suggestedSymptomsForDrug.map(sym => (
                <Text key={sym} style={styles.suggestionBulletText}>
                  • {sym}
                </Text>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.recommendEmptyText}>
          เลือกยาที่เกี่ยวข้องด้านล่าง เพื่อดูข้อมูลผลข้างเคียงและข้อควรระวังที่พบบ่อยจากระบบ
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  recommendSectionCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 14,
    marginBottom: 18,
  },
  recommendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
    marginLeft: 2,
  },
  recommendBody: {
    marginTop: 2,
  },
  recommendPrecautionText: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendEmptyText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },
  suggestionBox: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#FED7AA',
    paddingTop: 6,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
    marginBottom: 6,
  },
  suggestionBulletList: {
    marginTop: 2,
    gap: 4,
  },
  suggestionBulletText: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
  },
});
