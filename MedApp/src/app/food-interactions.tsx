import React, { useState, useCallback, useMemo } from 'react';
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
} from '@/services/interactionMatcher';
import { isMedicationScheduledForDate } from '@/services/medService';

const MEAL_ORDER = ['มื้อเช้า', 'มื้อกลางวัน', 'มื้อเย็น', 'ก่อนนอน'];

const MEAL_TIME_RANGES: Record<string, { range: string; defaultTime: string }> = {
  'มื้อเช้า': { range: 'ช่วงเวลา 05:00 - 10:59 น.', defaultTime: '08:00 น.' },
  'มื้อกลางวัน': { range: 'ช่วงเวลา 11:00 - 14:59 น.', defaultTime: '12:00 น.' },
  'มื้อเย็น': { range: 'ช่วงเวลา 15:00 - 19:59 น.', defaultTime: '18:00 น.' },
  'ก่อนนอน': { range: 'ช่วงเวลา 20:00 - 04:59 น.', defaultTime: '21:00 น.' },
};

function getMealCategory(timeStr?: string, mealTiming?: string): string {
  if (mealTiming === 'ก่อนนอน') return 'ก่อนนอน';
  const clean = (timeStr || '').replace(' น.', '').trim();
  const hour = parseInt(clean.split(':')[0], 10);
  if (!isNaN(hour)) {
    if (hour >= 5 && hour < 11) return 'มื้อเช้า';
    if (hour >= 11 && hour < 15) return 'มื้อกลางวัน';
    if (hour >= 15 && hour < 20) return 'มื้อเย็น';
    return 'ก่อนนอน';
  }
  return 'มื้อเช้า';
}

