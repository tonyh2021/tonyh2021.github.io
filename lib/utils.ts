/** Pure utilities — safe to import in both server and client components */

export function normalizeTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return [tags];
}
