import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PasswordSetupModalProps {
  visible: boolean;
  hasPassword?: boolean;
  email?: string;
  verifyInput: string;
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  isSavingPassword: boolean;
  onChangeVerifyInput: (val: string) => void;
  onChangeNewPassword: (val: string) => void;
  onChangeConfirmPassword: (val: string) => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onClose: () => void;
  onSave: () => void;
}

/** Modal dialog allowing users to set or update their account password after identity verification. */
export function PasswordSetupModal({
  visible,
  hasPassword,
  email,
  verifyInput,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  isSavingPassword,
  onChangeVerifyInput,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onToggleShowNewPassword,
  onToggleShowConfirmPassword,
  onClose,
  onSave,
}: PasswordSetupModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !isSavingPassword && onClose()}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboardWrapper}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconBox}>
                <Ionicons name="lock-closed-outline" size={24} color="#8B95F6" />
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSavingPassword}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>
              {hasPassword ? 'ตั้งรหัสผ่าน / เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่านสำหรับบัญชีนี้'}
            </Text>
            <Text style={styles.modalSubtitle}>
              บัญชี: {email || '-'}
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>
                {hasPassword
                  ? 'ยืนยันตัวตน '
                  : 'ยืนยันตัวตน (อีเมล หรือ เบอร์โทรศัพท์ของบัญชีนี้)'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={
                  hasPassword
                    ? 'กรอกรหัสผ่านเดิม หรือ อีเมลบัญชีนี้'
                    : 'กรอกอีเมล หรือ เบอร์โทรศัพท์ของคุณ'
                }
                placeholderTextColor="#94A3B8"
                value={verifyInput}
                onChangeText={onChangeVerifyInput}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>รหัสผ่านใหม่</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInputField}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  placeholderTextColor="#94A3B8"
                  value={newPassword}
                  onChangeText={onChangeNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={onToggleShowNewPassword}
                  style={styles.eyeIconBtn}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>ยืนยันรหัสผ่านใหม่</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInputField}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={onChangeConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={onToggleShowConfirmPassword}
                  style={styles.eyeIconBtn}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={onClose}
                disabled={isSavingPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isSavingPassword && { opacity: 0.7 }]}
                onPress={onSave}
                disabled={isSavingPassword}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveBtnText}>
                  {isSavingPassword ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalKeyboardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 10,
  },
  modalInputGroup: {
    marginBottom: 10,
  },
  modalInputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFAFC',
  },
  passwordInputWrapper: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 8,
    backgroundColor: '#FAFAFC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInputField: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  eyeIconBtn: {
    padding: 6,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B95F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
