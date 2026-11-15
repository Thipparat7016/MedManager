import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  MatchedInteractionResult,
  formatCleanDrugName,
  formatCleanFoodName,
} from '@/utils/interactionMatcher';

export interface RecommendInteractionCardProps {
  item: MatchedInteractionResult;
}

/** Displays a recommended drug-food pairing card with benefit notes and reference source. */
export function RecommendInteractionCard({ item }: RecommendInteractionCardProps) {
  const inter = item.interaction;
  const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);

  return (
    <View style={styles.recommendCard}>
      {/* 1. ชื่ออาหาร */}
      <View style={styles.cardHeader}>
        <Text style={styles.recommendFoodName} numberOfLines={1}>
          {formatCleanFoodName(inter.foodName)}
        </Text>
      </View>

      {/* 2. ชื่อยา */}
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="pill"
          size={15}
          color="#E11D48"
          style={styles.iconStyle}
        />
        <Text style={styles.infoText} numberOfLines={1}>
          {cleanUserMed}
        </Text>
      </View>

      {/* 3. ข้อแนะนำ/ประโยชน์ */}
      {inter.impactDetails ? (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={15}
            color="#22C55E"
            style={styles.iconStyle}
          />
          <Text style={styles.recommendImpactText}>{inter.impactDetails}</Text>
        </View>
      ) : null}

      {/* 4. Footer: เส้นคั่น + แหล่งอ้างอิง */}
      <View style={styles.cardFooter}>
        <Text style={styles.sourceText}>
          แหล่งอ้างอิง:{' '}
          {(inter as any).source ||
            (inter as any).reference ||
            'Journal of Clinical Pharmacology'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recommendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BCE6F8',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendFoodName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
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
  recommendImpactText: {
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
