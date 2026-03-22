import { getAllTags, getAllPosts } from "@/lib/posts";
import { normalizeTags } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileHeader";

export async function generateStaticParams() {
  const tagMap = getAllTags();
  return Object.keys(tagMap).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MobileTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getAllPosts().filter((p) =>
    normalizeTags(p.frontMatter.tags).includes(decoded),
  );

  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <MobileHeader title={`#${decoded}`} />
      <div className="pb-4">
        <Link
          href="/mobile/tags"
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← All tags
        </Link>
      </div>
      <ul>
        {posts.map((post) => {
          const tags = normalizeTags(post.frontMatter.tags);
          return (
            <li key={post.slug} className="py-5">
              <article className="flex flex-col space-y-2 xl:space-y-0">
                <dl>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={post.frontMatter.date}>
                      {formatDate(post.frontMatter.date)}
                    </time>
                  </dd>
                </dl>
                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold leading-8 tracking-tight">
                      <Link
                        href={`/mobile/posts/${post.slug}`}
                        className="text-gray-900 dark:text-gray-100"
                      >
                        {post.frontMatter.title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((t) => (
                        <Link
                          key={t}
                          href={`/mobile/tags/${encodeURIComponent(t)}`}
                          className={`mr-3 mt-2 text-sm font-medium uppercase ${
                            t === decoded
                              ? "text-blue-600 dark:text-blue-300"
                              : "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          }`}
                        >
                          {t}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
