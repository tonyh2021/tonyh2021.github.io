"use client";

import Image from "next/image";
import { useState } from "react";
import { user } from "@/configs/user";
import { useWallpaper } from "@/hooks/useWallpaper";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";

export default function Login() {
  const { setSystemPhase, sleep, restart, shutdown } = useStore(
    useShallow((s) => ({
      setSystemPhase: s.setSystemPhase,
      sleep: s.sleep,
      restart: s.restart,
      shutdown: s.shutdown,
    })),
  );
  const { image, video } = useWallpaper();
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div
      className="relative flex h-screen w-screen cursor-default flex-col items-center justify-center text-center select-none"
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => setSystemPhase("desktop")}
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
      <div className="relative -top-10 z-10">
        <Image
          src={user.avatar}
          alt={user.name}
          width={96}
          height={96}
          priority
          className="mx-auto h-24 w-24 rounded-full object-cover object-top shadow-lg"
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
            className="flex w-20 cursor-pointer flex-col items-center gap-1 text-white"
            onClick={action}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/70 text-lg backdrop-blur">
              {icon}
            </div>
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
