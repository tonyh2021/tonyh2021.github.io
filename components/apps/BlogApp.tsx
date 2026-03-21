"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { normalizeTags } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { useMobile } from "@/hooks/useMobile";
import { usePostLocale } from "@/hooks/usePostLocale";
import ArticleContent from "@/components/apps/ArticleContent";

function stripMd(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
    .replace(/>\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  posts: Post[];
  enPosts: Post[];
}

type FilterType =
  | { kind: "all" }
  | { kind: "tag"; value: string }
  | { kind: "year"; value: string };

export default function BlogApp({ posts, enPosts }: Props) {
  const isMobile = useMobile();
  const router = useRouter();
  const locale = usePostLocale("en");
  posts = locale === "zh" ? posts : enPosts;
  const [filter, setFilter] = useState<FilterType>({ kind: "all" });
  const [selectedPost, setSelectedPost] = useState<Post | null>(posts[0] ?? null);

  useEffect(() => {
    setFilter({ kind: "all" });
    setSelectedPost(posts[0] ?? null);
  }, [locale, posts]);

  // Build tag map
  const tagCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of normalizeTags(post.frontMatter.tags)) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const tags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Build year map
  const yearCounts: Record<string, number> = {};
  for (const post of posts) {
    const year = post.frontMatter.date.slice(0, 4);
    yearCounts[year] = (yearCounts[year] ?? 0) + 1;
  }
  const years = Object.keys(yearCounts).sort((a, b) => Number(b) - Number(a));

  const filteredPosts =
    filter.kind === "all"
      ? posts
      : filter.kind === "tag"
        ? posts.filter((p) => normalizeTags(p.frontMatter.tags).includes(filter.value))
        : posts.filter((p) => p.frontMatter.date.startsWith(filter.value));

  const applyFilter = (f: FilterType) => {
    setFilter(f);
    const first =
      f.kind === "all"
        ? posts[0]
        : f.kind === "tag"
          ? posts.find((p) => normalizeTags(p.frontMatter.tags).includes(f.value))
          : posts.find((p) => p.frontMatter.date.startsWith(f.value));
    setSelectedPost(first ?? null);
  };

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex h-full flex-col bg-gray-50 select-none dark:bg-gray-800">
        {/* Filter chips */}
        <div
          className="flex shrink-0 gap-2 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter.kind === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
            onClick={() => applyFilter({ kind: "all" })}
          >
            All ({posts.length})
          </button>
          {years.map((year) => (
            <button
              key={year}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter.kind === "year" && filter.value === year ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
              onClick={() => applyFilter({ kind: "year", value: year })}
            >
              {year}
            </button>
          ))}
          {tags.map((tag) => (
            <button
              key={tag}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter.kind === "tag" && filter.value === tag ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
              onClick={() => applyFilter({ kind: "tag", value: tag })}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Post list */}
        <ul className="flex-1 overflow-y-auto">
          {filteredPosts.map((post) => {
            const excerpt = stripMd(post.content).slice(0, 80);
            return (
              <li
                key={post.slug}
                className="flex flex-col border-b border-gray-200 px-4 py-3 active:bg-gray-100 dark:border-gray-700 dark:active:bg-gray-700/50"
                onClick={() => router.push(`/blog/${post.slug}`)}
              >
                <span className="mb-1 text-sm leading-snug font-semibold text-gray-900 dark:text-gray-100">
                  {post.frontMatter.title}
                </span>
                <span className="mb-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(post.frontMatter.date)}
                </span>
                <span className="line-clamp-2 text-xs leading-snug text-gray-500 dark:text-gray-400">
                  {excerpt || "—"}
                </span>
              </li>
            );
          })}
          {filteredPosts.length === 0 && (
            <li className="flex h-24 items-center justify-center text-xs text-gray-400">
              No posts
            </li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex h-full select-none">
      {/* ── Column 1: Sidebar ─────────────────────────────── */}
      <div className="w-36 shrink-0 overflow-y-auto bg-gray-200 text-sm text-gray-800 dark:bg-gray-700 dark:text-white">
        {/* All Posts */}
        <ul className="pt-1">
          <li
            className={`flex h-8 cursor-default items-center gap-2 pl-4 transition-colors ${
              filter.kind === "all"
                ? "bg-orange-500 text-white"
                : "hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => applyFilter({ kind: "all" })}
          >
            <span>📚</span>
            <span className="truncate">Blogs</span>
            <span
              className={`ml-auto pr-2 text-xs ${filter.kind === "all" ? "text-white/70" : "text-gray-500 dark:text-gray-500"}`}
            >
              {posts.length}
            </span>
          </li>
        </ul>

        {/* Years */}
        <div className="mt-3 mb-1 px-4 text-[10px] tracking-wider text-gray-400 uppercase">
          Years
        </div>
        <ul>
          {years.map((year) => (
            <li
              key={year}
              className={`flex h-8 cursor-default items-center pl-4 transition-colors ${
                filter.kind === "year" && filter.value === year
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => applyFilter({ kind: "year", value: year })}
            >
              <span className="mr-1.5 text-xs text-gray-400">📅</span>
              <span className="flex-1 truncate">{year}</span>
              <span
                className={`ml-auto shrink-0 pr-2 text-xs ${filter.kind === "year" && filter.value === year ? "text-white/70" : "text-gray-500"}`}
              >
                {yearCounts[year]}
              </span>
            </li>
          ))}
        </ul>

        {/* Tags */}
        <div className="mt-3 mb-1 px-4 text-[10px] tracking-wider text-gray-400 uppercase">
          Tags
        </div>
        <ul>
          {tags.map((tag) => (
            <li
              key={tag}
              className={`flex h-8 cursor-default items-center pl-4 transition-colors ${
                filter.kind === "tag" && filter.value === tag
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => applyFilter({ kind: "tag", value: tag })}
            >
              <span className="mr-1.5 text-xs text-gray-400">#</span>
              <span className="flex-1 truncate">{tag}</span>
              <span
                className={`ml-auto shrink-0 pr-2 text-xs ${filter.kind === "tag" && filter.value === tag ? "text-white/70" : "text-gray-500"}`}
              >
                {tagCounts[tag]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Column 2: Post list ────────────────────────────── */}
      <div className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800">
        <ul>
          {filteredPosts.map((post) => {
            const excerpt = stripMd(post.content).slice(0, 80);
            const isSelected = selectedPost?.slug === post.slug;
            return (
              <li
                key={post.slug}
                className={`flex h-24 cursor-default flex-col border-l-2 transition-colors ${
                  isSelected
                    ? "border-orange-500 bg-white dark:bg-gray-700"
                    : "border-transparent hover:bg-white dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setSelectedPost(post)}
              >
                {/* Title */}
                <div className="mt-3 flex h-8 items-center">
                  <div className="flex w-10 shrink-0 items-center justify-center text-gray-400">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                    </svg>
                  </div>
                  <span className="flex-1 truncate pr-3 text-sm leading-snug font-semibold text-gray-900 dark:text-gray-100">
                    {post.frontMatter.title}
                  </span>
                </div>
                {/* Excerpt */}
                <div className="ml-10 flex-1 border-b border-gray-200 pr-3 pb-2 dark:border-gray-700/50">
                  <div className="mb-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(post.frontMatter.date)}
                  </div>
                  <div className="line-clamp-2 text-xs leading-snug text-gray-500 dark:text-gray-400">
                    {excerpt || "—"}
                  </div>
                </div>
              </li>
            );
          })}

          {filteredPosts.length === 0 && (
            <li className="flex h-24 items-center justify-center text-xs text-gray-400">
              No posts
            </li>
          )}
        </ul>
      </div>

      {/* ── Column 3: Content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 select-text dark:bg-gray-800">
        {selectedPost ? (
          <>
            <ArticleContent post={selectedPost} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
            Select a post to read
          </div>
        )}
      </div>
    </div>
  );
}