export default function FoodInteractionsScreen() {
  const router = useRouter();
  const { interactions, medications, todaySchedule, refreshData } = useApp();
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

  // Filter only medications that are scheduled for TODAY
  const todayDate = useMemo(() => new Date(), []);
  const scheduledTodayNames = useMemo(() => {
    return new Set(
      todaySchedule.map(s => formatCleanDrugName(s.medicationName)).filter(Boolean)
    );
  }, [todaySchedule]);

  const todayActiveMeds = useMemo(() => {
    return activeUserMeds.filter(
      m => scheduledTodayNames.has(formatCleanDrugName(m.name)) || isMedicationScheduledForDate(m, todayDate)
    );
  }, [activeUserMeds, scheduledTodayNames, todayDate]);

  // Match interactions for today's medications
  const matchedList: MatchedInteractionResult[] = useMemo(() => {
    return matchInteractionsForUser(todayActiveMeds, interactions);
  }, [todayActiveMeds, interactions]);

  // Derive unique drug names for today
  const todayDrugNames = useMemo(() => {
    return Array.from(
      new Set(todayActiveMeds.map(m => formatCleanDrugName(m.name)))
    ).filter(Boolean);
  }, [todayActiveMeds]);

  // Buttons filter: "ทั้งหมด" + only the medicines of that day
  const drugFilters = useMemo(() => {
    return ['ทั้งหมด', ...todayDrugNames];
  }, [todayDrugNames]);

  // Fallback to "ทั้งหมด" if previously selected drug is not in today's drugs
  const effectiveSelectedDrug = drugFilters.includes(selectedDrug) ? selectedDrug : 'ทั้งหมด';

  // Filter for single drug view
  const singleDrugMatches = useMemo(() => {
    if (effectiveSelectedDrug === 'ทั้งหมด') return [];
    return matchedList.filter(
      item => formatCleanDrugName(item.matchedMedication.name) === effectiveSelectedDrug
    );
  }, [effectiveSelectedDrug, matchedList]);

  const singleAvoidList = useMemo(() => {
    return singleDrugMatches.filter(
      i => i.interaction.interactionType === 'หลีกเลี่ยง' || i.interaction.interactionType?.includes('หลีกเลี่ยง')
    );
  }, [singleDrugMatches]);

  const singleRecommendList = useMemo(() => {
    return singleDrugMatches.filter(
      i =>
        i.interaction.interactionType === 'แนะนำ' ||
        i.interaction.interactionType === 'แนะนำให้รับประทานร่วม' ||
        i.interaction.interactionType?.includes('แนะนำ')
    );
  }, [singleDrugMatches]);

  // Grouped by Meal for "ทั้งหมด"
  const mealsData = useMemo(() => {
    return MEAL_ORDER.map(mealName => {
      // Find medication names in this meal
      const itemsInMeal = todaySchedule.filter(
        s => getMealCategory(s.time, s.mealTiming) === mealName
      );
      const medNamesInMeal = new Set(
        itemsInMeal.map(s => formatCleanDrugName(s.medicationName))
      );

      // Fallback: also check medication times if todaySchedule is empty
      if (medNamesInMeal.size === 0) {
        todayActiveMeds.forEach(m => {
          if ((m.times || []).some(t => getMealCategory(t, m.mealTiming) === mealName)) {
            medNamesInMeal.add(formatCleanDrugName(m.name));
          }
        });
      }

      const mealMatches = matchedList.filter(item =>
        medNamesInMeal.has(formatCleanDrugName(item.matchedMedication.name))
      );

      const avoid = mealMatches.filter(
        i => i.interaction.interactionType === 'หลีกเลี่ยง' || i.interaction.interactionType?.includes('หลีกเลี่ยง')
      );
      const recommend = mealMatches.filter(
        i =>
          i.interaction.interactionType === 'แนะนำ' ||
          i.interaction.interactionType === 'แนะนำให้รับประทานร่วม' ||
          i.interaction.interactionType?.includes('แนะนำ')
      );

      return {
        mealName,
        range: MEAL_TIME_RANGES[mealName]?.range || '',
        avoid,
        recommend,
        totalCount: avoid.length + recommend.length,
      };
    }).filter(m => m.totalCount > 0);
  }, [todaySchedule, todayActiveMeds, matchedList]);

  // Card renderers (preserving exact original design)
  const renderAvoidCard = (item: MatchedInteractionResult, keyId?: string) => {
    const inter = item.interaction;
    const isHigh = inter.severity === 'สูง';
    const isMed = inter.severity === 'กลาง';
    const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);
    const cleanInterMed = formatCleanDrugName(inter.medicationName);
    const isDifferentDrug = cleanInterMed && cleanInterMed.toLowerCase() !== cleanUserMed.toLowerCase();

    return (
      <View
        key={keyId || item.id}
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
          <Text style={styles.foodName} numberOfLines={1}>
            {formatCleanFoodName(inter.foodName)}
          </Text>
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

        {/* Impact Details - Full clear display */}
        {inter.impactDetails ? (
          <View style={styles.impactBox}>
            <Text style={styles.impactTitle}>ผลกระทบและข้อแนะนำ:</Text>
            <Text style={styles.impactText}>{inter.impactDetails}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderRecommendCard = (item: MatchedInteractionResult, keyId?: string) => {
    const inter = item.interaction;
    const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);
    return (
      <View key={keyId || item.id} style={styles.recommendCard}>
        <View style={styles.matchedMedBadge}>
          <MaterialCommunityIcons name="pill" size={14} color="#15803D" />
          <Text style={[styles.matchedMedText, { color: '#15803D' }]} numberOfLines={1}>
            ยาของคุณ: {cleanUserMed}
          </Text>
        </View>

        <Text style={styles.recommendFoodName} numberOfLines={1}>
          {formatCleanFoodName(inter.foodName)}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="shield-checkmark"
            size={15}
            color="#10B981"
            style={styles.iconStyle}
          />
          <Text style={[styles.infoTextBold, { color: '#047857' }]}>
            {inter.impactDetails}
          </Text>
        </View>
      </View>
    );
  };

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
        ) : todayActiveMeds.length === 0 ? (
          /* CASE 2: No medications scheduled for today */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={44} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>ไม่มีรายการยาที่ต้องทานในวันนี้</Text>
            <Text style={styles.emptySubtitle}>
              วันนี้ไม่มีตารางรับประทานยา จึงไม่พบข้อควรระวังหรืออาหารที่ต้องหลีกเลี่ยง
            </Text>
          </View>
        ) : matchedList.length === 0 ? (
          /* CASE 3: Active medications today, but NONE match food interactions */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark" size={44} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>ไม่พบข้อควรระวังอาหารสำหรับยาของคุณในวันนี้</Text>
            <Text style={styles.emptySubtitle}>
              ระบบได้นำยาที่คุณต้องทานในวันนี้ ({todayActiveMeds.map(m => formatCleanDrugName(m.name)).join(', ')}) ไปตรวจสอบกับฐานข้อมูลหลังบ้านแล้ว{'\n'}
              ไม่พบข้อห้ามหรือข้อควรระวังเกี่ยวกับอาหาร
            </Text>
            <View style={styles.infoBadge}>
              <Ionicons name="information-circle-outline" size={16} color="#6366F1" />
              <Text style={styles.infoBadgeText}>
                ระบบจะแจ้งเตือนอัตโนมัติทันทีหากมีการอัปเดตข้อมูลในระบบหลังบ้าน หรือเมื่อคุณเพิ่มยาใหม่
              </Text>
            </View>
          </View>
        ) : (
          <>
        
            {/* Drug Filter Buttons (Chips - No dropdown) */}
            {drugFilters.length > 1 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>กรองตามยาของคุณ</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterChipsRow}
                >
                  {drugFilters.map(drug => {
                    const isSelected = effectiveSelectedDrug === drug;
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
                          {drug}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* MODE 1: "ทั้งหมด" -> แยกมื้อ (อาหารที่ควรเลี่ยง + อาหารแนะนำ) */}
            {effectiveSelectedDrug === 'ทั้งหมด' ? (
              mealsData.length === 0 ? (
                <View style={styles.emptyMealBox}>
                  <Text style={styles.emptyMealText}>
                    ไม่พบข้อควรระวังอาหารในมื้อของวันนี้
                  </Text>
                </View>
              ) : (
                mealsData.map(meal => (
                  <View key={meal.mealName} style={styles.mealSectionWrap}>
                    {/* Meal Header */}
                    <View style={styles.mealSectionHeader}>
                      <View style={styles.mealTitleRow}>
                        <Ionicons name="restaurant-outline" size={18} color="#4F46E5" />
                        <Text style={styles.mealSectionTitle}>{meal.mealName}</Text>
                      </View>
                      <Text style={styles.mealTimeRangeText}>{meal.range}</Text>
                    </View>

                    {/* อาหารที่ควรหลีกเลี่ยงในมื้อนี้ */}
                    {meal.avoid.length > 0 && (
                      <View style={styles.subCategoryBlock}>
                        <Text style={styles.subCategoryTitle}>อาหารที่ควรหลีกเลี่ยง</Text>
                        {meal.avoid.map(item =>
                          renderAvoidCard(item, `${meal.mealName}-avoid-${item.id}`)
                        )}
                      </View>
                    )}

                    {/* อาหารที่แนะนำในมื้อนี้ */}
                    {meal.recommend.length > 0 && (
                      <View style={styles.subCategoryBlock}>
                        <Text style={[styles.subCategoryTitle, { color: '#15803D' }]}>
                          อาหารที่แนะนำ
                        </Text>
                        {meal.recommend.map(item =>
                          renderRecommendCard(item, `${meal.mealName}-rec-${item.id}`)
                        )}
                      </View>
                    )}
                  </View>
                ))
              )
            ) : (
              /* MODE 2: กดเลือกชื่อยานั้นๆ -> แสดงอาหารที่ควรเลี่ยง + อาหารแนะนำ ของยานั้น */
              <>
                {singleAvoidList.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>อาหารที่ควรหลีกเลี่ยง</Text>
                    {singleAvoidList.map(item => renderAvoidCard(item, `single-avoid-${item.id}`))}
                  </View>
                )}

                {singleRecommendList.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.sectionTitle, { color: '#15803D' }]}>
                      อาหารที่แนะนำ
                    </Text>
                    {singleRecommendList.map(item =>
                      renderRecommendCard(item, `single-rec-${item.id}`)
                    )}
                  </View>
                )}

                {singleAvoidList.length === 0 && singleRecommendList.length === 0 && (
                  <View style={styles.emptyMealBox}>
                    <Text style={styles.emptyMealText}>
                      ไม่พบข้อควรระวังหรืออาหารแนะนำสำหรับยานี้
                    </Text>
                  </View>
                )}
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
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  mealSectionWrap: {
    marginBottom: 20,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  mealTimeRangeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  subCategoryBlock: {
    marginBottom: 8,
  },
  subCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginLeft: 2,
  },
  emptyMealBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginTop: 8,
  },
  emptyMealText: {
    fontSize: 13,
    color: '#64748B',
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
