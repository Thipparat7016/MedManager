import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';

interface HistoryEntry {
  id: string;
  name: string;
  dose: string;
  mealTiming: string;
  time: string;
  type?: string;
}

interface DateGroup {
  dateLabel: string;
  items: HistoryEntry[];
}

const HISTORY_GROUPS: DateGroup[] = [
  {
    dateLabel: 'วันนี้, 12/7/2569',
    items: [
      {
        id: 'h-1',
        name: 'เมทฟอร์มิน',
        dose: '500mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '07:00 น.',
        type: 'เม็ด',
      },
      {
        id: 'h-2',
        name: 'วิตามินซี',
        dose: '100mg • 2 เม็ด',
        mealTiming: 'พร้อมอาหาร',
        time: '12:00 น.',
        type: 'อาหารเสริม',
      },
      {
        id: 'h-3',
        name: 'แอสไพริน',
        dose: '100mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '14:00 น.',
        type: 'เม็ด',
      },
    ],
  },
  {
    dateLabel: 'เมื่อวาน, 11/7/2569',
    items: [
      {
        id: 'h-4',
        name: 'เมทฟอร์มิน',
        dose: '500mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '20:00 น.',
        type: 'เม็ด',
      },
    ],
  },
  {
    dateLabel: '10/7/2569',
    items: [
      {
        id: 'h-5',
        name: 'เมทฟอร์มิน',
        dose: '500mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '08:00 น.',
        type: 'เม็ด',
      },
      {
        id: 'h-6',
        name: 'วิตามินดี',
        dose: '100mg • 3 เม็ด',
        mealTiming: 'ก่อนอาหาร',
        time: '10:00 น.',
        type: 'อาหารเสริม',
      },
      {
        id: 'h-7',
        name: 'แอสไพริน',
        dose: '100mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '20:00 น.',
        type: 'เม็ด',
      },
    ],
  },
  {
    dateLabel: '09/7/2569',
    items: [
      {
        id: 'h-8',
        name: 'แอสไพริน',
        dose: '100mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '08:00 น.',
        type: 'เม็ด',
      },
      {
        id: 'h-9',
        name: 'วิตามินดี',
        dose: '100mg • 3 เม็ด',
        mealTiming: 'ก่อนอาหาร',
        time: '10:00 น.',
        type: 'อาหารเสริม',
      },
      {
        id: 'h-10',
        name: 'เมทฟอร์มิน',
        dose: '500mg • 1 เม็ด',
        mealTiming: 'หลังอาหาร',
        time: '20:00 น.',
        type: 'เม็ด',
      },
      {
        id: 'h-11',
        name: 'วิตามินซี',
        dose: '1000mg • 1 เม็ด',
        mealTiming: 'พร้อมอาหาร',
        time: '13:30 น.',
        type: 'อาหารเสริม',
      },
    ],
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ประวัติการรับประทานยา" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {HISTORY_GROUPS.map(group => (
          <View key={group.dateLabel} style={styles.groupContainer}>
            <Text style={styles.dateGroupHeader}>{group.dateLabel}</Text>
            {group.items.map(item => (
              <View key={item.id} style={styles.historyCard}>
                <PillIcon type={item.type || item.name} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.dose} • {item.mealTiming}
                  </Text>
                </View>

                <View style={styles.timeAndStatus}>
                  <Text style={styles.itemTime}>{item.time}</Text>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
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
