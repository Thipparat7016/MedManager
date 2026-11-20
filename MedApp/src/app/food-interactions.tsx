import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { AvoidInteractionCard } from '@/components/interactions/AvoidInteractionCard';
import { RecommendInteractionCard } from '@/components/interactions/RecommendInteractionCard';
import { formatCleanDrugName } from '@/utils/interactionMatcher';
import { useFoodInteractions } from '@/hooks/useFoodInteractions';

export default function FoodInteractionsScreen() {
  const {
    setSelectedDrug,
    refreshing,
    onRefresh,
    activeUserMeds,
    todayActiveMeds,
    matchedList,
    drugFilters,
    effectiveSelectedDrug,
    singleAvoidList,
    singleRecommendList,
    mealsData,
    goToAddMedication,
  } = useFoodInteractions();

  return (
    <View style={styles.safeArea}>
      <AppHeader title="อาหารที่ควรเลี่ยง" />
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
              onPress={goToAddMedication}
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
                        {meal.avoid.map(item => (
                          <AvoidInteractionCard
                            key={`${meal.mealName}-avoid-${item.id}`}
                            item={item}
                          />
                        ))}
                      </View>
                    )}

                    {/* อาหารที่แนะนำในมื้อนี้ */}
                    {meal.recommend.length > 0 && (
                      <View style={styles.subCategoryBlock}>
                        <Text style={styles.subCategoryTitle}>
                          อาหารที่แนะนำรับประทานควบคู่
                        </Text>
                        {meal.recommend.map(item => (
                          <RecommendInteractionCard
                            key={`${meal.mealName}-rec-${item.id}`}
                            item={item}
                          />
                        ))}
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
                    {singleAvoidList.map(item => (
                      <AvoidInteractionCard
                        key={`single-avoid-${item.id}`}
                        item={item}
                      />
                    ))}
                  </View>
                )}

                {singleRecommendList.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>
                      อาหารที่แนะนำรับประทานควบคู่
                    </Text>
                    {singleRecommendList.map(item => (
                      <RecommendInteractionCard
                        key={`single-rec-${item.id}`}
                        item={item}
                      />
                    ))}
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
});