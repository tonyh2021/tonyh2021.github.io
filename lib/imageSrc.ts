/** Normalize public asset paths (`images/...`) for `next/image`; keep http(s) URLs as-is. */
export function resolveImageSrc(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
}
