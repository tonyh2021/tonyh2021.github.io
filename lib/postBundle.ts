import type { PostIndex, PostIndexBundle } from "./types";

export type Locale = "zh" | "en";

/** Prefer `locale` list; fall back to zh when empty (e.g. no `_en` posts yet). */
export function resolvePostIndices(bundle: PostIndexBundle, locale: Locale): PostIndex[] {
  const primary = bundle[locale];
  return primary.length > 0 ? primary : bundle.zh;
}
