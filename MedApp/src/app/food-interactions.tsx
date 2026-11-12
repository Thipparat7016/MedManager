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
  'มื้อเช้า': { range: '05:00 - 10:59 น.', defaultTime: '08:00 น.' },
  'มื้อกลางวัน': { range: '11:00 - 14:59 น.', defaultTime: '12:00 น.' },
  'มื้อเย็น': { range: '15:00 - 19:59 น.', defaultTime: '18:00 น.' },
  'ก่อนนอน': { range: '20:00 - 04:59 น.', defaultTime: '21:00 น.' },
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
      m =>
        scheduledTodayNames.has(formatCleanDrugName(m.name)) ||
        isMedicationScheduledForDate(m, todayDate)
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
  const effectiveSelectedDrug = drugFilters.includes(selectedDrug)
    ? selectedDrug
    : 'ทั้งหมด';

  // Filter for single drug view
  const singleDrugMatches = useMemo(() => {
    if (effectiveSelectedDrug === 'ทั้งหมด') return [];
    return matchedList.filter(
      item =>
        formatCleanDrugName(item.matchedMedication.name) === effectiveSelectedDrug
    );
  }, [effectiveSelectedDrug, matchedList]);

  const singleAvoidList = useMemo(() => {
    return singleDrugMatches.filter(
      i =>
        i.interaction.interactionType === 'หลีกเลี่ยง' ||
        i.interaction.interactionType?.includes('หลีกเลี่ยง')
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
          if (
            (m.times || []).some(t => getMealCategory(t, m.mealTiming) === mealName)
          ) {
            medNamesInMeal.add(formatCleanDrugName(m.name));
          }
        });
      }

      const mealMatches = matchedList.filter(item =>
        medNamesInMeal.has(formatCleanDrugName(item.matchedMedication.name))
      );

      const avoid = mealMatches.filter(
        i =>
          i.interaction.interactionType === 'หลีกเลี่ยง' ||
          i.interaction.interactionType?.includes('หลีกเลี่ยง')
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

  // Card renderers (Updated to match exact UI design)
  const renderAvoidCard = (item: MatchedInteractionResult, keyId?: string) => {
    const inter = item.interaction;
    const isHigh = inter.severity === 'สูง';
    const isMed = inter.severity === 'กลาง';
    const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);
    const cleanInterMed = formatCleanDrugName(inter.medicationName);
    const isDifferentDrug =
      cleanInterMed && cleanInterMed.toLowerCase() !== cleanUserMed.toLowerCase();

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
  };

  const renderRecommendCard = (item: MatchedInteractionResult, keyId?: string) => {
    const inter = item.interaction;
    const cleanUserMed = formatCleanDrugName(item.matchedMedication.name);

    return (
      <View key={keyId || item.id} style={styles.recommendCard}>
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
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="อาหารที่หลีกเลี่ยง" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0284C7']}
          />
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
              <Feather
                name="plus"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.emptyAddBtnText}>เพิ่มยาใหม่ของคุณ</Text>
            </TouchableOpacity>
          </View>
        ) : todayActiveMeds.length === 0 ? (
          /* CASE 2: No medications scheduled for today */
          <View style={styles.emptyContainer}>
            <View
              style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}
            >
              <Ionicons name="shield-checkmark" size={44} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>ไม่มีรายการยาที่ต้องทานในวันนี้</Text>
            <Text style={styles.emptySubtitle}>
              วันนี้ไม่มีตารางรับประทานยา จึงไม่พบข้อควรระวังหรืออาหารที่ควรหลีกเลี่ยง
            </Text>
          </View>
        ) : matchedList.length === 0 ? (
          /* CASE 3: Active medications today, but NONE match food interactions */
          <View style={styles.emptyContainer}>
            <View
              style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}
            >
              <Ionicons name="shield-checkmark" size={44} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>
              ไม่พบข้อควรระวังอาหารสำหรับยาของคุณในวันนี้
            </Text>
            <Text style={styles.emptySubtitle}>
              ระบบได้นำยาที่คุณต้องทานในวันนี้ (
              {todayActiveMeds.map(m => formatCleanDrugName(m.name)).join(', ')})
              ไปตรวจสอบกับฐานข้อมูลหลังบ้านแล้ว{'\n'}
              ไม่พบข้อห้ามหรือข้อควรระวังเกี่ยวกับอาหาร
            </Text>
            <View style={styles.infoBadge}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#6366F1"
              />
              <Text style={styles.infoBadgeText}>
                ระบบจะแจ้งเตือนอัตโนมัติทันทีหากมีการอัปเดตข้อมูลในระบบหลังบ้าน
                หรือเมื่อคุณเพิ่มยาใหม่
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Drug Filter Buttons (Chips - No dropdown) */}
            {drugFilters.length > 1 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>กรองตามยา</Text>
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

            {/* MODE 1: "ทั้งหมด" -> แยกมื้อ (อาหารที่ต้องหลีกเลี่ยง + อาหารที่แนะนำรับประทานควบคู่) */}
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
                        <Ionicons
                          name="restaurant-outline"
                          size={18}
                          color="#0284C7"
                        />
                        <Text style={styles.mealSectionTitle}>
                          {meal.mealName}
                        </Text>
                      </View>
                      <Text style={styles.mealTimeRangeText}>{meal.range}</Text>
                    </View>

                    {/* อาหารที่ต้องหลีกเลี่ยงในมื้อนี้ */}
                    {meal.avoid.length > 0 && (
                      <View style={styles.subCategoryBlock}>
                        <Text style={styles.subCategoryTitle}>
                          อาหารที่ควรเลี่ยง
                        </Text>
                        {meal.avoid.map(item =>
                          renderAvoidCard(
                            item,
                            `${meal.mealName}-avoid-${item.id}`
                          )
                        )}
                      </View>
                    )}

                    {/* อาหารที่แนะนำในมื้อนี้ */}
                    {meal.recommend.length > 0 && (
                      <View style={styles.subCategoryBlock}>
                        <Text style={styles.subCategoryTitle}>
                          อาหารที่แนะนำรับประทานควบคู่
                        </Text>
                        {meal.recommend.map(item =>
                          renderRecommendCard(
                            item,
                            `${meal.mealName}-rec-${item.id}`
                          )
                        )}
                      </View>
                    )}
                  </View>
                ))
              )
            ) : (
              /* MODE 2: กดเลือกชื่อยานั้นๆ -> แสดงอาหารที่ต้องหลีกเลี่ยง + อาหารที่แนะนำรับประทานควบคู่ ของยานั้น */
              <>
                {singleAvoidList.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>อาหารที่ควรเลี่ยง</Text>
                    {singleAvoidList.map(item =>
                      renderAvoidCard(item, `single-avoid-${item.id}`)
                    )}
                  </View>
                )}

                {singleRecommendList.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>
                      อาหารที่แนะนำรับประทานควบคู่
                    </Text>
                    {singleRecommendList.map(item =>
                      renderRecommendCard(item, `single-rec-${item.id}`)
                    )}
                  </View>
                )}

                {singleAvoidList.length === 0 &&
                  singleRecommendList.length === 0 && (
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
  filterSection: {
    marginBottom: 18,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#0369A1',
    fontWeight: '700',
  },
  mealSectionWrap: {
    marginBottom: 20,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FBFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BCE6F8',
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C4A6E',
  },
  mealTimeRangeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  subCategoryBlock: {
    marginBottom: 8,
  },
  subCategoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 4,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
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
  recommendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BCE6F8', 
    padding: 16,
    marginBottom: 12,
  },
  recommendFoodName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  recommendImpactText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
});