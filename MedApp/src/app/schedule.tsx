import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { useApp } from '@/context/AppContext';
import {
  ScheduleItem,
  getLocalDateString,
  isMedicationScheduledForDate,
} from '@/services/medService';
import {
  formatCleanDrugName,
  resolveMedicationImageUri,
} from '@/services/interactionMatcher';

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const WEEK_DAY_LABELS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
const THAI_DAY_NAMES = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

export default function ScheduleScreen() {
  const router = useRouter();
  const {
    medications,
    masterMedications,
    todaySchedule,
    getScheduleForDate,
    refreshData,
  } = useApp();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem[]>([]);
  const [weekSchedulesMap, setWeekSchedulesMap] = useState<Record<string, ScheduleItem[]>>({});
  const [previewMedImage, setPreviewMedImage] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const todayStr = getLocalDateString(new Date());
  const selectedDateStr = getLocalDateString(selectedDate);
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthTitle = `${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`;

  // Monday of the selectedDate's week (0 = Mon .. 6 = Sun)
  const selectedDayOfWeek = (selectedDate.getDay() + 6) % 7;
  const monday = useMemo(() => {
    return new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() - selectedDayOfWeek
    );
  }, [selectedDate, selectedDayOfWeek]);

  const hasScheduledMedOnDate = useCallback(
    (d: Date) => medications.some(m => isMedicationScheduledForDate(m, d)),
    [medications]
  );

  const weekDays = useMemo(() => {
    return WEEK_DAY_LABELS.map((label, idx) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      const dStr = getLocalDateString(d);
      return {
        label,
        day: d.getDate(),
        date: d,
        dateStr: dStr,
        isToday: dStr === todayStr,
        hasDot: hasScheduledMedOnDate(d),
      };
    });
  }, [monday, todayStr, hasScheduledMedOnDate]);

  // Month grid cells (Monday-first to match weekDayLabels)
  const monthCells = useMemo(() => {
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const firstOffset = (firstOfMonth.getDay() + 6) % 7; // 0 = Mon .. 6 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: Array<{
      day: number | null;
      date?: Date;
      dateStr?: string;
      hasDot?: boolean;
    }> = [];

    for (let i = 0; i < firstOffset; i++) {
      cells.push({ day: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      cells.push({
        day,
        date: d,
        dateStr: getLocalDateString(d),
        hasDot: hasScheduledMedOnDate(d),
      });
    }
    return cells;
  }, [currentYear, currentMonth, hasScheduledMedOnDate]);

  // Load schedule for selectedDate whenever date or medications/todaySchedule changes
  useEffect(() => {
    let active = true;
    getScheduleForDate(selectedDateStr).then(items => {
      if (active) {
        setSelectedSchedule(items);
      }
    });
    return () => {
      active = false;
    };
  }, [selectedDateStr, medications, todaySchedule, getScheduleForDate]);

  // Load full week schedules when in 'week' view mode
  useEffect(() => {
    if (viewMode !== 'week') return;
    let active = true;
    Promise.all(
      weekDays.map(async wd => {
        const items = await getScheduleForDate(wd.dateStr);
        return [wd.dateStr, items] as const;
      })
    ).then(entries => {
      if (active) {
        const nextMap: Record<string, ScheduleItem[]> = {};
        entries.forEach(([k, v]) => {
          nextMap[k] = v;
        });
        setWeekSchedulesMap(nextMap);
      }
    });
    return () => {
      active = false;
    };
  }, [viewMode, weekDays, medications, todaySchedule, getScheduleForDate]);

  const handlePrevPeriod = () => {
    if (viewMode === 'month') {
      const targetMonth = currentMonth - 1;
      const maxDay = new Date(currentYear, targetMonth + 1, 0).getDate();
      setSelectedDate(
        new Date(currentYear, targetMonth, Math.min(selectedDate.getDate(), maxDay))
      );
    } else {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() - 7)
      );
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'month') {
      const targetMonth = currentMonth + 1;
      const maxDay = new Date(currentYear, targetMonth + 1, 0).getDate();
      setSelectedDate(
        new Date(currentYear, targetMonth, Math.min(selectedDate.getDate(), maxDay))
      );
    } else {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() + 7)
      );
    }
  };

  const cleanTime = (t?: string) => (t || '').replace(' น.', '').trim();
  const timeSlots = Array.from(new Set(selectedSchedule.map(s => cleanTime(s.time)))).sort();

  const renderScheduleCard = (item: ScheduleItem) => {
    const imgUri = resolveMedicationImageUri(
      { id: item.medicationId, name: item.medicationName },
      masterMedications,
      medications
    );
    const cleanName = formatCleanDrugName(item.medicationName);
    const dosageDisplay = item.dosage
      ? item.unit && !item.dosage.includes(item.unit)
        ? `${item.dosage} ${item.unit}`
        : item.dosage
      : '';
    const doseCount = item.doseCount || 1;
    const metaParts = [
      dosageDisplay,
      `${doseCount} ${item.type || 'เม็ด'}`,
      item.mealTiming,
    ].filter(Boolean);

    const statusLabel = item.isTaken
      ? 'กินยาแล้ว'
      : item.isChecked
      ? 'รอยืนยัน'
      : 'ยังไม่ได้กินยา';

    return (
      <View key={item.id} style={styles.itemCard}>
        {imgUri ? (
          <TouchableOpacity
            onPress={() =>
              setPreviewMedImage({
                uri: imgUri,
                name: cleanName,
              })
            }
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Image
              source={{ uri: imgUri }}
              style={styles.medThumbImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : null}

        <View style={[styles.itemDetails, !imgUri && { marginLeft: 0 }]}>
          <Text style={styles.itemName} numberOfLines={1}>
            {cleanName}
          </Text>
          <Text style={styles.itemMeta}>{metaParts.join(' • ')}</Text>
        </View>

        <View
          style={[
            styles.intakeStatusBadge,
            item.isTaken
              ? styles.intakeStatusTaken
              : item.isChecked
              ? styles.intakeStatusPending
              : styles.intakeStatusUntaken,
          ]}
        >
          <Text
            style={[
              styles.intakeStatusText,
              item.isTaken
                ? styles.intakeStatusTextTaken
                : item.isChecked
                ? styles.intakeStatusTextPending
                : styles.intakeStatusTextUntaken,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
    );
  };

  const weekHasAnyItems = useMemo(
    () => weekDays.some(wd => (weekSchedulesMap[wd.dateStr] || []).length > 0),
    [weekDays, weekSchedulesMap]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="ตารางยา"
        rightAction={
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}
              onPress={() => setViewMode('day')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'day' && styles.toggleBtnTextActive]}>
                วัน
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
              onPress={() => setViewMode('week')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'week' && styles.toggleBtnTextActive]}>
                สัปดาห์
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'month' && styles.toggleBtnActive]}
              onPress={() => setViewMode('month')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'month' && styles.toggleBtnTextActive]}>
                เดือน
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Header */}
        <View style={styles.weekHeader}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={handlePrevPeriod}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={16} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={handleNextPeriod}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Calendar Strip (Day/Week) or Full Month Grid (Month) */}
        {viewMode === 'month' ? (
          <View style={styles.monthGridCard}>
            <View style={styles.monthWeekLabelsRow}>
              {WEEK_DAY_LABELS.map(lbl => (
                <View key={lbl} style={styles.monthCell}>
                  <Text style={styles.dayLabel}>{lbl}</Text>
                </View>
              ))}
            </View>
            <View style={styles.monthCellsWrap}>
              {monthCells.map((cell, idx) => {
                if (!cell.day || !cell.date || !cell.dateStr) {
                  return <View key={`empty-${idx}`} style={styles.monthCell} />;
                }
                const isSelected = cell.dateStr === selectedDateStr;
                return (
                  <TouchableOpacity
                    key={cell.dateStr}
                    style={styles.monthCell}
                    onPress={() => cell.date && setSelectedDate(cell.date)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                      <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                        {cell.day}
                      </Text>
                    </View>
                    {cell.hasDot ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.daysStrip}>
            {weekDays.map(item => {
              const isSelected = item.dateStr === selectedDateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={styles.dayCol}
                  onPress={() => setSelectedDate(item.date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayLabel}>{item.label}</Text>
                  <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                      {item.day}
                    </Text>
                  </View>
                  {item.hasDot ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected Date Label when viewing non-today or month mode */}
        {viewMode !== 'week' && (
          <Text style={styles.selectedDateBanner}>
            {selectedDateStr === todayStr
              ? `วันนี้ • ${selectedDate.getDate()} ${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`
              : `${THAI_DAY_NAMES[selectedDate.getDay()]}ที่ ${selectedDate.getDate()} ${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`}
          </Text>
        )}

        {/* Schedule List */}
        {viewMode === 'week' ? (
          !weekHasAnyItems ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={36} color="#8B95F6" />
              </View>
              <Text style={styles.emptyTitle}>ไม่มีตารางยาสำหรับสัปดาห์นี้</Text>
              <Text style={styles.emptySubtitle}>
                เพิ่มรายการยาใหม่หรือเปิดใช้งานยาที่บันทึกไว้ เพื่อสร้างตารางรับประทานยาประจำวัน
              </Text>
              <TouchableOpacity
                style={styles.addMedButton}
                onPress={() => router.push('/add-medication')}
                activeOpacity={0.8}
              >
                <Text style={styles.addMedButtonText}>+ เพิ่มยาใหม่</Text>
              </TouchableOpacity>
            </View>
          ) : (
            weekDays.map(wd => {
              const dayItems = weekSchedulesMap[wd.dateStr] || [];
              if (dayItems.length === 0) return null;
              const daySlots = Array.from(new Set(dayItems.map(s => cleanTime(s.time)))).sort();
              return (
                <View key={wd.dateStr} style={styles.weekDaySection}>
                  <Text style={styles.selectedDateBanner}>
                    {wd.dateStr === todayStr
                      ? `วันนี้ • ${wd.date.getDate()} ${THAI_MONTHS_FULL[wd.date.getMonth()]}`
                      : `${THAI_DAY_NAMES[wd.date.getDay()]}ที่ ${wd.date.getDate()} ${THAI_MONTHS_FULL[wd.date.getMonth()]}`}
                  </Text>
                  {daySlots.map(time => {
                    const items = dayItems.filter(s => cleanTime(s.time) === time);
                    return (
                      <View key={`${wd.dateStr}-${time}`} style={styles.timeGroup}>
                        <Text style={styles.timeTitle}>{time} น.</Text>
                        {items.map(renderScheduleCard)}
                      </View>
                    );
                  })}
                </View>
              );
            })
          )
        ) : timeSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="calendar" size={36} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedDateStr === todayStr
                ? 'ไม่มีตารางยาสำหรับวันนี้'
                : `ไม่มีตารางยาสำหรับวันที่ ${selectedDate.getDate()} ${THAI_MONTHS_FULL[currentMonth]}`}
            </Text>
            <Text style={styles.emptySubtitle}>
              เพิ่มรายการยาใหม่หรือเปิดใช้งานยาที่บันทึกไว้ เพื่อสร้างตารางรับประทานยาประจำวัน
            </Text>
            <TouchableOpacity
              style={styles.addMedButton}
              onPress={() => router.push('/add-medication')}
              activeOpacity={0.8}
            >
              <Text style={styles.addMedButtonText}>+ เพิ่มยาใหม่</Text>
            </TouchableOpacity>
          </View>
        ) : (
          timeSlots.map(time => {
            const items = selectedSchedule.filter(s => cleanTime(s.time) === time);
            return (
              <View key={time} style={styles.timeGroup}>
                <Text style={styles.timeTitle}>{time} น.</Text>
                {items.map(renderScheduleCard)}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Enlarged Medication Photo Popup Modal */}
      <Modal
        visible={Boolean(previewMedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewMedImage(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPreviewMedImage(null)}
        >
          <Pressable
            style={styles.imagePreviewModalContainer}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.imagePreviewHeader}>
              <Text style={[styles.modalTitle, { flex: 1, marginRight: 10 }]} numberOfLines={2}>
                {previewMedImage?.name || 'รูปภาพยา'}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewMedImage(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.imagePreviewCloseBtn}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {previewMedImage?.uri ? (
              <View style={styles.imagePreviewFrame}>
                <Image
                  source={{ uri: previewMedImage.uri }}
                  style={styles.imagePreviewLarge}
                  resizeMode="contain"
                />
              </View>
            ) : null}
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  daysStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  monthGridCard: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  monthWeekLabelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  monthCellsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    width: '14.2857%',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#8B95F6',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dayNumberActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B95F6',
    marginTop: 4,
  },
  dotSpacer: {
    width: 4,
    height: 4,
    marginTop: 4,
  },
  selectedDateBanner: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 12,
  },
  weekDaySection: {
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  addMedButton: {
    backgroundColor: '#8B95F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addMedButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  timeGroup: {
    marginBottom: 20,
  },
  timeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  medThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  intakeStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeStatusTaken: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  intakeStatusPending: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FEF08A',
  },
  intakeStatusUntaken: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  intakeStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  intakeStatusTextTaken: {
    color: '#16A34A',
  },
  intakeStatusTextPending: {
    color: '#D97706',
  },
  intakeStatusTextUntaken: {
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  imagePreviewModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  imagePreviewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewFrame: {
    width: '100%',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    overflow: 'hidden',
  },
  imagePreviewLarge: {
    width: '100%',
    height: '100%',
  },
});
