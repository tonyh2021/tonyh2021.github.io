"use client";

import { useState, useEffect, memo, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import type { AppId } from "@/configs/apps";

const TOP_BAR_H = 32;
const DOCK_H = 76;
const MARGIN = 8;

export interface AppWindowDesktopProps {
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

interface WinPos {
  w: number;
  h: number;
  x: number;
  y: number;
}

const FullIcon = ({ size }: { size: number }) => (
  <svg
    className="icon"
    viewBox="0 0 13 13"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
  >
    <path d="M9.26 12.03L.006 2.73v9.3H9.26zM2.735.012l9.3 9.3v-9.3h-9.3z" />
  </svg>
);
const ExitFullIcon = ({ size }: { size: number }) => (
  <svg
    className="icon"
    viewBox="0 0 19 19"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
  >
    <path d="M18.373 9.23L9.75.606V9.23h8.624zM.6 9.742l8.623 8.624V9.742H.599z" />
  </svg>
);

/** Desktop-only window chrome + `react-rnd` — not bundled on mobile. */
const AppWindowDesktop = memo(function AppWindowDesktop({
  id,
  title,
  width,
  height,
  minWidth = 320,
  minHeight = 200,
  z,
  max,
  min,
  close,
  setMax,
  setMin,
  focus,
  titleBarExtras,
  children,
}: AppWindowDesktopProps) {
  const [vw, setVw] = useState(1280);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const update = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const availH = vh - TOP_BAR_H - DOCK_H;
  const initW = Math.min(vw - MARGIN * 2, width);
  const initH = Math.min(availH - MARGIN * 2, height);

  const [pos, setPos] = useState<WinPos>({
    w: initW,
    h: initH,
    x: (vw - initW) / 2,
    y: (availH - initH) / 2,
  });

  const curW = max ? vw : pos.w;
  const curH = max ? availH : pos.h;
  const curX = max ? 0 : Math.min(vw - MARGIN - pos.w, Math.max(MARGIN, pos.x));
  const curY = max ? 0 : Math.min(availH - MARGIN - pos.h, Math.max(0, pos.y));

  const round = max ? "rounded-none" : "rounded-lg";
  const border = max ? "" : "border border-gray-500/30";

  return (
    <Rnd
      id={`window-${id}`}
      bounds="parent"
      size={{ width: curW, height: curH }}
      position={{ x: curX, y: curY }}
      minWidth={minWidth}
      minHeight={minHeight}
      dragHandleClassName="window-bar"
      disableDragging={max}
      enableResizing={!max}
      style={{
        zIndex: z,
        opacity: min ? 0 : 1,
        transition: "opacity 0.3s ease-out",
      }}
      className={`overflow-hidden ${round} ${border} shadow-lg shadow-black/30 ${min ? "pointer-events-none" : ""}`}
      onMouseDown={() => focus(id)}
      onDragStop={(_, d) => setPos((p) => ({ ...p, x: d.x, y: d.y }))}
      onResizeStop={(_, __, ref, ___, p) =>
        setPos({
          w: parseInt(ref.style.width),
          h: parseInt(ref.style.height),
          x: p.x,
          y: p.y,
        })
      }
    >
      <div
        className="window-bar relative flex h-6 items-center justify-center bg-gray-200 dark:bg-gray-700"
        onDoubleClick={() => !max && setMax(id)}
      >
        <div className="traffic-lights absolute left-0 flex h-full flex-row items-center space-x-2 pl-2">
          <button
            className="window-btn flex items-center justify-center bg-red-500 dark:bg-red-400"
            onClick={(e) => {
              e.stopPropagation();
              close(id);
            }}
          >
            <span className="icon text-[9px] opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <button
            className={`window-btn flex items-center justify-center ${max ? "cursor-not-allowed bg-gray-400" : "bg-yellow-400 dark:bg-yellow-400"}`}
            onClick={(e) => {
              e.stopPropagation();
              setMin(id);
            }}
            disabled={max}
          >
            <span
              className={`icon text-[10px] opacity-0 group-hover:opacity-100 ${max ? "invisible" : ""}`}
            >
              −
            </span>
          </button>
          <button
            className="window-btn flex items-center justify-center bg-green-500 dark:bg-green-400"
            onClick={(e) => {
              e.stopPropagation();
              setMax(id);
            }}
          >
            {max ? <ExitFullIcon size={9} /> : <FullIcon size={6} />}
          </button>
        </div>

        <span className="inline-block max-w-[60%] truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </span>

        {titleBarExtras && (
          <div
            className="absolute right-0 flex h-full items-center pr-2"
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {titleBarExtras}
          </div>
        )}
      </div>

      <div
        className="w-full overflow-y-hidden bg-white dark:bg-gray-900"
        style={{ height: "calc(100% - 24px)" }}
      >
        {children}
      </div>
    </Rnd>
  );
});

export default AppWindowDesktop;
