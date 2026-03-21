"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

export function BlogPostHeader({ title = "Blogs" }: { title?: string }) {
  const isMobile = useMobile();

  return (
    <header className="relative flex h-11 shrink-0 items-center justify-center border-b border-gray-300/50 bg-gray-200/80 px-2 backdrop-blur dark:border-gray-600/50 dark:bg-gray-800/80">
      <Link
        href="/"
        className="absolute top-1/2 left-1 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
        aria-label="Home"
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden />
      </Link>
      <span
        className={cn(
          "max-w-[60%] truncate px-10 text-center font-semibold text-gray-800 dark:text-gray-100",
          isMobile ? "text-lg" : "text-sm",
        )}
      >
        {title}
      </span>
    </header>
  );
}
