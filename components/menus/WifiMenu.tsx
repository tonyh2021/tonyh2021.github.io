'use client';

import { useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useStore } from '@/store';
import { useShallow } from 'zustand/shallow';

interface Props {
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function WifiMenu({ close, btnRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const wifi = useStore((s) => s.wifi);
  const toggleWIFI = useStore((s) => s.toggleWIFI);
  useClickOutside(ref, close, [btnRef]);

  return (
    <div ref={ref} className="fixed top-[33px] right-0 sm:right-1.5 z-10000 w-72 flex items-center justify-between px-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-gray-200/40 dark:border-gray-700/40 rounded-2xl shadow-2xl text-gray-900 dark:text-gray-100">
      <span className="font-medium text-sm">Wi-Fi</span>
      <label className="switch-toggle">
        <input type="checkbox" checked={wifi} onChange={toggleWIFI} />
        <span className="slider-toggle" />
      </label>
    </div>
  );
}
