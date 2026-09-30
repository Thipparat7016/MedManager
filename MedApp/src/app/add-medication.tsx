import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/services/medService';

export default function AddMedicationScreen() {
  const router = useRouter();
  const { masterMedications } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ'>('เม็ด');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('mg');
  const [notes, setNotes] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showMasterCatalog, setShowMasterCatalog] = useState(false);
  const [selectedFromMaster, setSelectedFromMaster] = useState<string | null>(null);

  const typeOptions: Array<'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ'> = [
    'เม็ด',
    'อาหารเสริม',
    'แคปซูล',
    'ยาน้ำ',
  ];

  const unitOptions = ['mg', 'ml', 'IU', 'g', 'เม็ด', 'หยด'];

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อยาหรืออาหารเสริม');
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
        type,
        dosage,
        unit,
        notes,
      },
    });
  };

  const handleSelectMasterMed = (item: Medication) => {
    setName(item.name);
    if (item.type === 'เม็ด' || item.type === 'อาหารเสริม' || item.type === 'แคปซูล' || item.type === 'ยาน้ำ') {
      setType(item.type);
    }
    setDosage(item.dosage || '100');
    setUnit(item.unit || 'mg');
    if (item.instructions || item.precautions) {
      setNotes([item.instructions, item.precautions].filter(Boolean).join('\n'));
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
        <Text style={styles.sectionLabel}>รูปถ่ายยา / อาหารเสริม</Text>
        <TouchableOpacity
          style={styles.photoUploadBox}
          onPress={() => Alert.alert('เลือกรูปภาพ', 'เลือกรูปภาพยาจากอุปกรณ์ของคุณ')}
          activeOpacity={0.8}
        >
          <Text style={styles.photoUploadPlaceholder}>
            แตะเพื่อถ่ายรูปหรือเลือกจากคลัง
          </Text>
        </TouchableOpacity>

        <View style={styles.photoButtonsRow}>
          <TouchableOpacity
            style={styles.photoActionBtn}
            onPress={() => Alert.alert('ถ่ายรูป', 'เปิดกล้องถ่ายรูป')}
            activeOpacity={0.7}
          >
            <Text style={styles.photoActionBtnText}>ถ่ายรูป</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoActionBtn}
            onPress={() => Alert.alert('เลือกจากคลัง', 'เปิดคลังภาพ')}
            activeOpacity={0.7}
          >
            <Text style={styles.photoActionBtnText}>เลือกจากคลัง</Text>
          </TouchableOpacity>
        </View>

        {/* Master Catalog Selector Button */}
        <TouchableOpacity
          style={styles.masterCatalogBtn}
          onPress={() => setShowMasterCatalog(!showMasterCatalog)}
          activeOpacity={0.8}
        >
          <View style={styles.masterCatalogLeft}>
            <MaterialCommunityIcons name="database-search" size={22} color="#4F46E5" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.masterCatalogTitle}>เลือกจากคลังยาของระบบ (แอดมิน)</Text>
              <Text style={styles.masterCatalogSub}>
                มีข้อมูลยาพื้นฐาน {masterMedications.length} รายการในฐานข้อมูล
              </Text>
            </View>
          </View>
          <Ionicons
            name={showMasterCatalog ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#4F46E5"
          />
        </TouchableOpacity>

        {/* Master Catalog Dropdown List */}
        {showMasterCatalog && (
          <View style={styles.masterCatalogList}>
            <Text style={styles.masterCatalogHeader}>
              แตะยาที่ต้องการเพื่อดึงข้อมูลจากคลังแอดมินอัตโนมัติ:
            </Text>
            <ScrollView
              style={{ maxHeight: 220 }}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {filteredMasterList.length === 0 ? (
                <Text style={styles.emptyMasterText}>
                  ไม่พบยาที่ค้นหาในคลัง คุณสามารถพิมพ์ชื่อยาเองด้านล่างได้ครับ
                </Text>
              ) : (
                filteredMasterList.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.masterItemCard}
                    onPress={() => handleSelectMasterMed(item)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.masterItemName}>{item.name}</Text>
                      <Text style={styles.masterItemMeta}>
                        {item.dosage} {item.unit} • {item.type}
                      </Text>
                    </View>
                    <View style={styles.masterItemCategoryBadge}>
                      <Text style={styles.masterItemCategoryText}>{item.category}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* Success indicator if chosen from master catalog */}
        {selectedFromMaster && (
          <View style={styles.selectedMasterIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text style={styles.selectedMasterText} numberOfLines={1}>
              เลือกจากคลัง: {selectedFromMaster} (แก้ไขข้อมูลด้านล่างได้)
            </Text>
            <TouchableOpacity onPress={() => setSelectedFromMaster(null)}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Drug Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อยา / อาหารเสริม *</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น แอสไพริน, Aspirin, ไทลินอล (หรือเลือกจากคลังด้านบน)"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (selectedFromMaster && text !== selectedFromMaster) {
                setSelectedFromMaster(null);
              }
            }}
          />
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
                  onPress={() => setType(t)}
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
              <Text style={styles.unitText}>{unit}</Text>
              <Ionicons name="chevron-down" size={18} color="#8B95F6" />
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
          <Text style={styles.inputLabel}>หมายเหตุ</Text>
          <TextInput
            style={styles.textArea}
            placeholder="เช่น ใช้รักษา... วัตถุประสงค์การใช้งาน..."
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
          <Text style={styles.nextButtonText}>ถัดไป: ตั้งค่าการรับประทาน →</Text>
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
  },
  photoUploadPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  typeChipActive: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
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
    height: 52,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFC',
  },
  unitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
    fontSize: 14,
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
