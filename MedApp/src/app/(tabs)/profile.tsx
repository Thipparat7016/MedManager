import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { isScheduleTakenOnTime } from '@/services/medService';

interface SmoothSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function SmoothSwitch({ value, onValueChange }: SmoothSwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', '#8B95F6'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      style={styles.switchTouchContainer}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.switchThumb,
            { transform: [{ translateX }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user,
    updateProfile,
    setAccountPassword,
    logout,
    medications,
    appointments,
    todaySchedule,
  } = useApp();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleOpenPasswordModal = () => {
    setVerifyInput('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!verifyInput.trim()) {
      Alert.alert(
        'กรุณายืนยันตัวตน',
        user?.hasPassword
          ? 'กรุณากรอกรหัสผ่านเดิม หรือ อีเมลของบัญชีนี้เพื่อยืนยันตัวตน'
          : 'กรุณากรอกอีเมล หรือ เบอร์โทรศัพท์ของบัญชีนี้เพื่อยืนยันตัวตน'
      );
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'กรุณากำหนดรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    try {
      setIsSavingPassword(true);
      await setAccountPassword(verifyInput.trim(), newPassword.trim());
      setShowPasswordModal(false);
      Alert.alert(
        'บันทึกสำเร็จ',
        'ตั้งรหัสผ่านสำหรับบัญชีนี้เรียบร้อยแล้ว '
      );
    } catch (err: any) {
      Alert.alert('ไม่สามารถบันทึกรหัสผ่านได้', err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSavingPassword(false);
    }
  };

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
  const onTimeCount = todaySchedule.filter(s => isScheduleTakenOnTime(s)).length;
  const totalSchedule = todaySchedule.length;
  const onTimeRate = totalSchedule > 0 ? `${Math.round((onTimeCount / totalSchedule) * 100)}%` : '-';
  const consistencyRate = totalSchedule > 0 ? `${Math.round((takenCount / totalSchedule) * 100)}%` : '-';

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInner}>
                <Ionicons name="person" size={28} color="#8B95F6" />
              </View>
            )}
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
            <SmoothSwitch
              value={user?.notify30MinBefore ?? true}
              onValueChange={() => handleToggle('notify30MinBefore')}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>แจ้งเตือนอาหารที่ต้องเลี่ยง</Text>
            <SmoothSwitch
              value={user?.notifyFoodWarning ?? true}
              onValueChange={() => handleToggle('notifyFoodWarning')}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>แจ้งเตือนนัดหมายแพทย์</Text>
            <SmoothSwitch
              value={user?.notifyAppointments ?? true}
              onValueChange={() => handleToggle('notifyAppointments')}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.switchLabel}>แจ้งเตือนยาหมด / ใกล้หมดอายุ</Text>
            <SmoothSwitch
              value={user?.notifyLowStock ?? false}
              onValueChange={() => handleToggle('notifyLowStock')}
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
            style={styles.linkRow}
            onPress={handleOpenPasswordModal}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.linkIcon} />
              <Text style={styles.linkLabel}>ตั้งรหัสผ่าน / เปลี่ยนรหัสผ่าน</Text>
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

      {/* Set / Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isSavingPassword && setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboardWrapper}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalIconBox}>
                  <Ionicons name="lock-closed-outline" size={24} color="#8B95F6" />
                </View>
                <TouchableOpacity
                  onPress={() => setShowPasswordModal(false)}
                  disabled={isSavingPassword}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>
                {user?.hasPassword ? 'ตั้งรหัสผ่าน / เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่านสำหรับบัญชีนี้'}
              </Text>
              <Text style={styles.modalSubtitle}>
                บัญชี: {user?.email || '-'}
              </Text>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>
                  {user?.hasPassword
                    ? 'ยืนยันตัวตน '
                    : 'ยืนยันตัวตน (อีเมล หรือ เบอร์โทรศัพท์ของบัญชีนี้)'}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={
                    user?.hasPassword
                      ? 'กรอกรหัสผ่านเดิม หรือ อีเมลบัญชีนี้'
                      : 'กรอกอีเมล หรือ เบอร์โทรศัพท์ของคุณ'
                  }
                  placeholderTextColor="#94A3B8"
                  value={verifyInput}
                  onChangeText={setVerifyInput}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>รหัสผ่านใหม่</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInputField}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    placeholderTextColor="#94A3B8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(prev => !prev)}
                    style={styles.eyeIconBtn}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>ยืนยันรหัสผ่านใหม่</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInputField}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                    style={styles.eyeIconBtn}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowPasswordModal(false)}
                  disabled={isSavingPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, isSavingPassword && { opacity: 0.7 }]}
                  onPress={handleSavePassword}
                  disabled={isSavingPassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSaveBtnText}>
                    {isSavingPassword ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  switchTouchContainer: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalKeyboardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 10,
  },
  modalInputGroup: {
    marginBottom: 10,
  },
  modalInputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFAFC',
  },
  passwordInputWrapper: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 8,
    backgroundColor: '#FAFAFC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInputField: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  eyeIconBtn: {
    padding: 6,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B95F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
