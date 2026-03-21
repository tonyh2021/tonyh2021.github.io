"use client";

import { useState, useLayoutEffect } from "react";

export function useMobile(breakpoint = 768): boolean {
  /** Avoid first paint as "desktop" on phones (reduces wrong branch + extra chunk loads). */
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
