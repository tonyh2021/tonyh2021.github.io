import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Post, PostFrontMatter, PostIndex, PostIndexBundle } from "./types";
import type { Locale } from "./postBundle";
import { markdownExcerpt } from "./postExcerpt";
import { normalizeTags } from "./utils";

export { normalizeTags };
export type { Locale } from "./postBundle";
export { resolvePostIndices } from "./postBundle";

const POSTS_DIR = path.join(process.cwd(), "_posts");

function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/_en\.mdx?$/, "")
    .replace(/\.mdx?$/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function extractDateFromFileName(fileName: string): string {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function isEnFile(fileName: string): boolean {
  return /_en\.mdx?$/.test(fileName);
}

function getAllPostFiles(locale: Locale = "zh"): { filePath: string; fileName: string }[] {
  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });
  const result: { filePath: string; fileName: string }[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const yearDir = path.join(POSTS_DIR, entry.name);
      const yearFiles = fs.readdirSync(yearDir);
      for (const fileName of yearFiles) {
        if (!(fileName.endsWith(".md") || fileName.endsWith(".mdx"))) continue;
        const isEn = isEnFile(fileName);
        if (locale === "en" && isEn)
          result.push({ filePath: path.join(yearDir, fileName), fileName });
        if (locale === "zh" && !isEn)
          result.push({ filePath: path.join(yearDir, fileName), fileName });
      }
    } else {
      const fileName = entry.name;
      if (!(fileName.endsWith(".md") || fileName.endsWith(".mdx"))) continue;
      const isEn = isEnFile(fileName);
      if (locale === "en" && isEn)
        result.push({ filePath: path.join(POSTS_DIR, fileName), fileName });
      if (locale === "zh" && !isEn)
        result.push({ filePath: path.join(POSTS_DIR, fileName), fileName });
    }
  }

  return result;
}

function parsePostFile(filePath: string, fileName: string): Post {
  const slug = fileNameToSlug(fileName);
  const date = extractDateFromFileName(fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontMatter: PostFrontMatter = {
    ...(data as Omit<PostFrontMatter, "date">),
    date,
  };
  return { slug, frontMatter, content };
}

// ── Module cache: one read+matter parse per locale per Node process ─────────
const postsCache = new Map<Locale, Post[]>();

function loadPosts(locale: Locale): Post[] {
  const hit = postsCache.get(locale);
  if (hit) return hit;

  const files = getAllPostFiles(locale);
  const posts = files
    .map(({ filePath, fileName }) => parsePostFile(filePath, fileName))
    .sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date));

  postsCache.set(locale, posts);
  return posts;
}

function toPostIndex(post: Post, bodyLocale: Locale): PostIndex {
  return {
    slug: post.slug,
    frontMatter: post.frontMatter,
    excerpt: markdownExcerpt(post.content, 160),
    bodyLocale,
  };
}

export function getAllPosts(locale: Locale = "zh"): Post[] {
  return loadPosts(locale);
}

export function getPostIndexBundle(): PostIndexBundle {
  return {
    zh: loadPosts("zh").map((p) => toPostIndex(p, "zh")),
    en: loadPosts("en").map((p) => toPostIndex(p, "en")),
  };
}

export function getAllSlugs(): string[] {
  return loadPosts("zh").map((p) => p.slug);
}

export function getPostBySlug(slug: string, locale: Locale = "zh"): Post {
  const post = loadPosts(locale).find((p) => p.slug === slug);
  if (post) return post;

  if (locale === "en") {
    const zhPost = loadPosts("zh").find((p) => p.slug === slug);
    if (zhPost) return zhPost;
  }

  throw new Error(`Post not found: ${slug}`);
}

export function getAllTags(locale: Locale = "zh"): Record<string, PostIndex[]> {
  const posts = loadPosts(locale);
  const tagMap: Record<string, PostIndex[]> = {};

  for (const post of posts) {
    const idx = toPostIndex(post, locale);
    for (const tag of normalizeTags(post.frontMatter.tags)) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(idx);
    }
  }

  return tagMap;
}

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "zh";
  return acceptLanguage.toLowerCase().startsWith("zh") ? "zh" : "en";
}
