import { useRouter, useLocalSearchParams } from 'expo-router';

export function useSavedSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const drugName = (params.name as string) || 'ยาใหม่';
  const drugDose = (params.dosage as string) || '';
  const drugUnit = (params.unit as string) || '';
  const timesStr = (params.times as string) || 'ตามที่กำหนด';
  const remainingStr = ((params.remaining as string) || '').trim();
  const lowStockStr = ((params.lowStock as string) || '').trim();
  const startDateStr = (params.startDate as string) || 'วันนี้';
  const durationStr = (params.duration as string) || 'ทุกวัน';

  const stockSummaryText =
    remainingStr && lowStockStr
      ? `คงเหลือ: ${remainingStr} เม็ด • แจ้งเตือนเมื่อเหลือ ${lowStockStr} เม็ด`
      : remainingStr
      ? `คงเหลือ: ${remainingStr} เม็ด`
      : lowStockStr
      ? `แจ้งเตือนเมื่อเหลือ ${lowStockStr} เม็ด`
      : '';

  return {
    drugName,
    drugDose,
    drugUnit,
    timesStr,
    startDateStr,
    durationStr,
    stockSummaryText,
    goHome: () => router.replace('/(tabs)' as any),
    goSchedule: () => router.replace('/schedule' as any),
    goAddMedication: () => router.replace('/add-medication' as any),
  };
}
