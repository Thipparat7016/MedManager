import { Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { isMedicationMatch, formatCleanDrugName } from '@/utils/interactionMatcher';

export function useConfirmIntake() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scheduleId?: string; medName?: string }>();
  const { todaySchedule, markTaken, postponeSchedule, skipSchedule, interactions, medications } =
    useApp();

  // Find the target schedule item
  let targetItem = params.scheduleId
    ? todaySchedule.find(s => s.id === params.scheduleId)
    : todaySchedule.find(s => !s.isTaken);

  // If still not found by ID or pending, find by medName or fallback to first
  if (!targetItem && params.medName) {
    targetItem = todaySchedule.find(s => s.medicationName === params.medName);
  }

  // Find associated food interaction using smart matching
  const targetMed = targetItem
    ? medications.find(m => m.name === targetItem?.medicationName)
    : medications.find(m => m.name === params.medName) || medications[0];
  const targetMedName = targetItem?.medicationName || params.medName || (medications[0]?.name ?? '');
  const extraContext = [targetMed?.instructions, targetMed?.precautions].filter(Boolean).join(' ');

  const foodWarning = interactions.find(
    i =>
      targetMedName &&
      i.interactionType === 'หลีกเลี่ยง' &&
      isMedicationMatch(targetMedName, i.medicationName, extraContext)
  );

  const handleConfirm = async () => {
    if (targetItem && !targetItem.isTaken) {
      await markTaken(targetItem.id, true);
    }
    if (Platform.OS === 'web') {
      router.replace('/(tabs)' as any);
      return;
    }
    Alert.alert('บันทึกสำเร็จ', 'บันทึกการรับประทานยาเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  const handlePostpone = async () => {
    if (targetItem && !targetItem.isTaken) {
      const newTime = await postponeSchedule(targetItem.id, 30);
      if (Platform.OS === 'web') {
        router.replace('/(tabs)' as any);
        return;
      }
      Alert.alert(
        'เลื่อนเวลาสำเร็จ',
        `ระบบเลื่อนการรับประทานยาออกไป 30 นาที และจะแจ้งเตือนอีกครั้งเวลา ${newTime || ''}`.trim(),
        [{ text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) }]
      );
      return;
    }
    if (Platform.OS === 'web') {
      router.replace('/(tabs)' as any);
      return;
    }
    Alert.alert('เลื่อนเวลา', 'เลื่อนการรับประทานยาออกไป 30 นาทีแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  const handleSkip = async () => {
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('ต้องการข้ามการรับประทานยาครั้งนี้หรือไม่?')
      ) {
        if (targetItem) {
          await skipSchedule(targetItem.id);
        }
        router.replace('/(tabs)' as any);
      }
      return;
    }
    Alert.alert('ยืนยันการข้าม', 'ต้องการข้ามการรับประทานยาครั้งนี้หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ข้ามครั้งนี้',
        style: 'destructive',
        onPress: async () => {
          if (targetItem) {
            await skipSchedule(targetItem.id);
          }
          router.replace('/(tabs)' as any);
        },
      },
    ]);
  };

  const isEmpty = !targetItem && medications.length === 0;
  const medName = formatCleanDrugName(targetItem?.medicationName || targetMedName || 'รายการยา');
  const medDose = targetItem?.dosage || '1 เม็ด';
  const medMeal = targetItem?.mealTiming || 'หลังอาหาร';
  const medTime = targetItem?.time ? `${targetItem.time} น.` : 'ตามกำหนด';

  return {
    isEmpty,
    medName,
    medDose,
    medMeal,
    medTime,
    foodWarning,
    handleConfirm,
    handlePostpone,
    handleSkip,
    goHome: () => router.replace('/(tabs)' as any),
    goLogSideEffect: () => router.push('/log-side-effect'),
  };
}
