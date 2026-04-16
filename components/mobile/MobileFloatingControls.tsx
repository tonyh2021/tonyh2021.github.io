"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import LocaleSwitcher from "@/components/LocaleSwitcher";

const navLinks = [
  { href: "/mobile", label: "Home" },
  { href: "/mobile/posts", label: "Posts" },
  { href: "/mobile/tags", label: "Tags" },
];

function isActive(href: string, pathname: string) {
  if (href === "/mobile") return pathname === "/mobile";
  return pathname.startsWith(href);
}

export default function MobileFloatingControls() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const initLocale = useStore((s) => s.initLocale);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    initLocale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <>
      {/* Floating buttons */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        {pathname.startsWith("/mobile/posts") && <LocaleSwitcher size="md" />}
        <button
          onClick={toggleDark}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-gray-400 backdrop-blur transition-colors hover:bg-gray-100/80 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800/80 dark:hover:text-gray-300"
        >
          {dark ? (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-full p-2 text-gray-400 backdrop-blur transition-colors hover:bg-gray-100/80 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800/80 dark:hover:text-gray-300"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-60 bg-black/25" onClick={() => setMenuOpen(false)} />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 left-0 z-70 h-full w-full bg-white/95 transition-transform duration-300 ease-in-out dark:bg-gray-950/98 ${
          menuOpen ? "translate-x-0 opacity-95" : "-translate-x-full opacity-0"
        }`}
      >
        <nav className="mt-8 flex h-full flex-col items-start overflow-y-auto pt-2 pl-12">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`mb-4 py-2 pr-4 text-2xl font-bold tracking-widest transition-colors ${
                isActive(href, pathname)
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-900 hover:text-blue-500 dark:text-gray-100 dark:hover:text-blue-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className="fixed top-7 right-4 z-80 h-16 w-16 p-4 text-gray-900 hover:text-blue-500 dark:text-gray-100 dark:hover:text-blue-400"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
