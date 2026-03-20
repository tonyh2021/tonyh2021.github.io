import { create } from 'zustand';
import { createSystemSlice, type SystemSlice } from './slices/system';
import { createWindowsSlice, type WindowsSlice } from './slices/windows';
import { createDockSlice, type DockSlice } from './slices/dock';

type Store = SystemSlice & WindowsSlice & DockSlice;

export const useStore = create<Store>()((...a) => ({
  ...createSystemSlice(...a),
  ...createWindowsSlice(...a),
  ...createDockSlice(...a),
}));
