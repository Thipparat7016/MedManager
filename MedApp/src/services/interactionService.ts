import { supabase } from './supabase';
import { DrugFoodInteraction } from '../utils/types';

let interactionsCache: DrugFoodInteraction[] | null = null;
let interactionsFetchedAt = 0;
let interactionsInFlight: Promise<DrugFoodInteraction[]> | null = null;
const INTERACTIONS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (invalidated immediately by Realtime)

export const interactionService = {
  async getInteractions(
    medicationName?: string,
    forceRefresh: boolean = false
  ): Promise<DrugFoodInteraction[]> {
    const isFiltered = Boolean(medicationName && medicationName !== 'ทั้งหมด');
    const now = Date.now();

    if (
      !isFiltered &&
      !forceRefresh &&
      interactionsCache &&
      now - interactionsFetchedAt < INTERACTIONS_CACHE_TTL_MS
    ) {
      return interactionsCache;
    }

    if (!isFiltered && !forceRefresh && interactionsInFlight) {
      return interactionsInFlight;
    }

    const fetchPromise = (async () => {
      try {
        if (supabase) {
          let query = supabase
            .from('drug_food_interactions')
            .select('*')
            .order('created_at', { ascending: false });
          if (isFiltered && medicationName) {
            query = query.ilike('medication_name', `%${medicationName}%`);
          }
          const { data, error } = await query;
          if (!error && data) {
            const mapped: DrugFoodInteraction[] = data.map((d: any) => ({
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
            if (!isFiltered) {
              interactionsCache = mapped;
              interactionsFetchedAt = Date.now();
            }
            return mapped;
          }
        }
      } catch (e) {
        console.warn('Error fetching interactions from Supabase:', e);
      } finally {
        if (!isFiltered) {
          interactionsInFlight = null;
        }
      }
      return !isFiltered && interactionsCache ? interactionsCache : [];
    })();

    if (!isFiltered) {
      interactionsInFlight = fetchPromise;
    }

    return fetchPromise;
  },
};
