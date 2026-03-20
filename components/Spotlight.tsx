"use client";

import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { useClickOutside } from "@/hooks/useClickOutside";
import { appConfigs, type AppId } from "@/configs/apps";
import { launchpadApps } from "@/configs/launchpad";

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

const ALL_ITEMS: Item[] = [
  ...appConfigs
    .filter((a) => a.desktop || a.link)
    .map((a) => ({ id: a.id, title: a.title, type: "app" as const })),
  ...launchpadApps.map((a) => ({ ...a, type: "portfolio" as const })),
];

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = () => format(new Date(rand(0, Date.now())), "MM/dd/yyyy");

interface Props {
  openApp: (id: AppId) => void;
  toggleLaunchpad: (v: boolean) => void;
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function Spotlight({
  openApp,
  toggleLaunchpad,
  close,
  btnRef,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useClickOutside(ref, close, [btnRef]);

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = query
    ? ALL_ITEMS.filter(
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
    if (e.key === "ArrowDown")
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
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
      <div className="flex items-center h-14 px-4 gap-3">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-500 dark:text-gray-400 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent text-xl text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Spotlight Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {selected?.img && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={selected.img}
            alt={selected.title}
            className="w-8 h-8 shrink-0"
          />
        )}
      </div>

      {/* Results */}
      {query && results.length > 0 && (
        <div
          className="flex border-t border-gray-200 dark:border-gray-700"
          style={{ height: "340px" }}
        >
          {/* Left: list */}
          <div className="w-44 sm:w-72 border-r border-gray-200 dark:border-gray-700 overflow-y-auto px-2.5 py-1 shrink-0">
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
                      className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-default ${idx === selectedIdx ? "bg-blue-500 text-white" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center text-base">
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
                      className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-default ${idx === selectedIdx ? "bg-blue-500 text-white" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {app.img && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={app.img}
                          alt={app.title}
                          className="w-5 h-5 object-contain shrink-0"
                        />
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
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center gap-3 border-b border-gray-200 dark:border-gray-700 p-4">
                {selected.img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selected.img}
                    alt={selected.title}
                    className="w-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-5xl">
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
              <div className="flex text-xs px-4 py-3 gap-4">
                <div className="text-right text-gray-400 space-y-0.5">
                  <div>Kind</div>
                  <div>Size</div>
                  <div>Created</div>
                  <div>Modified</div>
                  <div>Last opened</div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 space-y-0.5">
                  <div>
                    {selected.type === "app" ? "Application" : "Portfolio"}
                  </div>
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
