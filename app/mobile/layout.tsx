import type { ReactNode } from "react";
import MobileFloatingControls from "@/components/mobile/MobileFloatingControls";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <MobileFloatingControls />
    </div>
  );
}
