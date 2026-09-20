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
import { useApp } from '@/context/AppContext';

export default function AddAppointmentScreen() {
  const router = useRouter();
  const { addAppointment } = useApp();

  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('');
  const [hospital, setHospital] = useState('');
  const [date, setDate] = useState('12/07/2569');
  const [time, setTime] = useState('14:00 น.');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!doctorName.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อแพทย์');
      return;
    }

    setIsSubmitting(true);
    await addAppointment({
      doctorName,
      department: department || 'อายุรกรรมทั่วไป',
      hospital: hospital || 'โรงพยาบาล A',
      date: date || '2026-07-13',
      time: time || '14:00 น.',
      details,
      status: 'confirmed',
    });
    setIsSubmitting(false);

    Alert.alert('สำเร็จ', 'บันทึกนัดหมายแพทย์เรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)/appointments') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="เพิ่มนัดหมายใหม่" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ชื่อแพทย์</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น นพ. สมศักดิ์ วิทยากรณ์"
            placeholderTextColor="#94A3B8"
            value={doctorName}
            onChangeText={setDoctorName}
          />
        </View>

        {/* Department & Hospital Row */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>แผนก</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น อายุรกรรมทั่วไป"
              placeholderTextColor="#94A3B8"
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>โรงพยาบาล</Text>
            <TextInput
              style={styles.input}
              placeholder="โรงพยาบาล A"
              placeholderTextColor="#94A3B8"
              value={hospital}
              onChangeText={setHospital}
            />
          </View>
        </View>

        {/* Date & Time Row */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>วันที่นัดหมาย</Text>
            <TextInput
              style={styles.input}
              placeholder="12/07/2569"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>เวลานัดหมาย</Text>
            <TextInput
              style={styles.input}
              placeholder="14:00 น."
              placeholderTextColor="#94A3B8"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Details / Preparation Textarea */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>รายละเอียด / การเตรียมตัว</Text>
          <TextInput
            style={styles.textArea}
            placeholder="เช่น ตรวจเบาหวานประจำปี-งดน้ำและอาหาร..."
            placeholderTextColor="#94A3B8"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.saveBtnText}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกนัดหมาย'}
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
  inputGroup: {
    marginBottom: 18,
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
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    height: 120,
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    height: 52,
    backgroundColor: '#6FA07E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#6FA07E',
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
