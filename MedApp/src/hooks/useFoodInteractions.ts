import { useState, useCallback, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import {
  matchInteractionsForUser,
  MatchedInteractionResult,
  formatCleanDrugName,
} from '@/utils/interactionMatcher';
import {
  isMedicationScheduledForDate,
  getMealCategory,
  MEAL_ORDER,
  MEAL_TIME_RANGES,
} from '@/utils/scheduleUtils';

export interface MealInteractionsGroup {
  mealName: string;
  range: string;
  avoid: MatchedInteractionResult[];
  recommend: MatchedInteractionResult[];
  totalCount: number;
}

/** Custom hook encapsulating active drug filtering, meal grouping, and interaction matching. */
export function useFoodInteractions() {
  const router = useRouter();
  const { interactions, medications, todaySchedule, refreshData } = useApp();
  const [selectedDrug, setSelectedDrug] = useState<string>('ทั้งหมด');
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh when navigating to screen to ensure backend updates from AdminMed appear immediately
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // User's active medications
  const activeUserMeds = useMemo(
    () => medications.filter(m => m.status === 'active'),
    [medications]
  );

  // Filter only medications that are scheduled for TODAY
  const todayDate = useMemo(() => new Date(), []);
  const scheduledTodayNames = useMemo(() => {
    return new Set(
      todaySchedule.map(s => formatCleanDrugName(s.medicationName)).filter(Boolean)
    );
  }, [todaySchedule]);

  const todayActiveMeds = useMemo(() => {
    return activeUserMeds.filter(
      m =>
        scheduledTodayNames.has(formatCleanDrugName(m.name)) ||
        isMedicationScheduledForDate(m, todayDate)
    );
  }, [activeUserMeds, scheduledTodayNames, todayDate]);

  // Match interactions for today's medications
  const matchedList: MatchedInteractionResult[] = useMemo(() => {
    return matchInteractionsForUser(todayActiveMeds, interactions);
  }, [todayActiveMeds, interactions]);

  // Derive unique drug names for today
  const todayDrugNames = useMemo(() => {
    return Array.from(
      new Set(todayActiveMeds.map(m => formatCleanDrugName(m.name)))
    ).filter(Boolean);
  }, [todayActiveMeds]);

  // Buttons filter: "ทั้งหมด" + only the medicines of that day
  const drugFilters = useMemo(() => {
    return ['ทั้งหมด', ...todayDrugNames];
  }, [todayDrugNames]);

  // Fallback to "ทั้งหมด" if previously selected drug is not in today's drugs
  const effectiveSelectedDrug = drugFilters.includes(selectedDrug)
    ? selectedDrug
    : 'ทั้งหมด';

  // Filter for single drug view
  const singleDrugMatches = useMemo(() => {
    if (effectiveSelectedDrug === 'ทั้งหมด') return [];
    return matchedList.filter(
      item =>
        formatCleanDrugName(item.matchedMedication.name) === effectiveSelectedDrug
    );
  }, [effectiveSelectedDrug, matchedList]);

  const singleAvoidList = useMemo(() => {
    return singleDrugMatches.filter(
      i =>
        i.interaction.interactionType === 'หลีกเลี่ยง' ||
        i.interaction.interactionType?.includes('หลีกเลี่ยง')
    );
  }, [singleDrugMatches]);

  const singleRecommendList = useMemo(() => {
    return singleDrugMatches.filter(
      i =>
        i.interaction.interactionType === 'แนะนำ' ||
        i.interaction.interactionType === 'แนะนำให้รับประทานร่วม' ||
        i.interaction.interactionType?.includes('แนะนำ')
    );
  }, [singleDrugMatches]);

  // Grouped by Meal for "ทั้งหมด"
  const mealsData: MealInteractionsGroup[] = useMemo(() => {
    return MEAL_ORDER.map(mealName => {
      // Find medication names in this meal
      const itemsInMeal = todaySchedule.filter(
        s => getMealCategory(s.time, s.mealTiming) === mealName
      );
      const medNamesInMeal = new Set(
        itemsInMeal.map(s => formatCleanDrugName(s.medicationName))
      );

      // Fallback: also check medication times if todaySchedule is empty
      if (medNamesInMeal.size === 0) {
        todayActiveMeds.forEach(m => {
          if (
            (m.times || []).some(t => getMealCategory(t, m.mealTiming) === mealName)
          ) {
            medNamesInMeal.add(formatCleanDrugName(m.name));
          }
        });
      }

      const mealMatches = matchedList.filter(item =>
        medNamesInMeal.has(formatCleanDrugName(item.matchedMedication.name))
      );

      const avoid = mealMatches.filter(
        i =>
          i.interaction.interactionType === 'หลีกเลี่ยง' ||
          i.interaction.interactionType?.includes('หลีกเลี่ยง')
      );
      const recommend = mealMatches.filter(
        i =>
          i.interaction.interactionType === 'แนะนำ' ||
          i.interaction.interactionType === 'แนะนำให้รับประทานร่วม' ||
          i.interaction.interactionType?.includes('แนะนำ')
      );

      return {
        mealName,
        range: MEAL_TIME_RANGES[mealName]?.range || '',
        avoid,
        recommend,
        totalCount: avoid.length + recommend.length,
      };
    }).filter(m => m.totalCount > 0);
  }, [todaySchedule, todayActiveMeds, matchedList]);

  const goToAddMedication = useCallback(() => {
    router.push('/add-medication');
  }, [router]);

  return {
    selectedDrug,
    setSelectedDrug,
    refreshing,
    onRefresh,
    activeUserMeds,
    todayActiveMeds,
    matchedList,
    drugFilters,
    effectiveSelectedDrug,
    singleAvoidList,
    singleRecommendList,
    mealsData,
    goToAddMedication,
  };
}
