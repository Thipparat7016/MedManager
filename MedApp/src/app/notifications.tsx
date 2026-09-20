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

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, clearNotifications, markTaken, todaySchedule } = useApp();

  const handleConfirmTake = async () => {
    const aspirineItem = todaySchedule.find(s => s.medicationName === 'แอสไพริน');
    if (aspirineItem) {
      await markTaken(aspirineItem.id, true);
    }
    Alert.alert('บันทึกสำเร็จ', 'ยืนยันการรับประทานยาเรียบร้อยแล้ว');
  };

  const handlePostpone = () => {
    Alert.alert('เลื่อนเวลา', 'เลื่อนการแจ้งเตือนออกไป 30 นาทีแล้ว');
  };

  const handleClearAll = () => {
    Alert.alert('ล้างการแจ้งเตือน', 'ต้องการล้างการแจ้งเตือนทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ล้างทั้งหมด', style: 'destructive', onPress: clearNotifications },
    ]);
  };

  const todayNotifs = notifications.filter(n => n.date === 'วันนี้');
  const yesterdayNotifs = notifications.filter(n => n.date === 'เมื่อวาน');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="การแจ้งเตือน"
        rightActionText="ล้างทั้งหมด"
        onRightActionPress={handleClearAll}
        rightActionColor="#DC2626"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Today */}
        <Text style={styles.sectionTitle}>วันนี้</Text>

        {/* Card 1: Actionable Med Reminder */}
        <View style={styles.notifCardPurple}>
          <View style={styles.notifCardTop}>
            <View style={styles.iconBoxPurple}>
              <Ionicons name="alarm-outline" size={22} color="#8B95F6" />
            </View>
            <View style={styles.notifTextCol}>
              <View style={styles.titleTimeRow}>
                <Text style={styles.notifTitle}>ถึงเวลารับประทานยา</Text>
                <Text style={styles.notifTime}>14:00 น.</Text>
              </View>
              <Text style={styles.notifMessage}>แอสไพริน 100mg — 1 เม็ด หลังอาหาร</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={handleConfirmTake}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.btnConfirmText}>ยืนยันกิน</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPostpone}
              onPress={handlePostpone}
              activeOpacity={0.7}
            >
              <Text style={styles.btnPostponeText}>เลื่อน 30 นาที</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2: Food Warning */}
        <View style={styles.notifCardBlue}>
          <View style={styles.iconBoxBlue}>
            <Ionicons name="information" size={20} color="#38BDF8" />
          </View>
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>แจ้งเตือนล่วงหน้า: อาหาร</Text>
              <Text style={styles.notifTime}>13:00 น.</Text>
            </View>
            <Text style={styles.notifMessage}>งดส้มและน้ำส้ม 1 ชม. ก่อนรับประทานแอสไพริน</Text>
          </View>
        </View>

        {/* Card 3: Doctor Appointment */}
        <View style={styles.notifCardGreen}>
          <View style={styles.iconBoxGreen}>
            <Ionicons name="clipboard-outline" size={20} color="#10B981" />
          </View>
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>นัดหมายแพทย์พรุ่งนี้</Text>
              <Text style={styles.notifTime}>13:00 น.</Text>
            </View>
            <Text style={styles.notifMessage}>นพ. สมศักดิ์ • โรงพยาบาล A - 09:00 น.</Text>
          </View>
        </View>

        {/* Section: Yesterday */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>เมื่อวาน</Text>

        {/* Card 4: Intake Done */}
        <View style={styles.notifCardNormal}>
          <View style={styles.iconBoxCheck}>
            <Ionicons name="checkmark" size={18} color="#8B95F6" />
          </View>
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>รับประทานยาสำเร็จ</Text>
              <Text style={styles.notifTime}>20:05 น.</Text>
            </View>
            <Text style={styles.notifMessage}>เมทฟอร์มิน 500mg - ยืนยัน 20:05 น.</Text>
          </View>
        </View>

        {/* Card 5: Low Stock */}
        <View style={styles.notifCardNormal}>
          <View style={styles.iconBoxPill}>
            <MaterialCommunityIcons name="pill" size={18} color="#8B95F6" />
          </View>
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>ยาใกล้หมด</Text>
              <Text style={styles.notifTime}>09:00 น.</Text>
            </View>
            <Text style={styles.notifMessage}>แอสไพริน เหลือ 5 เม็ด กรุณาสั่งซื้อเพิ่ม</Text>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
  },
  notifCardPurple: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 16,
    marginBottom: 12,
  },
  notifCardTop: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  iconBoxPurple: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifTextCol: {
    flex: 1,
  },
  titleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifMessage: {
    fontSize: 13,
    color: '#64748B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnConfirm: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#8B95F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnPostpone: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPostponeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  notifCardBlue: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxBlue: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifCardGreen: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxGreen: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifCardNormal: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxCheck: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
