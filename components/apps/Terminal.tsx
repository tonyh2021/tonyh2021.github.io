"use client";

import React, { useState, useRef, useEffect } from "react";
import { useInterval } from "@/hooks/useInterval";
import terminalData, { type TerminalEntry } from "@/configs/terminal";

/* ── rm -rf easter egg ─────────────────────────────────────── */
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG";
const EMOJIS = [
  "\\(o_o)/",
  "(˚Δ˚)b",
  "(^-^*)",
  "(╯‵□′)╯",
  "\\(°ˊДˋ°)/",
  "╰(‵□′)╯",
];

function MatrixRain({ onClose }: { onClose: () => void }) {
  const FONT = 12;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drops, setDrops] = useState<number[]>([]);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  useEffect(() => {
    const c = containerRef.current;
    const cv = canvasRef.current;
    if (!c || !cv) return;
    cv.width = c.offsetWidth;
    cv.height = c.offsetHeight;
    setDrops(Array(Math.floor(cv.width / FONT)).fill(1));
  }, []);

  useInterval(() => {
    const cv = canvasRef.current;
    if (!cv || drops.length === 0) return;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#2e9244";
    ctx.font = `${FONT}px monospace`;
    drops.forEach((y, x) =>
      ctx.fillText(
        CHARS[Math.floor(Math.random() * CHARS.length)],
        x * FONT,
        y * FONT,
      ),
    );
    setDrops((d) =>
      d.map((y) => (y * FONT > cv.height && Math.random() > 0.975 ? 1 : y + 1)),
    );
  }, 33);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-black text-white cursor-pointer"
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <div className="text-4xl">{emoji}</div>
        <div className="text-3xl font-bold">HOW DARE YOU!</div>
        <div className="text-sm">Click to go back</div>
      </div>
    </div>
  );
}

/* ── Terminal ───────────────────────────────────────────────── */
type Row = { key: string; el: React.ReactNode };

const ZSH_THEMES = [
  "half-life",
  "agnoster",
  "robbyrussell",
  "fino",
  "bira",
  "cloud",
  "dst",
  "gnzh",
  "kafeitu",
  "kolo",
  "mh",
  "mortalscumbag",
  "nanotech",
  "norm",
  "ys",
  "sorin",
  "candy",
];

function fmtLastLogin() {
  const d = new Date(Date.now() - Math.floor(Math.random() * 8 + 1) * 3600_000);
  return `Last login: ${d.toDateString().slice(0, 3)} ${d.toDateString().slice(4)} ${d.toTimeString().slice(0, 8)} on ttys00${Math.floor(Math.random() * 9) + 1}`;
}

