"use client";

import { useStore } from "@/store";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: "sm" | "md";
}

export default function LocaleSwitcher({ className, size = "sm" }: Props) {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);

  const pressed = locale === "zh";
  const iconPx = size === "md" ? 20 : 16;
  const sizing =
    size === "md" ? "rounded-full p-2 backdrop-blur" : "rounded-md p-1";
  // md variant mirrors the mobile theme/menu button palette exactly.
  const resting =
    size === "md"
      ? "text-gray-400 hover:bg-gray-100/80 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800/80 dark:hover:text-gray-300"
      : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-200";

  return (
    <button
      type="button"
      onClick={() => setLocale(pressed ? "en" : "zh")}
      aria-pressed={pressed}
      aria-label={
        pressed ? "Switch language to English" : "Switch language to Chinese"
      }
      className={cn(
        sizing,
        "inline-flex items-center justify-center transition-colors",
        pressed
          ? "text-[#007AFF] hover:bg-[#007AFF]/10 dark:text-[#0A84FF] dark:hover:bg-[#0A84FF]/15"
          : resting,
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconPx}
        height={iconPx}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    </button>
  );
}
