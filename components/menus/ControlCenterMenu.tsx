"use client";

import Image from "next/image";
import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/store";
import { useDark } from "@/hooks/useDark";
import { useShallow } from "zustand/shallow";
import { music } from "@/configs/music";
import { isFullScreen } from "@/lib/screen";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface Props {
  playing: boolean;
  toggleAudio: () => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement | null>;
}

function IconBubble({
  active,
  activeColor,
  color,
  children,
}: {
  active: boolean;
  activeColor?: string;
  color?: string;
  children: React.ReactNode;
}) {
  const bubbleClass = active
    ? (activeColor ?? "bg-blue-500 text-white")
    : (color ?? "bg-white/75 text-gray-800 dark:bg-white/20 dark:text-white");

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
        bubbleClass,
      )}
    >
      {children}
    </div>
  );
}

interface CCButtonProps {
  onClick: () => void;
  className?: string;
  active: boolean;
  activeColor?: string;
  color?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const base =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left shadow-none transition-[opacity,transform] duration-150 active:scale-[0.98]";

const surface =
  "border-white/25 bg-white/55 backdrop-blur-sm hover:opacity-95 dark:border-white/8 dark:bg-white/[0.07] dark:backdrop-blur-md";

const focus =
  "focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-0 focus-visible:outline-none dark:focus-visible:ring-white/25";

function CCButton({
  onClick,
  className,
  active,
  activeColor,
  color,
  icon,
  title,
  subtitle,
}: CCButtonProps) {
  return (
    <button type="button" onClick={onClick} className={cn(base, surface, focus, className)}>
      <IconBubble active={active} activeColor={activeColor} color={color}>
        {icon}
      </IconBubble>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold">{title}</div>
        <div className="text-[10px] font-medium text-gray-600 dark:text-white/80">{subtitle}</div>
      </div>
    </button>
  );
}

interface CCTileProps {
  className?: string;
  children: React.ReactNode;
}

function CCTile({ className, children }: CCTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/25 bg-white/55 shadow-none backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.07] dark:backdrop-blur-md",
        "cursor-default",
        className,
      )}
    >
      {children}
    </div>
  );
}

function RangeSlider({
  leftIcon,
  rightIcon,
  value,
  onChange,
}: {
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <div className="shrink-0 text-gray-600 dark:text-white/50">{leftIcon}</div>
      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-300/70 accent-gray-800 dark:bg-white/20 dark:accent-white"
      />
      <div className="shrink-0 text-gray-600 dark:text-white/60">{rightIcon}</div>
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
    <div ref={ref} className="fixed top-[33px] right-0 z-10000">
      <div className="menu-box-surface flex w-80 flex-col gap-2.5 p-2.5">
        {/* Network */}
        <div className="grid grid-cols-2 gap-2.5">
          <CCButton
            onClick={toggleWIFI}
            active={wifi}
            icon={<WifiIcon />}
            title="Wi-Fi"
            subtitle={wifi ? "On" : "Off"}
          />
          <CCButton
            onClick={toggleBluetooth}
            active={bluetooth}
            icon={<BluetoothIcon />}
            title="Bluetooth"
            subtitle={bluetooth ? "On" : "Off"}
          />
        </div>

        {/* Dark/Light + Fullscreen */}
        <div className="grid grid-cols-2 gap-2.5">
          <CCButton
            onClick={toggleDark}
            active={dark}
            icon={dark ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            title={dark ? "Dark" : "Light"}
            subtitle={dark ? "Dark Mode" : "Light Mode"}
          />
          <CCButton
            onClick={() => toggleFullScreen(!isFullScreen())}
            active={fullscreen}
            icon={fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            title={fullscreen ? "Exit Full" : "Fullscreen"}
            subtitle={fullscreen ? "On" : "Off"}
          />
        </div>

        {/* Brightness */}
        <CCTile>
          <div className="px-3 pt-2.5 pb-0.5 text-xs font-semibold text-gray-800 dark:text-white/80">
            Display
          </div>
          <RangeSlider
            leftIcon={<BrightnessLowIcon size={12} />}
            rightIcon={<BrightnessHighIcon size={12} />}
            value={brightness}
            onChange={setBrightness}
          />
        </CCTile>

        {/* Volume */}
        <CCTile>
          <div className="px-3 pt-2.5 pb-0.5 text-xs font-semibold text-gray-800 dark:text-white/80">
            Sound
          </div>
          <RangeSlider
            leftIcon={<SpeakerXMarkIcon className="h-4 w-4" aria-hidden />}
            rightIcon={<SpeakerWaveIcon className="h-4 w-4" aria-hidden />}
            value={volume}
            onChange={setVolume}
          />
        </CCTile>

        {/* Now Playing */}
        <CCTile className="flex items-center gap-3 px-3 py-2.5">
          <Image
            src={music.cover}
            alt="cover"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{music.title}</div>
            <div className="truncate text-[11px] text-gray-600 dark:text-white/50">
              {music.artist}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-white/70">
            <button
              type="button"
              aria-label="Previous track"
              className="transition-colors hover:text-gray-950 disabled:opacity-40 dark:hover:text-white"
              disabled
            >
              <BackwardIcon className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={toggleAudio}
              aria-label={playing ? "Pause" : "Play"}
              className="transition-colors hover:text-gray-950 dark:hover:text-white"
            >
              {playing ? (
                <PauseIcon className="h-5 w-5" aria-hidden />
              ) : (
                <PlayIcon className="h-5 w-5" aria-hidden />
              )}
            </button>
            <button
              type="button"
              aria-label="Next track"
              className="transition-colors hover:text-gray-950 disabled:opacity-40 dark:hover:text-white"
              disabled
            >
              <ForwardIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </CCTile>
      </div>
    </div>
  );
}

/* ── Icons ── */
function WifiIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M1 9l2 2c5-5 13-5 18 0l2-2C16.5 2.5 7.5 2.5 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7 7 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
    </svg>
  );
}
function BluetoothIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
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

function BrightnessHighIcon({ size = 14 }: { size?: number }) {
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
      <line x1="12" y1="1" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="1" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  );
}

function BrightnessLowIcon({ size = 14 }: { size?: number }) {
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
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="3" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="5.5" y1="5.5" x2="6.8" y2="6.8" />
      <line x1="17.2" y1="17.2" x2="18.5" y2="18.5" />
      <line x1="5.5" y1="18.5" x2="6.8" y2="17.2" />
      <line x1="17.2" y1="6.8" x2="18.5" y2="5.5" />
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
