import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '@/components/ui/AppHeader';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/services/medService';

export default function AddMedicationScreen() {
  const router = useRouter();
  const { masterMedications } = useApp();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<'ยา' | 'อาหารเสริม' | null>(null);
  const [type, setType] = useState<'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ' | null>(null);
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showMasterCatalog, setShowMasterCatalog] = useState(false);
  const [selectedFromMaster, setSelectedFromMaster] = useState<string | null>(null);

  const categoryOptions: Array<'ยา' | 'อาหารเสริม'> = [
    'ยา',
    'อาหารเสริม',
  ];

  const typeOptions: Array<'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ'> = [
    'เม็ด',
    'แคปซูล',
    'ยาน้ำ',
  ];

  const unitOptions = ['mg', 'ml'];

  const pickImageFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องการสิทธิ์การเข้าถึง', 'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพเพื่อเลือกรูปถ่ายยา');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Image picker error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องการสิทธิ์การเข้าถึง', 'กรุณาอนุญาตให้แอปเข้าถึงกล้องถ่ายรูป');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Camera error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายภาพได้');
    }
  };

  const handleSelectPhoto = () => {
    Alert.alert(
      'รูปถ่ายยา / อาหารเสริม',
      'เลือกวิธีการเพิ่มรูปภาพ',
      [
        {
          text: 'ถ่ายภาพจากกล้อง',
          onPress: takePhotoWithCamera,
        },
        {
          text: 'เลือกจากคลังภาพ',
          onPress: pickImageFromLibrary,
        },
        ...(imageUri
          ? [
              {
                text: 'ลบรูปภาพ',
                style: 'destructive' as const,
                onPress: () => setImageUri(null),
              },
            ]
          : []),
        {
          text: 'ยกเลิก',
          style: 'cancel' as const,
        },
      ]
    );
  };

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อยาหรืออาหารเสริม');
      return;
    }
    if (!category) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาเลือกหมวดหมู่ (ยา หรือ อาหารเสริม)');
      return;
    }
    if (!type) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาเลือกประเภท (เม็ด, แคปซูล หรือ ยาน้ำ)');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุขนาดยา');
      return;
    }

    router.push({
      pathname: '/medication-settings',
      params: {
        name,
        category,
        type,
        dosage,
        unit,
        notes,
        imageUrl: imageUri || '',
      },
    });
  };

  const handleSelectMasterMed = (item: Medication) => {
    setName(item.name);
    if (item.category === 'ยา' || item.category === 'อาหารเสริม') {
      setCategory(item.category);
    }
    if (item.type === 'เม็ด' || item.type === 'อาหารเสริม' || item.type === 'แคปซูล' || item.type === 'ยาน้ำ') {
      setType(item.type);
    }
    setDosage(item.dosage || '100');
    setUnit(item.unit || 'mg');
    if (item.instructions || item.precautions) {
      setNotes([item.instructions, item.precautions].filter(Boolean).join('\n'));
    }
    if (item.imageUrl) {
      setImageUri(item.imageUrl);
    }
    setSelectedFromMaster(item.name);
    setShowMasterCatalog(false);
  };

  // Filter master catalog by search query
  const filteredMasterList = masterMedications.filter(m =>
    m.name.toLowerCase().includes(name.toLowerCase()) ||
    (m.code && m.code.toLowerCase().includes(name.toLowerCase()))
  );

  return (
    <View style={styles.safeArea}>
      <AppHeader title="เพิ่มยาใหม่" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Upload Area */}
        <Text style={styles.sectionLabel}>รูปถ่าย</Text>
        <TouchableOpacity
          style={styles.photoUploadBox}
          onPress={handleSelectPhoto}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
              <View style={styles.changePhotoButton}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
                <Text style={styles.changePhotoText}>เปลี่ยนรูป</Text>
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholderContainer}>
              <Ionicons name="camera-outline" size={28} color="#8B95F6" />
              <Text style={styles.photoUploadPlaceholder}>
                แตะเพื่อเลือกรูปภาพจากคลัง
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Drug Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อยา / อาหารเสริม *</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น แอสไพริน, Aspirin"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Category Selection Chips */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>หมวดหมู่ *</Text>
          <View style={styles.chipsRow}>
            {categoryOptions.map(c => {
              const isSelected = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.typeChip, isSelected && styles.typeChipActive]}
                  onPress={() => setCategory(category === c ? null : c)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Drug Type Selection Chips */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ประเภท *</Text>
          <View style={styles.chipsRow}>
            {typeOptions.map(t => {
              const isSelected = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, isSelected && styles.typeChipActive]}
                  onPress={() => setType(type === t ? null : t)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dosage & Unit Row */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={styles.inputLabel}>ขนาดยา *</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 100, 500"
              placeholderTextColor="#94A3B8"
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>หน่วย *</Text>
            <TouchableOpacity
              style={styles.unitDropdown}
              onPress={() => setShowUnitPicker(!showUnitPicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.unitText, !unit && styles.unitTextPlaceholder]}>
                {unit || 'mg'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {showUnitPicker && (
              <View style={styles.unitPickerMenu}>
                {unitOptions.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={styles.unitOption}
                    onPress={() => {
                      setUnit(u);
                      setShowUnitPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.unitOptionText,
                        unit === u && styles.unitOptionTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Notes Textarea */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>หมายเหตุ *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="เช่น ใช้รักษา,วัตถุประสงค์การใช้งาน"
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Next Step Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>กดไปต่อเพื่อตั้งค่าการรับประทาน</Text>
        </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  masterCatalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  masterCatalogLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterCatalogTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
  },
  masterCatalogSub: {
    fontSize: 12,
    color: '#6366F1',
    marginTop: 2,
  },
  masterCatalogList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
  },
  masterCatalogHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  masterItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  masterItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  masterItemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  masterItemCategoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  masterItemCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  emptyMasterText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 14,
  },
  selectedMasterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  selectedMasterText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 6,
    marginRight: 6,
  },
  suggestionBox: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  suggestionChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  suggestionChipTextActive: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  photoUploadBox: {
    height: 150,
    borderRadius: 18,
    backgroundColor: '#F1F3FE',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPlaceholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoUploadPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 18,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FAFAFC',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipActive: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  unitDropdown: {
    height: 53,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFC',
  },
unitText: {
  fontSize: 15,
  color: '#0F172A',  
},
 unitTextPlaceholder: {
    color: '#94A3B8', // สีเทาอ่อนตอนยังไม่เลือก (รหัสเดียวกับ Placeholder ช่องอื่น)
  },

  unitPickerMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100,
  },
  unitOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  unitOptionText: {
    fontSize: 14,
    color: '#1E293B',
  },
  unitOptionTextActive: {
    color: '#8B95F6',
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    height: 100,
    backgroundColor: '#FAFAFC',
  },
  nextButton: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#8B95F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
