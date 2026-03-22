import type { ReactNode } from "react";

export default function DeskLayout({ children }: { children: ReactNode }) {
  return <div className="bg-black">{children}</div>;
}
