import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';
import {
  matchInteractionsForUser,
  MatchedInteractionResult,
  formatCleanDrugName,
  formatCleanFoodName,
  formatConciseText,
} from '@/services/interactionMatcher';

export default function FoodInteractionsScreen() {
  const router = useRouter();
  const { interactions, medications, refreshData } = useApp();
  const [selectedDrug, setSelectedDrug] = useState<string>('ทั้งหมด');
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh when navigating to screen to ensure backend updates from AdminMed appear immediately
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // User's active medications
  const activeUserMeds = medications.filter(m => m.status === 'active');

  // Automatically match user's medications with drug_food_interactions from Admin backend
  const matchedList: MatchedInteractionResult[] = matchInteractionsForUser(activeUserMeds, interactions);

  // Derive unique user drug names that actually have matched interactions (cleaned of parentheses)
  const matchedDrugNames = Array.from(
    new Set(matchedList.map(item => formatCleanDrugName(item.matchedMedication.name)))
  );

  const drugFilters = ['ทั้งหมด', ...matchedDrugNames];

  // Filter matched interactions according to selected chip
  const filteredList = matchedList.filter(item => {
    if (selectedDrug === 'ทั้งหมด') return true;
    return formatCleanDrugName(item.matchedMedication.name) === selectedDrug;
  });

  const avoidList = filteredList.filter(
    i => i.interaction.interactionType === 'หลีกเลี่ยง' || i.interaction.interactionType?.includes('หลีกเลี่ยง')
  );
  const recommendList = filteredList.filter(
    i =>
      i.interaction.interactionType === 'แนะนำ' ||
      i.interaction.interactionType === 'แนะนำให้รับประทานร่วม' ||
      i.interaction.interactionType?.includes('แนะนำ')
  );

  return (
    <View style={styles.safeArea}>
      <AppHeader title="อาหารที่ควรหลีกเลี่ยง" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
        }
      >
        {/* CASE 1: User has NO medications in "ยาของฉัน" */}
        {activeUserMeds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="pill" size={44} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการยาใน "ยาของฉัน"</Text>
            <Text style={styles.emptySubtitle}>
              เมนูนี้จะเชื่อมต่อกับฐานข้อมูลระบบหลังบ้าน (AdminMed) อัตโนมัติ{'\n'}
              และแสดงข้อควรระวังอาหารเฉพาะยาที่คุณเพิ่มลงในระบบ
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/add-medication')}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyAddBtnText}>เพิ่มยาใหม่ของคุณ</Text>
            </TouchableOpacity>
          </View>
        ) : matchedList.length === 0 ? (
          /* CASE 2: User HAS medications, but NONE match any food interaction in backend */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={44} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>ไม่พบข้อควรระวังอาหารสำหรับยาของคุณ</Text>
            <Text style={styles.emptySubtitle}>
              ระบบได้นำยาที่คุณเพิ่ม ({activeUserMeds.map(m => formatCleanDrugName(m.name)).join(', ')}) ไปตรวจสอบกับฐานข้อมูลหลังบ้านแล้ว{'\n'}
              ไม่พบข้อห้ามหรือข้อควรระวังเกี่ยวกับอาหารในขณะนี้
            </Text>
            <View style={styles.infoBadge}>
              <Ionicons name="information-circle-outline" size={16} color="#6366F1" />
              <Text style={styles.infoBadgeText}>
                ระบบจะแจ้งเตือนอัตโนมัติทันทีหากมีการอัปเดตข้อมูลในระบบหลังบ้าน หรือเมื่อคุณเพิ่มยาใหม่
              </Text>
            </View>
            <TouchableOpacity
              style={styles.outlineAddBtn}
              onPress={() => router.push('/add-medication')}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color="#4F46E5" style={{ marginRight: 6 }} />
              <Text style={styles.outlineAddBtnText}>เพิ่มยาอื่นเพิ่มเติม</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* CASE 3: Active matches found between user medications and backend interactions */
          <>
            {/* Sync Status Banner */}
            <View style={styles.syncBanner}>
              <View style={styles.syncBannerLeft}>
                <Ionicons name="shield-checkmark" size={18} color="#4F46E5" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.syncBannerTitle}>เชื่อมต่อระบบตรวจสอบข้อควรระวังอัตโนมัติ</Text>
                  <Text style={styles.syncBannerSubtitle}>
                    ตรวจพบ {matchedList.length} ข้อควรระวัง จากยาที่คุณทาน ({matchedDrugNames.length} รายการ)
                  </Text>
                </View>
              </View>
            </View>

            {/* Drug Filter Chips */}
            {drugFilters.length > 2 && (
              <>
                <Text style={styles.filterTitle}>กรองตามยาของคุณ</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}
                >
                  {drugFilters.map(drug => {
                    const count = drug === 'ทั้งหมด'
                      ? matchedList.length
                      : matchedList.filter(m => formatCleanDrugName(m.matchedMedication.name) === drug).length;
                    const isSelected = selectedDrug === drug;

                    return (
                      <TouchableOpacity
                        key={drug}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedDrug(drug)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {drug} ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Section 1: Foods to Avoid */}
            {avoidList.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>อาหารที่ควรหลีกเลี่ยง</Text>
                {avoidList.map(item => {
                  const inter = item.interaction;
                  const isHigh = inter.severity === 'สูง';
                  const isMed = inter.severity === 'กลาง';
                  const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);
                  const cleanInterMed = formatCleanDrugName(inter.medicationName);
                  const isDifferentDrug = cleanInterMed && cleanInterMed.toLowerCase() !== cleanUserMed.toLowerCase();

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
                      {/* Matched User Med Tag */}
                      <View style={styles.matchedMedBadge}>
                        <MaterialCommunityIcons name="pill" size={14} color="#4F46E5" />
                        <Text style={styles.matchedMedText} numberOfLines={1}>
                          ยาของคุณ: {cleanUserMed}
                        </Text>
                      </View>

                      {/* Header */}
                      <View style={styles.cardHeader}>
                        <Text style={styles.foodName} numberOfLines={1}>{formatCleanFoodName(inter.foodName)}</Text>
                        <StatusBadge
                          label={inter.severity || 'ปานกลาง'}
                          variant={isHigh ? 'high' : isMed ? 'medium' : 'low'}
                          size="sm"
                        />
                      </View>

                      {/* Active ingredient/interaction rule shown only if different from user med name */}
                      {isDifferentDrug ? (
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={14}
                            color={isHigh ? '#EF4444' : isMed ? '#F97316' : '#EAB308'}
                            style={styles.iconStyle}
                          />
                          <Text style={styles.infoText} numberOfLines={1}>
                            ตัวยาที่ระวัง: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{cleanInterMed}</Text>
                          </Text>
                        </View>
                      ) : null}

                      {/* Timing / Hours Note */}
                      {inter.hoursNote ? (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#DC2626"
                            style={styles.iconStyle}
                          />
                          <Text style={[styles.infoTextBold, { color: '#DC2626' }]} numberOfLines={1}>
                            คำแนะนำเวลา: {inter.hoursNote}
                          </Text>
                        </View>
                      ) : null}

                      {/* Impact Details - Concise display */}
                      {inter.impactDetails ? (
                        <View style={styles.impactBox}>
                          <Text style={styles.impactTitle}>ผลกระทบโดยย่อ:</Text>
                          <Text style={styles.impactText} numberOfLines={2}>
                            {formatConciseText(inter.impactDetails, 90)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </>
            )}

            {/* Section 2: Foods Recommended */}
            {recommendList.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>อาหารที่แนะนำ</Text>
                {recommendList.map(item => {
                  const inter = item.interaction;
                  const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);
                  return (
                    <View key={item.id} style={styles.recommendCard}>
                      <View style={styles.matchedMedBadge}>
                        <MaterialCommunityIcons name="pill" size={14} color="#15803D" />
                        <Text style={[styles.matchedMedText, { color: '#15803D' }]} numberOfLines={1}>
                          ยาของคุณ: {cleanUserMed}
                        </Text>
                      </View>

                      <Text style={styles.recommendFoodName} numberOfLines={1}>{formatCleanFoodName(inter.foodName)}</Text>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="shield-checkmark"
                          size={15}
                          color="#10B981"
                          style={styles.iconStyle}
                        />
                        <Text style={[styles.infoTextBold, { color: '#047857' }]} numberOfLines={2}>
                          {formatConciseText(inter.impactDetails, 90)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
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
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  outlineAddBtnText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#4F46E5',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  syncBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 14,
    marginBottom: 16,
  },
  syncBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
  },
  syncBannerSubtitle: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
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
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
  matchedMedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  matchedMedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
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
    flex: 1,
  },
  infoTextBold: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  impactBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    marginBottom: 4,
  },
  impactText: {
    fontSize: 13,
    color: '#9F1239',
    lineHeight: 18,
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
    marginBottom: 14,
  },
  recommendFoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 8,
  },
});
