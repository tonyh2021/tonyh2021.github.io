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
  const [selectedPost, setSelectedPost] = useState<Post | null>(
    posts[0] ?? null,
  );

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
  const tags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a],
  );

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
        ? posts.filter((p) =>
            normalizeTags(p.frontMatter.tags).includes(filter.value),
          )
        : posts.filter((p) => p.frontMatter.date.startsWith(filter.value));

  const applyFilter = (f: FilterType) => {
    setFilter(f);
    const first =
      f.kind === "all"
        ? posts[0]
        : f.kind === "tag"
          ? posts.find((p) =>
              normalizeTags(p.frontMatter.tags).includes(f.value),
            )
          : posts.find((p) => p.frontMatter.date.startsWith(f.value));
    setSelectedPost(first ?? null);
  };

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-full select-none bg-gray-50 dark:bg-gray-800">
        {/* Filter chips */}
        <div
          className="flex gap-2 px-3 py-2 overflow-x-auto shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter.kind === "all" ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
            onClick={() => applyFilter({ kind: "all" })}
          >
            All ({posts.length})
          </button>
          {years.map((year) => (
            <button
              key={year}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter.kind === "year" && filter.value === year ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              onClick={() => applyFilter({ kind: "year", value: year })}
            >
              {year}
            </button>
          ))}
          {tags.map((tag) => (
            <button
              key={tag}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter.kind === "tag" && filter.value === tag ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
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
                className="flex flex-col px-4 py-3 border-b border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700/50"
                onClick={() => router.push(`/blog/${post.slug}`)}
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
                  {post.frontMatter.title}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  {formatDate(post.frontMatter.date)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                  {excerpt || "—"}
                </span>
              </li>
            );
          })}
          {filteredPosts.length === 0 && (
            <li className="flex items-center justify-center h-24 text-xs text-gray-400">
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
      <div className="w-36 shrink-0 overflow-y-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm">
        {/* All Posts */}
        <ul className="pt-1">
          <li
            className={`pl-4 h-8 flex items-center gap-2 cursor-default transition-colors ${
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
        <div className="mt-3 mb-1 px-4 text-[10px] text-gray-400 uppercase tracking-wider">
          Years
        </div>
        <ul>
          {years.map((year) => (
            <li
              key={year}
              className={`pl-4 h-8 flex items-center cursor-default transition-colors ${
                filter.kind === "year" && filter.value === year
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => applyFilter({ kind: "year", value: year })}
            >
              <span className="text-gray-400 text-xs mr-1.5">📅</span>
              <span className="truncate flex-1">{year}</span>
              <span
                className={`ml-auto pr-2 text-xs shrink-0 ${filter.kind === "year" && filter.value === year ? "text-white/70" : "text-gray-500"}`}
              >
                {yearCounts[year]}
              </span>
            </li>
          ))}
        </ul>

        {/* Tags */}
        <div className="mt-3 mb-1 px-4 text-[10px] text-gray-400 uppercase tracking-wider">
          Tags
        </div>
        <ul>
          {tags.map((tag) => (
            <li
              key={tag}
              className={`pl-4 h-8 flex items-center cursor-default transition-colors ${
                filter.kind === "tag" && filter.value === tag
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => applyFilter({ kind: "tag", value: tag })}
            >
              <span className="text-gray-400 text-xs mr-1.5">#</span>
              <span className="truncate flex-1">{tag}</span>
              <span
                className={`ml-auto pr-2 text-xs shrink-0 ${filter.kind === "tag" && filter.value === tag ? "text-white/70" : "text-gray-500"}`}
              >
                {tagCounts[tag]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Column 2: Post list ────────────────────────────── */}
      <div className="w-56 shrink-0 overflow-y-auto bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/60">
        <ul>
          {filteredPosts.map((post) => {
            const excerpt = stripMd(post.content).slice(0, 80);
            const isSelected = selectedPost?.slug === post.slug;
            return (
              <li
                key={post.slug}
                className={`h-24 flex flex-col cursor-default border-l-2 transition-colors ${
                  isSelected
                    ? "border-orange-500 bg-white dark:bg-gray-700"
                    : "border-transparent hover:bg-white dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setSelectedPost(post)}
              >
                {/* Title */}
                <div className="h-8 mt-3 flex items-center">
                  <div className="w-10 flex items-center justify-center shrink-0 text-gray-400">
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="currentColor"
                    >
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-3 leading-snug">
                    {post.frontMatter.title}
                  </span>
                </div>
                {/* Excerpt */}
                <div className="flex-1 ml-10 pr-3 pb-2 border-b border-gray-200 dark:border-gray-700/50">
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                    {formatDate(post.frontMatter.date)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                    {excerpt || "—"}
                  </div>
                </div>
              </li>
            );
          })}

          {filteredPosts.length === 0 && (
            <li className="flex items-center justify-center h-24 text-xs text-gray-400">
              No posts
            </li>
          )}
        </ul>
      </div>

      {/* ── Column 3: Content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 select-text">
        {selectedPost ? (
          <>
            <ArticleContent post={selectedPost} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-600">
            Select a post to read
          </div>
        )}
      </div>
    </div>
  );
}
