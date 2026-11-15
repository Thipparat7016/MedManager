import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { DrugFoodInteraction, ScheduleItem } from '@/utils/types';
import { formatThaiFullDate } from '@/utils/dateUtils';
import {
  MEAL_ORDER,
  MEAL_TIME_RANGES,
  getMealCategory,
} from '@/utils/scheduleUtils';
import {
  isMedicationMatch,
  formatCleanFoodName,
  resolveMedicationImageUri,
} from '@/utils/interactionMatcher';

export interface HomeMealGroup {
  name: string;
  items: ScheduleItem[];
}

export interface PreviewMedImage {
  uri: string;
  name: string;
}

/** Custom hook encapsulating home dashboard state, meal progress, checklist pagination, and shortcuts. */
export function useHomeDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user,
    todaySchedule,
    toggleChecklist,
    confirmCheckedIntake,
    notifications,
    interactions,
    medications,
    masterMedications,
    refreshData,
  } = useApp();

  const [isExpandedAllMeals, setIsExpandedAllMeals] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [previewMedImage, setPreviewMedImage] = useState<PreviewMedImage | null>(null);
  const [hasUserPagedMeal, setHasUserPagedMeal] = useState<boolean>(false);

  // Auto-refresh when navigating back to HomeScreen
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

  const thaiDateText = formatThaiFullDate();

  // Progress metrics
  const takenCount = todaySchedule.filter(s => s.isTaken).length;
  const totalCount = todaySchedule.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const remainingCount = Math.max(0, totalCount - takenCount);

  // Resolve medication image from user medications or master medications catalog
  const getMedImage = useCallback(
    (medName: string, medId?: string): string | null => {
      return resolveMedicationImageUri(
        { id: medId, name: medName },
        masterMedications,
        medications
      );
    },
    [masterMedications, medications]
  );

  // Find food avoidances for a medicine
  const getMedAvoidances = useCallback(
    (medName: string): DrugFoodInteraction[] => {
      const list = interactions.filter(
        i =>
          (i.interactionType === 'หลีกเลี่ยง' || i.interactionType?.includes('หลีกเลี่ยง')) &&
          isMedicationMatch(medName, i.medicationName)
      );
      const seen = new Set<string>();
      return list.filter(item => {
        const clean = formatCleanFoodName(item.foodName).toLowerCase();
        if (seen.has(clean)) return false;
        seen.add(clean);
        return true;
      });
    },
    [interactions]
  );

  // Next pending medication items (prioritizes upcoming meals >= current time - 60m)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const pendingItemsToday = todaySchedule.filter(s => !s.isTaken && !s.isSkipped);
  const upcomingPending = pendingItemsToday.find(s => {
    const match = s.time.match(/(\d+):(\d+)/);
    if (!match) return true;
    const itemMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    return itemMinutes >= currentMinutes - 60;
  });
  const effectiveNextItem = upcomingPending || pendingItemsToday[0] || null;

  const nextMealName = effectiveNextItem
    ? getMealCategory(effectiveNextItem.time, effectiveNextItem.mealTiming)
    : todaySchedule.length > 0
    ? 'ทานครบแล้ว'
    : 'ยังไม่มีมื้อยา';

  const nextMealItems = effectiveNextItem
    ? todaySchedule.filter(
        s =>
          getMealCategory(s.time, s.mealTiming) === nextMealName &&
          !s.isTaken &&
          !s.isSkipped
      )
    : [];

  // Grouped schedule by Meal (1 page = 1 meal in Checklist)
  const mealsGrouped: HomeMealGroup[] = useMemo(() => {
    return MEAL_ORDER.map(mealName => ({
      name: mealName,
      items: todaySchedule.filter(
        s => getMealCategory(s.time, s.mealTiming) === mealName
      ),
    })).filter(g => g.items.length > 0);
  }, [todaySchedule]);

  const checklistMeals: HomeMealGroup[] = useMemo(() => {
    return mealsGrouped.length > 0
      ? mealsGrouped
      : MEAL_ORDER.map(mealName => ({
          name: mealName,
          items: [],
        }));
  }, [mealsGrouped]);

  const totalPages = Math.max(1, checklistMeals.length);
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const currentMeal = checklistMeals[safeCurrentPage] || checklistMeals[0];
  const pageItems = currentMeal ? currentMeal.items : [];

  // Auto-sync initial page to next upcoming meal (if user hasn't manually paged)
  useEffect(() => {
    if (!hasUserPagedMeal && checklistMeals.length > 0 && nextMealName) {
      const idx = checklistMeals.findIndex(m => m.name === nextMealName);
      if (idx >= 0) {
        setCurrentPage(idx);
      }
    }
  }, [nextMealName, checklistMeals, hasUserPagedMeal]);

  const handlePrevPage = useCallback(() => {
    setHasUserPagedMeal(true);
    setCurrentPage(p => Math.max(0, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setHasUserPagedMeal(true);
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const handleConfirmCurrentPage = useCallback(async () => {
    if (!currentMeal || currentMeal.items.length === 0) return;

    const pendingChecked = currentMeal.items.filter(i => i.isChecked && !i.isTaken);
    if (pendingChecked.length > 0) {
      await confirmCheckedIntake(pendingChecked.map(i => i.id));
    } else {
      const untaken = currentMeal.items.filter(i => !i.isTaken);
      if (untaken.length > 0) {
        await confirmCheckedIntake(untaken.map(i => i.id));
      }
    }
  }, [currentMeal, confirmCheckedIntake]);

  const unreadNotifCount = notifications.filter(
    n => !n.isRead && n.type !== 'med_taken'
  ).length;

  const topInsetPadding = Math.max(insets.top, 24) + 14;

  const goToNotifications = useCallback(() => router.push('/notifications'), [router]);
  const goToAddMedication = useCallback(() => router.push('/add-medication'), [router]);
  const goToSchedule = useCallback(() => router.push('/schedule'), [router]);
  const goToLogSideEffect = useCallback(() => router.push('/log-side-effect'), [router]);
  const goToFoodInteractions = useCallback(() => router.push('/food-interactions'), [router]);

  return {
    user,
    todaySchedule,
    thaiDateText,
    MEAL_TIME_RANGES,
    isExpandedAllMeals,
    setIsExpandedAllMeals,
    refreshing,
    onRefresh,
    previewMedImage,
    setPreviewMedImage,
    takenCount,
    totalCount,
    progressPercent,
    remainingCount,
    getMedImage,
    getMedAvoidances,
    nextMealName,
    nextMealItems,
    mealsGrouped,
    currentMeal,
    pageItems,
    safeCurrentPage,
    totalPages,
    handlePrevPage,
    handleNextPage,
    handleConfirmCurrentPage,
    toggleChecklist,
    unreadNotifCount,
    topInsetPadding,
    goToNotifications,
    goToAddMedication,
    goToSchedule,
    goToLogSideEffect,
    goToFoodInteractions,
  };
}
