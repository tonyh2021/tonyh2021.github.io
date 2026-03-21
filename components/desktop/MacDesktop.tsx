"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import { appConfigs, ALL_WIN_IDS, type AppId } from "@/configs/apps";
import { useWallpaper } from "@/hooks/useWallpaper";
import { useMobile } from "@/hooks/useMobile";
import { WallpaperLayer } from "@/components/WallpaperLayer";
import TopBar from "./TopBar";
import Dock from "./Dock";
import AppWindow from "./AppWindow";

/** Top bar height — mirrors minMarginY in playground-macos */
const TOP_BAR_H = 32;

function WindowAppLoading({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-white/40">
      {label}…
    </div>
  );
}

/** Per-app code-splitting to trim first-load JS; Blog/Tags read index from PostIndexContext. */
const PostApp = dynamic(() => import("@/components/apps/PostApp"), {
  ssr: false,
  loading: () => <WindowAppLoading label="Blog" />,
});
const AboutApp = dynamic(() => import("@/components/apps/AboutApp"), {
  ssr: false,
  loading: () => <WindowAppLoading label="About" />,
});
const TagsApp = dynamic(() => import("@/components/apps/TagsApp"), {
  ssr: false,
  loading: () => <WindowAppLoading label="Tags" />,
});
const Safari = dynamic(() => import("@/components/apps/Safari"), {
  ssr: false,
  loading: () => <WindowAppLoading label="Safari" />,
});
const VSCode = dynamic(() => import("@/components/apps/VSCode"), {
  ssr: false,
  loading: () => <WindowAppLoading label="VS Code" />,
});
const Terminal = dynamic(() => import("@/components/apps/Terminal"), {
  ssr: false,
  loading: () => <WindowAppLoading label="Terminal" />,
});

const Launchpad = dynamic(() => import("@/components/Launchpad"), { ssr: false });
const Spotlight = dynamic(() => import("@/components/Spotlight"), { ssr: false });

