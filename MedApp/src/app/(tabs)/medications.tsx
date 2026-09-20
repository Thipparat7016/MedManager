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
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { PillIcon } from '@/components/ui/PillIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function MedicationsScreen() {
  const router = useRouter();
  const { medications, deleteMedication } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ทั้งหมด' | 'ยา' | 'อาหารเสริม'>('ทั้งหมด');

  const activeMeds = medications.filter(m => m.status === 'active');
  const inactiveMeds = medications.filter(m => m.status === 'inactive');

  const filterList = (list: typeof medications) => {
    return list.filter(m => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.dosage && m.dosage.includes(search));
      const matchCat =
        activeCategory === 'ทั้งหมด' || m.category === activeCategory;
      return matchSearch && matchCat;
    });
  };

  const filteredActive = filterList(activeMeds);
  const filteredInactive = filterList(inactiveMeds);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('ยืนยันการลบ', `คุณต้องการลบ "${name}" หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => deleteMedication(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>ยาของฉัน</Text>
          <TouchableOpacity
            style={styles.addMedButton}
            onPress={() => router.push('/add-medication')}
            activeOpacity={0.8}
          >
            <Text style={styles.addMedButtonText}>+ เพิ่มยา</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8B95F6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหายาหรืออาหารเสริม..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeCategory === 'ทั้งหมด' && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory('ทั้งหมด')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === 'ทั้งหมด' && styles.filterChipTextActive,
              ]}
            >
              ทั้งหมด ({medications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeCategory === 'ยา' && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory('ยา')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === 'ยา' && styles.filterChipTextActive,
              ]}
            >
              ยา ({medications.filter(m => m.category === 'ยา').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeCategory === 'อาหารเสริม' && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory('อาหารเสริม')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === 'อาหารเสริม' && styles.filterChipTextActive,
              ]}
            >
              อาหารเสริม ({medications.filter(m => m.category === 'อาหารเสริม').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section: Active */}
        <Text style={styles.sectionTitle}>กำลังใช้งาน</Text>
        {filteredActive.map(item => {
          const isLowStock =
            item.remaining !== undefined &&
            item.lowStockThreshold !== undefined &&
            item.remaining <= item.lowStockThreshold;

          return (
            <View key={item.id} style={styles.medCard}>
              <View style={styles.medCardTop}>
                <PillIcon type={item.type || item.name} />
                <View style={styles.medCardDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.medCardName}>{item.name}</Text>
                    {isLowStock && <StatusBadge label="ใกล้หมด" variant="low_stock" size="sm" />}
                  </View>
                  <Text style={styles.medCardMeta}>
                    {item.dosage}{item.unit} • {item.type} • {item.frequency} ครั้ง/วัน
                  </Text>
                  <Text style={styles.medCardStock}>คงเหลือ: {item.remaining} เม็ด</Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnEdit}
                  onPress={() =>
                    router.push({
                      pathname: '/edit-medication',
                      params: { id: item.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnEditText}>แก้ไข</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSchedule}
                  onPress={() => router.push('/schedule')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnScheduleText}>ตาราง</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnDelete}
                  onPress={() => handleDelete(item.id, item.name)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Section: Inactive */}
        {filteredInactive.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>หยุดใช้งาน</Text>
            {filteredInactive.map(item => (
              <View key={item.id} style={styles.inactiveCard}>
                <PillIcon type={item.name} disabled />
                <View style={styles.inactiveDetails}>
                  <Text style={styles.inactiveName}>{item.name}</Text>
                  <Text style={styles.inactiveMeta}>
                    {item.dosage}{item.unit} • {item.type} • หยุด {item.endDate || '01/06/2569'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  addMedButton: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  addMedButtonText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterChipsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#8B95F6',
    borderColor: '#8B95F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  medCardTop: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  medCardDetails: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  medCardMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  medCardStock: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnEdit: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnEditText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  actionBtnSchedule: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnScheduleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  actionBtnDelete: {
    width: 44,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 10,
  },
  inactiveDetails: {
    flex: 1,
    marginLeft: 14,
  },
  inactiveName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  inactiveMeta: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
});
