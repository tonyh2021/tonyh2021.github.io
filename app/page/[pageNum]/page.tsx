import { getAllPosts, getPaginatedPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

const POSTS_PER_PAGE = 10;

export async function generateStaticParams() {
  const all = getAllPosts();
  const totalPages = Math.ceil(all.length / POSTS_PER_PAGE);
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    pageNum: String(i + 2),
  }));
}

export default function PaginatedPage({ params }: { params: { pageNum: string } }) {
  const page = parseInt(params.pageNum, 10);
  const { posts, totalPages } = getPaginatedPosts(page);

  return (
    <div id="home">
      <div className="posts">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
