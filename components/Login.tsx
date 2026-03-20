"use client";

import { useState } from "react";
import { user } from "@/configs/user";
import { useWallpaper } from "@/hooks/useWallpaper";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";

export default function Login() {
  const { setLogin, sleep, restart, shutdown } = useStore(
    useShallow((s) => ({
      setLogin: s.setLogin,
      sleep: s.sleep,
      restart: s.restart,
      shutdown: s.shutdown,
    })),
  );
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-center text-center select-none cursor-default"
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => setLogin(true)}
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
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
        />
      )}
      <div className="relative z-10 -top-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg"
        />
        <p className="mt-2 text-xl font-semibold text-white">{user.name}</p>
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-16 z-10 flex gap-4">
        {[
          {
            label: "Sleep",
            icon: "🌙",
            action: (e: React.MouseEvent) => {
              e.stopPropagation();
              sleep();
            },
          },
          {
            label: "Restart",
            icon: "↺",
            action: (e: React.MouseEvent) => {
              e.stopPropagation();
              restart();
            },
          },
          {
            label: "Shut Down",
            icon: "⏻",
            action: (e: React.MouseEvent) => {
              e.stopPropagation();
              shutdown();
            },
          },
        ].map(({ label, icon, action }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 text-white cursor-pointer w-20"
            onClick={action}
          >
            <div className="w-10 h-10 rounded-full bg-gray-700/70 backdrop-blur flex items-center justify-center text-lg">
              {icon}
            </div>
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
