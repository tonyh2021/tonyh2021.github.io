export interface TerminalEntry {
  id: string;
  title: string;
  type: "folder" | "file";
  content?: React.ReactNode;
  children?: TerminalEntry[];
}

const terminalData: TerminalEntry[] = [
  {
    id: "about",
    title: "about",
    type: "folder",
    children: [
      {
        id: "about-bio",
        title: "bio.txt",
        type: "file",
        content: (
          <div className="py-1">
            Hi, I&apos;m Tony Han — a software engineer who loves exploring new
            tech and building things. I write about iOS, Swift, web dev, and
            whatever I find interesting.
          </div>
        ),
      },
      {
        id: "about-interests",
        title: "interests.txt",
        type: "file",
        content: "iOS / Swift / React / Next.js / AI / Open Source",
      },
      {
        id: "about-contact",
        title: "contact.txt",
        type: "file",
        content: (
          <ul className="list-disc ml-6">
            <li>
              GitHub:{" "}
              <a
                className="text-blue-300"
                href="https://github.com/tonyh2021"
                target="_blank"
                rel="noreferrer"
              >
                @tonyh2021
              </a>
            </li>
            <li>
              Stack Overflow:{" "}
              <a
                className="text-blue-300"
                href="https://stackoverflow.com/users/4172900/tony"
                target="_blank"
                rel="noreferrer"
              >
                tony
              </a>
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "dream",
    title: "my-dream.SKILLS",
    type: "file",
    content: (
      <div className="py-1 font-mono">
        <div>
          <span className="text-pink-400">while</span>{" "}
          <span className="text-blue-300">true</span> {"{"}{" "}
        </div>
        <div className="ml-8">
          <span className="text-green-300">// keep building cool things</span>
        </div>
        <div>{"}"}</div>
      </div>
    ),
  },
];

export default terminalData;
