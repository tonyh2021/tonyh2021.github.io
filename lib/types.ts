export interface PostFrontMatter {
  title: string;
  description?: string;
  tags?: string | string[];
  comments?: boolean;
  category?: string;
  date: string;
}

export interface Post {
  slug: string;
  frontMatter: PostFrontMatter;
  content: string;
}

/** List/sidebar only — no markdown body (reduces RSC → client payload). */
export interface PostIndex {
  slug: string;
  frontMatter: PostFrontMatter;
  excerpt: string;
  /** Matches `/data/post-bodies/{bodyLocale}/{slug}.json` from the build script. */
  bodyLocale: "zh" | "en";
}

export interface PostIndexBundle {
  zh: PostIndex[];
  en: PostIndex[];
}
