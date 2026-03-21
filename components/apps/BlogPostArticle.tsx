import ArticleContent from "@/components/apps/ArticleContent";
import type { Post } from "@/lib/types";

interface Props {
  zhPost: Post | null;
  enPost: Post | null;
}

/**
 * Server-rendered article for `/blog/[slug]` static export (GitHub Pages).
 * Uses English when available, else Chinese — independent of in-app Blog `PostApp` rendering.
 */
export default function BlogPostArticle({ zhPost, enPost }: Props) {
  const post = enPost ?? zhPost;
  if (!post) return null;

  return (
    <ArticleContent
      post={post}
      articleClassName="max-w-2xl mx-auto px-6 py-10 text-gray-800 dark:text-gray-200"
      titleClassName="text-2xl font-bold mb-3 text-gray-900 dark:text-white leading-snug"
      metaClassName="flex items-center flex-wrap gap-2 mb-8 text-sm text-gray-500 dark:text-gray-400"
      timeClassName="text-gray-500 dark:text-gray-400"
      tagClassName="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
      tagMode="link"
      tagPrefixHash={false}
      enableSlug
    />
  );
}
