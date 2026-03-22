import type { ReactNode } from "react";
import DeviceGuard from "@/components/DeviceGuard";

export default function DeskLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-black">
      <DeviceGuard />
      {children}
    </div>
  );
}
