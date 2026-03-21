import { getPostIndexBundle } from "@/lib/posts";
import MacOSApp from "@/components/MacOSApp";

export default function HomePage() {
  const postIndexBundle = getPostIndexBundle();
  return <MacOSApp postIndexBundle={postIndexBundle} />;
}
