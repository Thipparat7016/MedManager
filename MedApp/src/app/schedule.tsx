import React from 'react';
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
import { Ionicons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScheduleDoseCard } from '@/components/schedule/ScheduleDoseCard';
import { useScheduleScreen } from '@/hooks/useScheduleScreen';

export default function ScheduleScreen() {
  const {
    THAI_MONTHS_FULL,
    WEEK_DAY_LABELS,
    THAI_DAY_NAMES,
    medications,
    masterMedications,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    previewMedImage,
    setPreviewMedImage,
    todayStr,
    selectedDateStr,
    currentYear,
    currentMonth,
    weekDays,
    periodTitle,
    weekSchedulesMap,
    weekHasAnyItems,
    orderedWeekDays,
    monthCells,
    selectedSchedule,
    timeSlots,
    cleanTime,
    handlePrevPeriod,
    handleNextPeriod,
    goToAddMedication,
  } = useScheduleScreen();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="ตาราง"
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
                onPress={goToAddMedication}
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
                          {items.map(item => (
                            <ScheduleDoseCard
                              key={item.id}
                              item={item}
                              masterMedications={masterMedications}
                              medications={medications}
                              onPreviewImage={setPreviewMedImage}
                            />
                          ))}
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
              onPress={goToAddMedication}
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
                {items.map(item => (
                  <ScheduleDoseCard
                    key={item.id}
                    item={item}
                    masterMedications={masterMedications}
                    medications={medications}
                    onPreviewImage={setPreviewMedImage}
                  />
                ))}
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
