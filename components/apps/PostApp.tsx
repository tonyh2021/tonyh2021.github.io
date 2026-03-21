"use client";

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

export default function PostApp({ post }: Props) {
  if (!post) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-600">
        No post selected
      </div>
    );
  }

  const tags = normalizeTags(post.frontMatter.tags);

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <article className="mx-auto max-w-2xl px-6 py-8 text-gray-800 dark:text-gray-200">
        <h1 className="mb-3 text-2xl leading-snug font-bold text-gray-900 dark:text-white">
          {post.frontMatter.title}
        </h1>

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
