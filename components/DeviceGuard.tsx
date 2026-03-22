"use client";

import { useLayoutEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MOBILE_BREAKPOINT_PX } from "@/hooks/useMobile";

function getRedirectTarget(pathname: string, isMobile: boolean): string | null {
  if (isMobile && pathname.startsWith("/desk")) {
    return "/mobile";
  }
  if (!isMobile && pathname.startsWith("/mobile")) {
    const postMatch = pathname.match(/^\/mobile\/posts\/([^/]+)/);
    if (postMatch) return `/desk?post=${postMatch[1]}`;
    return "/desk";
  }
  return null;
}

/** Redirects users to the correct platform (mobile/desktop) based on screen width. */
export default function DeviceGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
    const target = getRedirectTarget(pathname, isMobile);
    if (target) router.replace(target);
  }, [pathname, router]);

  return null;
}
