import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { PillIcon } from '@/components/ui/PillIcon';
import { useApp } from '@/context/AppContext';

export default function EditMedicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { medications, saveMedication } = useApp();

  const medId = params.id as string;
  const existingMed = medications.find(m => m.id === medId) || medications[0];

  const [name, setName] = useState(existingMed?.name || 'แอสไพริน');
  const [type, setType] = useState(existingMed?.type || 'เม็ด');
  const [dosage, setDosage] = useState(existingMed?.dosage || '100');
  const [unit, setUnit] = useState(existingMed?.unit || 'mg');
  const [frequency, setFrequency] = useState(existingMed?.frequency?.toString() || '3');
  const [remaining, setRemaining] = useState(existingMed?.remaining?.toString() || '5');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const typeOptions: Array<'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ'> = [
    'เม็ด',
    'อาหารเสริม',
    'แคปซูล',
    'ยาน้ำ',
  ];

  const unitOptions = ['mg', 'ml', 'IU', 'g', 'เม็ด'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อยา');
      return;
    }

    setIsSaving(true);
    await saveMedication({
      ...existingMed,
      name,
      type: type as any,
      dosage,
      unit,
      frequency: parseInt(frequency, 10) || 1,
      remaining: parseInt(remaining, 10) || 0,
    });
    setIsSaving(false);

    Alert.alert('สำเร็จ', 'บันทึกการแก้ไขเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)/medications') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="แก้ไขข้อมูลยา" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Preview Card */}
        <View style={styles.previewCard}>
          <PillIcon type={type} />
          <View style={styles.previewDetails}>
            <Text style={styles.previewName}>{name}</Text>
            <Text style={styles.previewMeta}>
              {dosage}{unit} • {type} • {frequency} ครั้ง/วัน
            </Text>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อยา / อาหารเสริม</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="ชื่อยา / อาหารเสริม"
          />
        </View>

        {/* Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ประเภท</Text>
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
            <Text style={styles.inputLabel}>ขนาดยา</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>หน่วย</Text>
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

        {/* Frequency & Remaining Row */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>จำนวน (ครั้ง / วัน)</Text>
            <TextInput
              style={styles.input}
              value={frequency}
              onChangeText={setFrequency}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>คงเหลือ</Text>
            <TextInput
              style={styles.input}
              value={remaining}
              onChangeText={setRemaining}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </Text>
        </TouchableOpacity>
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 16,
    marginBottom: 20,
  },
  previewDetails: {
    marginLeft: 14,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
  saveBtn: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#8B95F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
