import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  MatchedInteractionResult,
  formatCleanDrugName,
  formatCleanFoodName,
} from '@/utils/interactionMatcher';

export interface AvoidInteractionCardProps {
  item: MatchedInteractionResult;
}

/** Displays a drug-food avoidance warning card with severity, drug name, window, impact, and reference. */
export function AvoidInteractionCard({ item }: AvoidInteractionCardProps) {
  const inter = item.interaction;
  const isHigh = inter.severity === 'สูง';
  const isMed = inter.severity === 'กลาง';
  const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);
  const cleanInterMed = formatCleanDrugName(inter.medicationName);
  const isDifferentDrug =
    cleanInterMed && cleanInterMed.toLowerCase() !== cleanUserMed.toLowerCase();

  return (
    <View
      style={[
        styles.interactionCard,
        isHigh && styles.cardHighBorder,
        isMed && styles.cardMedBorder,
        !isHigh && !isMed && styles.cardLowBorder,
      ]}
    >
      {/* 1. Header: ชื่ออาหาร + Badge ระดับความรุนแรง */}
      <View style={styles.cardHeader}>
        <Text style={styles.foodName} numberOfLines={1}>
          {formatCleanFoodName(inter.foodName)}
        </Text>
        <StatusBadge
          label={inter.severity || 'กลาง'}
          variant={isHigh ? 'high' : isMed ? 'medium' : 'low'}
          size="sm"
        />
      </View>

      {/* 2. ชื่อยา (ไอคอนเม็ดยา + ชื่อยา) */}
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="pill"
          size={15}
          color="#E11D48"
          style={styles.iconStyle}
        />
        <Text style={styles.infoText} numberOfLines={1}>
          {cleanUserMed}
          {isDifferentDrug ? ` (ตัวยาที่ระวัง: ${cleanInterMed})` : ''}
        </Text>
      </View>

      {/* 3. เวลาที่งด (ไอคอนนาฬิกา + คำแนะนำเวลา) */}
      {inter.hoursNote ? (
        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={15}
            color="#DC2626"
            style={styles.iconStyle}
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {inter.hoursNote.startsWith('งด')
              ? inter.hoursNote
              : `งด: ${inter.hoursNote}`}
          </Text>
        </View>
      ) : null}

      {/* 4. ผลกระทบและข้อแนะนำ */}
      {inter.impactDetails ? (
        <View style={styles.infoRow}>
          <Ionicons
            name="warning"
            size={15}
            color="#B91C1C"
            style={styles.iconStyle}
          />
          <Text style={styles.impactInlineText}>{inter.impactDetails}</Text>
        </View>
      ) : null}

      {/* 5. Footer: เส้นคั่น + แหล่งอ้างอิง */}
      <View style={styles.cardFooter}>
        <Text style={styles.sourceText}>
          แหล่งอ้างอิง:{' '}
          {(inter as any).source ||
            (inter as any).reference ||
            'FDA Drug Interaction Database 2024'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  interactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHighBorder: {
    borderColor: '#FECDD3',
  },
  cardMedBorder: {
    borderColor: '#FED7AA',
  },
  cardLowBorder: {
    borderColor: '#FEF08A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconStyle: {
    marginRight: 8,
    width: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  impactInlineText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  sourceText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
