import { supabase } from './supabase';

export function subscribeToAppRealtime(handlers: {
  onMasterMedicationsChanged: () => void | Promise<void>;
  onInteractionsChanged: () => void | Promise<void>;
  onUserDataChanged: () => void | Promise<void>;
}): () => void {
  if (!supabase) {
    return () => {};
  }

  let masterTimer: ReturnType<typeof setTimeout> | null = null;
  let interTimer: ReturnType<typeof setTimeout> | null = null;
  let userTimer: ReturnType<typeof setTimeout> | null = null;

  const triggerMaster = () => {
    if (masterTimer) clearTimeout(masterTimer);
    masterTimer = setTimeout(() => {
      handlers.onMasterMedicationsChanged();
    }, 1000);
  };

  const triggerInteractions = () => {
    if (interTimer) clearTimeout(interTimer);
    interTimer = setTimeout(() => {
      handlers.onInteractionsChanged();
    }, 1000);
  };

  const triggerUserData = () => {
    if (userTimer) clearTimeout(userTimer);
    userTimer = setTimeout(() => {
      handlers.onUserDataChanged();
    }, 1500);
  };

  const channel = supabase
    .channel(`realtime:app-sync-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'medications' },
      triggerMaster
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drug_food_interactions' },
      triggerInteractions
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_schedules' },
      triggerUserData
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      triggerUserData
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'side_effects' },
      triggerUserData
    )
    .subscribe();

  return () => {
    if (masterTimer) clearTimeout(masterTimer);
    if (interTimer) clearTimeout(interTimer);
    if (userTimer) clearTimeout(userTimer);
    supabase?.removeChannel(channel);
  };
}
