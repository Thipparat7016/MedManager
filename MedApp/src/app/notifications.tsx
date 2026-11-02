import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { useApp } from '@/context/AppContext';
import { AppNotification, formatHospitalName, formatDepartmentName } from '@/services/medService';
import { resolveMedicationImageUri, resolveRawImageUri } from '@/services/interactionMatcher';

export default function NotificationsScreen() {
  const {
    notifications,
    clearNotifications,
    markTaken,
    todaySchedule,
    postponeSchedule,
    refreshData,
    medications,
    masterMedications,
  } = useApp();

  const [previewImage, setPreviewImage] = useState<{ uri: string; name: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const findScheduleItemForNotif = (notif: AppNotification) => {
    if (notif.scheduleId) {
      const byId = todaySchedule.find(s => s.id === notif.scheduleId);
      if (byId) return byId;
    }
    if (notif.id.startsWith('notif-remind-')) {
      const extractedId = notif.id.replace('notif-remind-', '');
      const byExtracted = todaySchedule.find(s => s.id === extractedId);
      if (byExtracted) return byExtracted;
    }
    return todaySchedule.find(
      s =>
        !s.isTaken &&
        (!notif.medicationName || s.medicationName === notif.medicationName) &&
        (!notif.time || s.time === notif.time)
    );
  };

  const getMedImageForNotif = (notif: AppNotification): string | null => {
    if (notif.imageUrl) {
      const resolved = resolveRawImageUri(notif.imageUrl);
      if (resolved) return resolved;
    }
    const pendingItem = findScheduleItemForNotif(notif);
    return resolveMedicationImageUri(
      {
        id: pendingItem?.medicationId,
        name: notif.medicationName || pendingItem?.medicationName,
      },
      masterMedications,
      medications
    );
  };

  const handleConfirmTake = async (notif: AppNotification) => {
    const pendingItem = findScheduleItemForNotif(notif);
    if (pendingItem && !pendingItem.isTaken) {
      await markTaken(pendingItem.id, true);
    }
    Alert.alert('บันทึกสำเร็จ', 'ยืนยันการรับประทานยาเรียบร้อยแล้ว');
  };

  const handlePostpone = async (notif: AppNotification) => {
    const pendingItem = findScheduleItemForNotif(notif);
    if (pendingItem && !pendingItem.isTaken) {
      await postponeSchedule(pendingItem.id, 30);
    }
    Alert.alert('เลื่อนเวลา', 'เลื่อนการแจ้งเตือนออกไป 30 นาทีแล้ว');
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('ต้องการล้างการแจ้งเตือนทั้งหมดหรือไม่?')) {
        clearNotifications();
      }
      return;
    }
    Alert.alert('ล้างการแจ้งเตือน', 'ต้องการล้างการแจ้งเตือนทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ล้างทั้งหมด', style: 'destructive', onPress: clearNotifications },
    ]);
  };

  const todayNotifs = notifications.filter(n => n.date === 'วันนี้' || !n.date);
  const otherNotifs = notifications.filter(n => n.date && n.date !== 'วันนี้');

  const renderNotifCard = (notif: AppNotification, isToday: boolean) => {
    // 1. แจ้งเตือนรับประทานยา (med_reminder) -> เอารูปยามาใส่เลย
    if (notif.type === 'med_reminder') {
      const medImage = getMedImageForNotif(notif);
      const showActionButtons = isToday && notif.isActionable;

      return (
        <View key={notif.id} style={styles.notifCardPurple}>
          <View style={[styles.notifCardTop, !showActionButtons && { marginBottom: 0 }]}>
            {medImage ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setPreviewImage({
                    uri: medImage,
                    name: notif.medicationName || notif.title,
                  })
                }
              >
                <Image
                  source={{ uri: medImage }}
                  style={styles.medThumbImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconBoxPurple}>
                <MaterialCommunityIcons name="pill" size={22} color="#8B95F6" />
              </View>
            )}
            <View style={styles.notifTextCol}>
              <View style={styles.titleTimeRow}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifMessage}>{notif.message}</Text>
            </View>
          </View>
          {showActionButtons && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => handleConfirmTake(notif)}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnConfirmText}>ยืนยันกิน</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPostpone}
                onPress={() => handlePostpone(notif)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnPostponeText}>เลื่อน 30 นาที</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    // 2. ข้อควรระวังอาหาร (food_warning) -> ไอคอนอาหารเหมือนกันหมด
    if (notif.type === 'food_warning') {
      return (
        <View key={notif.id} style={styles.notifCardBlue}>
          <View style={styles.iconBoxBlue}>
            <Ionicons name="restaurant-outline" size={22} color="#0284C7" />
          </View>
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            <Text style={styles.notifMessage}>{notif.message}</Text>
          </View>
        </View>
      );
    }

    // 3. นัดหมายแพทย์ (appointment) -> ไอคอนสอดคล้องกับนัดหมาย พร้อมธีมการ์ดสีเขียว
    if (notif.type === 'appointment') {
      // เอาเวลาออกจากข้อความเพราะมีแสดงที่มุมขวาบนของการ์ดอยู่แล้ว และขึ้นต้นด้วยโรงพยาบาล/แผนกเสมอ
      let cleanMsg = (notif.message || '')
        .replace(/\s*[-–—•]\s*\d{1,2}:\d{2}\s*(น\.)?\s*$/, '')
        .trim();

      const rawParts = cleanMsg
        .split(/[\n•]/)
        .map(p => p.trim())
        .filter(Boolean);

      let doctorName = '';
      let hospitalName = '';
      let departmentName = '';

      for (let i = 0; i < rawParts.length; i++) {
        const part = rawParts[i];
        if (
          part.startsWith('แผนก') ||
          part.includes('กรรม') ||
          part.includes('วิทยา') ||
          part.includes('ตรวจ') ||
          part.includes('คลินิก') ||
          part.includes('สูติ') ||
          part.includes('แพทย์')
        ) {
          if (!departmentName && (part.startsWith('แผนก') || i > 0)) {
            departmentName = formatDepartmentName(part);
            continue;
          }
        }
        if (part.startsWith('โรงพยาบาล') || part.startsWith('รพ.') || part.includes('พยาบาล')) {
          hospitalName = formatHospitalName(part);
          continue;
        }
        if (i === 0) {
          doctorName = part;
        } else if (!hospitalName) {
          hospitalName = formatHospitalName(part);
        } else if (!departmentName) {
          departmentName = formatDepartmentName(part);
        }
      }

      const line1 = [doctorName, hospitalName].filter(Boolean).join(' • ');
      const displayMessage = [line1, departmentName].filter(Boolean).join('\n');

      return (
        <View key={notif.id} style={styles.notifCardGreen}>
          <View style={styles.iconBoxGreen}>
            <Ionicons name="calendar-outline" size={22} color="#10B981" />
          </View>
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            <Text style={styles.notifMessage}>{displayMessage}</Text>
          </View>
        </View>
      );
    }

    // 4. ยาใกล้หมด (low_stock)
    if (notif.type === 'low_stock') {
      const medImage = getMedImageForNotif(notif);
      return (
        <View key={notif.id} style={styles.notifCardAmber}>
          {medImage ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setPreviewImage({
                  uri: medImage,
                  name: notif.medicationName || notif.title,
                })
              }
            >
              <Image
                source={{ uri: medImage }}
                style={styles.medThumbImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBoxAmber}>
              <Ionicons name="alert-circle-outline" size={22} color="#D97706" />
            </View>
          )}
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            <Text style={styles.notifMessage}>{notif.message}</Text>
          </View>
        </View>
      );
    }

    // 5. รายการทั่วไป / ติ๊กสำเร็จ (med_taken หรืออื่นๆ)
    return (
      <View key={notif.id} style={styles.notifCardNormal}>
        <View style={styles.iconBoxCheck}>
          <Ionicons name="checkmark" size={18} color="#8B95F6" />
        </View>
        <View style={styles.notifTextCol}>
          <View style={styles.titleTimeRow}>
            <Text style={styles.notifTitle}>{notif.title}</Text>
            <Text style={styles.notifTime}>{notif.time}</Text>
          </View>
          <Text style={styles.notifMessage}>{notif.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="การแจ้งเตือน"
        rightActionText={notifications.length > 0 ? 'ล้างทั้งหมด' : undefined}
        onRightActionPress={handleClearAll}
        rightActionColor="#DC2626"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={40} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือนในขณะนี้</Text>
            <Text style={styles.emptySubtitle}>
              คุณจะได้รับการแจ้งเตือนอัตโนมัติเมื่อถึงเวลารับประทานยา ข้อควรระวังด้านอาหาร หรือเมื่อมีนัดหมายแพทย์
            </Text>
          </View>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>มื้อถัดไป</Text>
                {todayNotifs.map(notif => renderNotifCard(notif, true))}
              </>
            )}

            {otherNotifs.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: todayNotifs.length > 0 ? 24 : 0 }]}>
                  นัดหมายถัดไป
                </Text>
                {otherNotifs.map(notif => renderNotifCard(notif, false))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal ดูรูปยาขนาดใหญ่ */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPreviewImage(null)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {previewImage?.name || 'รูปยา'}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewImage(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {previewImage?.uri && (
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: previewImage.uri }}
                  style={styles.modalLargeImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
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
  medThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    lineHeight: 19,
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
  notifCardAmber: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxAmber: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
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
  // Modal Preview Image
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLargeImage: {
    width: '100%',
    height: '100%',
  },
});
