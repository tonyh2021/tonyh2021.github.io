import type { StateCreator } from "zustand";
import { enterFullScreen, exitFullScreen } from "@/lib/screen";

export interface SystemSlice {
  dark: boolean;
  brightness: number;
  volume: number;
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  fullscreen: boolean;
  login: boolean;
  booting: boolean;
  sleeping: boolean;
  restarting: boolean;
  toggleDark: () => void;
  initDark: () => void;
  setBrightness: (v: number) => void;
  setVolume: (v: number) => void;
  toggleWIFI: () => void;
  toggleBluetooth: () => void;
  toggleAirdrop: () => void;
  toggleFullScreen: (v: boolean) => void;
  setLogin: (v: boolean) => void;
  setBooting: (v: boolean) => void;
  shutdown: () => void;
  sleep: () => void;
  restart: () => void;
}

export const createSystemSlice: StateCreator<SystemSlice> = (set) => ({
  dark: false,
  brightness: 80,
  volume: 80,
  wifi: true,
  bluetooth: true,
  airdrop: true,
  fullscreen: false,
  login: false,
  booting: true,
  sleeping: false,
  restarting: true,
  setLogin: (v) => set({ login: v }),
  setBooting: (v) => set({ booting: v }),
  shutdown: () =>
    set({ restarting: false, sleeping: false, login: false, booting: true }),
  sleep: () =>
    set({ restarting: false, sleeping: true, login: false, booting: true }),
  restart: () =>
    set({ restarting: true, sleeping: false, login: false, booting: true }),
  toggleDark: () =>
    set((state) => {
      if (typeof document !== "undefined") {
        if (!state.dark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
      return { dark: !state.dark };
    }),
  initDark: () =>
    set(() => {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (typeof document !== "undefined") {
        if (prefersDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
      return { dark: prefersDark };
    }),
  setBrightness: (v) => set({ brightness: v }),
  setVolume: (v) => set({ volume: v }),
  toggleWIFI: () => set((s) => ({ wifi: !s.wifi })),
  toggleBluetooth: () => set((s) => ({ bluetooth: !s.bluetooth })),
  toggleAirdrop: () => set((s) => ({ airdrop: !s.airdrop })),
  toggleFullScreen: (v) =>
    set(() => {
      if (typeof document !== "undefined") {
        v ? enterFullScreen() : exitFullScreen();
      }
      return { fullscreen: v };
    }),
});
