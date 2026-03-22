import { user } from "@/configs/user";

export default function MobileAbout() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Profile + content */}
        <div className="py-6">
          {/* Avatar + info */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar}
              alt={user.name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full"
            />
            <div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {user.name}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Full Stack Developer
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {["React", "Next.js", "iOS", "React Native", "Flutter", "AI"].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href="https://github.com/tonyh2021"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://stackoverflow.com/users/4172900/tony"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                Stack Overflow
              </a>
            </div>
          </div>

          {/* Bio */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>{"Hi. I'm Tony."}</p>
            <p>
              {`I'm naturally curious and a little skeptical about the world. Repetitive things or
              anything that lacks creativity lose my interest pretty quickly. I'm always drawn to
              ideas, technologies, or perspectives that feel fresh and a bit different. If you ever
              come across something genuinely interesting or new, feel free to share it with me.`}
            </p>
            <blockquote>And one more thing…</blockquote>
            <p>{`We're here to put a dent in the universe. Otherwise why else even be here?`}</p>
            <p className="text-sm">
              {`Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs
              in the square holes. The ones who see things differently. They're not fond of rules.
              And they have no respect for the status quo. You can quote them, disagree with them,
              glorify or vilify them. About the only thing you can't do is ignore them. Because they
              change things. They push the human race forward. And while some may see them as the
              crazy ones, we see genius. Because the people who are crazy enough to think they can
              change the world, are the ones who do.`}
            </p>
            <p className="text-right text-sm text-gray-500 not-italic">— Steve Jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
