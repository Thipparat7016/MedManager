import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DrugFoodInteraction, ScheduleItem } from '@/utils/types';
import {
  formatCleanDrugName,
  formatShortFoodReason,
  formatFoodAvoidanceHeader,
} from '@/utils/interactionMatcher';
import { HomeMealGroup } from '@/hooks/useHomeDashboard';
import { HomeMealChecklistCard } from './HomeMealChecklistCard';

export interface HomeNextReminderCardProps {
  todayScheduleCount: number;
  nextMealName: string;
  nextMealItems: ScheduleItem[];
  mealsGrouped: HomeMealGroup[];
  mealTimeRanges: Record<string, { range: string; defaultTime: string }>;
  isExpandedAllMeals: boolean;
  onToggleExpandAllMeals: () => void;
  currentMealName?: string;
  pageItems: ScheduleItem[];
  safeCurrentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onToggleChecklistItem: (id: string, nextChecked: boolean) => void;
  onConfirmCurrentPage: () => void;
  getMedImage: (medName: string, medId?: string) => string | null;
  getMedAvoidances: (medName: string) => DrugFoodInteraction[];
  onPreviewMedImage: (preview: { uri: string; name: string }) => void;
}

/** Displays the lilac Next Reminder card with left next-meal summary, right checklist card, and expandable all-meals view. */
export function HomeNextReminderCard({
  todayScheduleCount,
  nextMealName,
  nextMealItems,
  mealsGrouped,
  mealTimeRanges,
  isExpandedAllMeals,
  onToggleExpandAllMeals,
  currentMealName,
  pageItems,
  safeCurrentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onToggleChecklistItem,
  onConfirmCurrentPage,
  getMedImage,
  getMedAvoidances,
  onPreviewMedImage,
}: HomeNextReminderCardProps) {
  return (
    <View style={styles.nextReminderCard}>
      <View style={styles.reminderTopRow}>
        {/* Left Column: Next Meal Information */}
        <View style={styles.reminderLeftCol}>
          <Text style={styles.nextMealTag}>มื้อถัดไป</Text>
          <Text
            style={styles.nextMealTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {nextMealName}
          </Text>

          {nextMealItems.length > 0 ? (
            <View style={styles.nextMealList}>
              {nextMealItems.map(item => {
                const itemImage = getMedImage(item.medicationName, item.medicationId);
                const itemAvoidances = getMedAvoidances(item.medicationName);

                return (
                  <View key={item.id} style={styles.nextMedItemWrapper}>
                    {/* Medicine Row */}
                    <View
                      style={[styles.nextMedRow, item.isTaken && styles.nextMedRowTaken]}
                    >
                      {itemImage ? (
                        <TouchableOpacity
                          style={styles.medIconBox}
                          onPress={() =>
                            onPreviewMedImage({
                              uri: itemImage,
                              name: formatCleanDrugName(item.medicationName),
                            })
                          }
                          activeOpacity={0.75}
                        >
                          <Image
                            source={{ uri: itemImage }}
                            style={styles.medThumbImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.medIconBox}>
                          <MaterialCommunityIcons name="pill" size={20} color="#8B95F6" />
                        </View>
                      )}
                      <View style={styles.nextMedInfo}>
                        <View style={styles.nextMedHeaderLine}>
                          <Text style={styles.nextMedName} numberOfLines={2}>
                            {formatCleanDrugName(item.medicationName)}
                          </Text>
                          {item.isTaken ? (
                            <View style={styles.takenInlineBadge}>
                              <Ionicons name="checkmark-circle" size={11} color="#16A34A" />
                              <Text style={styles.takenInlineText}>ทานแล้ว</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.nextMedMeta} numberOfLines={1}>
                          {[
                            `${item.doseCount || 1} ${item.type}`,
                            item.mealTiming,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </Text>
                      </View>
                    </View>

                    {/* Food Avoidance directly under this medicine */}
                    {itemAvoidances.length > 0 && (
                      <View style={styles.avoidanceSection}>
                        <View style={styles.avoidBadge}>
                          <Ionicons name="restaurant-outline" size={11} color="#EF4444" style={{ marginRight: 4 }} />
                          <Text style={styles.avoidBadgeText}>อาหารที่ควรเลี่ยง</Text>
                        </View>
                        {itemAvoidances.map((avoid, aIdx) => {
                          const headerText = formatFoodAvoidanceHeader(avoid.foodName, avoid.hoursNote);
                          const reasonText = formatShortFoodReason(avoid.impactDetails);

                          return (
                            <View key={aIdx} style={styles.avoidItemBlock}>
                              <View style={styles.avoidBulletRow}>
                                <Text style={styles.avoidBulletDot}>•</Text>
                                <Text style={styles.avoidBulletText}>{headerText}</Text>
                              </View>
                              {reasonText ? (
                                <View style={styles.avoidBulletRow}>
                                  <Text style={styles.avoidBulletDot}>•</Text>
                                  <Text
                                    style={styles.avoidBulletText}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.85}
                                  >
                                    {reasonText}
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyNextMedBox}>
              <Text style={styles.emptyNextMedText}>
                {todayScheduleCount > 0 ? 'ทานครบทุกมื้อแล้ว' : 'ยังไม่มีรายการยาในมื้อนี้'}
              </Text>
            </View>
          )}
        </View>

        {/* Right Column: White Card Box (Checklist & Confirmation) */}
        <HomeMealChecklistCard
          mealName={currentMealName}
          pageItems={pageItems}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onToggleItem={onToggleChecklistItem}
          onConfirmPage={onConfirmCurrentPage}
        />
      </View>

      {/* Expanded View: All meals grouped */}
      {isExpandedAllMeals && (
        <View style={styles.expandedContainer}>
          {mealsGrouped.map(meal => (
            <View key={meal.name} style={styles.mealGroupSection}>
              <View style={styles.mealGroupTitleRow}>
                <Text style={styles.mealGroupTitle}>{meal.name}</Text>
                {mealTimeRanges[meal.name] ? (
                  <Text style={styles.mealGroupRangeText}>
                    ({mealTimeRanges[meal.name].range})
                  </Text>
                ) : null}
              </View>
              {meal.items.map(item => {
                const itemAvoidances = getMedAvoidances(item.medicationName);
                const itemImage = getMedImage(item.medicationName, item.medicationId);

                return (
                  <View key={item.id} style={styles.expandedItemCard}>
                    <View style={styles.expandedCardTopRow}>
                      {itemImage ? (
                        <TouchableOpacity
                          style={styles.medIconBox}
                          onPress={() =>
                            onPreviewMedImage({
                              uri: itemImage,
                              name: formatCleanDrugName(item.medicationName),
                            })
                          }
                          activeOpacity={0.75}
                        >
                          <Image
                            source={{ uri: itemImage }}
                            style={styles.medThumbImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.medIconBox}>
                          <MaterialCommunityIcons name="pill" size={20} color="#8B95F6" />
                        </View>
                      )}

                      <View style={[styles.expandedCardInfo, !itemImage && { marginLeft: 0 }]}>
                        <Text style={styles.expandedMedName} numberOfLines={1}>
                          {formatCleanDrugName(item.medicationName)}
                        </Text>
                        <Text style={styles.expandedMedMeta} numberOfLines={1}>
                          {[
                            `${item.doseCount || 1} ${item.type}`,
                            item.mealTiming,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          item.isTaken
                            ? styles.statusBadgeTaken
                            : item.isChecked
                            ? styles.statusBadgePending
                            : styles.statusBadgeUntaken,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            item.isTaken
                              ? styles.statusBadgeTextTaken
                              : item.isChecked
                              ? styles.statusBadgeTextPending
                              : styles.statusBadgeTextUntaken,
                          ]}
                        >
                          {item.isTaken
                            ? 'ยืนยันแล้ว'
                            : item.isChecked
                            ? 'รอยืนยัน'
                            : 'ยังไม่ได้ทานยา'}
                        </Text>
                      </View>
                    </View>

                    {/* Food Avoidance details for this item */}
                    {itemAvoidances.length > 0 && (
                      <View style={styles.expandedAvoidSection}>
                        <View style={styles.avoidBadge}>
                          <Ionicons name="restaurant-outline" size={11} color="#EF4444" style={{ marginRight: 4 }} />
                          <Text style={styles.avoidBadgeText}>อาหารที่ควรเลี่ยง</Text>
                        </View>
                        {itemAvoidances.map((avoid, aIdx) => {
                          const headerText = formatFoodAvoidanceHeader(avoid.foodName, avoid.hoursNote);
                          const reasonText = formatShortFoodReason(avoid.impactDetails);

                          return (
                            <View key={aIdx} style={styles.avoidItemBlock}>
                              <View style={styles.avoidBulletRow}>
                                <Text style={styles.avoidBulletDot}>•</Text>
                                <Text style={styles.avoidBulletText}>{headerText}</Text>
                              </View>
                              {reasonText ? (
                                <View style={styles.avoidBulletRow}>
                                  <Text style={styles.avoidBulletDot}>•</Text>
                                  <Text style={styles.avoidBulletText}>{reasonText}</Text>
                                </View>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Toggle Button: View all meals / Hide all meals */}
      <TouchableOpacity
        style={styles.pillToggleBtn}
        onPress={onToggleExpandAllMeals}
        activeOpacity={0.7}
      >
        <Text style={styles.pillToggleText}>
          {isExpandedAllMeals ? 'ปิดรายการทั้งหมด' : 'รายการทานยาทั้งหมด'}
        </Text>
        <Feather
          name={isExpandedAllMeals ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#8B95F6"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nextReminderCard: {
    backgroundColor: '#F4F6FF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    padding: 16,
    marginBottom: 24,
  },
  reminderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderLeftCol: {
    flex: 1.15,
    paddingRight: 6,
  },
  nextMealTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 2,
  },
  nextMealTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 10,
  },
  nextMealList: {
    marginBottom: 4,
  },
  nextMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextMedRowTaken: {
    opacity: 0.55,
  },
  medIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF0FF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medThumbImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  nextMedInfo: {
    marginLeft: 8,
    flex: 1,
  },
  nextMedHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextMedName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  takenInlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    marginLeft: 4,
  },
  takenInlineText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 2,
  },
  nextMedMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 15,
  },
  nextMedItemWrapper: {
    marginBottom: 10,
  },
  avoidanceSection: {
    marginTop: 3,
    marginBottom: 2,
  },
  avoidBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avoidBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  avoidItemBlock: {
    marginBottom: 0,
  },
  avoidBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2.5,
  },
  avoidBulletDot: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 16,
    marginRight: 5,
  },
  avoidBulletText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 16,
  },
  emptyNextMedBox: {
    paddingVertical: 12,
  },
  emptyNextMedText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  pillToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 4,
  },
  expandedContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  mealGroupSection: {
    marginBottom: 10,
  },
  mealGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 8,
  },
  mealGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  mealGroupRangeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  expandedItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  expandedCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedCardInfo: {
    marginLeft: 10,
    flex: 1,
  },
  expandedMedName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  expandedMedMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeTaken: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  statusBadgePending: {
    borderColor: '#FEF08A',
    backgroundColor: '#FEFCE8',
  },
  statusBadgeUntaken: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusBadgeTextTaken: {
    color: '#16A34A',
  },
  statusBadgeTextPending: {
    color: '#B45309',
  },
  statusBadgeTextUntaken: {
    color: '#64748B',
  },
  expandedAvoidSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
});
