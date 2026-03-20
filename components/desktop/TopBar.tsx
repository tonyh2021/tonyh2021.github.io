"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import { format } from "date-fns";
import { useInterval } from "@/hooks/useInterval";
import { useAudio } from "@/hooks/useAudio";
import { isFullScreen } from "@/lib/screen";
import { music } from "@/configs/music";
import AppleMenu from "@/components/menus/AppleMenu";
import WifiMenu from "@/components/menus/WifiMenu";
import Battery from "@/components/menus/Battery";
import ControlCenterMenu from "@/components/menus/ControlCenterMenu";

interface Props {
  currentApp: string;
  hide: boolean;
  toggleSpotlight: () => void;
  setSpotlightBtnRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

const TopItem = React.forwardRef<
  HTMLDivElement,
  {
    forceHover?: boolean;
    hideOnMobile?: boolean;
    className?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    children: React.ReactNode;
  }
>(function TopItem(
  {
    forceHover = false,
    hideOnMobile = false,
    className = "",
    onClick,
    onMouseEnter,
    children,
  },
  ref,
) {
  const base = hideOnMobile ? "hidden sm:inline-flex" : "inline-flex";
  const hover = forceHover ? "bg-white/20" : "hover:bg-white/20";
  return (
    <div
      ref={ref}
      className={`${base} ${hover} items-center gap-1 h-6 px-2 rounded cursor-default transition-colors ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
});

export default function TopBar({
  currentApp,
  hide,
  toggleSpotlight,
  setSpotlightBtnRef,
}: Props) {
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const wifiBtnRef = useRef<HTMLDivElement>(null);
  const ccBtnRef = useRef<HTMLDivElement>(null);
  const spotlightBtnRef = useRef<HTMLDivElement>(null);

  const [now, setNow] = useState<Date | null>(null);
  const [showApple, setShowApple] = useState(false);
  const [showWifi, setShowWifi] = useState(false);
  const [showCC, setShowCC] = useState(false);

  const { wifi, volume, brightness, setSystemPhase, shutdown, sleep, restart } =
    useStore(
      useShallow((s) => ({
        wifi: s.wifi,
        volume: s.volume,
        brightness: s.brightness,
        setSystemPhase: s.setSystemPhase,
        shutdown: s.shutdown,
        sleep: s.sleep,
        restart: s.restart,
      })),
    );
  const toggleFullScreen = useStore((s) => s.toggleFullScreen);
  const setVolume = useStore((s) => s.setVolume);
  const setBrightness = useStore((s) => s.setBrightness);

  const { state: audioState, controls: audioControls } = useAudio(music.audio);

  useEffect(() => {
    setNow(new Date());
    setSpotlightBtnRef(spotlightBtnRef);
    audioControls.setVolume(volume / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    toggleFullScreen(isFullScreen());
    const handler = () => toggleFullScreen(isFullScreen());
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(() => setNow(new Date()), 60_000);

  const handleSetVolume = (v: number) => {
    setVolume(v);
    audioControls.setVolume(v / 100);
  };

  const handleLogout = () => {
    audioControls.pause();
    setSystemPhase("login");
  };
  const handleShutdown = () => {
    audioControls.pause();
    shutdown();
  };
  const handleRestart = () => {
    audioControls.pause();
    restart();
  };
  const handleSleep = () => {
    audioControls.pause();
    sleep();
  };

  return (
    <div
      className={`w-full h-8 px-2 fixed top-0 flex items-center justify-between ${hide ? "z-0" : "z-9999"} text-sm text-white bg-gray-700/10 backdrop-blur-2xl shadow transition-all select-none`}
    >
      {/* Left side */}
      <div className="flex items-center gap-0.5">
        {/* Apple logo */}
        <TopItem
          forceHover={showApple}
          onClick={() => setShowApple((v) => !v)}
          ref={appleBtnRef}
          className="px-2"
        >
          <svg
            viewBox="0 0 814 1000"
            width="13"
            height="13"
            fill="currentColor"
          >
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.5 0 663 0 541.8c0-207.5 135.4-317.5 269-317.5 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49.1 185.5-49.1 29.4 0 108.2 2.6 168.6 81.3zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
          </svg>
        </TopItem>
        {/* Current app */}
        <TopItem
          className="font-semibold px-2"
          onMouseEnter={() => showApple && setShowApple(false)}
        >
          {currentApp}
        </TopItem>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-0.5">
        <TopItem hideOnMobile>
          <Battery />
        </TopItem>

        {/* WiFi */}
        <TopItem
          hideOnMobile
          forceHover={showWifi}
          onClick={() => setShowWifi((v) => !v)}
          ref={wifiBtnRef}
        >
          {wifi ? (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
              <path d="M1 9l2 2c5-5 13-5 18 0l2-2C16.5 2.5 7.5 2.5 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7 7 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
              <path d="M22.99 9C19.15 5.35 13.8 3.76 8.84 4.57L11.12 6.85C14.67 6.37 18.35 7.5 21 9.99l2-2zM13 13.35l2.07 2.07c-.57-.26-1.35-.42-2.07-.42a4.24 4.24 0 0 0-3 1.24l3 3 3-3-.04-.04.03-.03-.99-.82zM2.81 2.81L1.39 4.22 4 6.83C2.5 7.91 1.16 9.24 0 10.74l2 2c1.2-1.47 2.57-2.72 4.1-3.67l1.55 1.55C6.23 11.28 4.88 12.23 3.73 13.4l2 2c1.12-1.14 2.44-2.07 3.89-2.72l7.08 7.08 1.41-1.41L2.81 2.81z" />
            </svg>
          )}
        </TopItem>

        {/* Spotlight */}
        <TopItem onClick={toggleSpotlight} ref={spotlightBtnRef}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </TopItem>

        {/* Control center */}
        <TopItem
          forceHover={showCC}
          onClick={() => setShowCC((v) => !v)}
          ref={ccBtnRef}
        >
          {/* CC icon: two stacked toggle sliders */}
          <svg viewBox="0 0 29 29" width="16" height="16" fill="currentColor">
            <path d="M7.5,13h14a5.5,5.5,0,0,0,0-11H7.5a5.5,5.5,0,0,0,0,11Zm0-9h14a3.5,3.5,0,0,1,0,7H7.5a3.5,3.5,0,0,1,0-7Zm0,6A2.5,2.5,0,1,0,5,7.5,2.5,2.5,0,0,0,7.5,10Zm14,6H7.5a5.5,5.5,0,0,0,0,11h14a5.5,5.5,0,0,0,0-11Zm1.43,8a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,22.93,24Z" />
          </svg>
        </TopItem>

        {/* Date & time */}
        {now && (
          <TopItem>
            <span>{format(now, "EEE MMM d")}</span>
            <span>{format(now, "h:mm aa")}</span>
          </TopItem>
        )}
      </div>

      {/* Dropdowns */}
      {showApple && (
        <AppleMenu
          logout={handleLogout}
          shutdown={handleShutdown}
          restart={handleRestart}
          sleep={handleSleep}
          close={() => setShowApple(false)}
          btnRef={appleBtnRef}
        />
      )}
      {showWifi && (
        <WifiMenu close={() => setShowWifi(false)} btnRef={wifiBtnRef} />
      )}
      {showCC && (
        <ControlCenterMenu
          playing={audioState.playing}
          toggleAudio={audioControls.toggle}
          setVolume={handleSetVolume}
          setBrightness={setBrightness}
          close={() => setShowCC(false)}
          btnRef={ccBtnRef}
        />
      )}
    </div>
  );
}
