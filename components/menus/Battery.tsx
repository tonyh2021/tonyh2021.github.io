"use client";

import { useBattery } from "@/hooks/useBattery";

export default function Battery() {
  const bat = useBattery();
  const pct = Math.round(bat.level * 100);

  const fillColor = bat.charging
    ? "bg-green-400"
    : pct < 20
      ? "bg-red-500"
      : pct < 50
        ? "bg-yellow-400"
        : "bg-white";

  const fillWidth = 0.2 + bat.level * 0.96; // rem

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs tabular-nums">{pct}%</span>
      {/* Battery outline */}
      <div className="relative flex items-center">
        <svg viewBox="0 0 24 12" width="26" height="13" fill="currentColor">
          {/* body */}
          <rect
            x="0"
            y="1"
            width="21"
            height="10"
            rx="2"
            ry="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* terminal nub */}
          <rect x="21.5" y="3.5" width="2" height="5" rx="1" ry="1" />
        </svg>
        {/* fill */}
        <div
          className={`absolute top-[3px] bottom-[3px] left-[2px] rounded-[1px] ${fillColor}`}
          style={{ width: `${fillWidth}rem` }}
        />
        {/* lightning bolt when charging */}
        {bat.charging && (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black/70">
            ⚡
          </span>
        )}
      </div>
    </div>
  );
}
