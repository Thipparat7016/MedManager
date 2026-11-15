import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { FavoriteDoctor } from '@/services/appointmentService';

export interface FavoriteDoctorsSectionProps {
  favoriteDoctors: FavoriteDoctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (doc: FavoriteDoctor) => void;
  onEditDoctor: (doc: FavoriteDoctor) => void;
  onDeleteDoctor: (doc: FavoriteDoctor) => void;
  onAddNewDoctor: () => void;
}

/** Displays the user's saved favorite doctors list and an "+ เพิ่มแพทย์ใหม่" selection card. */
export function FavoriteDoctorsSection({
  favoriteDoctors,
  selectedDoctorId,
  onSelectDoctor,
  onEditDoctor,
  onDeleteDoctor,
  onAddNewDoctor,
}: FavoriteDoctorsSectionProps) {
  if (favoriteDoctors.length === 0) return null;

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="star" size={16} color="#EAB308" />
        <Text style={styles.sectionHeaderTitle}>แพทย์ที่นัดประจำ</Text>
      </View>

      {/* Favorite Doctor Cards List */}
      {favoriteDoctors.map(doc => {
        const isSelected = selectedDoctorId === doc.id;
        return (
          <View
            key={doc.id}
            style={[
              styles.doctorCard,
              isSelected && styles.doctorCardActive,
            ]}
          >
            <TouchableOpacity
              style={styles.doctorCardContent}
              onPress={() => onSelectDoctor(doc)}
              activeOpacity={0.7}
            >
              <Text style={styles.doctorCardName} numberOfLines={1}>
                {doc.name}
              </Text>
              <Text style={styles.doctorCardMeta} numberOfLines={1}>
                {doc.department} • {doc.hospital}
              </Text>
            </TouchableOpacity>

            <View style={styles.doctorCardActions}>
              <TouchableOpacity
                style={[styles.doctorActionBtn, styles.doctorActionBtnEdit]}
                onPress={() => onEditDoctor(doc)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={14} color="#B87108" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.doctorActionBtn, styles.doctorActionBtnDelete]}
                onPress={() => onDeleteDoctor(doc)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* + เพิ่มแพทย์ใหม่ (Dashed Card) */}
      <TouchableOpacity
        style={[
          styles.addDoctorDashedCard,
          selectedDoctorId === 'new' && styles.addDoctorDashedCardActive,
        ]}
        onPress={onAddNewDoctor}
        activeOpacity={0.7}
      >
        <Feather
          name="plus"
          size={16}
          color={selectedDoctorId === 'new' ? '#3D7B54' : '#64748B'}
        />
        <Text
          style={[
            styles.addDoctorDashedText,
            selectedDoctorId === 'new' && styles.addDoctorDashedTextActive,
          ]}
        >
          เพิ่มแพทย์ใหม่
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorCardActive: {
    borderColor: '#6FA07E',
    backgroundColor: '#F0FDF4',
  },
  doctorCardContent: {
    flex: 1,
    marginRight: 8,
  },
  doctorCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  doctorCardMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  doctorCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorActionBtnEdit: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  doctorActionBtnDelete: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  addDoctorDashedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1E7DD',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  addDoctorDashedCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#6FA07E',
  },
  addDoctorDashedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  addDoctorDashedTextActive: {
    color: '#3D7B54',
  },
});
