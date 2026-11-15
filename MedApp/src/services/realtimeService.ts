import { supabase } from './supabase';

export function subscribeToAppRealtime(handlers: {
  onMasterMedicationsChanged: () => void | Promise<void>;
  onInteractionsChanged: () => void | Promise<void>;
  onUserDataChanged: () => void | Promise<void>;
}): () => void {
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
    .channel(`realtime:app-sync-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'medications' },
      () => {
        handlers.onMasterMedicationsChanged();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drug_food_interactions' },
      () => {
        handlers.onInteractionsChanged();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_schedules' },
      () => {
        handlers.onUserDataChanged();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      () => {
        handlers.onUserDataChanged();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'activity_logs' },
      () => {
        handlers.onUserDataChanged();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'side_effects' },
      () => {
        handlers.onUserDataChanged();
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
