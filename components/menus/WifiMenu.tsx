"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/store";

interface Props {
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement | null>;
}

export default function WifiMenu({ close, btnRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const wifi = useStore((s) => s.wifi);
  const toggleWIFI = useStore((s) => s.toggleWIFI);
  useClickOutside(ref, close, [btnRef]);

  return (
    <div
      ref={ref}
      className="fixed top-[33px] right-0 z-10000 flex w-72 items-center justify-between rounded-2xl border border-gray-200/40 bg-gray-100/80 px-4 py-2.5 text-gray-900 shadow-2xl backdrop-blur-2xl sm:right-1.5 dark:border-gray-700/40 dark:bg-gray-800/80 dark:text-gray-100"
    >
      <span className="text-sm font-medium">Wi-Fi</span>
      <label className="switch-toggle">
        <input type="checkbox" checked={wifi} onChange={toggleWIFI} />
        <span className="slider-toggle" />
      </label>
    </div>
  );
}
