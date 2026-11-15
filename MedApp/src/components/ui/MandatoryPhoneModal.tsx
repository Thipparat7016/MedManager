import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MandatoryPhoneModalProps {
  visible: boolean;
  userName: string;
  userEmail: string;
  phoneInput: string;
  isSaving: boolean;
  onChangePhone: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
}

export function MandatoryPhoneModal({
  visible,
  userName,
  userEmail,
  phoneInput,
  isSaving,
  onChangePhone,
  onSave,
  onSkip,
}: MandatoryPhoneModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={phoneModalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={phoneModalStyles.keyboardWrapper}
        >
          <View style={phoneModalStyles.card}>
            <View style={phoneModalStyles.iconBox}>
              <MaterialCommunityIcons name="phone-outline" size={28} color="#8B95F6" />
            </View>
            <Text style={phoneModalStyles.title}>ระบุเบอร์โทรศัพท์เพิ่มเติม</Text>
            <Text style={phoneModalStyles.subtitle}>
              ยินดีต้อนรับคุณ {userName}{'\n'}
              บัญชี: {userEmail}{'\n'}
              กรุณากรอกเบอร์โทรศัพท์เพิ่มเติม หรือกดข้ามเพื่อกรอกภายหลังที่หน้าโปรไฟล์
            </Text>

            <View style={phoneModalStyles.inputGroup}>
              <Text style={phoneModalStyles.label}>เบอร์โทรศัพท์</Text>
              <TextInput
                style={phoneModalStyles.input}
                placeholder="0812345678"
                placeholderTextColor="#94A3B8"
                value={phoneInput}
                onChangeText={onChangePhone}
                keyboardType="phone-pad"
                maxLength={15}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                phoneModalStyles.primaryButton,
                isSaving && phoneModalStyles.disabledButton,
              ]}
              onPress={onSave}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <Text style={phoneModalStyles.primaryButtonText}>
                {isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกและเข้าสู่แอป'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={phoneModalStyles.skipButton}
              onPress={onSkip}
              disabled={isSaving}
              activeOpacity={0.75}
            >
              <Text style={phoneModalStyles.skipButtonText}>ข้าม</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const phoneModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  keyboardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14.5,
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
  primaryButton: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B95F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    height: 48,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
});
