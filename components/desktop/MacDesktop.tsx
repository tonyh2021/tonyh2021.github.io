'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/shallow';
import { appConfigs, ALL_WIN_IDS, type AppId } from '@/configs/apps';
import { useWallpaper } from '@/hooks/useWallpaper';
import TopBar from './TopBar';
import Dock from './Dock';
import AppWindow from './AppWindow';
import BlogApp from '@/components/apps/BlogApp';
import AboutApp from '@/components/apps/AboutApp';
import TagsApp from '@/components/apps/TagsApp';
import Safari from '@/components/apps/Safari';
import VSCode from '@/components/apps/VSCode';
import Terminal from '@/components/apps/Terminal';
import Launchpad from '@/components/Launchpad';
import Spotlight from '@/components/Spotlight';
import type { Post } from '@/lib/types';

/** Top bar height — mirrors minMarginY in playground-macos */
const TOP_BAR_H = 32;

interface Props {
  posts: Post[];
  enPosts: Post[];
}

export default function MacDesktop({ posts, enPosts }: Props) {
  const { wins, currentApp, brightness } = useStore(
    useShallow((s) => ({ wins: s.wins, currentApp: s.currentApp, brightness: s.brightness }))
  );
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);
  const prevVideoRef = useRef<string | null>(null);
  if (video !== prevVideoRef.current) {
    prevVideoRef.current = video;
    setVideoReady(false);
  }
  const currentAppTitle = useMemo(
    () => appConfigs.find((a) => a.id === currentApp)?.title ?? currentApp,
    [currentApp]
  );
  const openWin      = useStore((s) => s.openWin);
  const closeWin     = useStore((s) => s.closeWin);
  const minimizeWin  = useStore((s) => s.minimizeWin);
  const toggleMaxWin = useStore((s) => s.toggleMaxWin);
  const focusWin     = useStore((s) => s.focusWin);
  const initWins     = useStore((s) => s.initWins);
  const [mounted, setMounted] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightBtnRef, setSpotlightBtnRef] = useState<React.RefObject<HTMLDivElement> | null>(null);

  const anyMaximized = Object.values(wins).some((w) => w?.open && w.maximized);

  useEffect(() => {
    initWins(ALL_WIN_IDS);
    setTimeout(() => openWin('blog'), 80);
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Memoize window contents ─────────────────────────────────────────────────
  const windowContents = useMemo(() => ({
    blog:     <BlogApp posts={posts} enPosts={enPosts} />,
    about:    <AboutApp />,
    tags:     <TagsApp posts={posts} enPosts={enPosts} />,
    safari:   <Safari />,
    vscode:   <VSCode />,
    terminal: <Terminal />,
  }), [posts, enPosts]);

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
    el.style.setProperty('--restore-x', rect.left.toFixed(1) + 'px');
    el.style.setProperty('--restore-y', (rect.top - TOP_BAR_H).toFixed(1) + 'px');
  };

  /**
   * Fly the window to its dock icon and mark it minimized — mirrors
   * playground-macos minimizeApp().
   */
  const minimizeApp = (id: AppId) => {
    const winEl  = document.querySelector(`#window-${id}`) as HTMLElement | null;
    const dockEl = document.querySelector(`#dock-${id}`)  as HTMLElement | null;
    if (!winEl || !dockEl) { minimizeWin(id); return; }

    const dockRect = dockEl.getBoundingClientRect();

    saveWindowPosition(id);

    // Target: window center ≈ dock icon center (in container coords)
    const posY = window.innerHeight - winEl.offsetHeight / 2 - TOP_BAR_H;
    const posX = dockRect.x + dockRect.width / 2 - winEl.offsetWidth / 2;

    winEl.style.transform = `translate(${posX}px, ${posY}px) scale(0.2)`;
    winEl.style.transition = 'ease-out 0.3s';

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
        const rx = winEl.style.getPropertyValue('--restore-x');
        const ry = winEl.style.getPropertyValue('--restore-y');
        if (rx && ry) {
          winEl.style.transform = `translate(${rx}, ${ry}) scale(1)`;
          winEl.style.transition = 'ease-in 0.3s';
        }
      }
    }
    openWin(id);
  };

  // ── Background ──────────────────────────────────────────────────────────────
  const bgStyle = {
    backgroundImage: image ? `url(${image})` : undefined,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center' as const,
    filter: `brightness(${brightness * 0.7 + 50}%)`,
  };

  if (!mounted) {
    return <div className="w-screen h-screen" style={bgStyle} />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={bgStyle}>
      {video && (
        <video
          key={video}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      <TopBar
        currentApp={currentAppTitle}
        hide={anyMaximized}
        toggleSpotlight={() => setShowSpotlight((v) => !v)}
        setSpotlightBtnRef={(ref) => setSpotlightBtnRef(ref)}
      />

      {/* Window container — same bounds as playground-macos .window-bound */}
      <div className="absolute left-0 right-0 overflow-hidden" style={{ top: TOP_BAR_H, bottom: 76 }}>
        {ALL_WIN_IDS.map((id) => {
          const win = wins[id];
          if (!win?.open) return null;
          const meta = getWindowMeta(id);
          return (
            <AppWindow
              key={id} id={id} title={meta.title}
              width={meta.width} height={meta.height}
              minWidth={meta.minWidth} minHeight={meta.minHeight}
              z={win.z} max={win.maximized} min={win.minimized}
              close={closeWin} setMax={toggleMaxWin}
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

      <Launchpad show={showLaunchpad} toggle={setShowLaunchpad} />

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
