import "highlight.js/styles/github.css";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { normalizeTags } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import MobileShareButton from "@/components/mobile/MobileShareButton";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function getPostSafe(slug: string, locale: "zh" | "en") {
  try { return getPostBySlug(slug, locale); } catch { return null; }
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default async function MobilePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostSafe(slug, "en") ?? getPostSafe(slug, "zh");
  if (!post) notFound();

  const tags = normalizeTags(post.frontMatter.tags);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <header className="space-y-1 border-b border-gray-200 pb-6 text-left dark:border-gray-700">
          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
              <time dateTime={post.frontMatter.date}>
                {formatDate(post.frontMatter.date)}
              </time>
            </dd>
          </dl>
          <h1 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
            {post.frontMatter.title}
          </h1>
        </header>

        <div className="prose prose-gray max-w-none py-8 dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <footer className="divide-y divide-gray-200 text-sm font-medium dark:divide-gray-700">
          {tags.length > 0 && (
            <div className="py-4">
              <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/mobile/tags/${encodeURIComponent(tag)}`}
                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between py-8">
            <Link
              href="/mobile/posts"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← All Posts
            </Link>
            <MobileShareButton slug={slug} title={post.frontMatter.title} />
          </div>
        </footer>
      </article>
    </div>
  );
}
