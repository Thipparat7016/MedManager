import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatHospitalName, formatDepartmentName } from '@/utils/formatUtils';
import { useAppointmentsTab } from '@/hooks/useAppointmentsTab';

export default function AppointmentsScreen() {
  const {
    THAI_MONTHS_FULL,
    daysOfWeek,
    viewYear,
    viewMonth,
    selectedDay,
    setSelectedDay,
    pickerMode,
    yearPageStart,
    calendarDays,
    appointmentDays,
    selectedDateApts,
    pastApts,
    handleDelete,
    handlePrevPeriod,
    handleNextPeriod,
    openYearPicker,
    openMonthPicker,
    closePickerToDay,
    handleSelectYear,
    handleSelectMonth,
    goToAddAppointment,
    goToEditAppointment,
    topInsetPadding,
  } = useAppointmentsTab();

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
            onPress={goToAddAppointment}
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
              onPress={handlePrevPeriod}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color="#64748B" />
            </TouchableOpacity>

            {pickerMode === 'year' ? (
              <TouchableOpacity
                onPress={closePickerToDay}
                activeOpacity={0.7}
                style={styles.headerSelectorPill}
              >
                <Text style={styles.monthTitleText}>
                  {yearPageStart + 543} - {yearPageStart + 11 + 543}
                </Text>
              </TouchableOpacity>
            ) : pickerMode === 'month' ? (
              <TouchableOpacity
                onPress={closePickerToDay}
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
                  onPress={openMonthPicker}
                  activeOpacity={0.7}
                  style={styles.headerSelectorPill}
                >
                  <Text style={styles.monthTitleText}>
                    {THAI_MONTHS_FULL[viewMonth]}
                  </Text>
                </TouchableOpacity>

                {/* ปุ่มเลือกปี */}
                <TouchableOpacity
                  onPress={openYearPicker}
                  activeOpacity={0.7}
                  style={styles.headerSelectorPill}
                >
                  <Text style={styles.monthTitleText}>{viewYear + 543}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.monthArrow}
              onPress={handleNextPeriod}
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
            <Feather name="calendar" size={32} color="#6FA07E" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>ไม่มีนัดหมายในวันที่เลือก</Text>
            <Text style={styles.emptySubtext}>กดปุ่ม "+ เพิ่ม" เพื่อบันทึกนัดหมายแพทย์ใหม่</Text>
          </View>
        ) : (
          selectedDateApts.map(apt => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.aptCardHeader}>
                <Text style={styles.doctorName}>{apt.doctorName}</Text>
              </View>

              <Text style={styles.doctorDept}>
                {[formatDepartmentName(apt.department), formatHospitalName(apt.hospital)].filter(Boolean).join(' • ')}
              </Text>
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
                  onPress={() => goToEditAppointment(apt.id)}
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
                <Text style={styles.pastMeta}>{apt.details || formatDepartmentName(apt.department)}</Text>
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
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1E7DD',
  },
  addAptButtonText: {
    color: '#3D7B54',
    fontWeight: '700',
    fontSize: 13,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
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
    overflow: 'hidden',
  },
  dayCellSelected: {
    backgroundColor: '#6FA07E',
    borderRadius: 18,
    overflow: 'hidden',
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
    color: '#3D7B54',
  },
  aptDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B91C1C',
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
    backgroundColor: '#6FA07E',
    borderColor: '#6FA07E',
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
    borderColor: '#D1E7DD',
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
    borderColor: '#D1E7DD',
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
    flex: 1,
    marginRight: 8,
  },
  doctorDept: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  aptTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D7B54',
    marginBottom: 10,
  },
  notesBox: {
    backgroundColor: '#F0FBF3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: '#334155',
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
    borderWidth: 1,
    borderColor: '#C8EBD2',
    backgroundColor: '#F0FBF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#275238',
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
    flex: 1,
    marginRight: 8,
  },
  pastMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
