"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Boot from "./Boot";
import Login from "./Login";
import MacDesktop from "./desktop/MacDesktop";
import { useMobile } from "@/hooks/useMobile";
import type { PostIndexBundle } from "@/lib/types";

interface Props {
  postIndexBundle: PostIndexBundle;
}

export default function MacOSApp({ postIndexBundle }: Props) {
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

  // Mobile: skip all non-desktop phases, go straight to desktop
  useEffect(() => {
    if (isMobile && systemPhase !== "desktop") {
      setSystemPhase("desktop");
    }
  }, [isMobile, systemPhase, setSystemPhase]);

  return (
    <>
      {systemPhase === "desktop" ? <MacDesktop postIndexBundle={postIndexBundle} /> : <Login />}

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
          <Boot systemPhase={systemPhase} setSystemPhase={setSystemPhase} />
        )}
      </div>
    </>
  );
}
