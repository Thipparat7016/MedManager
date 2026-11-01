import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getMedicationStockStatus } from '@/services/medService';
import {
  formatCleanDrugName,
  resolveMedicationImageUri,
} from '@/services/interactionMatcher';

export default function MedicationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { medications, masterMedications, deleteMedication, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ทั้งหมด' | 'ยา' | 'อาหารเสริม'>('ทั้งหมด');
  const [previewMedImage, setPreviewMedImage] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

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

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}
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

        {/* Empty State */}
        {medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการยาใน "ยาของฉัน"</Text>
            <Text style={styles.emptySubtitle}>
              กดปุ่ม + เพื่อเพิ่มยา
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/add-medication')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyAddBtnText}>+ เพิ่มยา</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredActive.map(item => {
              const stockStatus = getMedicationStockStatus(item);
              const imgUri = resolveMedicationImageUri(item, masterMedications);
              const cleanName = formatCleanDrugName(item.name);

              return (
                <View key={item.id} style={styles.medCard}>
                  <View style={styles.medCardTop}>
                    {imgUri ? (
                      <TouchableOpacity
                        onPress={() =>
                          setPreviewMedImage({
                            uri: imgUri,
                            name: cleanName,
                          })
                        }
                        activeOpacity={0.75}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Image
                          source={{ uri: imgUri }}
                          style={styles.medThumbImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : null}

                    <View style={[styles.medCardDetails, !imgUri && { marginLeft: 0 }]}>
                      <View style={styles.nameRow}>
                        <Text
                          style={[styles.medCardName, { flex: 1, marginRight: 8 }]}
                          numberOfLines={1}
                        >
                          {cleanName}
                        </Text>
                        {stockStatus.isLowStock && (
                          <StatusBadge label="ใกล้หมด" variant="low_stock" size="sm" />
                        )}
                      </View>
                      <Text style={styles.medCardMeta}>
                        {item.dosage}{item.unit} • {item.type} • {item.frequency} ครั้ง/วัน
                      </Text>
                      {stockStatus.hasStock && (
                        <Text style={styles.medCardStock}>
                          คงเหลือ: {stockStatus.remaining} เม็ด
                        </Text>
                      )}
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
                      onPress={() => handleDelete(item.id, cleanName)}
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
                {filteredInactive.map(item => {
                  const stockStatus = getMedicationStockStatus(item);
                  const imgUri = resolveMedicationImageUri(item, masterMedications);
                  const cleanName = formatCleanDrugName(item.name);

                  return (
                    <View key={item.id} style={styles.inactiveCard}>
                      {imgUri ? (
                        <TouchableOpacity
                          onPress={() =>
                            setPreviewMedImage({
                              uri: imgUri,
                              name: cleanName,
                            })
                          }
                          activeOpacity={0.75}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Image
                            source={{ uri: imgUri }}
                            style={[styles.medThumbImage, { opacity: 0.8 }]}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : null}

                      <View style={[styles.inactiveDetails, !imgUri && { marginLeft: 0 }]}>
                        <View style={styles.nameRow}>
                          <Text
                            style={[styles.inactiveName, { flex: 1, marginRight: 8 }]}
                            numberOfLines={1}
                          >
                            {cleanName}
                          </Text>
                          {stockStatus.isLowStock && (
                            <StatusBadge label="ใกล้หมด" variant="low_stock" size="sm" />
                          )}
                        </View>
                        <Text style={styles.inactiveMeta}>
                          {item.dosage}{item.unit} • {item.type}
                          {item.endDate ? ` • หยุด ${item.endDate}` : ''}
                        </Text>
                        {stockStatus.hasStock && (
                          <Text style={[styles.inactiveMeta, { fontWeight: '700', color: '#475569' }]}>
                            คงเหลือ: {stockStatus.remaining} เม็ด
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Medication Image Enlarge Popup Modal */}
      <Modal
        visible={Boolean(previewMedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewMedImage(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPreviewMedImage(null)}
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
                onPress={() => setPreviewMedImage(null)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
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
  medThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#8B95F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
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
