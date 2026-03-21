"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { resolveImageSrc } from "@/lib/imageSrc";
import { appConfigs, type AppId } from "@/configs/apps";
import type { WinState } from "@/store/slices/windows";
import { useMobile } from "@/hooks/useMobile";
import { useDockVisibility } from "@/hooks/useDockVisibility";
import type { MagnifiedDockSlot } from "./MagnifiedDockBar";

/** Desktop-only; never loaded on mobile (early return below). */
const MagnifiedDockBar = dynamic(() => import("./MagnifiedDockBar"), {
  ssr: false,
  loading: () => <div className="h-20 max-w-[100vw]" aria-hidden />,
});

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

export default function Dock({ openWin, wins, hide, toggleLaunchpad, showLaunchpad }: Props) {
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
    const mobileApps = appConfigs.filter((a) => (MOBILE_APPS as readonly string[]).includes(a.id));

    return (
      <div
        className={`fixed inset-x-0 bottom-5 ${hide ? "z-0" : "z-9999"} transition-transform duration-300`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          transform: dockVisible ? "translateY(0)" : "translateY(110%)",
        }}
      >
        <div className="mx-3 mb-2 rounded-3xl border border-white/30 bg-white/25 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/35">
          <ul className="flex items-center justify-around px-2 py-2">
            {mobileApps.map((app) => {
              const inner = (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`relative h-14 w-14 overflow-hidden rounded-2xl shadow-md transition-transform duration-150 active:scale-90`}
                  >
                    <Image
                      src={resolveImageSrc(app.img)}
                      alt={app.title}
                      fill
                      sizes="56px"
                      loading="lazy"
                      className="border-0 object-cover"
                      draggable={false}
                    />
                  </div>
                  <span className="text-[10px] font-medium tracking-tight text-gray-900 drop-shadow-sm dark:text-white dark:drop-shadow">
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
                    <button onClick={() => handleOpen(app.id as AppId)}>{inner}</button>
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
      className={`dock fixed inset-x-0 bottom-1 mx-auto flex justify-center ${hide ? "z-0" : "z-9999"} overflow-x-visible px-2`}
    >
      <MagnifiedDockBar className="max-w-[100vw]" slots={desktopSlots} />
    </div>
  );
}
