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
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { useApp } from '@/context/AppContext';

export default function ConfirmIntakeScreen() {
  const router = useRouter();
  const { todaySchedule, markTaken, postponeSchedule, skipSchedule } = useApp();

  const handleConfirm = async () => {
    const aspirineItem = todaySchedule.find(s => s.medicationName === 'แอสไพริน');
    if (aspirineItem) {
      await markTaken(aspirineItem.id, true);
    }
    Alert.alert('บันทึกสำเร็จ', 'บันทึกการรับประทานยาเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  const handlePostpone = () => {
    const aspirineItem = todaySchedule.find(s => s.medicationName === 'แอสไพริน');
    if (aspirineItem) {
      postponeSchedule(aspirineItem.id, 30);
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
          const aspirineItem = todaySchedule.find(s => s.medicationName === 'แอสไพริน');
          if (aspirineItem) {
            skipSchedule(aspirineItem.id);
          }
          router.replace('/(tabs)' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ยืนยันการรับประทานยา" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Medicine Preview */}
        <View style={styles.medPreviewCard}>
          <View style={styles.photoBox}>
            <Text style={styles.photoPlaceholderText}>รูปถ่ายยา</Text>
          </View>
          <Text style={styles.medTitle}>แอสไพริน</Text>
          <Text style={styles.medSubtitle}>100mg • 1 เม็ด</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>14:00 น. • หลังอาหาร</Text>
          </View>
        </View>

        {/* Card 2: Food Caution (Red/Pink) */}
        <View style={styles.cautionCard}>
          <View style={styles.cautionHeader}>
            <Ionicons name="warning" size={16} color="#DC2626" style={styles.cautionIcon} />
            <Text style={styles.cautionTitle}>ข้อควรระวังด้านอาหาร</Text>
          </View>
          <Text style={styles.avoidLabel}>หลีกเลี่ยง:</Text>
          <Text style={styles.avoidItem}>• น้ำผลไม้ส้ม / กรีบฟรุต</Text>
          <Text style={styles.avoidItem}>• แอลกอฮอล์ทุกชนิด</Text>
          <Text style={styles.avoidItem}>• ยาต้านการอักเสบ (NSAIDs) อื่น</Text>

          <View style={styles.hoursBox}>
            <Ionicons name="time-outline" size={15} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.hoursText}>งดก่อนและหลังรับประทาน 2 ชั่วโมง</Text>
          </View>
        </View>

        {/* Card 3: Intake Recommendations (Green) */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>คำแนะนำการรับประทาน</Text>
          <View style={styles.checkItemRow}>
            <Ionicons name="checkbox-outline" size={16} color="#16A34A" style={styles.checkIcon} />
            <Text style={styles.checkItemText}>รับประทานหลังอาหารทันที</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Ionicons name="checkbox-outline" size={16} color="#16A34A" style={styles.checkIcon} />
            <Text style={styles.checkItemText}>ดื่มน้ำตามอย่างน้อย 1 แก้ว</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Ionicons name="checkbox-outline" size={16} color="#16A34A" style={styles.checkIcon} />
            <Text style={styles.checkItemText}>ห้ามบดหรือเคี้ยวยา</Text>
          </View>
          <View style={styles.checkItemRow}>
            <Ionicons name="warning-outline" size={16} color="#DC2626" style={styles.checkIcon} />
            <Text style={styles.warningItemText}>หากลืมกิน ให้กินทันทีที่นึกได้</Text>
          </View>
        </View>

        {/* Card 4: Side Effects Caution (Blue) */}
        <View style={styles.sideEffectCard}>
          <Text style={styles.sideEffectTitle}>ผลข้างเคียงที่ควรระวัง</Text>
          <Text style={styles.sideEffectList}>คลื่นไส้ • ปวดท้อง • เลือดออกผิดปกติ</Text>
          <Text style={styles.sideEffectNotice}>หากพบอาการ กรุณาพบแพทย์ทันที</Text>
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
  },
  medPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoBox: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#F1F3FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  medTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  medSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  timeBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  timeBadgeText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  cautionCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    marginBottom: 14,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cautionIcon: {
    marginRight: 6,
  },
  cautionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  avoidLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  avoidItem: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  hoursText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  guideCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    marginBottom: 14,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 10,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 8,
  },
  checkItemText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
  warningItemText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  sideEffectCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 20,
  },
  sideEffectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 6,
  },
  sideEffectList: {
    fontSize: 13,
    color: '#1E40AF',
    marginBottom: 4,
    fontWeight: '500',
  },
  sideEffectNotice: {
    fontSize: 12,
    color: '#64748B',
  },
  confirmButton: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  postponeButton: {
    flex: 1,
    height: 48,
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
    color: '#0F172A',
  },
  skipButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
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
    paddingVertical: 8,
  },
  logAbnormalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
});
