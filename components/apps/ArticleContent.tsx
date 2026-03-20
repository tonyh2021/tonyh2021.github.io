import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { normalizeTags } from "@/lib/utils";
import type { Post } from "@/lib/types";

type TagMode = "badge" | "link";

interface Props {
  post: Post;
  articleClassName?: string;
  titleClassName?: string;
  metaClassName?: string;
  timeClassName?: string;
  tagClassName?: string;
  tagMode?: TagMode;
  tagPrefixHash?: boolean;
  enableSlug?: boolean;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleContent({
  post,
  articleClassName = "max-w-2xl mx-auto px-8 py-8 text-gray-800 dark:text-gray-200",
  titleClassName = "text-2xl font-bold mb-3 text-gray-900 dark:text-white leading-tight",
  metaClassName = "flex items-center gap-2 mb-8 text-sm flex-wrap",
  timeClassName = "text-gray-400 dark:text-gray-500",
  tagClassName = "px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded text-xs",
  tagMode = "badge",
  tagPrefixHash = true,
  enableSlug = false,
}: Props) {
  const tags = normalizeTags(post.frontMatter.tags);
  const rehypePlugins = enableSlug
    ? [rehypeRaw, rehypeSlug, rehypeHighlight]
    : [rehypeRaw, rehypeHighlight];

  return (
    <article className={articleClassName}>
      <h1 className={titleClassName}>{post.frontMatter.title}</h1>

      <div className={metaClassName}>
        <time className={timeClassName}>{formatDate(post.frontMatter.date)}</time>
        {tags.map((tag) =>
          tagMode === "link" ? (
            <a
              key={tag}
              href={`/tags/#${encodeURIComponent(tag)}`}
              className={tagClassName}
            >
              {tagPrefixHash ? `#${tag}` : tag}
            </a>
          ) : (
            <span key={tag} className={tagClassName}>
              {tagPrefixHash ? `#${tag}` : tag}
            </span>
          ),
        )}
      </div>

      <div className="md-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}

