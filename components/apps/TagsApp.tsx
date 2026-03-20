'use client';

import { useState, useEffect } from 'react';
import { normalizeTags } from '@/lib/utils';
import type { Post } from '@/lib/types';

interface Props {
  posts: Post[];
  enPosts: Post[];
}

function buildTagMap(posts: Post[]): Record<string, Post[]> {
  const map: Record<string, Post[]> = {};
  for (const post of posts) {
    for (const tag of normalizeTags(post.frontMatter.tags)) {
      if (!map[tag]) map[tag] = [];
      map[tag].push(post);
    }
  }
  return map;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TagsApp({ posts, enPosts }: Props) {
  const [activePosts, setActivePosts] = useState(posts);
  useEffect(() => {
    if (!navigator.language.toLowerCase().startsWith('zh')) setActivePosts(enPosts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagMap = buildTagMap(activePosts);
  const tags = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { setSelected(tags[0] ?? null); }, [activePosts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar: tag list */}
      <aside className="w-44 shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelected(tag)}
            className={[
              'w-full text-left px-3 py-2 text-sm flex justify-between items-center transition-colors',
              selected === tag
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50',
            ].join(' ')}
          >
            <span className="truncate">{tag}</span>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {tagMap[tag].length}
            </span>
          </button>
        ))}
      </aside>

      {/* Content: posts for selected tag */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <>
            <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
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
                className="px-4 py-3 border-b border-gray-100 dark:border-gray-800"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                  {post.frontMatter.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatDate(post.frontMatter.date)}
                </p>
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-600">
            Select a tag
          </div>
        )}
      </div>
    </div>
  );
}
