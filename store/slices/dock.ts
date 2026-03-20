import type { StateCreator } from 'zustand';

export interface DockSlice {
  dockSize: number;
  dockMag: number;
}

export const createDockSlice: StateCreator<DockSlice> = () => ({
  dockSize: 48,
  dockMag: 1.8,
});
