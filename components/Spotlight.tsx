"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useClickOutside } from "@/hooks/useClickOutside";
import { appConfigs, type AppId } from "@/configs/apps";
import { resolveImageSrc } from "@/lib/imageSrc";

type AppItem = {
  id: AppId;
  title: string;
  img?: string;
  link?: undefined;
  type: "app";
};

type PortfolioItem = {
  id: string;
  title: string;
  img?: string;
  link?: string;
  type: "portfolio";
};

type Item = AppItem | PortfolioItem;

const APP_ITEMS: AppItem[] = appConfigs
  .filter((a) => a.desktop || a.link)
  .map((a) => ({ id: a.id, title: a.title, type: "app" as const }));

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = () => format(new Date(rand(0, Date.now())), "MM/dd/yyyy");

interface Props {
  openApp: (id: AppId) => void;
  toggleLaunchpad: (v: boolean) => void;
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement | null>;
}

export default function Spotlight({ openApp, toggleLaunchpad, close, btnRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useClickOutside(ref, close, [btnRef]);

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  /** Loaded on mount — Spotlight only mounts when opened, so `launchpad` is not in the main graph until then. */
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/configs/launchpad").then((m) => {
      if (!cancelled) {
        setPortfolioItems(
          m.launchpadApps.map((a) => ({ ...a, type: "portfolio" as const })),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const allItems = useMemo((): Item[] => {
    if (!portfolioItems) return APP_ITEMS;
    return [...APP_ITEMS, ...portfolioItems];
  }, [portfolioItems]);

  const results = query
    ? allItems.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.id.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const selected = results[selectedIdx] ?? null;

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const launch = (item: Item) => {
    if (item.link) {
      window.open(item.link, "_blank");
      close();
      return;
    }
    if (item.id === "launchpad") {
      toggleLaunchpad(true);
      close();
      return;
    }
    if (item.type === "app") openApp(item.id);
    close();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    else if (e.key === "ArrowUp") setSelectedIdx((i) => Math.max(i - 1, 0));
    else if (e.key === "Enter" && selected) launch(selected);
    else if (e.key === "Escape") close();
  };

  const apps = results.filter((r) => r.type === "app");
  const portfolio = results.filter((r) => r.type === "portfolio");

  return (
    <div
      ref={ref}
      className="spotlight"
      onKeyDown={handleKey}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Search input row */}
      <div className="flex h-14 items-center gap-3 px-4">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-gray-500 dark:text-gray-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent text-xl text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
          placeholder="Spotlight Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {selected?.img && (
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src={resolveImageSrc(selected.img)}
              alt={selected.title}
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Results */}
      {query && results.length > 0 && (
        <div
          className="flex border-t border-gray-200 dark:border-gray-700"
          style={{ height: "340px" }}
        >
          {/* Left: list */}
          <div className="w-44 shrink-0 overflow-y-auto border-r border-gray-200 px-2.5 py-1 sm:w-72 dark:border-gray-700">
            {apps.length > 0 && (
              <>
                <div className="spotlight-type">Applications</div>
                {apps.map((app) => {
                  const idx = results.indexOf(app);
                  return (
                    <div
                      key={app.id}
                      onClick={() => launch(app)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`flex cursor-default items-center gap-2 rounded px-2 py-1 text-xs ${idx === selectedIdx ? "bg-blue-500 text-white" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-base">
                        {appConfigs.find((a) => a.id === app.id)?.icon ?? "📦"}
                      </div>
                      <span className="truncate">{app.title}</span>
                    </div>
                  );
                })}
              </>
            )}
            {portfolio.length > 0 && (
              <>
                <div className="spotlight-type mt-1.5">Portfolio</div>
                {portfolio.map((app) => {
                  const idx = results.indexOf(app);
                  return (
                    <div
                      key={app.id}
                      onClick={() => launch(app)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`flex cursor-default items-center gap-2 rounded px-2 py-1 text-xs ${idx === selectedIdx ? "bg-blue-500 text-white" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {app.img && (
                        <div className="relative h-5 w-5 shrink-0">
                          <Image
                            src={resolveImageSrc(app.img)}
                            alt={app.title}
                            fill
                            sizes="20px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="truncate">{app.title}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Right: detail */}
          {selected && (
            <div className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col items-center justify-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
                {selected.img ? (
                  <div className="relative h-24 w-24">
                    <Image
                      src={resolveImageSrc(selected.img)}
                      alt={selected.title}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center text-5xl">
                    {appConfigs.find((a) => a.id === selected.id)?.icon ?? "📦"}
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {selected.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    Version {rand(0, 9)}.{rand(0, 99)}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 px-4 py-3 text-xs">
                <div className="space-y-0.5 text-right text-gray-400">
                  <div>Kind</div>
                  <div>Size</div>
                  <div>Created</div>
                  <div>Modified</div>
                  <div>Last opened</div>
                </div>
                <div className="space-y-0.5 text-gray-700 dark:text-gray-300">
                  <div>{selected.type === "app" ? "Application" : "Portfolio"}</div>
                  <div>{rand(1, 999)} MB</div>
                  <div>{randDate()}</div>
                  <div>{randDate()}</div>
                  <div>{randDate()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
