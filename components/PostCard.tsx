import type { Post } from '@/lib/types';
import { normalizeTags } from '@/lib/posts';

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/>\s/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PostCard({ post }: { post: Post }) {
  const tags = normalizeTags(post.frontMatter.tags);
  const preview = stripMarkdown(post.content).slice(0, 150);

  return (
    <div>
      <h1 className="post-title">
        <a href={`/blog/${post.slug}/`}>{post.frontMatter.title}</a>
      </h1>
      <span className="post-date">
        &raquo; {formatDate(post.frontMatter.date)}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {tags.join(', ')}
      </span>
      <a href={`/blog/${post.slug}/`} className="post-content">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{preview}
        <hr />
      </a>
    </div>
  );
}
