"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

function toSrc(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/${path}`;
}

/**
 * Full-viewport wallpaper as a real `<img>` (via `next/image`) so the browser can
 * treat it as an LCP candidate with `fetchPriority="high"` when `priority` is set.
 * CSS `background-image` on a div is often not counted as LCP.
 */
export function WallpaperLayer({
  image,
  priority = false,
  className = "",
}: {
  image: string | null;
  /** Pass `true` for the route’s main hero wallpaper (one per view). */
  priority?: boolean;
  className?: string;
}) {
  const src = toSrc(image);
  if (!src) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0", className)} aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority={priority}
        draggable={false}
      />
    </div>
  );
}
