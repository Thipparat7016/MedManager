import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleItem } from '@/utils/types';
import { formatCleanDrugName } from '@/utils/interactionMatcher';

export interface HomeMealChecklistCardProps {
  mealName?: string;
  pageItems: ScheduleItem[];
  safeCurrentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onToggleItem: (id: string, nextChecked: boolean) => void;
  onConfirmPage: () => void;
}

/** Displays the right-hand meal checklist box with pagination and confirm intake button. */
export function HomeMealChecklistCard({
  mealName,
  pageItems,
  safeCurrentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onToggleItem,
  onConfirmPage,
}: HomeMealChecklistCardProps) {
  return (
    <View style={styles.reminderRightBox}>
      <View style={styles.rightBoxHeaderRow}>
        <Text
          style={styles.rightBoxTitle}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Checklist ({mealName || 'มื้อยา'})
        </Text>
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={onPrevPage}
            disabled={safeCurrentPage === 0}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          >
            <Text
              style={[
                styles.pageArrowText,
                safeCurrentPage === 0 && styles.pageArrowDisabled,
              ]}
            >
              &lt;
            </Text>
          </TouchableOpacity>
          <Text style={styles.pageNumberText}>
            {' '}{safeCurrentPage + 1} / {totalPages}{' '}
          </Text>
          <TouchableOpacity
            onPress={onNextPage}
            disabled={safeCurrentPage >= totalPages - 1}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Text
              style={[
                styles.pageArrowText,
                safeCurrentPage >= totalPages - 1 && styles.pageArrowDisabled,
              ]}
            >
              &gt;
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Medication Checklist for Current Page */}
      <View style={styles.checklistContainer}>
        {pageItems.length > 0 ? (
          pageItems.map(item => {
            const isChecked = Boolean(item.isChecked || item.isTaken);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.checkItemRow}
                disabled={item.isTaken}
                onPress={() => {
                  if (!item.isTaken) {
                    onToggleItem(item.id, !isChecked);
                  }
                }}
                activeOpacity={item.isTaken ? 1 : 0.6}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <View
                  style={[
                    styles.checkCircle,
                    isChecked && styles.checkCircleActive,
                  ]}
                >
                  {isChecked && (
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={[
                    styles.checkItemName,
                    item.isTaken && styles.checkItemTextTaken,
                  ]}
                  numberOfLines={1}
                >
                  {formatCleanDrugName(item.medicationName)}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyListText}>ไม่มีรายการยาในมื้อนี้</Text>
        )}
      </View>

      {/* Confirm Intake Action Button */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={onConfirmPage}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmButtonText}>ยืนยันการทานยา</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  reminderRightBox: {
    flex: 0.95,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    paddingHorizontal: 8,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  rightBoxHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
  },
  rightBoxTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 2,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 2,
  },
  pageArrowDisabled: {
    color: '#CBD5E1',
  },
  pageNumberText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  checklistContainer: {
    minHeight: 68,
    justifyContent: 'flex-start',
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
  },
  checkCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  checkCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkItemName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  checkItemTextTaken: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  emptyListText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#8B9BF6',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 7,
  },
  confirmButtonText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
