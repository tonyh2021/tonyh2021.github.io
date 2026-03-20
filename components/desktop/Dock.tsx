"use client";

import { useMotionValue } from "framer-motion";
import { appConfigs, type AppId } from "@/configs/apps";
import DockItem from "./DockItem";
import type { WinState } from "@/store/slices/windows";

const DOCK_SIZE = 50;
const DOCK_MAG = 2;

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
  const mouseX = useMotionValue<number | null>(null);

  type DockItemId = AppId | "launchpad";

  const handleOpen = (id: DockItemId) => {
    if (id === "launchpad") {
      toggleLaunchpad(!showLaunchpad);
    } else {
      toggleLaunchpad(false);
      openWin(id);
    }
  };

  return (
    <div
      className={`dock fixed inset-x-0 mx-auto bottom-1 ${hide ? "z-0" : "z-9999"} w-full sm:w-max overflow-x-scroll sm:overflow-x-visible`}
    >
      <ul
        className="flex items-end space-x-2 px-2 backdrop-blur-2xl bg-white/20 dark:bg-black/30 border border-white/25 rounded-none sm:rounded-xl shadow-xl"
        style={{ height: `${(DOCK_SIZE + 15) / 16}rem` }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(null)}
      >
        {/* Launchpad first */}
        <DockItem
          id={LAUNCHPAD.id}
          title={LAUNCHPAD.title}
          img={LAUNCHPAD.img}
          desktop={false}
          isOpen={showLaunchpad}
          openApp={() => handleOpen("launchpad")}
          mouseX={mouseX}
          dockSize={DOCK_SIZE}
          dockMag={DOCK_MAG}
        />

        {/* Separator */}
        <li className="self-stretch flex items-center px-1">
          <div className="w-px h-10 bg-white/20 rounded-full" />
        </li>

        {appConfigs
          .filter((app) => app.show !== false)
          .map((app) => (
            <DockItem
              key={app.id}
              id={app.id}
              title={app.title}
              img={app.img}
              desktop={app.desktop}
              link={"link" in app ? app.link : undefined}
              isOpen={app.desktop ? !!wins[app.id]?.open : false}
              openApp={() => handleOpen(app.id)}
              mouseX={mouseX}
              dockSize={DOCK_SIZE}
              dockMag={DOCK_MAG}
            />
          ))}
      </ul>
    </div>
  );
}
