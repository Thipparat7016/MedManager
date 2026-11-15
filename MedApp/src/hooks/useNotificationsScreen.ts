import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { AppNotification } from '@/utils/types';
import { resolveMedicationImageUri, resolveRawImageUri } from '@/utils/interactionMatcher';

export function useNotificationsScreen() {
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
    const targetId = pendingItem?.id || notif.scheduleId || notif.id.replace('notif-remind-', '');
    if (targetId) {
      const newTime = await postponeSchedule(targetId, 30);
      Alert.alert(
        'เลื่อนเวลาสำเร็จ',
        `ระบบเลื่อนการรับประทานยาออกไป 30 นาที และจะแจ้งเตือนอีกครั้งเวลา ${newTime || ''}`.trim()
      );
    } else {
      Alert.alert('เลื่อนเวลา', 'เลื่อนการแจ้งเตือนออกไป 30 นาทีแล้ว');
    }
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

  return {
    notifications,
    todayNotifs,
    otherNotifs,
    previewImage,
    setPreviewImage,
    getMedImageForNotif,
    handleConfirmTake,
    handlePostpone,
    handleClearAll,
  };
}
