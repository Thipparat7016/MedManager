export function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function normalizeMedName(name?: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[()（）[\]{}.,\/#!$%\^&\*;:{}=\-_`~?+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format hospital name to always be prefixed with "โรงพยาบาล"
 * e.g., "บางมด" -> "โรงพยาบาลบางมด"
 * e.g., "รพ.ธนบุรี" -> "โรงพยาบาลธนบุรี"
 * e.g., "โรงพยาบาลศิริราช" -> "โรงพยาบาลศิริราช"
 */
export function formatHospitalName(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('โรงพยาบาล')) {
    return trimmed;
  }
  if (trimmed.startsWith('รพ.') || trimmed.startsWith('รพ ')) {
    return `โรงพยาบาล${trimmed.replace(/^รพ\.?\s*/, '')}`;
  }
  return `โรงพยาบาล${trimmed}`;
}

/**
 * Format department name to always be prefixed with "แผนก"
 * e.g., "อายุรกรรม" -> "แผนกอายุรกรรม"
 * e.g., "แผนกทันตกรรม" -> "แผนกทันตกรรม"
 */
export function formatDepartmentName(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('แผนก')) {
    return trimmed;
  }
  return `แผนก${trimmed}`;
}

export function toUserStorageKey(emailOrId?: string | null): string | null {
  if (!emailOrId) return null;
  const cleaned = emailOrId.trim().toLowerCase();
  if (!cleaned) return null;
  return cleaned.replace(/[^a-z0-9@._-]/gi, '_');
}

export function hasValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 9;
}

/** Normalizes Thai doctor names for duplicate detection by stripping honorific prefixes and collapsing whitespace. */
export function normalizeDoctorName(name: string): string {
  return name
    .trim()
    .replace(/^(นพ\.|พญ\.|ทพ\.|ทพญ\.|ดร\.|นพ|พญ|ทพ|ทพญ|ดร)\s*/i, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Pads a numeric unit (hour, minute, day, month) to two digits with leading zero. */
export function padTwoDigits(n: number): string {
  return n.toString().padStart(2, '0');
}
