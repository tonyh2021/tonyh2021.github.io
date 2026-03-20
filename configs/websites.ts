export interface SiteData {
  id: string;
  title: string;
  img?: string;
  link: string;
  /** Open in inner iframe instead of new tab */
  inner?: boolean;
}

export interface SiteSection {
  title: string;
  sites: SiteData[];
}

export const websites: { favorites: SiteSection; freq: SiteSection } = {
  favorites: {
    title: "My Links",
    sites: [
      {
        id: "my-github",
        title: "GitHub",
        img: "/images/apps/github.png",
        link: "https://github.com/tonyh2021",
      },
      {
        id: "my-stackoverflow",
        title: "Stack Overflow",
        img: "/images/apps/stackoverflow.png",
        link: "https://stackoverflow.com/users/4172900/tony",
      },
      {
        id: "linkedin",
        title: "LinkedIn",
        img: "/images/apps/linkedin.png",
        link: "https://www.linkedin.com/in/tonyh2021/",
      },
    ],
  },
  freq: {
    title: "Frequently Visited",
    sites: [
      {
        id: "google",
        title: "Google",
        img: "/images/apps/google.png",
        link: "https://google.com",
      },
      {
        id: "chatgpt",
        title: "ChatGPT",
        img: "/images/apps/openai.png",
        link: "https://chatgpt.com",
      },
      {
        id: "anthropic",
        title: "Claude",
        img: "/images/apps/anthropic.png",
        link: "https://claude.ai/new",
      },
      {
        id: "stackoverflow",
        title: "Stack Overflow",
        img: "/images/apps/stackoverflow.png",
        link: "https://stackoverflow.com",
      },
      {
        id: "reddit",
        title: "Reddit",
        img: "/images/apps/reddit.png",
        link: "https://www.reddit.com",
      },
      {
        id: "react",
        title: "React",
        img: "https://react.dev/favicon.ico",
        link: "https://react.dev",
      },
      {
        id: "appledev",
        title: "Apple Dev",
        img: "https://developer.apple.com/favicon.ico",
        link: "https://developer.apple.com",
      },
    ],
  },
};
