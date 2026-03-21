"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { appConfigs, type AppId } from "@/configs/apps";
import type { WinState } from "@/store/slices/windows";
import type { MagnifiedDockSlot } from "./MagnifiedDockBar";
const MagnifiedDockBar = dynamic(() => import("./MagnifiedDockBar"), {
  ssr: false,
  loading: () => <div className="h-20 max-w-[100vw]" aria-hidden />,
});

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

  return (
    <div
      className={`dock fixed inset-x-0 bottom-1 mx-auto flex justify-center ${hide ? "z-0" : "z-9999"} overflow-x-visible px-2`}
    >
      <MagnifiedDockBar className="max-w-[100vw]" slots={desktopSlots} />
    </div>
  );
}
