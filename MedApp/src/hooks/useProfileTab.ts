import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { UserProfile } from '@/utils/types';
import { isScheduleTakenOnTime } from '@/utils/scheduleUtils';

/** Custom hook managing profile statistics, notification toggles, password modal state, and navigation. */
export function useProfileTab() {
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

  const handleOpenPasswordModal = useCallback(() => {
    setVerifyInput('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  }, []);

  const handleClosePasswordModal = useCallback(() => {
    if (!isSavingPassword) {
      setShowPasswordModal(false);
    }
  }, [isSavingPassword]);

  const handleSavePassword = useCallback(async () => {
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
  }, [verifyInput, newPassword, confirmPassword, user?.hasPassword, setAccountPassword]);

  const handleToggle = useCallback(
    (key: keyof UserProfile) => {
      if (!user) return;
      updateProfile({
        [key]: !user[key],
      });
    },
    [user, updateProfile]
  );

  const handleLogout = useCallback(() => {
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
  }, [logout, router]);

  const goToEditProfile = useCallback(() => {
    router.push('/edit-profile');
  }, [router]);

  const goToHistory = useCallback(() => {
    router.push('/history');
  }, [router]);

  const stats = useMemo(() => {
    const activeMedsCount = medications.filter(m => m.status === 'active').length;
    const upcomingAptsCount = appointments.filter(a => a.status !== 'passed').length;
    const takenCount = todaySchedule.filter(s => s.isTaken).length;
    const onTimeCount = todaySchedule.filter(s => isScheduleTakenOnTime(s)).length;
    const totalSchedule = todaySchedule.length;
    const onTimeRate =
      totalSchedule > 0 ? `${Math.round((onTimeCount / totalSchedule) * 100)}%` : '-';
    const consistencyRate =
      totalSchedule > 0 ? `${Math.round((takenCount / totalSchedule) * 100)}%` : '-';
    return {
      activeMedsCount,
      upcomingAptsCount,
      onTimeRate,
      consistencyRate,
    };
  }, [medications, appointments, todaySchedule]);

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return {
    user,
    showPasswordModal,
    verifyInput,
    setVerifyInput,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSavingPassword,
    handleOpenPasswordModal,
    handleClosePasswordModal,
    handleSavePassword,
    handleToggle,
    handleLogout,
    goToEditProfile,
    goToHistory,
    stats,
    topInsetPadding,
  };
}
