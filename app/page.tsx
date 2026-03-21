import { getAllPosts } from "@/lib/posts";
import MacOSApp from "@/components/MacOSApp";

export default function HomePage() {
  const posts = getAllPosts("zh");
  const enPosts = getAllPosts("en");
  return <MacOSApp posts={posts} enPosts={enPosts} />;
}
