import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface EditFavoriteDoctorModalProps {
  visible: boolean;
  doctorName: string;
  department: string;
  hospital: string;
  onChangeDoctorName: (val: string) => void;
  onChangeDepartment: (val: string) => void;
  onChangeHospital: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

/** Modal dialog for editing a saved favorite doctor entry. */
export function EditFavoriteDoctorModal({
  visible,
  doctorName,
  department,
  hospital,
  onChangeDoctorName,
  onChangeDepartment,
  onChangeHospital,
  onClose,
  onSave,
}: EditFavoriteDoctorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.editDocModalCard} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>แก้ไขข้อมูลแพทย์ที่นัดประจำ</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ชื่อแพทย์</Text>
            <TextInput
              style={styles.input}
              value={doctorName}
              onChangeText={onChangeDoctorName}
              placeholder="ชื่อแพทย์"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>แผนก</Text>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={onChangeDepartment}
                placeholder="แผนก"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>โรงพยาบาล</Text>
              <TextInput
                style={styles.input}
                value={hospital}
                onChangeText={onChangeHospital}
                placeholder="โรงพยาบาล"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={onSave}
            >
              <Text style={styles.modalConfirmText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
  editDocModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#6FA07E',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
