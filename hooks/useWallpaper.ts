"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store";

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

export function useWallpaper(): WallpaperInfo {
  const dark = useStore((s) => s.dark);
  const [lightWallpaper, setLightWallpaper] = useState<Wallpaper | null>(null);

  useEffect(() => {
    setLightWallpaper(getLightWallpaper());
    const timer = setInterval(
      () => setLightWallpaper(getLightWallpaper()),
      60_000,
    );
    return () => clearInterval(timer);
  }, []);

  if (lightWallpaper === null) return { image: null, video: null };
  const wp = dark ? Wallpapers.night : lightWallpaper;
  return { image: wp.image, video: wp.video };
}
