import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { PillIcon } from '@/components/ui/PillIcon';

export default function HomeScreen() {
  const router = useRouter();
  const { user, todaySchedule, markTaken, notifications, interactions, medications } = useApp();

  const takenCount = todaySchedule.filter(s => s.isTaken).length;
  const totalCount = todaySchedule.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const remainingCount = Math.max(0, totalCount - takenCount);

  // Dynamic Thai Date
  const getThaiDate = () => {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const now = new Date();
    return `${days[now.getDay()]}ที่ ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 543}`;
  };

  // Next pending medication
  const nextPending = todaySchedule.find(s => !s.isTaken && !s.isSkipped);

  // Matching food warning for next pending drug
  const matchingWarning = nextPending
    ? interactions.find(
        i =>
          i.interactionType === 'หลีกเลี่ยง' &&
          (i.medicationName.includes(nextPending.medicationName) || i.medicationName.includes('ทุกชนิด'))
      )
    : null;

  // Group today's schedule by time
  const timeSlots = Array.from(new Set(todaySchedule.map(s => s.time)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>
              {user?.name ? `สวัสดี, ${user.name.split(' ')[0]}` : 'สวัสดี, ผู้ใช้งาน'}
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
            <Text style={styles.progressFraction}>{takenCount} / {totalCount} รายการ</Text>
          </View>
          {/* Progress Bar */}
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
              ? 'ยังไม่มีตารางยาสำหรับวันนี้ เริ่มต้นเพิ่มยาใหม่ได้เลยครับ'
              : remainingCount === 0
              ? 'ยอดเยี่ยม! คุณรับประทานยาครบทุกมื้อแล้วสำหรับวันนี้'
              : `กิน ${takenCount} ครั้ง • เหลืออีก ${remainingCount} ครั้ง • อย่าลืมทานยาให้ตรงเวลานะครับ`}
          </Text>
        </View>

        {/* Card 2: Next Reminder (Dynamic) */}
        {nextPending ? (
          <View style={styles.nextReminderCard}>
            <View style={styles.reminderTopRow}>
              <View style={styles.reminderLeftCol}>
                <Text style={styles.reminderTimeTag}>มื้อถัดไป</Text>
                <Text style={styles.reminderTime}>{nextPending.time}</Text>
                <Text style={styles.reminderMedName}>{nextPending.medicationName} {nextPending.dosage}{nextPending.unit}</Text>
                <Text style={styles.reminderMedDetail}>{nextPending.mealTiming} • 1 {nextPending.type}</Text>
              </View>
              {matchingWarning && (
                <View style={styles.reminderWarningBox}>
                  <Text style={styles.warningTitle}>▲ หลีกเลี่ยง</Text>
                  <Text style={styles.warningBullet} numberOfLines={2}>• {matchingWarning.foodName}</Text>
                  {matchingWarning.hoursNote && (
                    <Text style={styles.warningBullet}>• {matchingWarning.hoursNote}</Text>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.confirmActionButton}
              onPress={() =>
                router.push({
                  pathname: '/confirm-intake',
                  params: {
                    id: nextPending.id,
                    name: nextPending.medicationName,
                    dosage: nextPending.dosage,
                    unit: nextPending.unit,
                    mealTiming: nextPending.mealTiming,
                    time: nextPending.time,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.confirmActionText}>กดเพื่อยืนยันการรับประทาน →</Text>
            </TouchableOpacity>
          </View>
        ) : totalCount > 0 && remainingCount === 0 ? (
          <View style={styles.emptyReminderCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyReminderTitle}>รับประทานยาครบแล้วสำหรับวันนี้</Text>
            <Text style={styles.emptyReminderSub}>ระบบจะเริ่มแจ้งเตือนตารางยาของวันพรุ่งนี้</Text>
          </View>
        ) : (
          <View style={styles.emptyReminderCard}>
            <MaterialCommunityIcons name="pill" size={32} color="#8B95F6" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyReminderTitle}>ยังไม่มีการแจ้งเตือนกินยาถัดไป</Text>
            <Text style={styles.emptyReminderSub}>คุณสามารถกดเพิ่มยาใหม่เพื่อเริ่มสร้างตารางแจ้งเตือน</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => router.push('/add-medication')}
            >
              <Text style={styles.emptyAddButtonText}>+ เพิ่มยาใหม่</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section: Quick Shortcuts */}
        <Text style={styles.sectionTitle}>ทางลัด</Text>
        <View style={styles.shortcutsGrid}>
          {/* Shortcut 1 */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#F1F3FE' }]}
            onPress={() => router.push('/add-medication')}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={24} color="#8B95F6" />
            <Text style={[styles.shortcutText, { color: '#4F46E5' }]}>เพิ่มยาใหม่</Text>
          </TouchableOpacity>

          {/* Shortcut 2 */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#EBF8F1' }]}
            onPress={() => router.push('/schedule')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="view-grid-outline" size={24} color="#10B981" />
            <Text style={[styles.shortcutText, { color: '#047857' }]}>ตารางยา</Text>
          </TouchableOpacity>

          {/* Shortcut 3 */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#FEEFEF' }]}
            onPress={() => router.push('/log-side-effect')}
            activeOpacity={0.7}
          >
            <Feather name="alert-triangle" size={22} color="#EF4444" />
            <Text style={[styles.shortcutText, { color: '#B91C1C' }]}>ผลข้างเคียง</Text>
          </TouchableOpacity>

          {/* Shortcut 4 */}
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#EBF4FE' }]}
            onPress={() => router.push('/food-interactions')}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color="#3B82F6" />
            <Text style={[styles.shortcutText, { color: '#1D4ED8' }]}>อาหารที่ควรเลี่ยง</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Today's Schedule */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.sectionTitle}>ตารางยาวันนี้</Text>
          {totalCount > 0 && (
            <TouchableOpacity onPress={() => router.push('/schedule')}>
              <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            </TouchableOpacity>
          )}
        </View>

        {totalCount === 0 ? (
          <View style={styles.emptyScheduleBox}>
            <Text style={styles.emptyScheduleText}>ยังไม่มีรายการยาในตารางวันนี้</Text>
            <TouchableOpacity
              style={styles.emptyScheduleAddBtn}
              onPress={() => router.push('/add-medication')}
            >
              <Text style={styles.emptyScheduleAddText}>+ เพิ่มยาและสร้างตาราง</Text>
            </TouchableOpacity>
          </View>
        ) : (
          timeSlots.map(time => {
            const itemsAtTime = todaySchedule.filter(s => s.time === time);
            return (
              <View key={time} style={styles.timeSlotGroup}>
                <Text style={styles.timeSlotLabel}>{time}</Text>
                {itemsAtTime.map(item => (
                  <View key={item.id} style={styles.scheduleCard}>
                    <PillIcon type={item.type || item.medicationName} />
                    <View style={styles.medInfoCol}>
                      <Text style={styles.medNameText}>{item.medicationName}</Text>
                      <Text style={styles.medDoseText}>
                        {item.dosage}{item.unit} • 1 {item.type} • {item.mealTiming}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.checkCircle,
                        item.isTaken && styles.checkCircleActive,
                      ]}
                      onPress={() => markTaken(item.id, !item.isTaken)}
                      activeOpacity={0.7}
                    >
                      {item.isTaken && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })
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
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
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
    backgroundColor: '#F1F3FE',
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
    backgroundColor: '#FAFAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EEF0F8',
    padding: 18,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressFraction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B95F6',
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  nextReminderCard: {
    backgroundColor: '#F8F9FE',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E4E7FD',
    padding: 18,
    marginBottom: 24,
  },
  reminderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reminderLeftCol: {
    flex: 1,
  },
  reminderTimeTag: {
    fontSize: 12,
    color: '#8B95F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  reminderMedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  reminderMedDetail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  reminderWarningBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
    maxWidth: 160,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B95F6',
    marginBottom: 4,
  },
  warningBullet: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  confirmActionButton: {
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyReminderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyReminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyReminderSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyAddButton: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyAddButtonText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    rowGap: 12,
  },
  shortcutCard: {
    width: '48%',
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  shortcutText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyScheduleBox: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScheduleText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  emptyScheduleAddBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyScheduleAddText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  timeSlotGroup: {
    marginBottom: 18,
  },
  timeSlotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    padding: 14,
    marginBottom: 10,
  },
  medInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  medNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  medDoseText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});
