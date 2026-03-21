"use client";

import { useState, useEffect } from "react";
import { useDark } from "@/hooks/useDark";
import { useMobile } from "@/hooks/useMobile";

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
    image: "images/wallpapers/SequoiaMorning.jpg",
    video: "images/wallpapers/SequoiaMorning.mp4",
  },
  sunrise: {
    image: "images/wallpapers/SequoiaSunrise.jpg",
    video: "images/wallpapers/SequoiaSunrise.mp4",
  },
  night: {
    image: "images/wallpapers/SequoiaNight.jpg",
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
  const isMobile = useMobile();
  const [lightWallpaper, setLightWallpaper] = useState<Wallpaper | null>(null);

  useEffect(() => {
    setLightWallpaper(getLightWallpaper());

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

  if (lightWallpaper === null) return { image: null, video: null };
  const wp = dark ? Wallpapers.night : lightWallpaper;
  // Skip animated wallpaper on small viewports — no MP4 fetch/decode/battery cost.
  return { image: wp.image, video: isMobile ? null : wp.video };
}
