'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { normalizeTags } from '@/lib/utils';
import type { Post } from '@/lib/types';

interface Props {
  post: Post | null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostApp({ post }: Props) {
  if (!post) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900">
        No post selected
      </div>
    );
  }

  const tags = normalizeTags(post.frontMatter.tags);

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      {/* Highlight.js dark theme */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <article className="max-w-2xl mx-auto px-6 py-8 text-gray-800 dark:text-gray-200">
        <h1 className="text-2xl font-bold mb-3 leading-snug text-gray-900 dark:text-white">
          {post.frontMatter.title}
        </h1>

        <div className="flex items-center flex-wrap gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(post.frontMatter.date)}</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs"
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
