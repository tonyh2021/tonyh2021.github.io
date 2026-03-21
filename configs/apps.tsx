export interface AppConfig {
  id: string;
  title: string;
  img: string; // dock / spotlight icon image
  icon: string; // emoji fallback (used in Spotlight list)
  iconBg: string; // dock item background colour (unused when img is present)
  desktop: boolean;
  link?: string;
  show?: boolean;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

export const appConfigs = [
  {
    id: "blog",
    title: "Blogs",
    img: "images/icons/medium.png",
    icon: "📝",
    iconBg: "bg-orange-400",
    desktop: true,
    show: true,
    width: 1020,
    height: 620,
    minWidth: 600,
    minHeight: 360,
  },
  {
    id: "about",
    title: "About",
    img: "images/icons/instagram.png",
    icon: "🙋",
    iconBg: "bg-blue-500",
    desktop: true,
    show: true,
    width: 860,
    height: 680,
    minWidth: 320,
    minHeight: 200,
  },
  {
    id: "tags",
    title: "Tags",
    img: "images/icons/mail.png",
    icon: "🏷️",
    iconBg: "bg-purple-500",
    desktop: true,
    show: false,
    width: 640,
    height: 500,
    minWidth: 320,
    minHeight: 250,
  },
  {
    id: "safari",
    title: "Safari",
    img: "images/icons/safari.png",
    icon: "🧭",
    iconBg: "bg-blue-400",
    desktop: true,
    show: true,
    width: 900,
    height: 620,
    minWidth: 400,
    minHeight: 300,
  },
  {
    id: "vscode",
    title: "VSCode",
    img: "images/icons/vscode.png",
    icon: "💙",
    iconBg: "bg-blue-600",
    desktop: true,
    show: true,
    width: 900,
    height: 600,
    minWidth: 400,
    minHeight: 300,
  },
  {
    id: "terminal",
    title: "Terminal",
    img: "images/icons/terminal.png",
    icon: "💻",
    iconBg: "bg-gray-800",
    desktop: true,
    show: true,
    width: 680,
    height: 460,
    minWidth: 360,
    minHeight: 240,
  },
  {
    id: "github",
    title: "GitHub",
    img: "images/icons/github.png",
    icon: "🐙",
    iconBg: "bg-gray-700",
    desktop: false,
    show: true,
    link: "https://github.com/tonyh2021",
  },
] as const satisfies readonly AppConfig[];

export type AppId = (typeof appConfigs)[number]["id"];

/** All desktop window IDs */
export const ALL_WIN_IDS = appConfigs.filter((a) => a.desktop).map((a) => a.id) as AppId[];
