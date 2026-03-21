"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWallpaper } from "@/hooks/useWallpaper";
import { WallpaperLayer } from "@/components/WallpaperLayer";
import type { SystemPhase } from "@/store/slices/system";

export default function SleepOverlay({
  setSystemPhase,
}: {
  setSystemPhase: (p: SystemPhase) => void;
}) {
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const didWakeRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Fade in on mount
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  const handleWake = useCallback(() => {
    if (didWakeRef.current) return;
    didWakeRef.current = true;
    timerRef.current = window.setTimeout(() => setVisible(false), 200);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleWake);
    window.addEventListener("keydown", handleWake);
    return () => {
      window.removeEventListener("mousemove", handleWake);
      window.removeEventListener("keydown", handleWake);
    };
  }, [handleWake]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className={`relative h-screen w-screen cursor-none select-none transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      onTransitionEnd={() => { if (didWakeRef.current) setSystemPhase("login"); }}
      onClick={handleWake}
    >
      <WallpaperLayer image={image} />
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
    </div>
  );
}
