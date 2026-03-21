"use client";

import { useRef, useEffect } from "react";

export function useInterval(callback: () => void, delay?: number | null) {
  const saved = useRef<() => void>(() => {});
  useEffect(() => {
    saved.current = callback;
  });
  useEffect(() => {
    if (delay !== null && delay !== undefined) {
      const id = setInterval(() => saved.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
