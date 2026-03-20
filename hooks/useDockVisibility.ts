"use client";

import { useEffect, useRef, useState } from "react";

interface UseDockVisibilityOptions {
  container?: HTMLElement | null;
  threshold?: number;
  isMobile?: boolean;
}

export function useDockVisibility({
  container = null,
  threshold = 15,
  isMobile = true,
}: UseDockVisibilityOptions = {}) {
  const [dockVisible, setDockVisible] = useState(true);
  const touchStartY = useRef(0);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!isMobile) return;

    const target: Window | HTMLElement = container ?? window;

    const onTouchStart: EventListener = (e) => {
      const evt = e as TouchEvent;
      touchStartY.current = evt.touches[0]?.clientY ?? 0;
    };

    const onTouchMove: EventListener = (e) => {
      const evt = e as TouchEvent;
      const diff = touchStartY.current - (evt.touches[0]?.clientY ?? 0);
      if (!ticking.current) {
        requestAnimationFrame(() => {
          if (diff > threshold) setDockVisible(false);
          else if (diff < -threshold) setDockVisible(true);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    const onScroll: EventListener = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY =
            target instanceof Window ? window.scrollY : target.scrollTop;
          const diff = currentY - lastScrollY.current;

          if (diff > threshold) setDockVisible(false);
          else if (diff < -threshold) setDockVisible(true);

          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: true });
    target.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("scroll", onScroll);
    };
  }, [container, threshold, isMobile]);

  return dockVisible;
}