export default function Terminal() {
  const [rows, setRows] = useState<Row[]>([]);
  const [rmrf, setRmrf] = useState(false);
  const lastLogin = useRef(fmtLastLogin()).current;
  const zshTheme = useRef(
    ZSH_THEMES[Math.floor(Math.random() * ZSH_THEMES.length)],
  ).current;
  const inputCounterRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(0);
  const dirPathRef = useRef<string[]>([]);

  const getChildren = (): TerminalEntry[] => {
    let nodes: TerminalEntry[] = terminalData;
    for (const seg of dirPathRef.current) {
      const found = nodes.find((n) => n.title === seg && n.type === "folder");
      if (!found || !found.children) break;
      nodes = found.children;
    }
    return nodes;
  };

  const addRow = (row: Row) =>
    setRows((r) => (r.find((x) => x.key === row.key) ? r : [...r, row]));

  const buildPrompt = (id: number) => (
    <div key={`inp-${id}`} className="flex items-center gap-1 mt-1">
      <span className="text-green-400 shrink-0">tony</span>
      <span className="text-gray-500 shrink-0">@</span>
      <span className="text-cyan-400 shrink-0">macbook</span>
      <span className="text-gray-500 shrink-0 mx-0.5">:</span>
      <span className="text-blue-400 shrink-0">
        ~{dirPathRef.current.length ? "/" + dirPathRef.current.join("/") : ""}
      </span>
      <span className="text-yellow-300 shrink-0 ml-1">%</span>
      <input
        id={`ti-${id}`}
        className="flex-1 min-w-0 text-white bg-transparent outline-none caret-green-400"
        onKeyDown={handleKey}
      />
    </div>
  );

  const addResult = (id: number, content: React.ReactNode) =>
    addRow({
      key: `res-${id}`,
      el: (
        <div key={`res-${id}`} className="break-all">
          {content}
        </div>
      ),
    });

  // commands
  const cd = (arg?: string) => {
    const id = inputCounterRef.current;
    if (!arg || arg === "~") {
      dirPathRef.current = [];
      return;
    }
    if (arg === ".") return;
    if (arg === "..") {
      dirPathRef.current = dirPathRef.current.slice(0, -1);
      return;
    }
    const target = getChildren().find(
      (n) => n.title === arg && n.type === "folder",
    );
    if (!target) addResult(id, <span>cd: no such directory: {arg}</span>);
    else dirPathRef.current = [...dirPathRef.current, arg];
  };

  const ls = () => {
    const id = inputCounterRef.current;
    addResult(
      id,
      <div className="grid grid-cols-4 w-full">
        {getChildren().map((n) => (
          <span
            key={n.id}
            className={n.type === "file" ? "text-white" : "text-purple-300"}
          >
            {n.title}
          </span>
        ))}
      </div>,
    );
  };

  const cat = (arg?: string) => {
    const id = inputCounterRef.current;
    const file = getChildren().find(
      (n) => n.title === arg && n.type === "file",
    );
    if (!file)
      addResult(id, <span>cat: {arg}: No such file or directory</span>);
    else addResult(id, <span>{file.content}</span>);
  };

  const clear = () => {
    inputCounterRef.current += 1;
    setRows([]);
  };

  const help = () => {
    addResult(
      inputCounterRef.current,
      <ul className="list-disc ml-6 pb-1.5 space-y-0.5">
        {[
          ["cat <file>", "print file contents"],
          ["cd <dir>", 'change directory; "cd .." parent, "cd" root'],
          ["ls", "list current directory"],
          ["clear", "clear screen"],
          ["help", "show this menu"],
          ["rm -rf /", ":)"],
          ["↑ / ↓", "history navigation"],
          ["Tab", "autocomplete"],
        ].map(([cmd, desc]) => (
          <li key={cmd}>
            <span className="text-red-400">{cmd}</span> — {desc}
          </li>
        ))}
      </ul>,
    );
  };

  const autoComplete = (text: string) => {
    if (!text) return text;
    const [cmd, arg] = text.split(" ");
    const cmds = ["cd", "ls", "cat", "clear", "help"];
    if (!arg) {
      const match = cmds.find((c) => c.startsWith(cmd));
      return match ?? text;
    }
    if (cmd === "cd" || cmd === "cat") {
      const type = cmd === "cd" ? "folder" : "file";
      const match = getChildren().find(
        (n) => n.type === type && n.title.startsWith(arg),
      );
      return match ? `${cmd} ${match.title}` : text;
    }
    return text;
  };

  const focusLast = () => {
    const el = document.getElementById(
      `ti-${inputCounterRef.current}`,
    ) as HTMLInputElement;
    el?.focus({ preventScroll: true });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inp = e.currentTarget;
    const text = inp.value.trim();
    const [cmd, arg] = text.split(" ");

    if (e.key === "Enter") {
      historyRef.current.push(text);
      histIdxRef.current = historyRef.current.length;
      inp.setAttribute("readonly", "true");
      if (text.startsWith("rm -rf")) {
        setRmrf(true);
      } else if (cmd === "cd") cd(arg);
      else if (cmd === "ls") ls();
      else if (cmd === "cat") cat(arg);
      else if (cmd === "clear") {
        clear();
        inputCounterRef.current += 1;
        addRow({
          key: `inp-${inputCounterRef.current}`,
          el: buildPrompt(inputCounterRef.current),
        });
        return;
      } else if (cmd === "help") help();
      else if (cmd)
        addResult(
          inputCounterRef.current,
          <span>zsh: command not found: {cmd}</span>,
        );
      inputCounterRef.current += 1;
      addRow({
        key: `inp-${inputCounterRef.current}`,
        el: buildPrompt(inputCounterRef.current),
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdxRef.current > 0)
        inp.value = historyRef.current[--histIdxRef.current];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdxRef.current < historyRef.current.length) {
        histIdxRef.current++;
        inp.value =
          histIdxRef.current === historyRef.current.length
            ? ""
            : historyRef.current[histIdxRef.current];
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      inp.value = autoComplete(text);
    }
  };

  useEffect(() => {
    addRow({ key: `inp-0`, el: buildPrompt(0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After rows render: focus latest input (skip initial mount) & scroll to bottom
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) {
      // Only auto-focus after the first user interaction (not on initial mount)
      // to prevent mobile keyboard popup shifting the Dock
      focusLast();
    } else {
      mountedRef.current = true;
    }
    // Scroll within the terminal container only — avoid scrollIntoView which
    // traverses ancestors and can shift fixed elements like the Dock
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <div
      className="relative flex flex-col h-full bg-[#1e1e2e] text-white text-sm font-mono cursor-text"
      onClick={focusLast}
    >
      {rmrf && <MatrixRain onClose={() => setRmrf(false)} />}

      {/* Scrollable content */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        <div className="pb-1 space-y-0.5">
          <div className="text-gray-400">{lastLogin}</div>
          <div className="text-yellow-400/90">
            [oh-my-zsh] Random theme{" "}
            <span className="text-green-400">'{zshTheme}'</span> loaded
          </div>
        </div>
        {rows.map((r) => r.el)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
