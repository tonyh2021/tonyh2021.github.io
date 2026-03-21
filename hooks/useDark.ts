"use client";

import { useStore } from "@/store";

/**
 * Global desktop light/dark appearance (`system.dark` in Zustand).
 * Kept in sync with the `dark` class on `document.documentElement` via
 * `initDark` / `toggleDark` in the system slice.
 *
 * Use this instead of scattering `useStore((s) => s.dark))` in UI components.
 */
export function useDark(): boolean {
  return useStore((s) => s.dark);
}
