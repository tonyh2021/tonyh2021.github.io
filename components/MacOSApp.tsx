"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import SleepOverlay from "./SleepOverlay";
import Login from "./Login";
import MacDesktop from "./desktop/MacDesktop";

export default function MacOSApp() {
  const { initDark, initLocale, systemPhase, setSystemPhase } = useStore(
    useShallow((s) => ({
      initDark: s.initDark,
      initLocale: s.initLocale,
      systemPhase: s.systemPhase,
      setSystemPhase: s.setSystemPhase,
    })),
  );

  useEffect(() => {
    initDark();
    initLocale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMacDesktop = systemPhase === "desktop";

  return (
    <>
      {showMacDesktop ? <MacDesktop /> : <Login />}

      {/* Sleep overlay */}
      {systemPhase === "sleep" && (
        <div className="fixed inset-0 z-99999">
          <SleepOverlay setSystemPhase={setSystemPhase} />
        </div>
      )}
    </>
  );
}
