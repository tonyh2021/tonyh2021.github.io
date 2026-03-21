"use client";

import { useRef, useEffect } from "react";

const defaultEvents = ["mousedown", "touchstart"];

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: (event: Event) => void,
  excludeRefs: React.RefObject<HTMLElement | null>[] = [],
  events: string[] = defaultEvents,
) {
  const savedCallback = useRef(onClickOutside);

  useEffect(() => {
    savedCallback.current = onClickOutside;
  }, [onClickOutside]);

  useEffect(() => {
    const handler = (event: Event) => {
      for (const excludeRef of excludeRefs) {
        const el = excludeRef.current;
        if (el && el.contains(event.target as Node)) return;
      }
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      savedCallback.current(event);
    };
    for (const name of events) document.addEventListener(name, handler);
    return () => {
      for (const name of events) document.removeEventListener(name, handler);
    };
  }, [events, ref, excludeRefs]);
}
