"use client";

import dynamic from "next/dynamic";
import { memo, type ReactNode } from "react";
import type { AppId } from "@/configs/apps";
import { useMobile } from "@/hooks/useMobile";

const DesktopAppWindow = dynamic(() => import("./AppWindowDesktop"), {
  ssr: false,
  loading: () => (
    <div
      className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center bg-transparent"
      aria-hidden
    />
  ),
});

interface Props {
  id: AppId;
  title: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  z: number;
  max: boolean;
  min: boolean;
  close: (id: AppId) => void;
  setMax: (id: AppId, target?: boolean) => void;
  setMin: (id: AppId) => void;
  focus: (id: AppId) => void;
  children: ReactNode;
}

/** Mobile: lightweight shell. Desktop: lazy `react-rnd` chunk. */
const AppWindow = memo(function AppWindow(props: Props) {
  const isMobile = useMobile();
  const { id, title, z, focus, children } = props;

  if (isMobile) {
    return (
      <div
        id={`window-${id}`}
        className="fixed inset-0 flex flex-col bg-white dark:bg-gray-900"
        style={{ zIndex: z }}
        onClick={() => focus(id)}
      >
        <div className="relative flex h-11 shrink-0 items-center justify-center border-b border-gray-300/50 bg-gray-200/80 px-2 backdrop-blur dark:border-gray-600/50 dark:bg-gray-800/80">
          <span className="max-w-[60%] truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return <DesktopAppWindow {...props} />;
});

export default AppWindow;
