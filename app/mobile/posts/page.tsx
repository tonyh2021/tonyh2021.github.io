import { getPostIndexBundle } from "@/lib/posts";
import MobilePostList from "@/components/mobile/MobilePostList";

export default function MobilePostsPage() {
  const postIndexBundle = getPostIndexBundle();
  return <MobilePostList postIndexBundle={postIndexBundle} />;
}
