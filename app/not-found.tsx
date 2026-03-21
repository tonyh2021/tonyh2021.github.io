import type { Metadata } from "next";
import { Macos404Alert } from "@/components/Macos404Alert";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Page Not Found | ${siteConfig.name}`,
  description: "The requested page does not exist.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <Macos404Alert />;
}
