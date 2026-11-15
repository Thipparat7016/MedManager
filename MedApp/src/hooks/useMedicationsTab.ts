import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

export type MedicationCategoryFilter = 'ทั้งหมด' | 'ยา' | 'อาหารเสริม';

export interface PreviewMedImage {
  uri: string;
  name: string;
}

/** Custom hook encapsulating search, category filtering, image preview, and deletion for MedicationsScreen. */
export function useMedicationsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { medications, masterMedications, deleteMedication, refreshData } = useApp();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MedicationCategoryFilter>('ทั้งหมด');
  const [previewMedImage, setPreviewMedImage] = useState<PreviewMedImage | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const filteredMeds = useMemo(() => {
    const query = search.toLowerCase();
    return medications.filter(m => {
      const matchSearch =
        m.name.toLowerCase().includes(query) ||
        Boolean(m.dosage && m.dosage.includes(search));
      const matchCat =
        activeCategory === 'ทั้งหมด' || m.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [medications, search, activeCategory]);

  const categoryCounts = useMemo(
    () => ({
      all: medications.length,
      med: medications.filter(m => m.category === 'ยา').length,
      supplement: medications.filter(m => m.category === 'อาหารเสริม').length,
    }),
    [medications]
  );

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert('ยืนยันการลบ', `คุณต้องการลบ "${name}" หรือไม่?`, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: () => deleteMedication(id) },
      ]);
    },
    [deleteMedication]
  );

  const goToAddMedication = useCallback(() => {
    router.push('/add-medication');
  }, [router]);

  const goToEditMedication = useCallback(
    (id: string) => {
      router.push({
        pathname: '/edit-medication',
        params: { id },
      });
    },
    [router]
  );

  const goToSchedule = useCallback(() => {
    router.push('/schedule');
  }, [router]);

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return {
    medications,
    masterMedications,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    previewMedImage,
    setPreviewMedImage,
    filteredMeds,
    categoryCounts,
    handleDelete,
    goToAddMedication,
    goToEditMedication,
    goToSchedule,
    topInsetPadding,
  };
}
