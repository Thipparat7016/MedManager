import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { PillIcon } from '@/components/ui/PillIcon';
import {
  isMedicationMatch,
  formatCleanDrugName,
  formatCleanFoodName,
  formatConciseText,
} from '@/services/interactionMatcher';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user,
    todaySchedule,
    markTaken,
    notifications,
    interactions,
    medications,
    masterMedications,
    refreshData,
  } = useApp();

  const [isExpandedAllMeals, setIsExpandedAllMeals] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Auto-refresh when navigating back to HomeScreen
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

  // Dynamic Thai Date
  const getThaiDate = () => {
    const days = [
      'วันอาทิตย์',
      'วันจันทร์',
      'วันอังคาร',
      'วันพุธ',
      'วันพฤหัสบดี',
      'วันศุกร์',
      'วันเสาร์',
    ];
    const months = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];
    const now = new Date();
    return `${days[now.getDay()]}ที่ ${now.getDate()} ${months[now.getMonth()]} ${
      now.getFullYear() + 543
    }`;
  };

  // Progress metrics
  const takenCount = todaySchedule.filter(s => s.isTaken).length;
  const totalCount = todaySchedule.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const remainingCount = Math.max(0, totalCount - takenCount);

  // Helper to map time/timing to standard Thai meal categories
  const getMealCategory = (timeStr?: string, mealTiming?: string): string => {
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
  };

  // Resolve medication image from user medications or master medications catalog (AdminMed backend)
  const getMedImage = (medName: string, medId?: string): string | null => {
    const userMed = medications.find(
      m => (medId && m.id === medId) || m.name === medName || isMedicationMatch(m.name, medName)
    );
    if (userMed?.imageUrl) return userMed.imageUrl;

    const masterMed = masterMedications.find(
      m => m.name === medName || isMedicationMatch(medName, m.name)
    );
    if (masterMed?.imageUrl) return masterMed.imageUrl;

    return null;
  };

  // Helper to find food avoidances for a medicine
  const getMedAvoidance = (medName: string) => {
    return interactions.find(
      i =>
        (i.interactionType === 'หลีกเลี่ยง' || i.interactionType?.includes('หลีกเลี่ยง')) &&
        isMedicationMatch(medName, i.medicationName)
    );
  };

  // Next pending medication
  const nextPending = todaySchedule.find(s => !s.isTaken && !s.isSkipped);
  const nextMed = nextPending || todaySchedule[0] || null;
  const nextMealName = nextPending
    ? getMealCategory(nextPending.time, nextPending.mealTiming)
    : todaySchedule.length > 0
    ? 'ทานครบแล้ว'
    : 'ยังไม่มีมื้อยา';

  const nextMedWarning = nextMed ? getMedAvoidance(nextMed.medicationName) : null;
  const nextMedImage = nextMed ? getMedImage(nextMed.medicationName, nextMed.medicationId) : null;

  // Pagination for Right Box: "ยาที่ต้องรับประทานวันนี้"
  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(todaySchedule.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const pageItems = todaySchedule.slice(
    safeCurrentPage * PAGE_SIZE,
    (safeCurrentPage + 1) * PAGE_SIZE
  );

  const handlePrevPage = () => {
    setCurrentPage(p => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  };

  const handleConfirmCurrentPage = async () => {
    const untaken = pageItems.filter(i => !i.isTaken);
    if (untaken.length > 0) {
      for (const item of untaken) {
        await markTaken(item.id, true);
      }
    } else {
      const nextUntaken = todaySchedule.find(i => !i.isTaken);
      if (nextUntaken) {
        await markTaken(nextUntaken.id, true);
      }
    }
  };

  // Grouped schedule for Expanded View
  const MEAL_ORDER = ['มื้อเช้า', 'มื้อกลางวัน', 'มื้อเย็น', 'ก่อนนอน'];
  const mealsGrouped = MEAL_ORDER.map(mealName => ({
    name: mealName,
    items: todaySchedule.filter(s => getMealCategory(s.time, s.mealTiming) === mealName),
  })).filter(g => g.items.length > 0);

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B95F6']} />
        }
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>
              สวัสดี, {user?.name ? user.name.split(' ')[0] : 'สมชาย'}
            </Text>
            <Text style={styles.dateText}>{getThaiDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color="#8B95F6" />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Card 1: Today's Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>ความคืบหน้าวันนี้</Text>
            <Text style={styles.progressFraction}>
              {takenCount} / {totalCount} รายการ
            </Text>
          </View>
          {/* Progress Bar Track */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${totalCount > 0 ? Math.min(100, Math.max(5, progressPercent)) : 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {totalCount === 0
              ? 'ยังไม่มีตารางรับประทานยาสำหรับวันนี้'
              : remainingCount === 0
              ? `กิน ${takenCount} ครั้ง • ครบทุกมื้อแล้ว • ทำได้ดี!`
              : `กิน ${takenCount} ครั้ง • เหลืออีก ${remainingCount} ครั้ง • ทำได้ดี!`}
          </Text>
        </View>

        {/* Section: Next Reminder Header */}
        <Text style={styles.sectionHeaderTitle}>แจ้งเตือนถัดไป</Text>

        {/* Card 2: Next Reminder Card (Lilac Container) */}
        <View style={styles.nextReminderCard}>
          <View style={styles.reminderTopRow}>
            {/* Left Column: Next Meal Information */}
            <View style={styles.reminderLeftCol}>
              <Text style={styles.nextMealTag}>มื้อถัดไป</Text>
              <Text style={styles.nextMealTitle}>{nextMealName}</Text>

              {nextMed ? (
                <>
                  {/* Medicine Row */}
                  <View style={styles.nextMedRow}>
                    <View style={styles.medIconBox}>
                      {nextMedImage ? (
                        <Image
                          source={{ uri: nextMedImage }}
                          style={styles.medThumbImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <PillIcon type={nextMed.type || 'เม็ด'} size={20} containerSize={42} />
                      )}
                    </View>
                    <View style={styles.nextMedInfo}>
                      <Text style={styles.nextMedName} numberOfLines={1}>
                        {formatCleanDrugName(nextMed.medicationName)}
                      </Text>
                      <Text style={styles.nextMedMeta} numberOfLines={1}>
                        {nextMed.dosage}{nextMed.unit} • 1 {nextMed.type} • {nextMed.mealTiming}
                      </Text>
                    </View>
                  </View>

                  {/* Food Avoidance Tag & Bullet Points */}
                  {nextMedWarning && (
                    <View style={styles.avoidanceSection}>
                      <View style={styles.avoidBadge}>
                        <Text style={styles.avoidBadgeText}>อาหารที่ควรเลี่ยง</Text>
                      </View>
                      <Text style={styles.avoidBulletText} numberOfLines={1}>
                        • {formatCleanFoodName(nextMedWarning.foodName)}
                      </Text>
                      {nextMedWarning.hoursNote ? (
                        <Text style={styles.avoidBulletText} numberOfLines={1}>
                          • {nextMedWarning.hoursNote}
                        </Text>
                      ) : null}
                      {nextMedWarning.impactDetails ? (
                        <Text style={styles.avoidBulletText} numberOfLines={1}>
                          • {formatConciseText(nextMedWarning.impactDetails, 35)}
                        </Text>
                      ) : null}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyNextMedBox}>
                  <Text style={styles.emptyNextMedText}>ยังไม่มีรายการยาในมื้อนี้</Text>
                </View>
              )}
            </View>

            {/* Right Column: White Card Box (Checklist & Confirmation) */}
            <View style={styles.reminderRightBox}>
              <View style={styles.rightBoxHeaderRow}>
                <Text style={styles.rightBoxTitle}>Checklist</Text>
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    onPress={handlePrevPage}
                    disabled={safeCurrentPage === 0}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                  >
                    <Text
                      style={[
                        styles.pageArrowText,
                        safeCurrentPage === 0 && styles.pageArrowDisabled,
                      ]}
                    >
                      &lt;
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.pageNumberText}>
                    {' '}{safeCurrentPage + 1} / {totalPages}{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={handleNextPage}
                    disabled={safeCurrentPage >= totalPages - 1}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  >
                    <Text
                      style={[
                        styles.pageArrowText,
                        safeCurrentPage >= totalPages - 1 && styles.pageArrowDisabled,
                      ]}
                    >
                      &gt;
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Medication Checklist for Current Page */}
              <View style={styles.checklistContainer}>
                {pageItems.length > 0 ? (
                  pageItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.checkItemRow}
                      onPress={() => markTaken(item.id, !item.isTaken)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkCircle,
                          item.isTaken && styles.checkCircleActive,
                        ]}
                      >
                        {item.isTaken && (
                          <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.checkItemText,
                          item.isTaken && styles.checkItemTextTaken,
                        ]}
                        numberOfLines={1}
                      >
                        {formatCleanDrugName(item.medicationName)} • 1 {item.type} •{' '}
                        {item.mealTiming}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyListText}>ไม่มีรายการยา</Text>
                )}
              </View>

              {/* Confirm Intake Action Button */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmCurrentPage}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>กดเพื่อยืนยันการรับประทาน</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expanded View: All meals grouped as shown in Image 2 */}
          {isExpandedAllMeals && (
            <View style={styles.expandedContainer}>
              {mealsGrouped.map(meal => (
                <View key={meal.name} style={styles.mealGroupSection}>
                  <Text style={styles.mealGroupTitle}>{meal.name}</Text>
                  {meal.items.map(item => {
                    const itemWarning = getMedAvoidance(item.medicationName);
                    const itemImage = getMedImage(item.medicationName, item.medicationId);

                    return (
                      <View key={item.id} style={styles.expandedItemCard}>
                        {/* Top row: Image, Name/Details, Status Badge */}
                        <View style={styles.expandedCardTopRow}>
                          <View style={styles.medIconBox}>
                            {itemImage ? (
                              <Image
                                source={{ uri: itemImage }}
                                style={styles.medThumbImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <PillIcon
                                type={item.type || 'เม็ด'}
                                size={20}
                                containerSize={42}
                              />
                            )}
                          </View>

                          <View style={styles.expandedCardInfo}>
                            <Text style={styles.expandedMedName} numberOfLines={1}>
                              {formatCleanDrugName(item.medicationName)}
                            </Text>
                            <Text style={styles.expandedMedMeta} numberOfLines={1}>
                              {item.dosage}{item.unit} • 1 {item.type} • {item.mealTiming}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={[
                              styles.statusBadge,
                              item.isTaken
                                ? styles.statusBadgeTaken
                                : styles.statusBadgePending,
                            ]}
                            onPress={() => markTaken(item.id, !item.isTaken)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                item.isTaken
                                  ? styles.statusBadgeTextTaken
                                  : styles.statusBadgeTextPending,
                              ]}
                            >
                              {item.isTaken ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Food Avoidance details for this item */}
                        {itemWarning && (
                          <View style={styles.expandedAvoidSection}>
                            <View style={styles.avoidBadge}>
                              <Text style={styles.avoidBadgeText}>อาหารที่ควรเลี่ยง</Text>
                            </View>
                            <Text style={styles.avoidBulletText} numberOfLines={1}>
                              • {formatCleanFoodName(itemWarning.foodName)}
                            </Text>
                            {itemWarning.hoursNote ? (
                              <Text style={styles.avoidBulletText} numberOfLines={1}>
                                • {itemWarning.hoursNote}
                              </Text>
                            ) : null}
                            {itemWarning.impactDetails ? (
                              <Text style={styles.avoidBulletText} numberOfLines={1}>
                                • {formatConciseText(itemWarning.impactDetails, 40)}
                              </Text>
                            ) : null}
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
            onPress={() => setIsExpandedAllMeals(!isExpandedAllMeals)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillToggleText}>
              {isExpandedAllMeals ? 'ซ่อนรายการทั้งหมด' : 'รายการรับประทานยาทั้งหมด'}
            </Text>
            <Feather
              name={isExpandedAllMeals ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#8B95F6"
            />
          </TouchableOpacity>
        </View>

        {/* Section: Quick Shortcuts ("ทางลัด") */}
        <Text style={styles.sectionHeaderTitle}>ทางลัด</Text>
        <View style={styles.shortcutsGrid}>
          {/* Shortcut 1: เพิ่มยาใหม่ */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#F5F3FF' }]}
            onPress={() => router.push('/add-medication')}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={26} color="#6366F1" />
            <Text style={styles.shortcutText}>เพิ่มยาใหม่</Text>
          </TouchableOpacity>

          {/* Shortcut 2: ตารางยา */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#F0FDF4' }]}
            onPress={() => router.push('/schedule')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="view-grid-outline" size={26} color="#16A34A" />
            <Text style={styles.shortcutText}>ตารางยา</Text>
          </TouchableOpacity>

          {/* Shortcut 3: ผลข้างเคียง */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#FEF2F2' }]}
            onPress={() => router.push('/log-side-effect')}
            activeOpacity={0.7}
          >
            <Text style={styles.exclamationIcon}>!</Text>
            <Text style={styles.shortcutText}>ผลข้างเคียง</Text>
          </TouchableOpacity>

          {/* Shortcut 4: อาหารที่ควรเลี่ยง */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#EFF6FF' }]}
            onPress={() => router.push('/food-interactions')}
            activeOpacity={0.7}
          >
            <Feather name="x" size={26} color="#2563EB" />
            <Text style={styles.shortcutText}>อาหารที่ควรเลี่ยง</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#8B95F6',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressFraction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B95F6',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  nextReminderCard: {
    backgroundColor: '#F3F4FD',
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
  },
  reminderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderLeftCol: {
    flex: 1.05,
    paddingRight: 10,
  },
  nextMealTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B95F6',
    marginBottom: 2,
  },
  nextMealTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 10,
  },
  nextMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  medIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF0FF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medThumbImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  nextMedInfo: {
    marginLeft: 8,
    flex: 1,
  },
  nextMedName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  nextMedMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  avoidanceSection: {
    marginTop: 4,
  },
  avoidBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  avoidBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  avoidBulletText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 15,
  },
  emptyNextMedBox: {
    paddingVertical: 12,
  },
  emptyNextMedText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reminderRightBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rightBoxHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rightBoxTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 2,
  },
  pageArrowDisabled: {
    color: '#CBD5E1',
  },
  pageNumberText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  checklistContainer: {
    minHeight: 68,
    justifyContent: 'center',
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3.5,
  },
  checkCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkItemText: {
    marginLeft: 6,
    fontSize: 9.5,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  checkItemTextTaken: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  emptyListText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#8B95F6',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
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
  mealGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  expandedItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
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
  },
  statusBadgeTaken: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  statusBadgePending: {
    borderColor: '#FDE047',
    backgroundColor: '#FEFCE8',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusBadgeTextTaken: {
    color: '#16A34A',
  },
  statusBadgeTextPending: {
    color: '#CA8A04',
  },
  expandedAvoidSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shortcutCard: {
    width: '48%',
    height: 86,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
  },
  exclamationIcon: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 28,
  },
});
