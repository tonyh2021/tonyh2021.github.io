import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import BlogPostArticle from "@/components/apps/BlogPostArticle";
import { BlogPostHeader } from "@/components/apps/BlogPostHeader";
import { markdownExcerpt } from "@/lib/postExcerpt";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getPostSafe(slug: string, locale: "zh" | "en") {
  try {
    return getPostBySlug(slug, locale);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostSafe(slug, "en") ?? getPostSafe(slug, "zh");
  const canonicalPath = `/blog/${slug}/`;
  if (!post) {
    return {
      title: "Post Not Found",
      description: "",
      robots: { index: false, follow: false },
      alternates: { canonical: canonicalPath },
    };
  }
  const description = post.frontMatter.description ?? markdownExcerpt(post.content, 160);
  return {
    title: post.frontMatter.title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        "zh-CN": canonicalPath,
        "en-US": canonicalPath,
        "x-default": canonicalPath,
      },
    },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title: post.frontMatter.title,
      description,
      publishedTime: post.frontMatter.date,
      tags:
        typeof post.frontMatter.tags === "string"
          ? [post.frontMatter.tags]
          : (post.frontMatter.tags ?? []),
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontMatter.title,
      description,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const zhPost = getPostSafe(slug, "zh");
  const enPost = getPostSafe(slug, "en");
  if (!zhPost && !enPost) notFound();
  const seoPost = enPost ?? zhPost!;
  const canonicalUrl = `${SITE_URL}/posts/${slug}/`;
  const keywords =
    typeof seoPost.frontMatter.tags === "string"
      ? [seoPost.frontMatter.tags]
      : (seoPost.frontMatter.tags ?? []);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seoPost.frontMatter.title,
    description: seoPost.frontMatter.description ?? "",
    datePublished: seoPost.frontMatter.date,
    dateModified: seoPost.frontMatter.date,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    inLanguage: enPost ? "en-US" : "zh-CN",
    author: {
      "@type": "Person",
      name: "Tony Han",
    },
    publisher: {
      "@type": "Person",
      name: "Tony Han",
    },
    keywords,
  };
  return (
    <div className="h-dvh min-h-screen overflow-y-auto bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostHeader />
      <BlogPostArticle zhPost={zhPost} enPost={enPost} />
    </div>
  );
}
