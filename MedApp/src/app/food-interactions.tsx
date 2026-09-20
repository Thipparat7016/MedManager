import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApp } from '@/context/AppContext';

export default function FoodInteractionsScreen() {
  const { interactions } = useApp();
  const [selectedDrug, setSelectedDrug] = useState<string>('ทั้งหมด');

  const drugFilters = ['ทั้งหมด', 'แอสไพริน', 'เมทฟอร์มิน', 'โอเมก้า-3'];

  const filteredInteractions = interactions.filter(item => {
    if (selectedDrug === 'ทั้งหมด') return true;
    return item.medicationName.includes(selectedDrug) || item.medicationName.includes('ทุกชนิด');
  });

  const avoidList = filteredInteractions.filter(i => i.interactionType === 'หลีกเลี่ยง');
  const recommendList = filteredInteractions.filter(i => i.interactionType === 'แนะนำ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="ข้อมูลยาและอาหารที่ควรหลีกเลี่ยง" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Drug Filter Chips */}
        <Text style={styles.filterTitle}>กรองตามยา</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {drugFilters.map(drug => (
            <TouchableOpacity
              key={drug}
              style={[
                styles.filterChip,
                selectedDrug === drug && styles.filterChipActive,
              ]}
              onPress={() => setSelectedDrug(drug)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedDrug === drug && styles.filterChipTextActive,
                ]}
              >
                {drug}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section 1: Foods to Avoid */}
        <Text style={styles.sectionTitle}>อาหารที่ต้องหลีกเลี่ยง</Text>
        {avoidList.map(item => {
          const isHigh = item.severity === 'สูง';
          const isMed = item.severity === 'กลาง';

          return (
            <View
              key={item.id}
              style={[
                styles.interactionCard,
                isHigh && styles.cardHighBorder,
                isMed && styles.cardMedBorder,
                !isHigh && !isMed && styles.cardLowBorder,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.foodName}>{item.foodName}</Text>
                <StatusBadge
                  label={item.severity}
                  variant={isHigh ? 'high' : isMed ? 'medium' : 'low'}
                  size="sm"
                />
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="pill"
                  size={14}
                  color={isHigh ? '#EF4444' : isMed ? '#F97316' : '#EAB308'}
                  style={styles.iconStyle}
                />
                <Text style={styles.infoText}>{item.medicationName}</Text>
              </View>

              {item.hoursNote && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isHigh ? '#EF4444' : isMed ? '#F97316' : '#EAB308'}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.infoText}>{item.hoursNote}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Ionicons
                  name="warning"
                  size={14}
                  color={isHigh ? '#DC2626' : isMed ? '#EA580C' : '#CA8A04'}
                  style={styles.iconStyle}
                />
                <Text
                  style={[
                    styles.infoTextBold,
                    { color: isHigh ? '#B91C1C' : isMed ? '#C2410C' : '#A16207' },
                  ]}
                >
                  {item.impactDetails}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.sourceText}>แหล่งอ้างอิง: {item.sourceName}</Text>
              </View>
            </View>
          );
        })}

        {/* Section 2: Recommended Foods */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          อาหารที่แนะนำรับประทานควบคู่
        </Text>
        {recommendList.map(item => (
          <View key={item.id} style={styles.recommendCard}>
            <Text style={styles.recommendFoodName}>{item.foodName}</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="pill"
                size={14}
                color="#8B95F6"
                style={styles.iconStyle}
              />
              <Text style={styles.infoText}>{item.medicationName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color="#10B981"
                style={styles.iconStyle}
              />
              <Text style={[styles.infoTextBold, { color: '#047857' }]}>
                {item.impactDetails}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.sourceText}>แหล่งอ้างอิง: {item.sourceName}</Text>
            </View>
          </View>
        ))}
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
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#BAE6FD',
    borderColor: '#38BDF8',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#0369A1',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  interactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  cardHighBorder: {
    borderColor: '#FECACA',
  },
  cardMedBorder: {
    borderColor: '#FED7AA',
  },
  cardLowBorder: {
    borderColor: '#FEF08A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  iconStyle: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  infoTextBold: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 6,
  },
  sourceText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  recommendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 16,
    marginBottom: 14,
  },
  recommendFoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
});
