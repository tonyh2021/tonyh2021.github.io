"use client";

export default function AboutApp() {
  return (
    <div className="h-full overflow-y-auto bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Hi. I&apos;m Tony.
        </h1>

        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          I’m naturally curious and a little skeptical about the world. Repetitive things or
          anything that lacks creativity lose my interest pretty quickly. I’m always drawn to ideas,
          technologies, or perspectives that feel fresh and a bit different. If you ever come across
          something genuinely interesting or new, feel free to share it with me.
        </p>

        <blockquote className="my-6 border-l-4 border-indigo-500 pl-4 text-gray-600 italic dark:text-gray-400">
          And one more thing…
        </blockquote>

        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {`We're here to put a dent in the universe. Otherwise why else even be here?`}
        </p>

        <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {`Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They're not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can't do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.`}
        </p>

        <p className="mb-8 text-right text-sm text-gray-500 dark:text-gray-500">— Steve Jobs</p>
      </div>
    </div>
  );
}
