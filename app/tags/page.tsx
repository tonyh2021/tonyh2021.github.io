import { getAllTags } from "@/lib/posts";

export const metadata = {
  title: "Tags | Tony's Portfolio",
  description: "An archive of posts sorted by tag.",
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TagsPage() {
  const tagMap = getAllTags();
  const sortedTags = Object.keys(tagMap).sort();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-white">Tags</h1>
        <p className="mb-8 text-sm text-gray-400">An archive of posts sorted by tag.</p>

        {/* Tag cloud */}
        <div className="mb-10 flex flex-wrap gap-2">
          {sortedTags.map((tag) => (
            <a
              key={tag}
              href={`#${encodeURIComponent(tag)}`}
              className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-700"
            >
              {tag}
              <span className="ml-1.5 text-xs text-gray-500">{tagMap[tag].length}</span>
            </a>
          ))}
        </div>

        {/* Posts grouped by tag */}
        <div className="space-y-8">
          {sortedTags.map((tag) => (
            <section key={tag} id={encodeURIComponent(tag)}>
              <h2 className="mb-3 border-b border-gray-800 pb-1.5 text-base font-semibold text-gray-300">
                #{tag}
                <span className="ml-2 text-xs font-normal text-gray-500">{tagMap[tag].length}</span>
              </h2>
              <ul className="space-y-1.5">
                {tagMap[tag].map((post) => (
                  <li key={post.slug} className="flex items-baseline gap-3 text-sm">
                    <span className="shrink-0 text-gray-500 tabular-nums">
                      {formatDate(post.frontMatter.date)}
                    </span>
                    <a
                      href={`/posts/${post.slug}/`}
                      className="text-gray-300 transition-colors hover:text-blue-400"
                    >
                      {post.frontMatter.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
