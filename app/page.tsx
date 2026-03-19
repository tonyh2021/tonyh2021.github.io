import { getPaginatedPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

export default function HomePage() {
  const { posts, totalPages } = getPaginatedPosts(1);

  return (
    <div id="home">
      <div className="posts">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination currentPage={1} totalPages={totalPages} />
    </div>
  );
}
