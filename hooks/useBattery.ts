"use client";

import { useState, useEffect } from "react";

export interface BatteryState {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}
export interface UseBatteryState extends BatteryState {
  isSupported: boolean;
  fetched?: boolean;
}

interface TimeBattery {
  level: number;
  charging: boolean;
}

function getTimeBattery(): TimeBattery {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const chargeEnd = 8 * 60; // 8:00am — fully charged
  const dayEnd = 24 * 60; // midnight — fully drained

  if (minutes <= chargeEnd) {
    // 0:00 → 8:00: charging 0% → 100%
    return { level: minutes / chargeEnd, charging: true };
  }
  // 8:00 → 24:00: discharging 100% → 0%
  return {
    level: 1 - (minutes - chargeEnd) / (dayEnd - chargeEnd),
    charging: false,
  };
}

function useBatteryMock(): UseBatteryState {
  const [bat, setBat] = useState<TimeBattery>({ level: 1, charging: false });

  useEffect(() => {
    setBat(getTimeBattery());
    const timer = setInterval(() => setBat(getTimeBattery()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return {
    isSupported: false,
    chargingTime: 0,
    dischargingTime: 0,
    ...bat,
  };
}

export const useBattery = useBatteryMock;
