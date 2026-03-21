"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Boot from "./Boot";
import Login from "./Login";
import MacDesktop from "./desktop/MacDesktop";
import { useMobile } from "@/hooks/useMobile";

export default function MacOSApp() {
  const isMobile = useMobile();
  const { initDark, systemPhase, setSystemPhase } = useStore(
    useShallow((s) => ({
      initDark: s.initDark,
      systemPhase: s.systemPhase,
      setSystemPhase: s.setSystemPhase,
    })),
  );

  useEffect(() => {
    initDark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Mobile: render desktop under the boot overlay so JS chunks mount while the bar animates. */
  const desktopUnderBoot = isMobile && systemPhase === "bootRestart";
  const showMacDesktop = systemPhase === "desktop" || desktopUnderBoot;

  return (
    <>
      {showMacDesktop ? <MacDesktop /> : <Login />}

      {/* Boot overlay */}
      <div
        className={`fixed inset-0 z-99999 transition-opacity duration-500 ${
          systemPhase !== "desktop" && systemPhase !== "login" ? "" : "pointer-events-none"
        }`}
        style={{
          opacity: systemPhase !== "desktop" && systemPhase !== "login" ? 1 : 0,
        }}
      >
        {systemPhase !== "desktop" && systemPhase !== "login" && (
          <Boot
            systemPhase={systemPhase}
            setSystemPhase={setSystemPhase}
            restartCompletePhase={isMobile ? "desktop" : "login"}
          />
        )}
      </div>
    </>
  );
}
