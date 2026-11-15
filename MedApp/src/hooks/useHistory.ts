import { useApp } from '@/context/AppContext';

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function useHistory() {
  const { todaySchedule } = useApp();

  // Filter schedules that have been taken
  const takenToday = todaySchedule.filter(s => s.isTaken);

  const now = new Date();
  const todayLabel = `วันนี้, ${now.getDate()} ${THAI_MONTHS[now.getMonth()]} ${
    now.getFullYear() + 543
  }`;

  return {
    takenToday,
    todayLabel,
  };
}
