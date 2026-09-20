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
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const weekDays = [
    { label: 'จ', day: 12, hasDot: true },
    { label: 'อ', day: 13, hasDot: true },
    { label: 'พ', day: 14, hasDot: true },
    { label: 'พฤ', day: 15, hasDot: true },
    { label: 'ศ', day: 16, hasDot: false },
    { label: 'ส', day: 17, hasDot: false },
    { label: 'อา', day: 18, hasDot: false },
  ];

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
          <Text style={styles.monthTitle}>กรกฎาคม 2569</Text>
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
        {timeSlots.map(time => {
          const items = todaySchedule.filter(s => s.time === time);
          return (
            <View key={time} style={styles.timeGroup}>
              <Text style={styles.timeTitle}>{time}</Text>
              {items.map(item => (
                <View key={item.id} style={styles.itemCard}>
                  <PillIcon type={item.type || item.medicationName} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.medicationName}</Text>
                    <Text style={styles.itemMeta}>
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

        {/* Add to Schedule Dashed Card */}
        <TouchableOpacity
          style={styles.addDashedCard}
          onPress={() => router.push('/add-medication')}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={20} color="#10B981" />
          <Text style={styles.addDashedText}>เพิ่มยาในตาราง</Text>
        </TouchableOpacity>
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
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: '#A7F3D0',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowBtn: {
    padding: 4,
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
  },
  dayCol: {
    alignItems: 'center',
    width: 40,
  },
  dayLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#A7F3D0',
  },
  dayNumber: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  dayNumberActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    marginTop: 4,
  },
  timeGroup: {
    marginBottom: 18,
  },
  timeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
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
  addDashedCard: {
    height: 70,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addDashedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 4,
  },
});
