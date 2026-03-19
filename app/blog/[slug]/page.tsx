import { getAllSlugs, getPostBySlug, normalizeTags } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import DisqusComments from '@/components/DisqusComments';

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  return {
    title: `${post.frontMatter.title} | Tony's Blog`,
    description: post.frontMatter.description ?? '',
  };
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  const tags = normalizeTags(post.frontMatter.tags);

  return (
    <article itemScope itemType="http://schema.org/Article">
      <div className="post">
        <h1 itemProp="name" className="post-title">
          {post.frontMatter.title}
        </h1>

        {tags.length > 0 && (
          <p className="entry-tags">
            {tags.map((tag, i) => (
              <span key={tag}>
                <a
                  href={`/tags/#${encodeURIComponent(tag)}`}
                  title={`Pages tagged ${tag}`}
                  rel="tag"
                >
                  {tag}
                </a>
                {i < tags.length - 1 && ' \u2022 '}
              </span>
            ))}
          </p>
        )}

        <p
          className="post-date"
          itemProp="datePublished"
          content={post.frontMatter.date}
        >
          {formatDate(post.frontMatter.date)}
        </p>

        <div itemProp="articleBody">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {post.frontMatter.comments && (
          <DisqusComments slug={params.slug} title={post.frontMatter.title} />
        )}
      </div>
    </article>
  );
}
