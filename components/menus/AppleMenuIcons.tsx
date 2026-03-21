import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  CogIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  MoonIcon,
  NoSymbolIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";

/** Shared sizing + thicker strokes (outline default is 1.5). */
const cls = "h-3.5 w-3.5 shrink-0";
const stroke = { strokeWidth: 2, className: cls, "aria-hidden": true as const };

export function AboutMacIcon() {
  return <ComputerDesktopIcon {...stroke} />;
}

export function SystemPreferencesIcon() {
  return <CogIcon {...stroke} />;
}

export function AppStoreIcon() {
  return <BuildingStorefrontIcon {...stroke} />;
}

export function RecentItemsIcon() {
  return <ClockIcon {...stroke} />;
}

export function ForceQuitIcon() {
  return <NoSymbolIcon {...stroke} />;
}

export function SleepIcon() {
  return <MoonIcon {...stroke} />;
}

export function RestartIcon() {
  return <ArrowPathIcon {...stroke} />;
}

export function ShutDownIcon() {
  return <PowerIcon {...stroke} />;
}

export function LockScreenIcon() {
  return <LockClosedIcon {...stroke} />;
}

export function LogOutIcon() {
  return <ArrowRightStartOnRectangleIcon {...stroke} />;
}
