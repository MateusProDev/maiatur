// Utilitário para remover campos undefined de objetos aninhados
export function deepSanitizeFirestoreData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepSanitizeFirestoreData);
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = typeof v === 'object' && v !== null ? deepSanitizeFirestoreData(v) : v;
    }
  }
  return clean;
}
