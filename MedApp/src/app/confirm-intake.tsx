import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';

export default function ConfirmIntakeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scheduleId?: string; medName?: string }>();
  const { todaySchedule, markTaken, postponeSchedule, skipSchedule, interactions, medications } = useApp();

  // Find the target schedule item
  let targetItem = params.scheduleId
    ? todaySchedule.find(s => s.id === params.scheduleId)
    : todaySchedule.find(s => !s.isTaken);

  // If still not found by ID or pending, find by medName or fallback to first
  if (!targetItem && params.medName) {
    targetItem = todaySchedule.find(s => s.medicationName === params.medName);
  }

  // Find associated food interaction
  const targetMedName = targetItem?.medicationName || params.medName || (medications[0]?.name ?? '');
  const foodWarning = interactions.find(
    i => targetMedName && i.medicationName.includes(targetMedName) && i.interactionType === 'หลีกเลี่ยง'
  );

  const handleConfirm = async () => {
    if (targetItem) {
      await markTaken(targetItem.id, true);
    }
    Alert.alert('บันทึกสำเร็จ', 'บันทึกการรับประทานยาเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  const handlePostpone = () => {
    if (targetItem) {
      postponeSchedule(targetItem.id, 30);
    }
    Alert.alert('เลื่อนเวลา', 'เลื่อนการรับประทานยาออกไป 30 นาทีแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  const handleSkip = () => {
    Alert.alert('ยืนยันการข้าม', 'ต้องการข้ามการรับประทานยาครั้งนี้หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ข้ามครั้งนี้',
        style: 'destructive',
        onPress: () => {
          if (targetItem) {
            skipSchedule(targetItem.id);
          }
          router.replace('/(tabs)' as any);
        },
      },
    ]);
  };

  if (!targetItem && medications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="ยืนยันการรับประทานยา" />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="pill" size={40} color="#8B95F6" />
          </View>
          <Text style={styles.emptyTitle}>ไม่มีรายการยาที่ต้องรับประทาน</Text>
          <Text style={styles.emptySubtitle}>
            ยังไม่มีรายการยาในระบบ หรือรับประทานยาครบทุกมื้อแล้วสำหรับวันนี้
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)' as any)}
          >
            <Text style={styles.backButtonText}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const medName = targetItem?.medicationName || targetMedName || 'รายการยา';
  const medDose = targetItem?.dosage || '1 เม็ด';
  const medMeal = targetItem?.mealTiming || 'หลังอาหาร';
  const medTime = targetItem?.time ? `${targetItem.time} น.` : 'ตามกำหนด';

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ยืนยันการรับประทานยา" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Medicine Preview */}
        <View style={styles.medPreviewCard}>
          <View style={styles.pillIconWrap}>
            <PillIcon type={medName} size={48} />
          </View>
          <Text style={styles.medTitle}>{medName}</Text>
          <Text style={styles.medSubtitle}>{medDose}</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{medTime} • {medMeal}</Text>
          </View>
        </View>

        {/* Card 2: Food Caution (if available) */}
        {foodWarning ? (
          <View style={styles.cautionCard}>
            <View style={styles.cautionHeader}>
              <Ionicons name="warning" size={16} color="#DC2626" style={styles.cautionIcon} />
              <Text style={styles.cautionTitle}>ข้อควรระวังด้านอาหาร</Text>
            </View>
            <Text style={styles.avoidLabel}>หลีกเลี่ยง: {foodWarning.foodName}</Text>
            {foodWarning.impactDetails ? (
              <Text style={styles.avoidItem}>• {foodWarning.impactDetails}</Text>
            ) : null}

            {foodWarning.hoursNote ? (
              <View style={styles.hoursBox}>
                <Ionicons name="time-outline" size={15} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.hoursText}>{foodWarning.hoursNote}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Card 3: Intake Recommendations (Green) */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>คำแนะนำการรับประทาน</Text>
          <View style={styles.checkItemRow}>
            <Ionicons name="checkbox-outline" size={16} color="#16A34A" style={styles.checkIcon} />
            <Text style={styles.checkItemText}>รับประทาน{medMeal}</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Ionicons name="checkbox-outline" size={16} color="#16A34A" style={styles.checkIcon} />
            <Text style={styles.checkItemText}>ดื่มน้ำตามอย่างน้อย 1 แก้ว</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Ionicons name="warning-outline" size={16} color="#DC2626" style={styles.checkIcon} />
            <Text style={styles.warningItemText}>หากลืมกิน ให้กินทันทีที่นึกได้ หรือปฏิบัติตามคำสั่งแพทย์</Text>
          </View>
        </View>

        {/* Big Confirm Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.confirmButtonText}>ยืนยันรับประทานยาแล้ว</Text>
        </TouchableOpacity>

        {/* Row of Secondary Actions */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.postponeButton}
            onPress={handlePostpone}
            activeOpacity={0.7}
          >
            <Text style={styles.postponeButtonText}>เลื่อน 30 นาที</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Feather name="x" size={16} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={styles.skipButtonText}>ข้ามครั้งนี้</Text>
          </TouchableOpacity>
        </View>

        {/* Link to Log Side Effects */}
        <TouchableOpacity
          style={styles.logAbnormalLink}
          onPress={() => router.push('/log-side-effect')}
          activeOpacity={0.7}
        >
          <Text style={styles.logAbnormalText}>บันทึกอาการผิดปกติ</Text>
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
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B95F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  medPreviewCard: {
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  pillIconWrap: {
    marginBottom: 12,
  },
  medTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  medSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 12,
  },
  timeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  cautionCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    padding: 16,
    marginBottom: 16,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cautionIcon: {
    marginRight: 6,
  },
  cautionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  avoidLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 6,
  },
  avoidItem: {
    fontSize: 13,
    color: '#7F1D1D',
    marginBottom: 4,
    lineHeight: 18,
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FCA5A5',
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  guideCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 16,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 12,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  checkItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },
  warningItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: '#8B95F6',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  postponeButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postponeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  skipButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  logAbnormalLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logAbnormalText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B95F6',
    textDecorationLine: 'underline',
  },
});
