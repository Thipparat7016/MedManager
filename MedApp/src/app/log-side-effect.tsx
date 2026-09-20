import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';

export default function LogSideEffectScreen() {
  const router = useRouter();
  const { sideEffects, addSideEffect } = useApp();

  const [date, setDate] = useState('12/07/2569');
  const [time, setTime] = useState('14:00 น.');
  const [selectedDrug, setSelectedDrug] = useState('แอสไพริน');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['คลื่นไส้', 'ปวดท้อง']);
  const [severity, setSeverity] = useState<'สูง' | 'กลาง' | 'ต่ำ'>('กลาง');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const drugOptions = ['แอสไพริน', 'เมทฟอร์มิน', 'วิตามินซี', 'โอเมก้า-3'];
  const symptomOptions = [
    'คลื่นไส้',
    'อาเจียน',
    'ปวดท้อง',
    'ปวดหัว',
    'วิงเวียน',
    'ผื่นคัน',
    'หายใจหอบ',
    'ใจสั่น',
    'นอนไม่หลับ',
    'ท้องเสีย',
    'ท้องผูก',
    '+ อื่นๆ',
  ];

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDrug || selectedSymptoms.length === 0) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกยาที่เกี่ยวข้องและอาการที่พบ');
      return;
    }

    setIsSubmitting(true);
    await addSideEffect({
      date,
      time,
      medicationName: selectedDrug,
      symptoms: selectedSymptoms,
      severity,
      details,
    });
    setIsSubmitting(false);

    Alert.alert('สำเร็จ', 'บันทึกข้อมูลผลข้างเคียงเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="บันทึกผลข้างเคียง" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          บันทึกอาการหลังรับประทานยาเพื่อให้แพทย์ติดตามการรักษาได้อย่างแม่นยำ
        </Text>

        {/* Date & Time Row */}
        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>วันที่</Text>
            <TextInput
              style={styles.inputBox}
              value={date}
              onChangeText={setDate}
              placeholder="12/07/2569"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>เวลา</Text>
            <TextInput
              style={styles.inputBox}
              value={time}
              onChangeText={setTime}
              placeholder="14:00 น."
            />
          </View>
        </View>

        {/* Related Drug Selection */}
        <Text style={styles.sectionLabel}>ยาที่เกี่ยวข้อง *</Text>
        <View style={styles.chipsWrap}>
          {drugOptions.map(drug => {
            const isSelected = selectedDrug === drug;
            return (
              <TouchableOpacity
                key={drug}
                style={[styles.drugChip, isSelected && styles.drugChipActive]}
                onPress={() => setSelectedDrug(drug)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.drugChipText, isSelected && styles.drugChipTextActive]}
                >
                  {drug}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Symptoms Selection */}
        <Text style={styles.sectionLabel}>อาการที่พบ</Text>
        <View style={styles.chipsWrap}>
          {symptomOptions.map(symptom => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <TouchableOpacity
                key={symptom}
                style={[styles.symptomChip, isSelected && styles.symptomChipActive]}
                onPress={() => toggleSymptom(symptom)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.symptomChipText,
                    isSelected && styles.symptomChipTextActive,
                  ]}
                >
                  {symptom}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Severity Selection */}
        <Text style={styles.sectionLabel}>ความรุนแรง</Text>
        <View style={styles.severityRow}>
          <TouchableOpacity
            style={[styles.severityBtn, severity === 'สูง' && styles.severityHighActive]}
            onPress={() => setSeverity('สูง')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.severityText,
                { color: '#EF4444' },
                severity === 'สูง' && styles.severityTextActive,
              ]}
            >
              สูง
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.severityBtn, severity === 'กลาง' && styles.severityMedActive]}
            onPress={() => setSeverity('กลาง')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.severityText,
                { color: '#EA580C' },
                severity === 'กลาง' && styles.severityTextActive,
              ]}
            >
              กลาง
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.severityBtn, severity === 'ต่ำ' && styles.severityLowActive]}
            onPress={() => setSeverity('ต่ำ')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.severityText,
                { color: '#CA8A04' },
                severity === 'ต่ำ' && styles.severityTextActive,
              ]}
            >
              ต่ำ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notes Details Textarea */}
        <Text style={styles.sectionLabel}>รายละเอียดเพิ่มเติม</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="อธิบายอาการ เริ่มเมื่อไร นานแค่ไหน สิ่งที่ทำให้ดีขึ้น/แย่ลง..."
          placeholderTextColor="#94A3B8"
          value={details}
          onChangeText={setDetails}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกอาการ'}
          </Text>
        </TouchableOpacity>

        {/* Past History */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ประวัติการบันทึก</Text>
        {sideEffects.map(item => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDrug}>
                {item.date} • {item.medicationName}
              </Text>
              <StatusBadge
                label={item.severity}
                variant={
                  item.severity === 'สูง'
                    ? 'high'
                    : item.severity === 'กลาง'
                    ? 'medium'
                    : 'low'
                }
                size="sm"
              />
            </View>
            <Text style={styles.historySymptoms}>{item.symptoms.join(', ')}</Text>
            {item.details ? (
              <Text style={styles.historyDetails}>{item.details}</Text>
            ) : null}
          </View>
        ))}
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
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputBox: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  drugChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
  },
  drugChipActive: {
    backgroundColor: '#F87171',
    borderColor: '#F87171',
  },
  drugChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  drugChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  symptomChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
  },
  symptomChipActive: {
    backgroundColor: '#F87171',
    borderColor: '#F87171',
  },
  symptomChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  symptomChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  severityBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityHighActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  severityMedActive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#F97316',
  },
  severityLowActive: {
    backgroundColor: '#FEF9C3',
    borderColor: '#EAB308',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  severityTextActive: {
    fontWeight: '800',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    height: 100,
    marginBottom: 20,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F87171',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 16,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDrug: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  historySymptoms: {
    fontSize: 13,
    color: '#475569',
  },
  historyDetails: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
