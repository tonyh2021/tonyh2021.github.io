"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function toSrc(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/${path}`;
}

/**
 * Full-viewport wallpaper as a real `<img>` (via `next/image`) so the browser can
 * treat it as an LCP candidate with `fetchPriority="high"` when `priority` is set.
 * CSS `background-image` on a div is often not counted as LCP.
 *
 * When the image src changes, the incoming image crossfades over the outgoing one
 * so dark/light wallpaper switches are smooth rather than a hard cut.
 */
export function WallpaperLayer({
  image,
  priority = false,
  className = "",
}: {
  image: string | null;
  priority?: boolean;
  className?: string;
}) {
  const src = toSrc(image);

  // bottom: currently visible image; top: incoming image fading in
  const [bottom, setBottom] = useState<string | null>(src);
  const [top, setTop] = useState<string | null>(null);
  const [topVisible, setTopVisible] = useState(false);

  useEffect(() => {
    if (!src || src === bottom) return;
    setTop(src);
    setTopVisible(false);
    // Two rAF ticks so the browser registers opacity:0 before transitioning to 1
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setTopVisible(true)),
    );
    return () => cancelAnimationFrame(raf);
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTransitionEnd = () => {
    if (topVisible && top) {
      setBottom(top);
      setTop(null);
      setTopVisible(false);
    }
  };

  if (!bottom && !top) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0", className)} aria-hidden>
      {bottom && (
        <Image
          src={bottom}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={priority}
          draggable={false}
        />
      )}
      {top && (
        <Image
          src={top}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-700 ${topVisible ? "opacity-100" : "opacity-0"}`}
          priority={false}
          draggable={false}
          onTransitionEnd={handleTransitionEnd}
        />
      )}
    </div>
  );
}
