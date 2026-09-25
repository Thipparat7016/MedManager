import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SavedSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const drugName = (params.name as string) || 'ยาใหม่';
  const drugDose = (params.dosage as string) || '';
  const drugUnit = (params.unit as string) || '';
  const timesStr = (params.times as string) || 'ตามที่กำหนด';
  const remainingStr = (params.remaining as string) || '0';
  const lowStockStr = (params.lowStock as string) || '0';
  const startDateStr = (params.startDate as string) || 'วันนี้';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>

        {/* Success Title & Description */}
        <Text style={styles.successTitle}>บันทึกสำเร็จ!</Text>
        <Text style={styles.successSubtitle}>
          ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว{'\n'}ระบบจะแจ้งเตือนตามเวลาที่ตั้งไว้
        </Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>สรุปที่บันทึก</Text>

          <Text style={styles.summaryMedName}>{drugName} {drugDose}{drugUnit}</Text>
          <Text style={styles.summaryItem}>{timesStr}</Text>
          <Text style={styles.summaryItem}>ทุกวัน • เริ่ม {startDateStr}</Text>
          <Text style={styles.summaryItem}>แจ้งเตือนก่อน 30 นาที</Text>
          <Text style={styles.summaryItem}>แจ้งเตือนอาหารที่ต้องหลีกเลี่ยง</Text>
          <Text style={styles.summaryItem}>
            คงเหลือ: {remainingStr} เม็ด • แจ้งเตือนเมื่อเหลือ {lowStockStr} เม็ด
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.replace('/schedule' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.outlineButtonText}>ดูตารางยา</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.replace('/add-medication' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.outlineButtonText}>+ เพิ่มยาอีกรายการ</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#5CD6A2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#5CD6A2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 20,
    marginBottom: 28,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryMedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});
