"use client";

import { useState, useLayoutEffect } from "react";

/** Same breakpoint as Tailwind `sm` (must stay in sync with `useWallpaper` video gating). */
export const MOBILE_BREAKPOINT_PX = 768;

export function useMobile(breakpoint = MOBILE_BREAKPOINT_PX): boolean {
  /** Must match SSR (`false`) to avoid hydration mismatch; real value after layout. */
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
