"use client";

import { useState } from "react";
import { launchpadApps } from "@/configs/launchpad";
import { useWallpaper } from "@/hooks/useWallpaper";

interface Props {
  show: boolean;
  toggle: (v: boolean) => void;
}

export default function Launchpad({ show, toggle }: Props) {
  const wallpaper = useWallpaper();
  const [search, setSearch] = useState("");

  const filtered = search
    ? launchpadApps.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.id.toLowerCase().includes(search.toLowerCase()),
      )
    : launchpadApps;

  return (
    <div
      id="launchpad"
      className="fixed inset-0 z-30 overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: show ? 1 : 0,
        visibility: show ? "visible" : "hidden",
        transition: "opacity 0.2s, visibility 0.2s",
        transform: show ? "scale(1)" : "scale(1.08)",
      }}
      onClick={() => toggle(false)}
    >
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-2xl flex flex-col items-center justify-center gap-8">
        {/* Search bar */}
        <div
          className="flex h-9 w-72 items-center gap-2 px-3 bg-white/15 border border-white/25 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="white" className="opacity-70 shrink-0">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* App grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-x-6 gap-y-8 px-12">
          {filtered.map((app) => (
            <div key={app.id} className="flex flex-col items-center gap-2 w-20">
              <a
                href={app.link}
                target="_blank"
                rel="noreferrer"
                className="w-16 sm:w-20 transition-transform duration-150 hover:scale-110 active:scale-95"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={app.img}
                  alt={app.title}
                  className="w-full rounded-2xl shadow-lg"
                />
              </a>
              <span className="text-xs text-white/90 text-center leading-tight drop-shadow">
                {app.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
