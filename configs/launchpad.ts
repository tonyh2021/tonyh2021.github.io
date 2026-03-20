export interface LaunchpadItem {
  id: string;
  title: string;
  img: string;
  link: string;
}

export const launchpadApps: LaunchpadItem[] = [
  {
    id: "github",
    title: "GitHub",
    img: "/images/apps/github.png",
    link: "https://github.com/tonyh2021",
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    img: "/images/apps/linkedin.png",
    link: "https://www.linkedin.com/in/tonyh2021/",
  },
  {
    id: "stackoverflow",
    title: "Stack Overflow",
    img: "/images/apps/stackoverflow.png",
    link: "https://stackoverflow.com/users/4172900/tony",
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    img: "/images/apps/openai.png",
    link: "https://chatgpt.com",
  },
  {
    id: "figma",
    title: "Figma",
    img: "/images/apps/figma.png",
    link: "https://figma.com",
  },
  {
    id: "youtube",
    title: "YouTube",
    img: "/images/apps/youtube.png",
    link: "https://youtube.com",
  },
  {
    id: "reddit",
    title: "Reddit",
    img: "/images/apps/reddit.png",
    link: "https://www.reddit.com",
  },
];
