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
  buildScheduleForDateSync,
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
  const [storedSchedulesMap, setStoredSchedulesMap] = useState<Record<string, ScheduleItem[]>>({});
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

  // A date gets a red dot ONLY if buildScheduleForDateSync returns at least 1 scheduled dose for that date
  const hasScheduledMedOnDate = useCallback(
    (d: Date) => {
      const dStr = getLocalDateString(d);
      const storedForDay =
        dStr === todayStr ? todaySchedule : storedSchedulesMap[dStr] || [];
      return buildScheduleForDateSync(medications, d, storedForDay).length > 0;
    },
    [medications, todayStr, todaySchedule, storedSchedulesMap]
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

  const periodTitle = useMemo(() => {
    if (viewMode !== 'week' || weekDays.length < 7) {
      return monthTitle;
    }
    const startD = weekDays[0].date;
    const endD = weekDays[6].date;
    const startYearBE = startD.getFullYear() + 543;
    const endYearBE = endD.getFullYear() + 543;
    if (startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear()) {
      return `${startD.getDate()} – ${endD.getDate()} ${THAI_MONTHS_FULL[endD.getMonth()]} ${endYearBE}`;
    }
    if (startD.getFullYear() === endD.getFullYear()) {
      return `${startD.getDate()} ${THAI_MONTHS_FULL[startD.getMonth()]} – ${endD.getDate()} ${THAI_MONTHS_FULL[endD.getMonth()]} ${endYearBE}`;
    }
    return `${startD.getDate()} ${THAI_MONTHS_FULL[startD.getMonth()]} ${startYearBE} – ${endD.getDate()} ${THAI_MONTHS_FULL[endD.getMonth()]} ${endYearBE}`;
  }, [viewMode, weekDays, monthTitle]);

  // Synchronously compute schedules for all 7 days of the active week
  const weekSchedulesMap = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    for (const wd of weekDays) {
      const storedForDay =
        wd.dateStr === todayStr
          ? todaySchedule
          : storedSchedulesMap[wd.dateStr] || [];
      map[wd.dateStr] = buildScheduleForDateSync(medications, wd.date, storedForDay);
    }
    return map;
  }, [weekDays, medications, todayStr, todaySchedule, storedSchedulesMap]);

  const weekHasAnyItems = useMemo(
    () => weekDays.some(wd => (weekSchedulesMap[wd.dateStr] || []).length > 0),
    [weekDays, weekSchedulesMap]
  );

  // Put the selected day first at the top so tapping any day in week view immediately updates the top section
  const orderedWeekDays = useMemo(() => {
    const selectedWd = weekDays.find(wd => wd.dateStr === selectedDateStr);
    const otherScheduledWds = weekDays.filter(
      wd => wd.dateStr !== selectedDateStr && (weekSchedulesMap[wd.dateStr] || []).length > 0
    );
    return selectedWd ? [selectedWd, ...otherScheduledWds] : otherScheduledWds;
  }, [weekDays, selectedDateStr, weekSchedulesMap]);

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

  // Synchronously compute schedule for selectedDate so switching days or adding/editing/deleting meds updates in 0ms
  const selectedSchedule = useMemo(() => {
    const storedForDay =
      selectedDateStr === todayStr
        ? todaySchedule
        : storedSchedulesMap[selectedDateStr] || [];
    return buildScheduleForDateSync(medications, selectedDate, storedForDay);
  }, [medications, selectedDate, selectedDateStr, todayStr, todaySchedule, storedSchedulesMap]);

  // Load persisted taken/checked status for selectedDate whenever date or medications/todaySchedule changes
  useEffect(() => {
    let active = true;
    getScheduleForDate(selectedDateStr).then(items => {
      if (active) {
        setStoredSchedulesMap(prev => ({
          ...prev,
          [selectedDateStr]: items,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, [selectedDateStr, medications, todaySchedule, getScheduleForDate]);

  // Hydrate persisted taken/checked status for all 7 days in the active week when in week view
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
        setStoredSchedulesMap(prev => {
          const next = { ...prev };
          entries.forEach(([k, v]) => {
            next[k] = v;
          });
          return next;
        });
      }
    });
    return () => {
      active = false;
    };
  }, [viewMode, monday, medications, todaySchedule, getScheduleForDate]);

  const handlePrevPeriod = () => {
    if (viewMode === 'month') {
      const targetMonth = currentMonth - 1;
      const maxDay = new Date(currentYear, targetMonth + 1, 0).getDate();
      setSelectedDate(
        new Date(currentYear, targetMonth, Math.min(selectedDate.getDate(), maxDay))
      );
    } else if (viewMode === 'week') {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() - 7)
      );
    } else {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() - 1)
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
    } else if (viewMode === 'week') {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() + 7)
      );
    } else {
      setSelectedDate(
        new Date(currentYear, currentMonth, selectedDate.getDate() + 1)
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
      ? 'ยืนยันแล้ว'
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
          <Text style={styles.monthTitle}>{periodTitle}</Text>
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

        {/* Selected Date Label (Day & Month modes) */}
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
                <Feather name="calendar" size={36} color="#6FA07E" />
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
            orderedWeekDays.map((wd, wdIdx) => {
              const dayItems = weekSchedulesMap[wd.dateStr] || [];
              const daySlots = Array.from(new Set(dayItems.map(s => cleanTime(s.time)))).sort();
              const isSelectedDay = wd.dateStr === selectedDateStr;
              const wdYearBE = wd.date.getFullYear() + 543;
              const bannerText =
                wd.dateStr === todayStr
                  ? `วันนี้ • ${wd.date.getDate()} ${THAI_MONTHS_FULL[wd.date.getMonth()]} ${wdYearBE}`
                  : `${THAI_DAY_NAMES[wd.date.getDay()]}ที่ ${wd.date.getDate()} ${THAI_MONTHS_FULL[wd.date.getMonth()]} ${wdYearBE}`;

              return (
                <View key={wd.dateStr} style={styles.weekDaySection}>
                  {wdIdx === 1 && (
                    <View style={styles.weekOtherDaysDivider}>
                      <View style={styles.weekOtherDaysLine} />
                      <Text style={styles.weekOtherDaysLabel}>วันอื่นๆ ในสัปดาห์นี้</Text>
                      <View style={styles.weekOtherDaysLine} />
                    </View>
                  )}
                  <Text style={styles.selectedDateBanner}>{bannerText}</Text>
                  {daySlots.length === 0 && isSelectedDay ? (
                    <View style={styles.weekEmptySelectedCard}>
                      <Feather name="calendar" size={18} color="#6FA07E" />
                      <Text style={styles.weekEmptySelectedText}>
                        {wd.dateStr === todayStr
                          ? 'ไม่มีตารางยาสำหรับวันนี้'
                          : `ไม่มีตารางยาสำหรับวันที่ ${wd.date.getDate()} ${THAI_MONTHS_FULL[wd.date.getMonth()]}`}
                      </Text>
                    </View>
                  ) : (
                    daySlots.map(time => {
                      const items = dayItems.filter(s => cleanTime(s.time) === time);
                      return (
                        <View key={`${wd.dateStr}-${time}`} style={styles.timeGroup}>
                          <Text style={styles.timeTitle}>{time} น.</Text>
                          {items.map(renderScheduleCard)}
                        </View>
                      );
                    })
                  )}
                </View>
              );
            })
          )
        ) : timeSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="calendar" size={36} color="#6FA07E" />
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
    gap: 6,
    alignItems: 'center',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1E7DD',
    backgroundColor: '#FFFFFF',
  },
  toggleBtnActive: {
    backgroundColor: '#6FA07E',
    borderColor: '#6FA07E',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D7B54',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
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
    overflow: 'hidden',
  },
  dayCircleActive: {
    backgroundColor: '#dbede1ff',
    borderRadius: 17,
    overflow: 'hidden',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dayNumberActive: {
    color: '#629a72ff',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B91C1C',
    marginTop: 4,
  },
  dotSpacer: {
    width: 4,
    height: 4,
    marginTop: 4,
  },
  selectedDateBanner: {
    fontSize: 17,
    fontWeight: '700',
    color: '#629a72ff',
    marginBottom: 12,
  },
  weekDaySection: {
    marginBottom: 10,
  },
  weekOtherDaysDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  weekOtherDaysLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2EFE6',
  },
  weekOtherDaysLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6FA07E',
    marginHorizontal: 10,
  },
  weekEmptySelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FBFC',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D1E7DD',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  weekEmptySelectedText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
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
    backgroundColor: '#F0FDF4',
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
    backgroundColor: '#6FA07E',
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
    backgroundColor: '#F9FBFC',
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C8EBD2',
    paddingVertical: 18,
    paddingHorizontal: 14,
    minHeight: 86,
    marginBottom: 10,
    position: 'relative',
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
    marginRight: 84,
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
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeStatusTaken: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
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
