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
