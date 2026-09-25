import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';

export default function HistoryScreen() {
  const { todaySchedule } = useApp();

  // Filter schedules that have been taken
  const takenToday = todaySchedule.filter(s => s.isTaken);

  const now = new Date();
  const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const todayLabel = `วันนี้, ${now.getDate()} ${THAI_MONTHS[now.getMonth()]} ${now.getFullYear() + 543}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ประวัติการรับประทานยา" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {takenToday.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="clock" size={40} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีประวัติการรับประทานยา</Text>
            <Text style={styles.emptySubtitle}>
              เมื่อคุณกดยืนยันการรับประทานยาในหน้าหลัก หรือหน้าแจ้งเตือน รายการยาที่ทานแล้วจะแสดงในหน้านี้
            </Text>
          </View>
        ) : (
          <View style={styles.groupContainer}>
            <Text style={styles.dateGroupHeader}>{todayLabel}</Text>
            {takenToday.map(item => (
              <View key={item.id} style={styles.historyCard}>
                <PillIcon type={item.medicationName} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.medicationName}</Text>
                  <Text style={styles.itemMeta}>
                    {item.dosage} • {item.mealTiming}
                  </Text>
                </View>

                <View style={styles.timeAndStatus}>
                  <Text style={styles.itemTime}>{item.time} น.</Text>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  groupContainer: {
    marginBottom: 20,
  },
  dateGroupHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    padding: 14,
    marginBottom: 10,
  },
  itemInfo: {
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
  timeAndStatus: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemTime: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#5CD6A2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
