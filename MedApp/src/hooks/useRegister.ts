import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';

export function useRegister() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: isAppLoading } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const shouldRedirectToTabs = !isAppLoading && isAuthenticated;

  const handleRegister = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อและอีเมล');
      return;
    }
    if (!password.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากำหนดรหัสผ่าน');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
      ]);
    } else {
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', result.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    shouldRedirectToTabs,
    handleRegister,
    navigateToLogin: () => router.push('/(auth)/login'),
  };
}
