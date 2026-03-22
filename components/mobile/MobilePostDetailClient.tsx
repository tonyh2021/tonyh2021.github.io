"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { normalizeTags } from "@/lib/utils";

function BackToPosts() {
  return (
    <Link
      href="/mobile/posts"
      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
    >
      ← All Posts
    </Link>
  );
}
import { postBodyJsonUrl } from "@/lib/postBodyUrl";
import type { Post, PostIndex } from "@/lib/types";
import type { Locale } from "@/lib/postBundle";

const LOCALE_KEY = "mobileLocale";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  slug: string;
}

export default function MobilePostDetailClient({ slug }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_KEY) as Locale | null;
    const locale: Locale =
      savedLocale === "zh" || savedLocale === "en"
        ? savedLocale
        : navigator.language.toLowerCase().startsWith("zh")
          ? "zh"
          : "en";

    const primary: PostIndex = {
      slug,
      frontMatter: { title: "", date: "" },
      excerpt: "",
      bodyLocale: locale,
    };
    const fallback: PostIndex = {
      slug,
      frontMatter: { title: "", date: "" },
      excerpt: "",
      bodyLocale: locale === "zh" ? "en" : "zh",
    };

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(postBodyJsonUrl(primary));
        if (res.ok) {
          setPost((await res.json()) as Post);
          return;
        }
      } catch {
        /* fall through */
      }
      try {
        const res = await fetch(postBodyJsonUrl(fallback));
        if (res.ok) {
          setPost((await res.json()) as Post);
          return;
        }
      } catch {
        /* both failed */
      }
      setError("Could not load post.");
    }

    void load().finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${slug}/`;
    if (navigator.share) {
      await navigator.share({ title: post?.frontMatter.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
        Loading…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{error ?? "Post not found."}</p>
        <BackToPosts />
      </div>
    );
  }

  const tags = normalizeTags(post.frontMatter.tags);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article>
        {/* Header */}
        <header className="space-y-1 border-b border-gray-200 pb-6 text-left dark:border-gray-700">
          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="text-sm leading-6 font-medium text-gray-500 dark:text-gray-400">
              <time dateTime={post.frontMatter.date}>{formatDate(post.frontMatter.date)}</time>
            </dd>
          </dl>
          <h1 className="text-2xl leading-9 font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {post.frontMatter.title}
          </h1>
        </header>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none py-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <footer className="divide-y divide-gray-200 text-sm font-medium dark:divide-gray-700">
          {tags.length > 0 && (
            <div className="py-4">
              <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/mobile?tag=${tag}`}
                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-8">
            <BackToPosts />
            <button
              onClick={handleShare}
              title={copied ? "Copied!" : "Share"}
              className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {copied ? (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
              <span className="text-xs">{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
