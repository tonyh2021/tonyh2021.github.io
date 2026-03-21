"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useInterval } from "@/hooks/useInterval";
import { useWallpaper } from "@/hooks/useWallpaper";
import type { SystemPhase } from "@/store/slices/system";

interface Props {
  systemPhase: SystemPhase;
  setSystemPhase: (p: SystemPhase) => void;
  /** After `bootRestart` progress completes (default: login). */
  restartCompletePhase?: "login" | "desktop";
}

/* ── Sleep / screensaver ──────────────────────────────────────── */
function SleepScreen({ onWake }: { onWake: () => void }) {
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);
  const didWakeRef = useRef(false);
  const wakeTimerRef = useRef<number | null>(null);

  const handleWake = useCallback(() => {
    if (didWakeRef.current) return;
    didWakeRef.current = true;
    wakeTimerRef.current = window.setTimeout(() => {
      onWake();
    }, 2000);
  }, [onWake]);

  useEffect(() => {
    window.addEventListener("mousemove", handleWake);
    window.addEventListener("keydown", handleWake);
    return () => {
      window.removeEventListener("mousemove", handleWake);
      window.removeEventListener("keydown", handleWake);
    };
  }, [handleWake, onWake]);

  useEffect(() => {
    return () => {
      if (wakeTimerRef.current) window.clearTimeout(wakeTimerRef.current);
    };
  }, []);

  return (
    <div
      className="h-screen w-screen cursor-none select-none"
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleWake}
    >
      {video && (
        <video
          key={video}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setVideoReady(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

/* ── Shutdown black screen ────────────────────────────────────── */
function ShutdownScreen({ onWake }: { onWake: () => void }) {
  useEffect(() => {
    window.addEventListener("keydown", onWake);
    window.addEventListener("click", onWake);
    return () => {
      window.removeEventListener("keydown", onWake);
      window.removeEventListener("click", onWake);
    };
  }, [onWake]);

  return <div className="h-screen w-screen bg-black" />;
}

/* ── Boot animation ───────────────────────────────────────────── */
function BootAnimation({
  mode,
  setSystemPhase,
  restartCompletePhase,
}: {
  mode: "restart" | "shutdown";
  setSystemPhase: (p: SystemPhase) => void;
  restartCompletePhase: "login" | "desktop";
}) {
  const [percent, setPercent] = useState(0);
  const didFinishRef = useRef(false);

  useInterval(() => {
    if (didFinishRef.current) return;
    const next = percent + 0.15;
    if (next >= 100) {
      didFinishRef.current = true;
      if (mode === "restart")
        setTimeout(() => setSystemPhase(restartCompletePhase), 500);
      else setSystemPhase("shutdownWait");
    } else {
      setPercent(next);
    }
  }, 1);

  return (
    <div
      className="flex h-screen w-screen cursor-default flex-col items-center justify-center bg-black select-none"
      onClick={() => {
        if (mode === "restart") window.location.reload();
      }}
    >
      <svg viewBox="0 0 814 1000" width="80" height="80" fill="white">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.5 0 663 0 541.8c0-207.5 135.4-317.5 269-317.5 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49.1 185.5-49.1 29.4 0 108.2 2.6 168.6 81.3zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
      </svg>
      <div className="mt-14 h-1.5 w-56 overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-full rounded-full bg-white transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ── Entry point ──────────────────────────────────────────────── */
export default function Boot({
  systemPhase,
  setSystemPhase,
  restartCompletePhase = "login",
}: Props) {
  if (systemPhase === "sleep") return <SleepScreen onWake={() => setSystemPhase("login")} />;
  if (systemPhase === "shutdownWait")
    return <ShutdownScreen onWake={() => setSystemPhase("login")} />;

  if (systemPhase === "bootRestart")
    return (
      <BootAnimation
        mode="restart"
        setSystemPhase={setSystemPhase}
        restartCompletePhase={restartCompletePhase}
      />
    );
  if (systemPhase === "bootShutdown")
    return (
      <BootAnimation
        mode="shutdown"
        setSystemPhase={setSystemPhase}
        restartCompletePhase="login"
      />
    );

  return null;
}
