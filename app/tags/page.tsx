import { getAllTags } from '@/lib/posts';

export const metadata = {
  title: "Tags | Tony's Blog",
  description: 'An archive of posts sorted by tag.',
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function TagsPage() {
  const tagMap = getAllTags();
  const sortedTags = Object.keys(tagMap).sort();

  return (
    <div className="page">
      <h1 className="page-title">Tags</h1>
      <p>An archive of posts sorted by tag.</p>

      {/* Tag cloud */}
      <ul className="tag-box inline">
        {sortedTags.map((tag) => (
          <li key={tag}>
            <a href={`#${encodeURIComponent(tag)}`}>
              {tag} <span>{tagMap[tag].length}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Posts grouped by tag */}
      {sortedTags.map((tag) => (
        <div key={tag} id={encodeURIComponent(tag)}>
          <h2>{tag}</h2>
          <ul>
            {tagMap[tag].map((post) => (
              <li key={post.slug}>
                <span>{formatDate(post.frontMatter.date)}</span>
                {' — '}
                <a href={`/blog/${post.slug}/`}>{post.frontMatter.title}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
