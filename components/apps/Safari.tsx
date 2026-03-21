"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveImageSrc } from "@/lib/imageSrc";
import { useStore } from "@/store";
import { useDark } from "@/hooks/useDark";
import { websites, type SiteSection } from "@/configs/websites";
import { useMobile } from "@/hooks/useMobile";

const numTrackers = Math.floor(Math.random() * 99 + 1);

function isValidURL(url: string) {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

function resolveURL(input: string): string {
  if (input === "") return "";
  if (isValidURL(input)) {
    return input.startsWith("http") ? input : `https://${input}`;
  }
  return `https://www.bing.com/search?q=${encodeURIComponent(input)}`;
}

/* ── Favorites grid ─────────────────────────────────── */
function NavSection({
  section,
  onNavigate,
}: {
  section: SiteSection;
  onNavigate: (url: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8">
      <div className="mb-3 ml-2 text-xl font-medium sm:text-2xl">{section.title}</div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(4.5rem, 1fr))" }}
      >
        {section.sites.map((site) => (
          <div
            key={site.id}
            className="flex h-28 cursor-pointer flex-col items-center"
            onClick={() => onNavigate(site.link)}
          >
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              {site.img ? (
                <Image
                  src={resolveImageSrc(site.img)}
                  alt={site.title}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <span className="px-1 text-center text-sm font-medium text-gray-700">
                  {site.title}
                </span>
              )}
            </div>
            <span className="mt-2 line-clamp-1 w-full px-1 text-center text-xs text-gray-700 dark:text-gray-300">
              {site.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── New-tab homepage ───────────────────────────────── */
function HomePage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const dark = useDark();
  return (
    <div
      className="h-full w-full overflow-y-auto overscroll-none text-gray-900 dark:text-gray-100"
      style={{
        background: dark
          ? "linear-gradient(150deg,#090915 0%,#10102e 35%,#0b1c3d 65%,#160b28 100%)"
          : "linear-gradient(150deg,#1a6b9a 0%,#5185b5 20%,#7b6aad 45%,#be6d8f 70%,#e3946a 100%)",
      }}
    >
      <div className="min-h-full w-full bg-white/80 pt-6 pb-16 backdrop-blur-2xl dark:bg-gray-900/80">
        <NavSection section={websites.favorites} onNavigate={onNavigate} />
        <NavSection section={websites.freq} onNavigate={onNavigate} />

        {/* Privacy report */}
        <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-8">
          <div className="mb-3 ml-2 text-xl font-medium sm:text-2xl">Privacy Report</div>
          <div className="flex h-16 w-full items-center gap-4 rounded-xl bg-gray-50/70 px-4 shadow-md dark:bg-gray-700/50">
            <div className="flex items-center gap-2 text-xl font-bold">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
                className="text-blue-500"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <span>{numTrackers}</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              In the last seven days, Safari has prevented {numTrackers} trackers from profiling
              you.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── No-internet page ───────────────────────────────── */
function NoInternetPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-center text-gray-600 dark:text-gray-400">
        <div className="mb-2 text-2xl font-bold">Not Connected to the Internet</div>
        <div className="text-sm">
          This page can&apos;t be displayed because your computer is currently offline.
        </div>
      </div>
    </div>
  );
}

/* ── Main Safari component ──────────────────────────── */
export default function Safari({ width = 900 }: { width?: number }) {
  const wifi = useStore((s) => s.wifi);
  const [inputURL, setInputURL] = useState("");
  const [activeURL, setActiveURL] = useState("");

  const navigate = (url: string) => {
    const resolved = resolveURL(url);
    window.open(resolved, "_blank");
  };

  const goBack = () => {
    setInputURL("");
    setActiveURL("");
  };

  const isMobile = useMobile();
  const canGoBack = activeURL !== "";
  const hideRight = width < 500;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Browser toolbar */}
      {isMobile ? (
        /* Mobile: full-width flex bar, larger touch targets */
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 dark:border-gray-700 dark:bg-gray-800">
          {canGoBack && (
            <button
              onClick={goBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-blue-500 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
              </svg>
            </button>
          )}
          <div className="flex h-8 flex-1 items-center gap-1.5 rounded-xl bg-gray-200/80 px-3 dark:bg-gray-700/80">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="currentColor"
              className="shrink-0 text-gray-400"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <input
              type="text"
              value={inputURL}
              onChange={(e) => setInputURL(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate(inputURL)}
              placeholder="Search or enter website name"
              className="flex-1 bg-transparent text-center text-sm text-gray-600 placeholder-gray-400 outline-none dark:text-gray-300"
            />
          </div>
        </div>
      ) : (
        /* Desktop: 3-column grid */
        <div
          className="h-10 shrink-0 border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${hideRight ? 2 : 3}, minmax(0,1fr))`,
            alignItems: "center",
          }}
        >
          <div className="flex items-center gap-1 px-2">
            <button
              onClick={goBack}
              disabled={!canGoBack}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${canGoBack ? "text-gray-700 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"}`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
              </svg>
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded text-gray-300 dark:text-gray-600">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <input
              type="text"
              value={inputURL}
              onChange={(e) => setInputURL(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate(inputURL)}
              placeholder="Search or enter website name"
              className="h-6 flex-1 rounded border-2 border-transparent bg-gray-200/70 px-2 text-center text-sm text-gray-600 outline-none focus:border-blue-400 dark:bg-gray-700/70 dark:text-gray-400"
            />
          </div>

          {!hideRight && (
            <div className="flex items-center justify-end gap-1 px-2">
              <button
                onClick={() => activeURL && window.open(activeURL, "_blank")}
                disabled={!canGoBack}
                title="Open in new tab"
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${canGoBack ? "text-gray-600 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Browser content */}
      <div className="flex-1 overflow-hidden">
        {!wifi ? (
          <NoInternetPage />
        ) : activeURL === "" ? (
          <HomePage onNavigate={navigate} />
        ) : (
          <iframe
            src={activeURL}
            title="Safari"
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}
