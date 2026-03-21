"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { normalizeTags } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface Props {
  post: Post | null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostContent({ post }: Props) {
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-600">
        No post selected
      </div>
    );
  }

  const tags = normalizeTags(post.frontMatter.tags);
  const postUrl = `${window.location.origin}/posts/${post.slug}/`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.frontMatter.title, url: postUrl });
    } else {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <article className="mx-auto max-w-2xl px-6 py-8 text-gray-800 dark:text-gray-200">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h1 className="text-2xl leading-snug font-bold text-gray-900 dark:text-white">
            {post.frontMatter.title}
          </h1>
          <button
            type="button"
            onClick={handleShare}
            title={copied ? "Copied!" : "Share"}
            className="mt-1 shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            {copied ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(post.frontMatter.date)}</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {tag}
            </span>
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
