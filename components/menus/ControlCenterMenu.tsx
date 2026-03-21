"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/store";
import { useDark } from "@/hooks/useDark";
import { useShallow } from "zustand/shallow";
import { music } from "@/configs/music";
import { isFullScreen } from "@/lib/screen";

interface Props {
  playing: boolean;
  toggleAudio: () => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement | null>;
}

function Tile({
  onClick,
  className = "",
  children,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-default rounded-xl border border-black/5 bg-white/22 shadow-none backdrop-blur-md dark:border-white/8 dark:bg-white/[0.07] dark:backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

function IconBubble({
  active,
  color = "bg-blue-500 text-white",
  children,
}: {
  active: boolean;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
        active ? color : "bg-gray-200/90 text-gray-700 dark:bg-white/20 dark:text-white"
      }`}
    >
      {children}
    </div>
  );
}

function RangeSlider({
  icon,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <div className="shrink-0 text-gray-600 dark:text-white/50">{icon}</div>
      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gray-300 accent-gray-900 dark:bg-white/20 dark:accent-white"
      />
      <div className="shrink-0 text-gray-600 dark:text-white/60">{icon}</div>
    </div>
  );
}

export default function ControlCenterMenu({
  playing,
  toggleAudio,
  setVolume,
  setBrightness,
  close,
  btnRef,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, close, [btnRef]);

  const dark = useDark();
  const { wifi, bluetooth, brightness, volume, fullscreen } = useStore(
    useShallow((s) => ({
      wifi: s.wifi,
      bluetooth: s.bluetooth,
      brightness: s.brightness,
      volume: s.volume,
      fullscreen: s.fullscreen,
    })),
  );
  const toggleDark = useStore((s) => s.toggleDark);
  const toggleWIFI = useStore((s) => s.toggleWIFI);
  const toggleBluetooth = useStore((s) => s.toggleBluetooth);
  const toggleFullScreen = useStore((s) => s.toggleFullScreen);

  return (
    <div ref={ref} className="fixed top-[33px] right-0 z-10000 sm:right-1.5">
      <div className="menu-box-surface flex w-72 flex-col gap-1.5 p-2">
        {/* Network */}
        <div className="grid grid-cols-2 gap-1.5">
          <Tile onClick={toggleWIFI} className="flex items-center gap-2.5 p-3">
            <IconBubble active={wifi}>
              <WifiIcon />
            </IconBubble>
            <div>
              <div className="text-sm leading-4 font-semibold">Wi-Fi</div>
              <div className="text-[11px] text-gray-600 dark:text-white/50">
                {wifi ? "Home" : "Off"}
              </div>
            </div>
          </Tile>
          <Tile onClick={toggleBluetooth} className="flex items-center gap-2.5 p-3">
            <IconBubble active={bluetooth}>
              <BluetoothIcon />
            </IconBubble>
            <div>
              <div className="text-sm leading-4 font-semibold">Bluetooth</div>
              <div className="text-[11px] text-gray-600 dark:text-white/50">
                {bluetooth ? "On" : "Off"}
              </div>
            </div>
          </Tile>
        </div>

        {/* Dark/Light + Fullscreen */}
        <div className="grid grid-cols-2 gap-1.5">
          <Tile onClick={toggleDark} className="flex items-center gap-2.5 p-3">
            <IconBubble
              active={dark}
              color={dark ? "bg-gray-600 text-white" : "bg-amber-400 text-gray-900"}
            >
              {dark ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </IconBubble>
            <div>
              <div className="text-sm leading-4 font-semibold">{dark ? "Dark" : "Light"}</div>
              <div className="text-[11px] text-gray-600 dark:text-white/50">
                {dark ? "Dark Mode" : "Light Mode"}
              </div>
            </div>
          </Tile>
          <Tile
            onClick={() => toggleFullScreen(!isFullScreen())}
            className="flex cursor-pointer items-center gap-2.5 p-3"
          >
            <IconBubble active={fullscreen} color="bg-gray-500 text-white">
              {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </IconBubble>
            <div>
              <div className="text-sm leading-4 font-semibold">
                {fullscreen ? "Exit Full" : "Fullscreen"}
              </div>
              <div className="text-[11px] text-gray-600 dark:text-white/50">
                {fullscreen ? "On" : "Off"}
              </div>
            </div>
          </Tile>
        </div>

        {/* Brightness */}
        <Tile>
          <div className="px-3 pt-2.5 pb-0.5 text-xs font-semibold text-gray-800 dark:text-white/80">
            Display
          </div>
          <RangeSlider
            icon={<BrightnessIcon size={12} />}
            value={brightness}
            onChange={setBrightness}
          />
        </Tile>

        {/* Volume */}
        <Tile>
          <div className="px-3 pt-2.5 pb-0.5 text-xs font-semibold text-gray-800 dark:text-white/80">
            Sound
          </div>
          <RangeSlider icon={<VolumeIcon size={12} />} value={volume} onChange={setVolume} />
        </Tile>

        {/* Now Playing */}
        <Tile className="flex items-center gap-3 px-3 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={music.cover}
            alt="cover"
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{music.title}</div>
            <div className="truncate text-[11px] text-gray-600 dark:text-white/50">
              {music.artist}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-white/70">
            <button className="transition-colors hover:text-gray-950 dark:hover:text-white">
              ⏮
            </button>
            <button
              onClick={toggleAudio}
              className="text-lg transition-colors hover:text-gray-950 dark:hover:text-white"
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button className="transition-colors hover:text-gray-950 dark:hover:text-white">
              ⏭
            </button>
          </div>
        </Tile>
      </div>
    </div>
  );
}

/* ── Icons ── */
function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M1 9l2 2c5-5 13-5 18 0l2-2C16.5 2.5 7.5 2.5 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7 7 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
    </svg>
  );
}
function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
    </svg>
  );
}
function MoonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function BrightnessIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}
function VolumeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  );
}
function FullscreenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}
function ExitFullscreenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  );
}
