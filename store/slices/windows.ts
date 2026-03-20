import type { StateCreator } from 'zustand';

export interface WinState {
  open: boolean;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface WindowsSlice {
  wins: Record<string, WinState>;
  maxZ: number;
  currentApp: string;
  openWin: (id: string) => void;
  closeWin: (id: string) => void;
  minimizeWin: (id: string) => void;
  toggleMaxWin: (id: string, target?: boolean) => void;
  focusWin: (id: string) => void;
  initWins: (ids: string[]) => void;
}

export const createWindowsSlice: StateCreator<WindowsSlice> = (set) => ({
  wins: {},
  maxZ: 2,
  currentApp: 'blog',
  openWin: (id) =>
    set((state) => {
      const newZ = state.maxZ + 1;
      return {
        wins: {
          ...state.wins,
          [id]: { ...(state.wins[id] || {}), open: true, minimized: false, z: newZ },
        },
        maxZ: newZ,
        currentApp: id,
      };
    }),
  closeWin: (id) =>
    set((state) => ({
      wins: {
        ...state.wins,
        [id]: { ...state.wins[id], open: false, minimized: false, maximized: false },
      },
    })),
  minimizeWin: (id) =>
    set((state) => ({
      wins: {
        ...state.wins,
        [id]: { ...state.wins[id], minimized: true },
      },
    })),
  toggleMaxWin: (id, target) =>
    set((state) => {
      const cur = state.wins[id]?.maximized ?? false;
      return {
        wins: {
          ...state.wins,
          [id]: { ...state.wins[id], maximized: target !== undefined ? target : !cur },
        },
      };
    }),
  focusWin: (id) =>
    set((state) => {
      const newZ = state.maxZ + 1;
      return {
        wins: {
          ...state.wins,
          [id]: { ...state.wins[id], z: newZ },
        },
        maxZ: newZ,
        currentApp: id,
      };
    }),
  initWins: (ids) =>
    set(() => ({
      wins: Object.fromEntries(
        ids.map((id) => [id, { open: false, z: 2, minimized: false, maximized: false }])
      ),
    })),
});
