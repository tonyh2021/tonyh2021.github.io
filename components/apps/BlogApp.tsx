"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { normalizeTags } from "@/lib/utils";
import { postBodyJsonUrl } from "@/lib/postBodyUrl";
import type { Post, PostIndex } from "@/lib/types";
import { useMobile } from "@/hooks/useMobile";
import { resolvePostIndices, type Locale } from "@/lib/postBundle";
import { usePostIndexBundle } from "@/contexts/PostIndexContext";
import PostContent from "@/components/apps/PostContent";
import { DocumentTextIcon, CalendarIcon, HashtagIcon } from "@heroicons/react/24/solid";
import { useStore } from "@/store";

/** macOS / iOS default system accent (control tint) — Apple HIG blue. */
const MAC_SYSTEM_ACCENT_BG = "bg-[#007AFF] text-white dark:bg-[#0A84FF]";
const MAC_SYSTEM_ACCENT_BORDER = "border-[#007AFF] dark:border-[#0A84FF]";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type FilterType =
  | { kind: "all" }
  | { kind: "tag"; value: string }
  | { kind: "year"; value: string };

export default function BlogApp() {
  const postIndexBundle = usePostIndexBundle();
  const isMobile = useMobile();
  const [locale, setLocale] = useState<Locale>(() =>
    navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en",
  );

  const indices = resolvePostIndices(postIndexBundle, locale);

  const blogCurrentSlug = useStore((s) => s.blogCurrentSlug);
  const listRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState<FilterType>({ kind: "all" });
  const [selectedIndex, setSelectedIndex] = useState<PostIndex | null>(() => {
    if (blogCurrentSlug) {
      const found = indices.find((p) => p.slug === blogCurrentSlug);
      if (found) return found;
    }
    return indices[0] ?? null;
  });
  const [loadedPost, setLoadedPost] = useState<Post | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">(() =>
    blogCurrentSlug ? "detail" : "list",
  );

  useEffect(() => {
    setFilter({ kind: "all" });
    setSelectedIndex(indices[0] ?? null);
    setMobileView("list");
  }, [locale, indices]);

  useEffect(() => {
    if (!selectedIndex || !listRef.current) return;
    const item = listRef.current.querySelector<HTMLLIElement>(
      `[data-slug="${selectedIndex.slug}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  useEffect(() => {
    if (!blogCurrentSlug) return;
    const found = indices.find((p) => p.slug === blogCurrentSlug);
    if (found) {
      setSelectedIndex(found);
      setMobileView("detail");
    } else {
      const otherLocale: Locale = locale === "zh" ? "en" : "zh";
      if (postIndexBundle[otherLocale].some((p) => p.slug === blogCurrentSlug)) {
        setLocale(otherLocale);
      }
    }
  }, [blogCurrentSlug, indices, locale, postIndexBundle]);

  const loadBody = useCallback(async (index: PostIndex | null) => {
    if (!index) {
      setLoadedPost(null);
      setLoadError(null);
      return;
    }
    setLoadingBody(true);
    setLoadError(null);
    try {
      const res = await fetch(postBodyJsonUrl(index));
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as Post;
      setLoadedPost(data);
    } catch {
      setLoadedPost(null);
      setLoadError(
        "Could not load post body. Run `pnpm run sync-post-bodies` (or `pnpm dev` / `pnpm build`) to generate JSON under public/data/post-bodies.",
      );
    } finally {
      setLoadingBody(false);
    }
  }, []);

  useEffect(() => {
    void loadBody(selectedIndex);
  }, [selectedIndex, loadBody]);

  // Build tag map
  const tagCounts: Record<string, number> = {};
  for (const post of indices) {
    for (const tag of normalizeTags(post.frontMatter.tags)) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const tags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Build year map
  const yearCounts: Record<string, number> = {};
  for (const post of indices) {
    const year = post.frontMatter.date.slice(0, 4);
    yearCounts[year] = (yearCounts[year] ?? 0) + 1;
  }
  const years = Object.keys(yearCounts).sort((a, b) => Number(b) - Number(a));

  const filteredPosts =
    filter.kind === "all"
      ? indices
      : filter.kind === "tag"
        ? indices.filter((p) => normalizeTags(p.frontMatter.tags).includes(filter.value))
        : indices.filter((p) => p.frontMatter.date.startsWith(filter.value));

  const applyFilter = (f: FilterType) => {
    setFilter(f);
    const first =
      f.kind === "all"
        ? indices[0]
        : f.kind === "tag"
          ? indices.find((p) => normalizeTags(p.frontMatter.tags).includes(f.value))
          : indices.find((p) => p.frontMatter.date.startsWith(f.value));
    setSelectedIndex(first ?? null);
  };

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex h-full flex-col bg-gray-50 select-none dark:bg-gray-800">
        {mobileView === "list" ? (
          <>
            <div
              className="flex shrink-0 gap-2 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              style={{ scrollbarWidth: "none" }}
            >
              <button
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter.kind === "all" ? MAC_SYSTEM_ACCENT_BG : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
                onClick={() => applyFilter({ kind: "all" })}
              >
                All ({indices.length})
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter.kind === "year" && filter.value === year ? MAC_SYSTEM_ACCENT_BG : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
                  onClick={() => applyFilter({ kind: "year", value: year })}
                >
                  {year}
                </button>
              ))}
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter.kind === "tag" && filter.value === tag ? MAC_SYSTEM_ACCENT_BG : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
                  onClick={() => applyFilter({ kind: "tag", value: tag })}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <ul className="flex-1 overflow-y-auto">
              {filteredPosts.map((post) => {
                const excerpt = post.excerpt.slice(0, 80) + (post.excerpt.length > 80 ? "…" : "");
                return (
                  <li
                    key={post.slug}
                    className="flex flex-col border-b border-gray-200 px-4 py-3 active:bg-gray-100 dark:border-gray-700 dark:active:bg-gray-700/50"
                    onClick={() => {
                      setSelectedIndex(post);
                      setMobileView("detail");
                    }}
                  >
                    <span className="mb-1 text-sm leading-snug font-semibold text-gray-900 dark:text-gray-100">
                      {post.frontMatter.title}
                    </span>
                    <span className="mb-1 text-xs text-gray-500 dark:text-gray-500">
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
          </>
        ) : (
          <>
            <div className="flex h-11 shrink-0 items-center border-b border-gray-200 bg-white px-2 dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                className="flex items-center gap-1 px-1 text-[#007AFF] active:opacity-50 dark:text-[#0A84FF]"
                onClick={() => setMobileView("list")}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span className="text-sm">Posts</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 select-text bg-gray-50 dark:bg-gray-800">
              {!selectedIndex ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
                  Select a post
                </div>
              ) : loadingBody ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
                  Loading…
                </div>
              ) : loadError ? (
                <div className="p-6 text-sm text-amber-800 dark:text-amber-200">{loadError}</div>
              ) : (
                <PostContent post={loadedPost} />
              )}
            </div>
          </>
        )}
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
                ? MAC_SYSTEM_ACCENT_BG
                : "hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => applyFilter({ kind: "all" })}
          >
            <DocumentTextIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Blogs</span>
            <span
              className={`ml-auto pr-2 text-xs ${filter.kind === "all" ? "text-white/70" : "text-gray-500 dark:text-gray-500"}`}
            >
              {indices.length}
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
                  ? MAC_SYSTEM_ACCENT_BG
                  : "hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => applyFilter({ kind: "year", value: year })}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="ml-2 flex-1 truncate">{year}</span>
              <span
                className={`ml-auto pr-2 text-xs ${filter.kind === "year" && filter.value === year ? "text-white/70" : "text-gray-500"}`}
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
                  ? MAC_SYSTEM_ACCENT_BG
                  : "hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => applyFilter({ kind: "tag", value: tag })}
            >
              <HashtagIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="ml-2 flex-1 truncate">{tag}</span>
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
      <div ref={listRef} className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800">
        <ul>
          {filteredPosts.map((post) => {
            const excerpt = post.excerpt.slice(0, 80) + (post.excerpt.length > 80 ? "…" : "");
            const isSelected = selectedIndex?.slug === post.slug;
            return (
              <li
                key={post.slug}
                data-slug={post.slug}
                className={`flex h-24 cursor-default flex-col border-l-2 transition-colors ${
                  isSelected
                    ? `${MAC_SYSTEM_ACCENT_BORDER} bg-white dark:bg-gray-700`
                    : "border-transparent hover:bg-white dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setSelectedIndex(post)}
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
        {!selectedIndex ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
            Select a post to read
          </div>
        ) : (
          <>
            {loadingBody && (
              <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
                Loading…
              </div>
            )}
            {!loadingBody && loadError && (
              <div className="p-6 text-sm text-amber-800 dark:text-amber-200">{loadError}</div>
            )}
            {!loadingBody && !loadError && loadedPost ? <PostContent post={loadedPost} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
