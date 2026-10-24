import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

interface SelectedDateObj {
  day: number;
  month: number;
  year: number;
}

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void;
  initialDate?: string; // Format: DD/MM/YYYY e.g. "31/12/2026"
  title?: string;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  title = 'เลือกวันที่',
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<SelectedDateObj | null>(null);

  // Parse initialDate if provided, or initialize to today's date when opened
  useEffect(() => {
    if (!visible) return;

    if (initialDate && initialDate.trim()) {
      const parts = initialDate.trim().split(/[\/\-.]/);
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          const normYear = y > 2400 ? y - 543 : y;
          const normMonth = Math.max(0, Math.min(11, m));
          setSelectedDate({ day: d, month: normMonth, year: normYear });
          setViewMonth(normMonth);
          setViewYear(normYear);
          return;
        }
      }
    }

    // Default to current date (วันปัจจุบัน)
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curDay = now.getDate();
    setSelectedDate({ day: curDay, month: curMonth, year: curYear });
    setViewMonth(curMonth);
    setViewYear(curYear);
  }, [initialDate, visible]);

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, ..., 6 = Sat

  // Build grid as weeks of 7 columns to guarantee 100% balance across all screen sizes
  const weeks = useMemo(() => {
    const rows: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        rows.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      rows.push(currentWeek);
    }

    return rows;
  }, [viewYear, viewMonth, daysInMonth, firstDayOfWeek]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      onClose();
      return;
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${pad(selectedDate.day)}/${pad(selectedDate.month + 1)}/${selectedDate.year}`;
    onSelectDate(formatted);
    onClose();
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const previewSubtitle = selectedDate
    ? `${pad(selectedDate.day)} ${THAI_MONTHS[selectedDate.month]} ${selectedDate.year}`
    : `${THAI_MONTHS[viewMonth]} ${viewYear}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{previewSubtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Month & Year Navigation Row (จัดสมดุล ไม่มีสัญลักษณ์ลูกศรคู่ << >>) */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={handlePrevMonth}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={20} color="#475569" />
            </TouchableOpacity>

            <View style={styles.monthYearTitleBox}>
              <Text style={styles.monthYearTitle}>
                {THAI_MONTHS[viewMonth]} {viewYear}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleNextMonth}
              activeOpacity={0.7}
            >
              <Feather name="chevron-right" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels (อา - ส) จัด 7 คอลัมน์ให้สมดุลตรงกับวันที่ */}
          <View style={styles.weekdaysRow}>
            {WEEKDAY_NAMES.map((w, idx) => (
              <View key={w} style={styles.weekdayCol}>
                <Text
                  style={[
                    styles.weekdayText,
                    idx === 0 && { color: '#EF4444' }, // Sun in red
                    idx === 6 && { color: '#6366F1' }, // Sat in indigo
                  ]}
                >
                  {w}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Weeks & Days Grid (จัดแบบแถว 7 คอลัมน์สมบูรณ์ ไม่มีการปัดตกหล่น) */}
          <View style={styles.calendarContainer}>
            {weeks.map((week, wIdx) => (
              <View key={`week-${wIdx}`} style={styles.weekRow}>
                {week.map((day, dIdx) => {
                  if (day === null) {
                    return <View key={`empty-${wIdx}-${dIdx}`} style={styles.dayCell} />;
                  }

                  // Action/วงกลมเลือกวันจะแสดงเฉพาะเมื่อตรงทั้งวัน-เดือน-ปีที่เลือกเท่านั้น
                  // เมื่อเลื่อนไปเดือนก่อนหน้า/เดือนถัดไป จะไม่มีวงกลมค้าง
                  const isSelected =
                    selectedDate !== null &&
                    selectedDate.day === day &&
                    selectedDate.month === viewMonth &&
                    selectedDate.year === viewYear;

                  return (
                    <View key={`day-${wIdx}-${day}`} style={styles.dayCell}>
                      <TouchableOpacity
                        style={[
                          styles.dayChip,
                          isSelected && styles.dayChipSelected,
                        ]}
                        onPress={() => setSelectedDate({ day, month: viewMonth, year: viewYear })}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Footer Actions (ยกเลิก / ตกลง) จัดขนาดและสมดุลเท่ากัน */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthYearTitleBox: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  calendarContainer: {
    marginBottom: 18,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
