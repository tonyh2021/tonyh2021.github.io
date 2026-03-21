"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useDark } from "@/hooks/useDark";
import { MOBILE_BREAKPOINT_PX } from "@/hooks/useMobile";

interface Wallpaper {
  image: string;
  video: string;
}

export interface WallpaperInfo {
  image: string | null;
  video: string | null;
}

const Wallpapers: Record<string, Wallpaper> = {
  morning: {
    image: "images/wallpapers/SequoiaMorning.webp",
    video: "images/wallpapers/SequoiaMorning.mp4",
  },
  sunrise: {
    image: "images/wallpapers/SequoiaSunrise.webp",
    video: "images/wallpapers/SequoiaSunrise.mp4",
  },
  night: {
    image: "images/wallpapers/SequoiaNight.webp",
    video: "images/wallpapers/SequoiaNight.mp4",
  },
};

function getLightWallpaper(): Wallpaper {
  return new Date().getHours() < 12 ? Wallpapers.morning : Wallpapers.sunrise;
}

function msUntilNoon(): number {
  const now = new Date();
  const noon = new Date(now);
  noon.setHours(12, 0, 0, 0);
  if (now >= noon) noon.setDate(noon.getDate() + 1);
  return noon.getTime() - now.getTime();
}

export function useWallpaper(): WallpaperInfo {
  const dark = useDark();
  /**
   * `null` until viewport is measured — must NOT use `useMobile()` here: that hook
   * starts `false` for hydration, which would briefly expose `video` on phones and
   * trigger an MP4 fetch. Only enable video after we know width >= breakpoint.
   */
  const [allowVideoWallpaper, setAllowVideoWallpaper] = useState<boolean | null>(null);
  /**
   * Stable SSR + hydration: server and first client frame use the same default.
   * Real time-of-day wallpaper is applied in useLayoutEffect (client only).
   */
  const [lightWallpaper, setLightWallpaper] = useState<Wallpaper>(Wallpapers.morning);

  useLayoutEffect(() => {
    setLightWallpaper(getLightWallpaper());
    const measure = () => setAllowVideoWallpaper(window.innerWidth >= MOBILE_BREAKPOINT_PX);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    // Schedule a single update at the next noon transition instead of polling every 60s
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      timer = setTimeout(() => {
        setLightWallpaper(getLightWallpaper());
        scheduleNext();
      }, msUntilNoon());
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, []);

  const wp = dark ? Wallpapers.night : lightWallpaper;
  // Skip MP4 on mobile / until viewport known (SSR + first client frame).
  const video = allowVideoWallpaper === true ? wp.video : null;
  return { image: wp.image, video };
}