export default function MacDesktop() {
  const { wins, currentApp, brightness } = useStore(
    useShallow((s) => ({
      wins: s.wins,
      currentApp: s.currentApp,
      brightness: s.brightness,
    })),
  );
  const isMobile = useMobile();
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);
  const prevVideoRef = useRef<string | null>(null);
  if (video !== prevVideoRef.current) {
    prevVideoRef.current = video;
    setVideoReady(false);
  }
  const currentAppTitle = useMemo(
    () => appConfigs.find((a) => a.id === currentApp)?.title ?? currentApp,
    [currentApp],
  );
  const openWin = useStore((s) => s.openWin);
  const closeWin = useStore((s) => s.closeWin);
  const minimizeWin = useStore((s) => s.minimizeWin);
  const toggleMaxWin = useStore((s) => s.toggleMaxWin);
  const focusWin = useStore((s) => s.focusWin);
  const initWins = useStore((s) => s.initWins);
  const setBlogCurrentSlug = useStore((s) => s.setBlogCurrentSlug);
  const [mounted, setMounted] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  /** Keep Launchpad mounted after first open so close opacity transition can finish. */
  const [launchpadMounted, setLaunchpadMounted] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightBtnRef, setSpotlightBtnRef] =
    useState<React.RefObject<HTMLDivElement | null> | null>(null);

  const anyMaximized = Object.values(wins).some((w) => w?.open && w.maximized);

  useEffect(() => {
    initWins(ALL_WIN_IDS);
    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get("post");
    if (postSlug) {
      setBlogCurrentSlug(postSlug);
      window.history.replaceState(null, "", window.location.pathname);
    }
    setTimeout(() => openWin("blog"), 80);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showLaunchpad) setLaunchpadMounted(true);
  }, [showLaunchpad]);

  // ── Memoize window contents (each app is a dynamic chunk; index from PostIndexProvider) ──
  const windowContents = useMemo(
    () => ({
      blog: <PostApp />,
      about: <AboutApp />,
      tags: <TagsApp />,
      safari: <Safari />,
      vscode: <VSCode />,
      terminal: <Terminal />,
    }),
    [],
  );

  const getWindowMeta = (id: AppId) => {
    const cfg = appConfigs.find((a) => a.id === id);
    const width = cfg && "width" in cfg ? cfg.width : undefined;
    const height = cfg && "height" in cfg ? cfg.height : undefined;
    const minWidth = cfg && "minWidth" in cfg ? cfg.minWidth : undefined;
    const minHeight = cfg && "minHeight" in cfg ? cfg.minHeight : undefined;
    return {
      title: cfg?.title ?? id,
      width: width ?? 640,
      height: height ?? 420,
      minWidth: minWidth ?? 320,
      minHeight: minHeight ?? 200,
    };
  };

  // ── Genie minimize — mirrors playground-macos Desktop.tsx ──────────────────
  /**
   * Store the window's current screen position as CSS custom properties so we
   * can restore it later (same trick as playground-macos setWindowPosition).
   */
  const saveWindowPosition = (id: AppId) => {
    const el = document.querySelector(`#window-${id}`) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--restore-x", rect.left.toFixed(1) + "px");
    el.style.setProperty("--restore-y", (rect.top - TOP_BAR_H).toFixed(1) + "px");
  };

  /**
   * Fly the window to its dock icon and mark it minimized — mirrors
   * playground-macos minimizeApp().
   */
  const minimizeApp = (id: AppId) => {
    const winEl = document.querySelector(`#window-${id}`) as HTMLElement | null;
    const dockEl = document.querySelector(`#dock-${id}`) as HTMLElement | null;
    if (!winEl || !dockEl) {
      minimizeWin(id);
      return;
    }

    const dockRect = dockEl.getBoundingClientRect();

    saveWindowPosition(id);

    // Target: window center ≈ dock icon center (in container coords)
    const posY = window.innerHeight - winEl.offsetHeight / 2 - TOP_BAR_H;
    const posX = dockRect.x + dockRect.width / 2 - winEl.offsetWidth / 2;

    winEl.style.transform = `translate(${posX}px, ${posY}px) scale(0.2)`;
    winEl.style.transition = "ease-out 0.3s";

    // Batched with the above DOM change — React renders AFTER this handler
    minimizeWin(id);
  };

  /**
   * Open (or restore) a window — mirrors playground-macos openApp().
   */
  const openApp = (id: AppId) => {
    const win = wins[id];
    if (win?.minimized) {
      const winEl = document.querySelector(`#window-${id}`) as HTMLElement | null;
      if (winEl) {
        const rx = winEl.style.getPropertyValue("--restore-x");
        const ry = winEl.style.getPropertyValue("--restore-y");
        if (rx && ry) {
          winEl.style.transform = `translate(${rx}, ${ry}) scale(1)`;
          winEl.style.transition = "ease-in 0.3s";
        }
      }
    }
    openWin(id);
  };

  // ── Background (real `<img>` for LCP; brightness filter on shell) ───────────
  const shellStyle = {
    filter: `brightness(${brightness * 0.7 + 50}%)`,
  };

  if (!mounted) {
    return (
      <div className="relative h-screen w-screen" style={shellStyle}>
        <WallpaperLayer image={image} priority />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={shellStyle}>
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
      {!isMobile && (
        <TopBar
          currentApp={currentAppTitle}
          hide={anyMaximized}
          toggleSpotlight={() => setShowSpotlight((v) => !v)}
          setSpotlightBtnRef={(ref) => setSpotlightBtnRef(ref)}
        />
      )}

      {/* Window container — same bounds as playground-macos .window-bound */}
      <div
        className="absolute right-0 left-0 z-2 overflow-hidden"
        style={{ top: isMobile ? 0 : TOP_BAR_H, bottom: 76 }}
      >
        {ALL_WIN_IDS.map((id) => {
          const win = wins[id];
          if (!win?.open) return null;
          const meta = getWindowMeta(id);
          return (
            <AppWindow
              key={id}
              id={id}
              title={meta.title}
              width={meta.width}
              height={meta.height}
              minWidth={meta.minWidth}
              minHeight={meta.minHeight}
              z={win.z}
              max={win.maximized}
              min={win.minimized}
              close={closeWin}
              setMax={toggleMaxWin}
              setMin={minimizeApp}
              focus={focusWin}
            >
              {windowContents[id as keyof typeof windowContents]}
            </AppWindow>
          );
        })}
      </div>

      {showSpotlight && spotlightBtnRef && (
        <Spotlight
          openApp={openApp}
          toggleLaunchpad={setShowLaunchpad}
          close={() => setShowSpotlight(false)}
          btnRef={spotlightBtnRef}
        />
      )}

      {launchpadMounted && (
        <Launchpad show={showLaunchpad} toggle={setShowLaunchpad} />
      )}

      <Dock
        openWin={openApp}
        wins={wins}
        hide={anyMaximized}
        toggleLaunchpad={setShowLaunchpad}
        showLaunchpad={showLaunchpad}
      />
    </div>
  );
}
