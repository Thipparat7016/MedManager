import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Medication } from '@/utils/types';
import { formatCleanDrugName, resolveRawImageUri } from '@/utils/interactionMatcher';

export interface MasterCatalogDropdownProps {
  visible: boolean;
  catalog: Medication[];
  showAddedBadge?: boolean;
  isMedAlreadyAdded?: (drugName?: string) => boolean;
  onClose: () => void;
  onSelect: (item: Medication) => void;
  onPreviewImage: (preview: { uri: string; name: string }) => void;
}

/** Searchable master medication catalog dropdown shared between Add and Edit Medication screens. */
export function MasterCatalogDropdown({
  visible,
  catalog,
  showAddedBadge = false,
  isMedAlreadyAdded,
  onClose,
  onSelect,
  onPreviewImage,
}: MasterCatalogDropdownProps) {
  if (!visible || catalog.length === 0) {
    return null;
  }

  return (
    <View style={styles.masterCatalogList}>
      <View style={styles.dropdownHeaderRow}>
        <Text style={styles.masterCatalogHeader}>รายการยา</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.dropdownCloseText}>ปิด</Text>
        </TouchableOpacity>
      </View>

      {catalog.map((item, idx) => {
        const itemUri = resolveRawImageUri(item.imageUrl);
        const cleanItemName = formatCleanDrugName(item.name);
        const isAdded = showAddedBadge && isMedAlreadyAdded ? isMedAlreadyAdded(item.name) : false;

        return (
          <View
            key={item.id || item.name + idx}
            style={[
              styles.masterItemCard,
              isAdded && styles.masterItemCardAdded,
            ]}
          >
            {itemUri ? (
              <TouchableOpacity
                onPress={() =>
                  onPreviewImage({
                    uri: itemUri,
                    name: cleanItemName,
                  })
                }
                activeOpacity={0.75}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 4 }}
              >
                <Image
                  source={{ uri: itemUri }}
                  style={styles.dropdownThumbImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.masterItemSelectArea}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <View style={{ marginLeft: itemUri ? 10 : 0, flex: 1 }}>
                {showAddedBadge ? (
                  <View style={styles.masterItemNameRow}>
                    <Text style={styles.masterItemName} numberOfLines={1}>
                      {cleanItemName}
                    </Text>
                    {isAdded ? (
                      <View style={styles.masterItemAddedBadge}>
                        <Text style={styles.masterItemAddedText}>เพิ่มแล้ว</Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.masterItemName} numberOfLines={1}>
                    {cleanItemName}
                  </Text>
                )}
                <Text style={styles.masterItemMeta} numberOfLines={1}>
                  {item.category || 'ยา'} • {item.type || 'เม็ด'} • {item.dosage || ''} {item.unit || ''}
                </Text>
              </View>
              <View
                style={[
                  styles.masterItemCategoryBadge,
                  item.category === 'อาหารเสริม'
                    ? styles.masterItemCategorySupplement
                    : styles.masterItemCategoryDrug,
                ]}
              >
                <Text
                  style={[
                    styles.masterItemCategoryText,
                    item.category === 'อาหารเสริม'
                      ? styles.masterItemCategoryTextSupplement
                      : styles.masterItemCategoryTextDrug,
                  ]}
                >
                  {item.category || 'ยา'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  masterCatalogList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  masterCatalogHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  dropdownCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B95F6',
  },
  masterItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  masterItemSelectArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownThumbImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  masterItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  masterItemCardAdded: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  masterItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  masterItemAddedBadge: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  masterItemAddedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B95F6',
  },
  masterItemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  masterItemCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
  },
  masterItemCategoryDrug: {
    backgroundColor: '#E0F2FE',
    borderColor: '#B9E2FE',
  },
  masterItemCategorySupplement: {
    backgroundColor: '#E8E4FB',
    borderColor: '#C9C3EE',
  },
  masterItemCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  masterItemCategoryTextDrug: {
    color: '#0284C7',
  },
  masterItemCategoryTextSupplement: {
    color: '#7C6CD8',
  },
});
