export function extractOAuthParams(rawUrl: string): Record<string, string> {
  const result: Record<string, string> = {};
  const queryIndex = rawUrl.indexOf('?');
  const hashIndex = rawUrl.indexOf('#');
  if (queryIndex !== -1) {
    const queryPart =
      hashIndex > queryIndex
        ? rawUrl.slice(queryIndex + 1, hashIndex)
        : rawUrl.slice(queryIndex + 1);
    new URLSearchParams(queryPart).forEach((val, key) => {
      result[key] = val;
    });
  }
  if (hashIndex !== -1) {
    const hashPart = rawUrl.slice(hashIndex + 1);
    new URLSearchParams(hashPart).forEach((val, key) => {
      result[key] = val;
    });
  }
  return result;
}

export function resolveGoogleName(meta: any): string {
  if (!meta) return '';
  if (meta.full_name) return String(meta.full_name).trim();
  if (meta.name) return String(meta.name).trim();
  const given = meta.given_name ? String(meta.given_name).trim() : '';
  const family = meta.family_name ? String(meta.family_name).trim() : '';
  return `${given} ${family}`.trim();
}

export function resolveGoogleAvatar(meta: any): string {
  if (!meta) return '';
  if (meta.avatar_url) return String(meta.avatar_url).trim();
  if (meta.picture) return String(meta.picture).trim();
  return '';
}
