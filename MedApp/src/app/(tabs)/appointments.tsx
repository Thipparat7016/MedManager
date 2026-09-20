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
  const [selectedDay, setSelectedDay] = useState<number>(12);

  const upcomingApts = appointments.filter(a => a.status !== 'passed');
  const pastApts = appointments.filter(a => a.status === 'passed');

  const handleDelete = (id: string, name: string) => {
    Alert.alert('ยืนยันการลบ', `ต้องการลบนัดหมาย "${name}" หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => deleteAppointment(id) },
    ]);
  };

  const daysOfWeek = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  // Simplified calendar matrix for July 2569 matching mockup
  const calendarDays = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ];

  const appointmentDays = [13, 20, 28];

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
            <Text style={styles.monthTitle}>กรกฎาคม 2569</Text>
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
        {upcomingApts.map(apt => (
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
              {apt.date.includes('13') ? 'พรุ่งนี้ (13 ก.ค.)' : '20 ก.ค. 2569'} • {apt.time}
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
        ))}

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
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  addAptButtonText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 13,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    padding: 16,
    marginBottom: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthArrow: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    width: 36,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: '#A7F3D0',
  },
  dayNumber: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  dayNumberBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  dayNumberSelected: {
    color: '#065F46',
    fontWeight: '800',
  },
  aptDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    position: 'absolute',
    bottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  aptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    padding: 16,
    marginBottom: 14,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  notesBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  notesText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
    lineHeight: 18,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnEdit: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEditText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  actionBtnDelete: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  pastCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 10,
  },
  pastDoctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  pastMeta: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
});
