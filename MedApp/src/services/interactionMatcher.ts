import { Medication, DrugFoodInteraction } from './medService';

/**
 * Clean and normalize text for drug name matching
 */
export function cleanDrugText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[()（）[\]{}.,\/#!$%\^&\*;:{}=\-_`~?+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract meaningful drug tokens (Thai and English)
 * e.g., "ไทลินอล (พาราเซตามอล 500 มก.)" -> ["ไทลินอล", "พาราเซตามอล"]
 */
export function extractDrugTokens(name: string): string[] {
  if (!name) return [];
  const cleaned = cleanDrugText(name);

  // Common stop-words / units / dosages to filter out
  const stopWords = new Set([
    'ยา', 'ยาลด', 'ยาแก้', 'สูตร', 'ตรา', 'เม็ด', 'แคปซูล', 'ยาน้ำ',
    'mg', 'ml', 'g', 'iu', 'มก', 'มล', 'กรัม', 'ซีซี',
    'tab', 'tabs', 'cap', 'caps', 'tablet', 'tablets',
    'ขนาด', 'ละลายน้ำ', 'ชนิด', 'ธรรมชาติ', 'พลัส', 'plus'
  ]);

  const rawTokens = cleaned.split(' ');
  const tokens: string[] = [];

  for (const t of rawTokens) {
    const trimmed = t.trim();
    // Skip numbers or short tokens unless meaningful
    if (!trimmed || /^\d+$/.test(trimmed)) continue;
    if (stopWords.has(trimmed)) continue;
    if (trimmed.length >= 2) {
      tokens.push(trimmed);
    }
  }

  return tokens;
}

/**
 * Check if a user's medication matches an admin interaction's medication_name
 */
export function isMedicationMatch(
  userMedName: string,
  interactionMedName: string
): boolean {
  if (!userMedName || !interactionMedName) return false;

  const cleanUser = cleanDrugText(userMedName);
  const cleanInter = cleanDrugText(interactionMedName);

  // 1. General catch-all interaction (e.g. 'ทุกชนิด', 'ยาทุกชนิด')
  if (cleanInter.includes('ทุกชนิด') || cleanInter.includes('ยาทั่วไป')) {
    return true;
  }

  // 2. Direct substring match (either direction)
  if (cleanUser.includes(cleanInter) || cleanInter.includes(cleanUser)) {
    return true;
  }

  // 3. Token-based matching
  const userTokens = extractDrugTokens(userMedName);
  const interTokens = extractDrugTokens(interactionMedName);

  for (const uToken of userTokens) {
    if (uToken.length < 3) continue;
    for (const iToken of interTokens) {
      if (iToken.length < 3) continue;

      if (uToken === iToken) return true;
      if (uToken.includes(iToken) || iToken.includes(uToken)) return true;
    }
  }

  return false;
}

export interface MatchedInteractionResult {
  id: string; // unique ID for React keys
  interaction: DrugFoodInteraction;
  matchedMedication: Medication;
}

/**
 * Match all interactions from Supabase backend against user's active medications
 */
export function matchInteractionsForUser(
  userMedications: Medication[],
  allInteractions: DrugFoodInteraction[]
): MatchedInteractionResult[] {
  const activeMeds = userMedications.filter(m => m.status === 'active');
  if (activeMeds.length === 0 || allInteractions.length === 0) {
    return [];
  }

  const results: MatchedInteractionResult[] = [];
  const seenPairs = new Set<string>();

  for (const med of activeMeds) {
    for (const inter of allInteractions) {
      if (isMedicationMatch(med.name, inter.medicationName)) {
        const pairKey = `${med.id || med.name}-${inter.id}-${inter.foodName}`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          results.push({
            id: `${inter.id}-${med.id || med.name}`,
            interaction: inter,
            matchedMedication: med,
          });
        }
      }
    }
  }

  return results;
}
