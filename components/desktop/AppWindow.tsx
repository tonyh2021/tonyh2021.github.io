"use client";

import dynamic from "next/dynamic";
import { memo, type ReactNode } from "react";
import type { AppId } from "@/configs/apps";

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
  titleBarExtras?: ReactNode;
  children: ReactNode;
}

const AppWindow = memo(function AppWindow(props: Props) {
  return <DesktopAppWindow {...props} />;
});

export default AppWindow;
