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
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { PillIcon } from '@/components/ui/PillIcon';

export default function HomeScreen() {
  const router = useRouter();
  const { user, todaySchedule, markTaken, notifications } = useApp();

  const takenCount = todaySchedule.filter(s => s.isTaken).length;
  const totalCount = todaySchedule.length || 5;
  const progressPercent = Math.round((takenCount / totalCount) * 100);
  const remainingCount = Math.max(0, totalCount - takenCount);

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
            <Text style={styles.greetingText}>สวัสดี, {user?.name?.split(' ')[0] || 'สมชาย'}</Text>
            <Text style={styles.dateText}>วันจันทร์ที่ 12 กรกฎาคม 2569</Text>
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
                { width: `${Math.min(100, Math.max(10, progressPercent))}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            กิน {takenCount} ครั้ง • เหลืออีก {remainingCount} ครั้ง • {takenCount >= 3 ? 'ทำได้ดี!' : 'อย่าลืมทานยาให้ตรงเวลานะครับ'}
          </Text>
        </View>

        {/* Card 2: Next Reminder */}
        <View style={styles.nextReminderCard}>
          <View style={styles.reminderTopRow}>
            <View style={styles.reminderLeftCol}>
              <Text style={styles.reminderTimeTag}>ถัดไปใน 45 นาที</Text>
              <Text style={styles.reminderTime}>14:00 น.</Text>
              <Text style={styles.reminderMedName}>แอสไพริน 100mg</Text>
              <Text style={styles.reminderMedDetail}>หลังอาหาร • 1 เม็ด</Text>
            </View>
            <View style={styles.reminderWarningBox}>
              <Text style={styles.warningTitle}>▲ หลีกเลี่ยง</Text>
              <Text style={styles.warningBullet}>• น้ำผลไม้ส้ม</Text>
              <Text style={styles.warningBullet}>• แอลกอฮอล์</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmActionButton}
            onPress={() => router.push('/confirm-intake')}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmActionText}>กดเพื่อยืนยันการรับประทาน →</Text>
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity onPress={() => router.push('/schedule')}>
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        {timeSlots.map(time => {
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
        })}
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
