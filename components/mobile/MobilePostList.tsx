"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { resolvePostIndices } from "@/lib/postBundle";
import { normalizeTags } from "@/lib/utils";
import type { PostIndexBundle } from "@/lib/types";
import MobileHeader from "@/components/mobile/MobileHeader";
import { useStore } from "@/store";

const SCROLL_KEY = "postListScrollTop";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  postIndexBundle: PostIndexBundle;
}

export default function MobilePostList({ postIndexBundle }: Props) {
  const locale = useStore((s) => s.locale);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Save scroll position on unmount
    return () => {
      const main = divRef.current?.parentElement;
      if (main) sessionStorage.setItem(SCROLL_KEY, String(main.scrollTop));
    };
  }, []);

  // Restore scroll position after mount (before paint)
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const main = divRef.current?.parentElement;
      if (main) main.scrollTop = Number(saved);
    }
  }, []);

  const indices = resolvePostIndices(postIndexBundle, locale);

  return (
    <div ref={divRef} className="mx-auto max-w-3xl px-4 py-8">
      <MobileHeader title="Posts" />
      {/* Post list */}
      <ul>
        {indices.map((post) => {
          const tags = normalizeTags(post.frontMatter.tags);
          return (
            <li key={post.slug} className="py-5">
              <article className="flex flex-col space-y-2 xl:space-y-0">
                <dl>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={post.frontMatter.date}>
                      {formatDate(post.frontMatter.date)}
                    </time>
                  </dd>
                </dl>
                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl leading-8 font-bold tracking-tight">
                      <Link
                        href={`/mobile/posts/${post.slug}`}
                        className="text-gray-900 dark:text-gray-100"
                      >
                        {post.frontMatter.title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="mt-2 mr-3 text-sm font-medium text-blue-500 uppercase hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                    {post.excerpt}
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
