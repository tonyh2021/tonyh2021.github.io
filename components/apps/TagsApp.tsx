"use client";

import { useState, useEffect, useMemo } from "react";
import { normalizeTags } from "@/lib/utils";
import type { PostIndex } from "@/lib/types";
import { resolvePostIndices } from "@/lib/postBundle";
import { usePostIndexBundle } from "@/contexts/PostIndexContext";
import { useStore } from "@/store";

function buildTagMap(posts: PostIndex[]): Record<string, PostIndex[]> {
  const map: Record<string, PostIndex[]> = {};
  for (const post of posts) {
    for (const tag of normalizeTags(post.frontMatter.tags)) {
      if (!map[tag]) map[tag] = [];
      map[tag].push(post);
    }
  }
  return map;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TagsApp() {
  const postIndexBundle = usePostIndexBundle();
  const locale = useStore((s) => s.locale);

  const indices = useMemo(
    () => resolvePostIndices(postIndexBundle, locale),
    [postIndexBundle, locale],
  );

  const tagMap = useMemo(() => buildTagMap(indices), [indices]);
  const tags = useMemo(
    () => Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length),
    [tagMap],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const tagsKey = tags.join("|");

  useEffect(() => {
    setSelected(tags[0] ?? null);
  }, [tagsKey, tags]);

  return (
    <div className="flex h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Sidebar: tag list */}
      <aside className="w-44 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelected(tag)}
            className={[
              "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
              selected === tag
                ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50",
            ].join(" ")}
          >
            <span className="truncate">{tag}</span>
            <span className="ml-2 shrink-0 text-xs text-gray-400 dark:text-gray-500">
              {tagMap[tag].length}
            </span>
          </button>
        ))}
      </aside>

      {/* Content: posts for selected tag */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <>
            <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/30">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                #{selected}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({tagMap[selected].length})
                </span>
              </h3>
            </div>
            {tagMap[selected].map((post) => (
              <div
                key={post.slug}
                className="border-b border-gray-100 px-4 py-3 dark:border-gray-800"
              >
                <p className="text-sm leading-snug font-medium text-gray-800 dark:text-gray-200">
                  {post.frontMatter.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(post.frontMatter.date)}
                </p>
              </div>
            ))}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-600">
            Select a tag
          </div>
        )}
      </div>
    </div>
  );
}
