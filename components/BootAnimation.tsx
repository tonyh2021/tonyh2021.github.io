"use client";

import { useState, useEffect, useRef } from "react";
import { useInterval } from "@/hooks/useInterval";
import { useMobile } from "@/hooks/useMobile";

const BOOT_TICK_MS = 10;
const BOOT_STEP_DESKTOP = 0.3;
const BOOT_STEP_MOBILE = 2.0;

export default function BootAnimation({ onComplete }: { onComplete: () => void }) {
  const isMobile = useMobile();
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(false);
  const didFinishRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useInterval(() => {
    if (didFinishRef.current) return;
    const step = isMobile ? BOOT_STEP_MOBILE : BOOT_STEP_DESKTOP;
    setPercent((prev) => {
      if (didFinishRef.current) return prev;
      const next = prev + step;
      if (next >= 100) {
        didFinishRef.current = true;
        setVisible(false);
        return 100;
      }
      return next;
    });
  }, BOOT_TICK_MS);

  return (
    <div className="flex h-screen w-screen cursor-default flex-col items-center justify-center bg-black select-none">
      <svg
        viewBox="0 0 814 1000"
        width="80"
        height="80"
        fill="white"
        className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        onTransitionEnd={() => { if (didFinishRef.current) onComplete(); }}
      >
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.5 0 663 0 541.8c0-207.5 135.4-317.5 269-317.5 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49.1 185.5-49.1 29.4 0 108.2 2.6 168.6 81.3zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
      </svg>
      <div
        className={`mt-14 h-1.5 w-56 overflow-hidden rounded-full bg-gray-700 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="h-full rounded-full bg-white transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
