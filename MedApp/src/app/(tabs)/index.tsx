import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useHomeDashboard } from '@/hooks/useHomeDashboard';
import { HomeProgressCard } from '@/components/home/HomeProgressCard';
import { HomeNextReminderCard } from '@/components/home/HomeNextReminderCard';
import { HomeShortcutsGrid } from '@/components/home/HomeShortcutsGrid';

export default function HomeScreen() {
  const {
    user,
    todaySchedule,
    thaiDateText,
    MEAL_TIME_RANGES,
    isExpandedAllMeals,
    setIsExpandedAllMeals,
    refreshing,
    onRefresh,
    previewMedImage,
    setPreviewMedImage,
    takenCount,
    totalCount,
    progressPercent,
    remainingCount,
    getMedImage,
    getMedAvoidances,
    nextMealName,
    nextMealItems,
    mealsGrouped,
    currentMeal,
    pageItems,
    safeCurrentPage,
    totalPages,
    handlePrevPage,
    handleNextPage,
    handleConfirmCurrentPage,
    toggleChecklist,
    unreadNotifCount,
    topInsetPadding,
    goToNotifications,
    goToAddMedication,
    goToSchedule,
    goToLogSideEffect,
    goToFoodInteractions,
  } = useHomeDashboard();

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
            <Text style={styles.dateText}>{thaiDateText}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={goToNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color="#8B95F6" />
            {unreadNotifCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Card 1: Today's Progress */}
        <HomeProgressCard
          takenCount={takenCount}
          totalCount={totalCount}
          progressPercent={progressPercent}
          remainingCount={remainingCount}
        />

        {/* Section: Next Reminder Header */}
        <Text style={styles.sectionHeaderTitle}>แจ้งเตือนถัดไป</Text>

        {/* Card 2: Next Reminder Card (Lilac Container) */}
        <HomeNextReminderCard
          todayScheduleCount={todaySchedule.length}
          nextMealName={nextMealName}
          nextMealItems={nextMealItems}
          mealsGrouped={mealsGrouped}
          mealTimeRanges={MEAL_TIME_RANGES}
          isExpandedAllMeals={isExpandedAllMeals}
          onToggleExpandAllMeals={() => setIsExpandedAllMeals(!isExpandedAllMeals)}
          currentMealName={currentMeal?.name}
          pageItems={pageItems}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onToggleChecklistItem={toggleChecklist}
          onConfirmCurrentPage={handleConfirmCurrentPage}
          getMedImage={getMedImage}
          getMedAvoidances={getMedAvoidances}
          onPreviewMedImage={setPreviewMedImage}
        />

        {/* Section: Quick Shortcuts ("ทางลัด") */}
        <Text style={styles.sectionHeaderTitle}>ทางลัด</Text>
        <HomeShortcutsGrid
          onAddMedication={goToAddMedication}
          onSchedule={goToSchedule}
          onLogSideEffect={goToLogSideEffect}
          onFoodInteractions={goToFoodInteractions}
        />
      </ScrollView>

      {/* Enlarged Medication Photo Popup Modal */}
      <Modal
        visible={Boolean(previewMedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewMedImage(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPreviewMedImage(null)}
        >
          <Pressable
            style={styles.imagePreviewModalContainer}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.imagePreviewHeader}>
              <Text style={[styles.modalTitle, { flex: 1, marginRight: 10 }]} numberOfLines={2}>
                {previewMedImage?.name || 'รูปภาพยา'}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewMedImage(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.imagePreviewCloseBtn}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {previewMedImage?.uri ? (
              <View style={styles.imagePreviewFrame}>
                <Image
                  source={{ uri: previewMedImage.uri }}
                  style={styles.imagePreviewLarge}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
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
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  imagePreviewModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  imagePreviewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewFrame: {
    width: '100%',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    overflow: 'hidden',
  },
  imagePreviewLarge: {
    width: '100%',
    height: '100%',
  },
});
