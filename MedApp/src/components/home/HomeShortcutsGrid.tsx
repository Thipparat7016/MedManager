import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export interface HomeShortcutsGridProps {
  onAddMedication: () => void;
  onSchedule: () => void;
  onLogSideEffect: () => void;
  onFoodInteractions: () => void;
}

/** Displays the 2x2 quick action shortcuts grid on HomeScreen. */
export function HomeShortcutsGrid({
  onAddMedication,
  onSchedule,
  onLogSideEffect,
  onFoodInteractions,
}: HomeShortcutsGridProps) {
  return (
    <View style={styles.shortcutsGrid}>
      {/* Shortcut 1: เพิ่มยาใหม่ */}
      <TouchableOpacity
        style={[styles.shortcutCard, { backgroundColor: '#F5F3FF' }]}
        onPress={onAddMedication}
        activeOpacity={0.7}
      >
        <Feather name="plus" size={26} color="#6366F1" />
        <Text style={styles.shortcutText}>เพิ่มยาใหม่</Text>
      </TouchableOpacity>

      {/* Shortcut 2: ตารางยา */}
      <TouchableOpacity
        style={[styles.shortcutCard, { backgroundColor: '#F0FDF4' }]}
        onPress={onSchedule}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="view-grid-outline" size={26} color="#16A34A" />
        <Text style={styles.shortcutText}>ตารางทานยา</Text>
      </TouchableOpacity>

      {/* Shortcut 3: ผลข้างเคียง */}
      <TouchableOpacity
        style={[styles.shortcutCard, { backgroundColor: '#FEF2F2' }]}
        onPress={onLogSideEffect}
        activeOpacity={0.7}
      >
        <Text style={styles.exclamationIcon}>!</Text>
        <Text style={styles.shortcutText}>ผลข้างเคียง</Text>
      </TouchableOpacity>

      {/* Shortcut 4: อาหารที่ควรเลี่ยง */}
      <TouchableOpacity
        style={[styles.shortcutCard, { backgroundColor: '#EFF6FF' }]}
        onPress={onFoodInteractions}
        activeOpacity={0.7}
      >
        <Feather name="x" size={26} color="#2563EB" />
        <Text style={styles.shortcutText}>อาหารที่ควรเลี่ยง</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shortcutCard: {
    width: '48%',
    height: 86,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
  },
  exclamationIcon: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 28,
  },
});
