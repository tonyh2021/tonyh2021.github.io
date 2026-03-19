import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Post, PostFrontMatter } from './types';

const POSTS_DIR = path.join(process.cwd(), '_posts');
const POSTS_PER_PAGE = 10;

function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/\.mdx?$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function extractDateFromFileName(fileName: string): string {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

export function normalizeTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return [tags];
}

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR);

  const posts = files
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileNameToSlug(fileName);
      const date = extractDateFromFileName(fileName);
      const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf-8');
      const { data, content } = matter(raw);
      const frontMatter: PostFrontMatter = {
        ...(data as Omit<PostFrontMatter, 'date'>),
        date,
      };
      return { slug, frontMatter, content };
    });

  return posts.sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date));
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getPostBySlug(slug: string): Post {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return post;
}

export function getPaginatedPosts(page: number) {
  const all = getAllPosts();
  const totalPages = Math.ceil(all.length / POSTS_PER_PAGE);
  const posts = all.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  return { posts, totalPages, currentPage: page };
}

export function getAllTags(): Record<string, Post[]> {
  const posts = getAllPosts();
  const tagMap: Record<string, Post[]> = {};

  for (const post of posts) {
    const tags = normalizeTags(post.frontMatter.tags);
    for (const tag of tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(post);
    }
  }

  return tagMap;
}
