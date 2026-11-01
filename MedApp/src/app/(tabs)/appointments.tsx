import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointments, deleteAppointment } = useApp();

  const now = useMemo(() => new Date(), []);
  const getYearPageBase = (y: number) => y - ((((y - 2024) % 12) + 12) % 12);

  const [viewYear, setViewYear] = useState<number>(now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());
  const [pickerMode, setPickerMode] = useState<'day' | 'month' | 'year'>('day');
  const [yearPageStart, setYearPageStart] = useState<number>(() =>
    getYearPageBase(now.getFullYear())
  );

  // รีเซ็ตปฏิทินเป็นวันที่ปัจจุบันแบบ real-time ทุกครั้งที่กลับมาที่หน้านัดหมาย
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setSelectedDay(today.getDate());
      setPickerMode('day');
      setYearPageStart(getYearPageBase(today.getFullYear()));
    }, [])
  );

  const THAI_MONTHS_FULL = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Parse appointment date string (DD/MM/YYYY or DD/MM/BE)
  const parseAptDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.trim().split(/[\/\-.]/);
    if (parts.length >= 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      let y = parseInt(parts[2], 10);
      if (y > 2400) y -= 543; // Buddhist Era to CE
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return { day: d, month: m, year: y };
      }
    }
    return null;
  };

  // Filter appointments for the currently selected date (Day / Month / Year)
  const selectedDateApts = useMemo(() => {
    return appointments.filter(apt => {
      if (apt.status === 'passed') return false;
      const parsed = parseAptDate(apt.date);
      if (!parsed) return false;
      return (
        parsed.day === selectedDay &&
        parsed.month === viewMonth &&
        parsed.year === viewYear
      );
    });
  }, [appointments, selectedDay, viewMonth, viewYear]);

  const pastApts = useMemo(() => {
    return appointments.filter(a => a.status === 'passed');
  }, [appointments]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('ยืนยันการลบ', `ต้องการลบนัดหมาย "${name}" หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => deleteAppointment(id) },
    ]);
  };

  const daysOfWeek = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

  // Dynamically calculate days of the viewed month & year
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday-first

  const calendarDays: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      calendarDays.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    calendarDays.push(currentWeek);
  }

  // Filter appointments for the currently viewed month & year
  const appointmentDays = useMemo(() => {
    return appointments
      .map(apt => parseAptDate(apt.date))
      .filter((parsed): parsed is { day: number; month: number; year: number } => {
        return !!parsed && parsed.month === viewMonth && parsed.year === viewYear;
      })
      .map(p => p.day);
  }, [appointments, viewMonth, viewYear]);

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

  const handleSelectYear = (yr: number) => {
    setViewYear(yr);
    setPickerMode('month');
  };

  const handleSelectMonth = (mIdx: number) => {
    setViewMonth(mIdx);
    const maxDay = new Date(viewYear, mIdx + 1, 0).getDate();
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
    setPickerMode('day');
  };

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>นัดหมายแพทย์</Text>
          <TouchableOpacity
            style={styles.addAptButton}
            onPress={() => router.push('/add-appointment')}
            activeOpacity={0.8}
          >
            <Text style={styles.addAptButtonText}>+ เพิ่ม</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Calendar Month & Year Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity
              style={styles.monthArrow}
              onPress={
                pickerMode === 'year'
                  ? () => setYearPageStart(prev => prev - 12)
                  : pickerMode === 'month'
                    ? () => setViewYear(prev => prev - 1)
                    : handlePrevMonth
              }
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color="#64748B" />
            </TouchableOpacity>

            {pickerMode === 'year' ? (
              <TouchableOpacity
                onPress={() => setPickerMode('day')}
                activeOpacity={0.7}
                style={styles.headerSelectorPill}
              >
                <Text style={styles.monthTitleText}>
                  {yearPageStart + 543} - {yearPageStart + 11 + 543}
                </Text>
              </TouchableOpacity>
            ) : pickerMode === 'month' ? (
              <TouchableOpacity
                onPress={() => setPickerMode('day')}
                activeOpacity={0.7}
                style={styles.headerSelectorPill}
              >
                <Text style={styles.monthTitleText}>
                  {THAI_MONTHS_FULL[viewMonth]}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.monthYearCenterRow}>
                {/* ปุ่มเลือกเดือน */}
                <TouchableOpacity
                  onPress={() => setPickerMode('month')}
                  activeOpacity={0.7}
                  style={styles.headerSelectorPill}
                >
                  <Text style={styles.monthTitleText}>
                    {THAI_MONTHS_FULL[viewMonth]}
                  </Text>
                </TouchableOpacity>

                {/* ปุ่มเลือกปี */}
                <TouchableOpacity
                  onPress={() => {
                    setYearPageStart(getYearPageBase(viewYear));
                    setPickerMode('year');
                  }}
                  activeOpacity={0.7}
                  style={styles.headerSelectorPill}
                >
                  <Text style={styles.monthTitleText}>{viewYear + 543}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.monthArrow}
              onPress={
                pickerMode === 'year'
                  ? () => setYearPageStart(prev => prev + 12)
                  : pickerMode === 'month'
                    ? () => setViewYear(prev => prev + 1)
                    : handleNextMonth
              }
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {pickerMode === 'year' ? (
            /* Year Grid (3x4 ในกรอบปฏิทินเดิม: เลือกปี >> ไปเลือกเดือน) */
            <View style={styles.selectorGridContainer}>
              {[0, 1, 2, 3].map(rowIdx => (
                <View key={`yr-row-${rowIdx}`} style={styles.selectorRow}>
                  {[0, 1, 2].map(colIdx => {
                    const yr = yearPageStart + rowIdx * 3 + colIdx;
                    const isYearSelected = yr === viewYear;
                    return (
                      <TouchableOpacity
                        key={`yr-${yr}`}
                        style={[
                          styles.selectorChip,
                          isYearSelected && styles.selectorChipSelected,
                        ]}
                        onPress={() => handleSelectYear(yr)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.selectorChipText,
                            isYearSelected && styles.selectorChipTextSelected,
                          ]}
                        >
                          {yr + 543}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : pickerMode === 'month' ? (
            /* Month Grid (3x4: เลือกเดือน >> ไปเลือกวัน) */
            <View style={styles.selectorGridContainer}>
              {[0, 1, 2, 3].map(rowIdx => (
                <View key={`mo-row-${rowIdx}`} style={styles.selectorRow}>
                  {[0, 1, 2].map(colIdx => {
                    const mIdx = rowIdx * 3 + colIdx;
                    const isMonthSelected = mIdx === viewMonth;
                    return (
                      <TouchableOpacity
                        key={`mo-${mIdx}`}
                        style={[
                          styles.selectorChip,
                          isMonthSelected && styles.selectorChipSelected,
                        ]}
                        onPress={() => handleSelectMonth(mIdx)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.selectorChipText,
                            isMonthSelected && styles.selectorChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {THAI_MONTHS_FULL[mIdx]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <>
              {/* Days of Week */}
              <View style={styles.daysRow}>
                {daysOfWeek.map((day, idx) => (
                  <Text key={idx} style={styles.dayLabel}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              {calendarDays.map((week, wIdx) => (
                <View key={wIdx} style={styles.weekRow}>
                  {week.map((d, dIdx) => {
                    if (!d) {
                      return <View key={dIdx} style={styles.dayCell} />;
                    }
                    const isSelected = d === selectedDay;
                    const hasApt = appointmentDays.includes(d);

                    return (
                      <TouchableOpacity
                        key={dIdx}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                        ]}
                        onPress={() => setSelectedDay(d)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayNumber,
                            isSelected && styles.dayNumberSelected,
                            hasApt && !isSelected && styles.dayNumberBold,
                          ]}
                        >
                          {d}
                        </Text>
                        {hasApt && !isSelected && (
                          <View style={styles.aptDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Section: Appointments for Selected Date */}
        <Text style={styles.sectionTitle}>นัดหมายที่กำลังจะมาถึง</Text>
        {selectedDateApts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="calendar" size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>ไม่มีนัดหมายในวันที่เลือก</Text>
            <Text style={styles.emptySubtext}>กดปุ่ม "+ เพิ่ม" เพื่อบันทึกนัดหมายแพทย์ใหม่</Text>
          </View>
        ) : (
          selectedDateApts.map(apt => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.aptCardHeader}>
                <Text style={styles.doctorName}>{apt.doctorName}</Text>
              </View>

              <Text style={styles.doctorDept}>{apt.department} • {apt.hospital}</Text>
              <Text style={styles.aptTimeText}>
                {apt.date} • {apt.time}
              </Text>

              {apt.details ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{apt.details}</Text>
                </View>
              ) : null}

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnEdit}
                  onPress={() =>
                    router.push({
                      pathname: '/edit-appointment' as any,
                      params: { id: apt.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnEditText}>แก้ไข</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnDelete}
                  onPress={() => handleDelete(apt.id, apt.doctorName)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnDeleteText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Section: Past Appointments */}
        {pastApts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ประวัตินัดหมาย</Text>
            {pastApts.map(apt => (
              <View key={apt.id} style={styles.pastCard}>
                <View style={styles.aptCardHeader}>
                  <Text style={styles.pastDoctorName}>{apt.doctorName}</Text>
                  <StatusBadge label="ผ่านแล้ว" variant="passed" size="sm" />
                </View>
                <Text style={styles.pastMeta}>{apt.details || apt.department}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  addAptButton: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  addAptButtonText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 13,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSelectorPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  monthTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#8B95F6',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayNumberBold: {
    fontWeight: '800',
    color: '#6366F1',
  },
  aptDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366F1',
    position: 'absolute',
    bottom: 4,
  },
  selectorGridContainer: {
    paddingVertical: 8,
    gap: 10,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectorChip: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  selectorChipSelected: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  selectorChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  selectorChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  aptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  aptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  doctorDept: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  aptTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 10,
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnEdit: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  actionBtnDelete: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  pastCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 8,
  },
  pastDoctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  pastMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
