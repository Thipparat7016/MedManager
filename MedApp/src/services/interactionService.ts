import { supabase } from './supabase';
import { DrugFoodInteraction } from '../utils/types';

export const interactionService = {
  async getInteractions(medicationName?: string): Promise<DrugFoodInteraction[]> {
    try {
      if (supabase) {
        let query = supabase
          .from('drug_food_interactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (medicationName && medicationName !== 'ทั้งหมด') {
          query = query.ilike('medication_name', `%${medicationName}%`);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            medicationName: d.medication_name,
            foodName: d.food_name,
            interactionType: d.interaction_type,
            severity: d.severity,
            hoursNote: d.hours_note,
            impactDetails: d.impact_details,
            sourceName: d.source_name,
            sourceType: d.source_type,
          }));
        }
      }
    } catch (e) {
      console.warn('Error fetching interactions from Supabase:', e);
    }

    return [];
  },
};
