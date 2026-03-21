"use client";

import { useState, useLayoutEffect } from "react";

export function useMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
