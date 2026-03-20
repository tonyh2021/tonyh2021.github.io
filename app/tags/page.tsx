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
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2 text-white">Tags</h1>
        <p className="text-sm text-gray-400 mb-8">
          An archive of posts sorted by tag.
        </p>

        {/* Tag cloud */}
        <div className="flex flex-wrap gap-2 mb-10">
          {sortedTags.map((tag) => (
            <a
              key={tag}
              href={`#${encodeURIComponent(tag)}`}
              className="px-3 py-1 rounded-full bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {tag}
              <span className="ml-1.5 text-xs text-gray-500">
                {tagMap[tag].length}
              </span>
            </a>
          ))}
        </div>

        {/* Posts grouped by tag */}
        <div className="space-y-8">
          {sortedTags.map((tag) => (
            <section key={tag} id={encodeURIComponent(tag)}>
              <h2 className="text-base font-semibold text-gray-300 mb-3 pb-1.5 border-b border-gray-800">
                #{tag}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {tagMap[tag].length}
                </span>
              </h2>
              <ul className="space-y-1.5">
                {tagMap[tag].map((post) => (
                  <li
                    key={post.slug}
                    className="flex items-baseline gap-3 text-sm"
                  >
                    <span className="text-gray-500 tabular-nums shrink-0">
                      {formatDate(post.frontMatter.date)}
                    </span>
                    <a
                      href={`/blog/${post.slug}/`}
                      className="text-gray-300 hover:text-blue-400 transition-colors"
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
