import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout, medications, appointments, todaySchedule } = useApp();

  const handleToggle = (key: keyof NonNullable<typeof user>) => {
    if (!user) return;
    updateProfile({
      [key]: !user[key],
    });
  };

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const activeMedsCount = medications.filter(m => m.status === 'active').length;
  const upcomingAptsCount = appointments.filter(a => a.status !== 'passed').length;
  const takenCount = todaySchedule.filter(s => s.isTaken).length;
  const totalSchedule = todaySchedule.length;
  const onTimeRate = totalSchedule > 0 ? `${Math.round((takenCount / totalSchedule) * 100)}%` : '-';
  const consistencyRate = totalSchedule > 0 ? `${Math.round((takenCount / totalSchedule) * 100)}%` : '-';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={28} color="#8B95F6" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'ผู้ใช้งาน'}</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.editProfileBtnText}>แก้ไขโปรไฟล์</Text>
          </TouchableOpacity>
        </View>

        {/* Stats 2x2 Grid */}
        <View style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>สถิติการรับประทานยา</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{onTimeRate}</Text>
              <Text style={styles.statLabel}>ตรงเวลา</Text>
              <Text style={styles.statSublabel}>วันนี้</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{consistencyRate}</Text>
              <Text style={styles.statLabel}>สำเร็จ</Text>
              <Text style={styles.statSublabel}>วันนี้</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activeMedsCount}</Text>
              <Text style={styles.statLabel}>รายการ</Text>
              <Text style={styles.statSublabel}>ยาที่ใช้อยู่</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{upcomingAptsCount}</Text>
              <Text style={styles.statLabel}>ที่จะมาถึง</Text>
              <Text style={styles.statSublabel}>นัดหมาย</Text>
            </View>
          </View>
        </View>

        {/* Section: Notification Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>การแจ้งเตือน</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>แจ้งเตือนก่อนเวลา 30 นาที</Text>
            <Switch
              value={user?.notify30MinBefore ?? true}
              onValueChange={() => handleToggle('notify30MinBefore')}
              trackColor={{ false: '#E2E8F0', true: '#8B95F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>แจ้งเตือนอาหารที่ต้องเลี่ยง</Text>
            <Switch
              value={user?.notifyFoodWarning ?? true}
              onValueChange={() => handleToggle('notifyFoodWarning')}
              trackColor={{ false: '#E2E8F0', true: '#8B95F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>แจ้งเตือนนัดหมายแพทย์</Text>
            <Switch
              value={user?.notifyAppointments ?? true}
              onValueChange={() => handleToggle('notifyAppointments')}
              trackColor={{ false: '#E2E8F0', true: '#8B95F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.switchLabel}>แจ้งเตือนยาหมด / ใกล้หมดอายุ</Text>
            <Switch
              value={user?.notifyLowStock ?? false}
              onValueChange={() => handleToggle('notifyLowStock')}
              trackColor={{ false: '#E2E8F0', true: '#8B95F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Account & Security */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>บัญชีและความปลอดภัย</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="person-outline" size={18} color="#64748B" style={styles.linkIcon} />
              <Text style={styles.linkLabel}>แก้ไขข้อมูลส่วนบุคคล</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#64748B" style={styles.linkIcon} />
              <Text style={styles.linkLabel}>ประวัติการรับประทานยา</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
        </TouchableOpacity>

        {/* Version Footer */}
        <Text style={styles.footerText}>MedManager v1.0.0 • © {new Date().getFullYear() + 543}</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#8B95F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 14,
  },
  editProfileBtn: {
    backgroundColor: '#F5F6FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginBottom: 16,
  },
  statsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statSublabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  settingsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: 12,
  },
  linkLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  logoutButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 20,
  },
});
