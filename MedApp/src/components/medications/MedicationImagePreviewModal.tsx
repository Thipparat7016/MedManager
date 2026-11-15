import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface MedicationImagePreviewModalProps {
  previewMedImage: { uri: string; name: string } | null;
  onClose: () => void;
}

/** Lightbox modal displaying a zoomed medication thumbnail from the catalog dropdown. */
export function MedicationImagePreviewModal({
  previewMedImage,
  onClose,
}: MedicationImagePreviewModalProps) {
  return (
    <Modal
      visible={Boolean(previewMedImage)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.imagePreviewModalContainer}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.imagePreviewHeader}>
            <Text style={[styles.modalTitle, { flex: 1, marginRight: 10 }]} numberOfLines={2}>
              {previewMedImage?.name || 'รูปภาพยา'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.imagePreviewCloseBtn}
            >
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {previewMedImage?.uri ? (
            <View style={styles.imagePreviewFrame}>
              <Image
                source={{ uri: previewMedImage.uri }}
                style={styles.imagePreviewLarge}
                resizeMode="contain"
              />
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  imagePreviewModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  imagePreviewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewFrame: {
    width: '100%',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    overflow: 'hidden',
  },
  imagePreviewLarge: {
    width: '100%',
    height: '100%',
  },
});
