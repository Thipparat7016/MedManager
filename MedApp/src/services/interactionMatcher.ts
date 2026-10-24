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
 * Clean drug name by removing details inside parentheses
 * e.g., "ทิฟฟี่ (พาราเซตามอล + คลอร์เฟนิรามีน + ฟีนิลเอฟรีน)" -> "ทิฟฟี่"
 * e.g., "ไทลินอล (พาราเซตามอล 500 มก.)" -> "ไทลินอล"
 * e.g., "ดีคอลเจน พริน (Decolgen Prin)" -> "ดีคอลเจน พริน"
 */
export function formatCleanDrugName(rawName?: string | null): string {
  if (!rawName) return '';
  const cleaned = rawName
    .replace(/\s*[\(\（\[【][^\)\）\]】]*[\)\）\]】]?\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || rawName.trim();
}

/**
 * Clean food name by removing details inside parentheses
 * e.g., "เครื่องดื่มที่มีคาเฟอีน (ชาเข้มข้น, กาแฟ, เครื่องดื่มชูกำลัง)" -> "เครื่องดื่มที่มีคาเฟอีน"
 * e.g., "กาแฟ, ชาเข้มข้น, ธัญพืชไม่ขัดสี (อาหารที่มีไฟเตตสูง)" -> "กาแฟ, ชาเข้มข้น, ธัญพืชไม่ขัดสี"
 */
export function formatCleanFoodName(rawFoodName?: string | null): string {
  if (!rawFoodName) return '';
  const cleaned = rawFoodName
    .replace(/\s*[\(\（\[【][^\)\）\]】]*[\)\）\]】]?\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || rawFoodName.trim();
}

/**
 * Extract extra formula/ingredients from parentheses if present
 * e.g., "ทิฟฟี่ (พาราเซตามอล + คลอร์เฟนิรามีน + ฟีนิลเอฟรีน)" -> "พาราเซตามอล + คลอร์เฟนิรามีน + ฟีนิลเอฟรีน"
 */
export function extractDrugDetails(rawName?: string | null): string {
  if (!rawName) return '';
  const match = rawName.match(/[\(\（\[【]([^\)\）\]】]+)[\)\）\]】]/);
  return match ? match[1].trim() : '';
}

/**
 * Truncate long descriptions to a concise summary (แสดงพอสังเขป)
 */
export function formatConciseText(text?: string | null, maxLength: number = 80): string {
  if (!text) return '';
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength) + '...';
}

/**
 * Check if a user's medication matches an admin interaction's medication_name
 */
export function isMedicationMatch(
  userMedName: string,
  interactionMedName: string,
  userMedContext?: string
): boolean {
  if (!userMedName || !interactionMedName) return false;

  const cleanUser = cleanDrugText(userMedName);
  const cleanInter = cleanDrugText(interactionMedName);

  // 1. General catch-all interaction (e.g. 'ทุกชนิด', 'ยาทุกชนิด')
  if (cleanInter.includes('ทุกชนิด') || cleanInter.includes('ยาทั่วไป')) {
    return true;
  }

  // 2. Direct clean base name match (e.g. "ทิฟฟี่" vs "ทิฟฟี่")
  const baseUser = formatCleanDrugName(userMedName).toLowerCase();
  const baseInter = formatCleanDrugName(interactionMedName).toLowerCase();
  if (baseUser && baseInter && (baseUser === baseInter || baseUser.includes(baseInter) || baseInter.includes(baseUser))) {
    return true;
  }

  // 3. Direct substring match (either direction)
  if (cleanUser.includes(cleanInter) || cleanInter.includes(cleanUser)) {
    return true;
  }

  // 3. Token-based matching (checking name and any formula/context)
  const userFull = userMedName + (userMedContext ? ' ' + userMedContext : '');
  const userTokens = extractDrugTokens(userFull);
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
      const extraContext = [med.instructions, med.precautions].filter(Boolean).join(' ');
      if (isMedicationMatch(med.name, inter.medicationName, extraContext)) {
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
