import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';

export default function ScheduleScreen() {
  const router = useRouter();
  const { todaySchedule, markTaken } = useApp();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const THAI_MONTHS_FULL = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const monthTitle = `${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`;

  // Find Monday of the current week
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);

  const weekDayLabels = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  const weekDays = weekDayLabels.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      label,
      day: d.getDate(),
      isToday: idx === dayOfWeek,
      hasDot: todaySchedule.length > 0 && idx === dayOfWeek,
    };
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(dayOfWeek);

  const timeSlots = Array.from(new Set(todaySchedule.map(s => s.time)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="ตารางยา"
        rightAction={
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}
              onPress={() => setViewMode('day')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'day' && styles.toggleBtnTextActive]}>
                วัน
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
              onPress={() => setViewMode('week')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'week' && styles.toggleBtnTextActive]}>
                สัปดาห์
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'month' && styles.toggleBtnActive]}
              onPress={() => setViewMode('month')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'month' && styles.toggleBtnTextActive]}>
                เดือน
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Strip Header */}
        <View style={styles.weekHeader}>
          <TouchableOpacity style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={16} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          <TouchableOpacity style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Days Strip */}
        <View style={styles.daysStrip}>
          {weekDays.map((item, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.dayCol}
                onPress={() => setSelectedDayIndex(idx)}
                activeOpacity={0.7}
              >
                <Text style={styles.dayLabel}>{item.label}</Text>
                <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                    {item.day}
                  </Text>
                </View>
                {item.hasDot && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule by Time */}
        {timeSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="calendar" size={36} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>ไม่มีตารางยาสำหรับวันนี้</Text>
            <Text style={styles.emptySubtitle}>
              เพิ่มรายการยาใหม่หรือเปิดใช้งานยาที่บันทึกไว้ เพื่อสร้างตารางรับประทานยาประจำวัน
            </Text>
            <TouchableOpacity
              style={styles.addMedButton}
              onPress={() => router.push('/add-medication')}
              activeOpacity={0.8}
            >
              <Text style={styles.addMedButtonText}>+ เพิ่มยาใหม่</Text>
            </TouchableOpacity>
          </View>
        ) : (
          timeSlots.map(time => {
            const items = todaySchedule.filter(s => s.time === time);
            return (
              <View key={time} style={styles.timeGroup}>
                <Text style={styles.timeTitle}>{time} น.</Text>
                {items.map(item => (
                  <View key={item.id} style={styles.itemCard}>
                    <PillIcon type={item.type || item.medicationName} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.medicationName}</Text>
                      <Text style={styles.itemMeta}>
                        {item.dosage} • 1 {item.type} • {item.mealTiming}
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
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  daysStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#8B95F6',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dayNumberActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B95F6',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  addMedButton: {
    backgroundColor: '#8B95F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addMedButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  timeGroup: {
    marginBottom: 20,
  },
  timeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#5CD6A2',
    borderColor: '#5CD6A2',
  },
});
