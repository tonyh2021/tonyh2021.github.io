"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { useStore } from "@/store";
import { useDark } from "@/hooks/useDark";
import { useWallpaper } from "@/hooks/useWallpaper";
import { WallpaperLayer } from "@/components/WallpaperLayer";

/** System alert warning icon */
function WarningGlyph() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" className="shrink-0" aria-hidden>
      <path
        d="M28 6 L50 46 H6 Z"
        fill="#FFCC00"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <path d="M28 18 v14" stroke="white" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={28} cy={38} r={2.75} fill="white" />
    </svg>
  );
}

export function Macos404Alert() {
  const router = useRouter();
  const pathname = usePathname();
  const brightness = useStore((s) => s.brightness);
  const dark = useDark();
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setVideoReady(false);
  }, [video]);

  // 404 skips MacOSApp `initDark` — keep store in sync with `<html class="dark">`.
  useLayoutEffect(() => {
    const sync = () => {
      useStore.setState({
        dark: document.documentElement.classList.contains("dark"),
      });
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const pathLine =
    pathname && pathname !== "/"
      ? `Requested: ${pathname}`
      : "The server returned a 404 status for this request.";

  const shellStyle = {
    filter: `brightness(${brightness * 0.7 + 50}%)`,
  } as const;

  const uiFont = "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" as const;

  return (
    <div
      className="relative min-h-dvh w-full overflow-hidden font-sans antialiased"
      style={shellStyle}
      data-appearance={dark ? "dark" : "light"}
    >
      <WallpaperLayer image={image} priority />
      {video && (
        <video
          key={video}
          src={video.startsWith("/") ? video : `/${video}`}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setVideoReady(true)}
          className={`pointer-events-none absolute inset-0 z-1 h-full w-full object-cover transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
        />
      )}

      <div
        className="absolute inset-0 z-10 flex items-center justify-center p-6 text-white"
        style={{ fontFamily: uiFont }}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="macos-404-title"
          aria-describedby="macos-404-desc"
          className="w-full max-w-[460px] overflow-hidden rounded-[11px] border border-white/8 bg-[#323232] shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
        >
          <div className="h-7 border-b border-white/6 bg-[#383838]" />

          <div className="flex gap-4 px-5 pt-4 pb-2 sm:gap-5 sm:px-6 sm:pt-5">
            <WarningGlyph />
            <div className="min-w-0 flex-1 pt-0.5">
              <h1
                id="macos-404-title"
                className="text-[15px] leading-snug font-semibold tracking-tight text-white"
              >
                This page can&apos;t be found.
              </h1>
              <p id="macos-404-desc" className="mt-2 text-[13px] leading-relaxed text-white/92">
                The file or route you opened isn&apos;t on this site. It may have been moved,
                renamed, or the link may be incorrect.
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-white/45">
                <span className="font-medium text-white/55">404 — Not Found.</span> {pathLine}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/6 bg-[#2e2e2e] px-4 py-3 sm:px-5">
            <button
              type="button"
              title="Help"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#4a4a4a] text-[13px] font-medium text-white/90 shadow-sm transition-colors hover:bg-[#555555] active:bg-[#404040]"
              onClick={() =>
                window.open(
                  "https://github.com/tonyh2021/tonyh2021",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              ?
            </button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-white/6 bg-[#4a4a4a] px-3.5 py-1 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#555555] active:bg-[#3d3d3d]"
              >
                Back
              </button>
              <Link
                href="/"
                className="rounded-md border border-white/8 bg-[#6b6b6b] px-3.5 py-1 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#787878] active:bg-[#5c5c5c]"
              >
                Go to Desktop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
