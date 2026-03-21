"use client";

import { useCallback, useMemo } from "react";
import { appConfigs, type AppId } from "@/configs/apps";
import type { WinState } from "@/store/slices/windows";
import { useMobile } from "@/hooks/useMobile";
import { useDockVisibility } from "@/hooks/useDockVisibility";
import MagnifiedDockBar, {
  type MagnifiedDockSlot,
} from "./MagnifiedDockBar";

const MOBILE_APPS = ["blog", "about", "safari", "github"] as const;

interface Props {
  openWin: (id: AppId) => void;
  wins: Partial<Record<AppId, WinState>>;
  hide: boolean;
  toggleLaunchpad: (v: boolean) => void;
  showLaunchpad: boolean;
}

const LAUNCHPAD = {
  id: "launchpad",
  title: "Launchpad",
  img: "images/icons/launchpad.png",
  desktop: false,
};

export default function Dock({
  openWin,
  wins,
  hide,
  toggleLaunchpad,
  showLaunchpad,
}: Props) {
  const isMobile = useMobile();
  const dockVisible = useDockVisibility({ isMobile, threshold: 15 });

  type DockItemId = AppId | "launchpad";

  const handleOpen = useCallback(
    (id: DockItemId) => {
      if (id === "launchpad") {
        toggleLaunchpad(!showLaunchpad);
      } else {
        toggleLaunchpad(false);
        openWin(id);
      }
    },
    [openWin, showLaunchpad, toggleLaunchpad],
  );

  const desktopSlots: MagnifiedDockSlot[] = useMemo(() => {
    return [
      {
        kind: "icon",
        id: LAUNCHPAD.id,
        name: LAUNCHPAD.title,
        icon: LAUNCHPAD.img,
        isOpen: showLaunchpad,
        onActivate: () => handleOpen("launchpad"),
      },
      { kind: "separator" },
      ...appConfigs
        .filter((app) => app.show !== false)
        .map((app) => ({
          kind: "icon" as const,
          id: app.id,
          name: app.title,
          icon: app.img,
          link: "link" in app ? app.link : undefined,
          isOpen: app.desktop ? !!wins[app.id as AppId]?.open : false,
          onActivate: () => handleOpen(app.id as AppId),
        })),
    ];
  }, [handleOpen, wins, showLaunchpad]);

  // ── Mobile: iPhone-style bottom tab bar ────────────────────────────────────
  if (isMobile) {
    const mobileApps = appConfigs.filter((a) =>
      (MOBILE_APPS as readonly string[]).includes(a.id),
    );

    return (
      <div
        className={`fixed inset-x-0 bottom-3 ${hide ? "z-0" : "z-9999"} transition-transform duration-300`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          transform: dockVisible ? "translateY(0)" : "translateY(110%)",
        }}
      >
        <div className="mx-3 mb-2 rounded-3xl backdrop-blur-2xl bg-white/25 dark:bg-black/35 border border-white/30 dark:border-white/10 shadow-2xl">
          <ul className="flex items-center justify-around px-2 py-2">
            {mobileApps.map((app) => {
              const isOpen = app.desktop
                ? !!wins[app.id as AppId]?.open
                : false;
              const inner = (
                <div className="flex flex-col items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div
                    className={`w-14 h-14 rounded-2xl overflow-hidden shadow-md transition-transform duration-150 active:scale-90`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- dock icons are local assets */}
                    <img
                      src={app.img}
                      alt={app.title}
                      className="w-full h-full object-cover border-0"
                      draggable={false}
                    />
                  </div>
                  <span className="text-[10px] text-white drop-shadow font-medium tracking-tight">
                    {app.title}
                  </span>
                </div>
              );

              return (
                <li key={app.id} id={`dock-${app.id}`}>
                  {"link" in app && app.link ? (
                    <a href={app.link} target="_blank" rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <button onClick={() => handleOpen(app.id as AppId)}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  // ── Desktop: macOS-style magnifying dock (cosine lens + lerp) ──────────────
  return (
    <div
      className={`dock fixed inset-x-0 mx-auto bottom-1 flex justify-center ${hide ? "z-0" : "z-9999"} overflow-x-visible px-2`}
    >
      <MagnifiedDockBar className="max-w-[100vw]" slots={desktopSlots} />
    </div>
  );
}
