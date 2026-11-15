import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';

export function useEditProfile() {
  const router = useRouter();
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handlePickImage = async () => {
    setShowPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'ต้องการสิทธิ์เข้าถึง',
          'กรุณาอนุญาตการเข้าถึงคลังรูปภาพในอุปกรณ์ของคุณเพื่อเปลี่ยนรูปโปรไฟล์'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const handleDeleteImage = () => {
    setShowPhotoModal(false);
    setAvatarUrl('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อ-นามสกุล');
      return;
    }

    setIsSaving(true);
    await updateProfile({
      name,
      email,
      phone,
      avatarUrl,
    });
    setIsSaving(false);

    Alert.alert('สำเร็จ', 'บันทึกข้อมูลส่วนบุคคลเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)/profile') },
    ]);
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    avatarUrl,
    isSaving,
    showPhotoModal,
    setShowPhotoModal,
    handlePickImage,
    handleDeleteImage,
    handleSave,
  };
}
