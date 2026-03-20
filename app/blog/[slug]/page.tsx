import { getAllSlugs, getPostBySlug, normalizeTags, detectLocale } from "@/lib/posts";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const locale = detectLocale(headers().get('accept-language'));
  const post = getPostBySlug(params.slug, locale);
  return {
    title: `${post.frontMatter.title} | Tony's Portfolio`,
    description: post.frontMatter.description ?? "",
  };
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const locale = detectLocale(headers().get('accept-language'));
  const post = getPostBySlug(params.slug, locale);
  const tags = normalizeTags(post.frontMatter.tags);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />

      {/* Top bar */}
      <header className="sticky top-0 z-10 h-10 flex items-center px-4 bg-gray-900/80 backdrop-blur border-b border-gray-800 text-sm">
        <a
          href="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Desktop
        </a>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-3 text-white leading-snug">
          {post.frontMatter.title}
        </h1>

        <div className="flex items-center flex-wrap gap-2 mb-8 text-sm text-gray-400">
          <time>{formatDate(post.frontMatter.date)}</time>
          {tags.map((tag) => (
            <a
              key={tag}
              href={`/tags/#${encodeURIComponent(tag)}`}
              className="px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded text-xs hover:bg-blue-800/60 transition-colors"
            >
              {tag}
            </a>
          ))}
        </div>

        <div className="md-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
