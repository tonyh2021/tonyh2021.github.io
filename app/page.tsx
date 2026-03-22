"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BootAnimation from "@/components/BootAnimation";
import { MOBILE_BREAKPOINT_PX } from "@/hooks/useMobile";

type Phase = "black" | "shutdown" | "boot";

function getTarget() {
  return window.innerWidth < MOBILE_BREAKPOINT_PX ? "/mobile" : "/desk";
}

export default function BootPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("black");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("desktopDate") === today) {
      router.replace(getTarget());
      return;
    }
    if (localStorage.getItem("shutdown") === "1") {
      setPhase("shutdown");
    } else {
      setPhase("boot");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "black") return <div className="h-screen w-screen bg-black" />;

  if (phase === "shutdown") {
    const handlePowerOn = () => {
      localStorage.removeItem("shutdown");
      setPhase("boot");
    };
    return (
      <div
        className="h-screen w-screen bg-black"
        onClick={handlePowerOn}
        onKeyDown={handlePowerOn}
        tabIndex={0}
      />
    );
  }

  return (
    <BootAnimation
      onComplete={() => {
        localStorage.setItem("desktopDate", new Date().toISOString().slice(0, 10));
        router.replace(getTarget());
      }}
    />
  );
}
