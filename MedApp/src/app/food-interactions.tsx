import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';

export default function FoodInteractionsScreen() {
  const { interactions, medications } = useApp();
  const [selectedDrug, setSelectedDrug] = useState<string>('ทั้งหมด');

  // Derive drug filters dynamically from active meds and interactions
  const availableDrugs = Array.from(
    new Set([
      ...medications.map(m => m.name),
      ...interactions.map(i => i.medicationName),
    ])
  ).filter(Boolean);

  const drugFilters = ['ทั้งหมด', ...availableDrugs];

  const filteredInteractions = interactions.filter(item => {
    if (selectedDrug === 'ทั้งหมด') return true;
    return item.medicationName.includes(selectedDrug) || item.medicationName.includes('ทุกชนิด');
  });

  const avoidList = filteredInteractions.filter(i => i.interactionType === 'หลีกเลี่ยง');
  const recommendList = filteredInteractions.filter(i => i.interactionType === 'แนะนำ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ข้อมูลยาและอาหารที่ควรหลีกเลี่ยง" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {interactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีข้อมูลอาหารที่ควรหลีกเลี่ยง</Text>
            <Text style={styles.emptySubtitle}>
              ข้อมูลจะปรากฏเมื่อมียาที่ถูกบันทึก และมีข้อควรระวังจับคู่ในฐานข้อมูล Supabase
            </Text>
          </View>
        ) : (
          <>
            {/* Drug Filter Chips */}
            {drugFilters.length > 1 && (
              <>
                <Text style={styles.filterTitle}>กรองตามยา</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}
                >
                  {drugFilters.map(drug => (
                    <TouchableOpacity
                      key={drug}
                      style={[
                        styles.filterChip,
                        selectedDrug === drug && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedDrug(drug)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedDrug === drug && styles.filterChipTextActive,
                        ]}
                      >
                        {drug}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Section 1: Foods to Avoid */}
            {avoidList.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>อาหารที่ต้องหลีกเลี่ยง</Text>
                {avoidList.map(item => {
                  const isHigh = item.severity === 'สูง';
                  const isMed = item.severity === 'กลาง';

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.interactionCard,
                        isHigh && styles.cardHighBorder,
                        isMed && styles.cardMedBorder,
                        !isHigh && !isMed && styles.cardLowBorder,
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={styles.foodName}>{item.foodName}</Text>
                        <StatusBadge
                          label={item.severity}
                          variant={isHigh ? 'high' : isMed ? 'medium' : 'low'}
                          size="sm"
                        />
                      </View>

                      <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                          name="pill"
                          size={14}
                          color={isHigh ? '#EF4444' : isMed ? '#F97316' : '#EAB308'}
                          style={styles.iconStyle}
                        />
                        <Text style={styles.infoText}>{item.medicationName}</Text>
                      </View>

                      {item.hoursNote ? (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#DC2626"
                            style={styles.iconStyle}
                          />
                          <Text style={[styles.infoTextBold, { color: '#DC2626' }]}>
                            {item.hoursNote}
                          </Text>
                        </View>
                      ) : null}

                      {item.impactDetails ? (
                        <View style={styles.impactBox}>
                          <Text style={styles.impactTitle}>ผลกระทบที่อาจเกิดขึ้น:</Text>
                          <Text style={styles.impactText}>{item.impactDetails}</Text>
                        </View>
                      ) : null}


                      <View style={styles.cardFooter}>
                        <Text style={styles.sourceText}>แหล่งอ้างอิง: {item.sourceName || 'กรมการแพทย์'}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* Section 2: Foods Recommended */}
            {recommendList.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>อาหารที่แนะนำ</Text>
                {recommendList.map(item => (
                  <View key={item.id} style={styles.recommendCard}>
                    <Text style={styles.recommendFoodName}>{item.foodName}</Text>

                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons
                        name="pill"
                        size={14}
                        color="#8B95F6"
                        style={styles.iconStyle}
                      />
                      <Text style={styles.infoText}>{item.medicationName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color="#10B981"
                        style={styles.iconStyle}
                      />
                      <Text style={[styles.infoTextBold, { color: '#047857' }]}>
                        {item.impactDetails}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.sourceText}>แหล่งอ้างอิง: {item.sourceName || 'กรมการแพทย์'}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#BAE6FD',
    borderColor: '#38BDF8',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#0369A1',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  interactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
  },
  cardHighBorder: {
    borderColor: '#FECACA',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconStyle: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoTextBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  impactBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    marginBottom: 2,
  },
  impactText: {
    fontSize: 12,
    color: '#9F1239',
  },
  recommendBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  recommendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  recommendText: {
    fontSize: 12,
    color: '#64748B',
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
    fontStyle: 'italic',
  },
  recommendCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 16,
    marginBottom: 12,
  },
  recommendFoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 8,
  },
});
