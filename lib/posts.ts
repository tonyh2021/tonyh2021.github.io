import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Post, PostFrontMatter } from "./types";
import { normalizeTags } from "./utils";

export { normalizeTags };

export type Locale = "zh" | "en";

const POSTS_DIR = path.join(process.cwd(), "_posts");

function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/_en\.mdx?$/, "") // strip _en before extension
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

export function getAllPosts(locale: Locale = "zh"): Post[] {
  const files = getAllPostFiles(locale);

  const posts = files.map(({ filePath, fileName }) => {
    const slug = fileNameToSlug(fileName);
    const date = extractDateFromFileName(fileName);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontMatter: PostFrontMatter = {
      ...(data as Omit<PostFrontMatter, "date">),
      date,
    };
    return { slug, frontMatter, content };
  });

  return posts.sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date));
}

export function getAllSlugs(): string[] {
  return getAllPosts("zh").map((p) => p.slug);
}

export function getPostBySlug(slug: string, locale: Locale = "zh"): Post {
  const posts = getAllPosts(locale);
  const post = posts.find((p) => p.slug === slug);
  if (post) return post;

  // Fallback to Chinese if English version not found
  if (locale === "en") {
    const zhPost = getAllPosts("zh").find((p) => p.slug === slug);
    if (zhPost) return zhPost;
  }

  throw new Error(`Post not found: ${slug}`);
}

export function getAllTags(locale: Locale = "zh"): Record<string, Post[]> {
  const posts = getAllPosts(locale);
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

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "zh";
  return acceptLanguage.toLowerCase().startsWith("zh") ? "zh" : "en";
}
