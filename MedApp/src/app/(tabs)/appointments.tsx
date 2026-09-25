import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { appointments, deleteAppointment } = useApp();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  const THAI_MONTHS_FULL = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const monthTitle = `${THAI_MONTHS_FULL[currentMonth]} ${currentYear + 543}`;

  const upcomingApts = appointments.filter(a => a.status !== 'passed');
  const pastApts = appointments.filter(a => a.status === 'passed');

  const handleDelete = (id: string, name: string) => {
    Alert.alert('ยืนยันการลบ', `ต้องการลบนัดหมาย "${name}" หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => deleteAppointment(id) },
    ]);
  };

  const daysOfWeek = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

  // Dynamically calculate days of the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday-first

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

  // Extract appointment days from real appointments
  const appointmentDays = appointments.map(apt => {
    const match = apt.date.match(/(\d{1,2})/);
    return match ? parseInt(match[1], 10) : -1;
  }).filter(d => d > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
          {/* Calendar Month Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity style={styles.monthArrow}>
              <Ionicons name="chevron-back" size={16} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <TouchableOpacity style={styles.monthArrow}>
              <Ionicons name="chevron-forward" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={styles.daysRow}>
            {daysOfWeek.map((day, idx) => (
              <Text key={idx} style={styles.dayLabel}>{day}</Text>
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
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
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
                    {hasApt && !isSelected && <View style={styles.aptDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Section: Upcoming */}
        <Text style={styles.sectionTitle}>นัดหมายที่กำลังจะมาถึง</Text>
        {upcomingApts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="calendar" size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>ไม่มีนัดหมายเร็วๆ นี้</Text>
            <Text style={styles.emptySubtext}>กดปุ่ม "+ เพิ่ม" เพื่อบันทึกนัดหมายแพทย์ใหม่</Text>
          </View>
        ) : (
          upcomingApts.map(apt => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.aptCardHeader}>
                <Text style={styles.doctorName}>{apt.doctorName}</Text>
                <StatusBadge
                  label={apt.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                  variant={apt.status === 'confirmed' ? 'confirmed' : 'pending'}
                  size="sm"
                />
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
                    Alert.alert('แก้ไขนัดหมาย', `เปิดแก้ไขข้อมูลนัดหมาย ${apt.doctorName}`)
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
  monthTitle: {
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
