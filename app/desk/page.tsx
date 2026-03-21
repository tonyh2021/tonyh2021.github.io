import { getPostIndexBundle } from "@/lib/posts";
import HomeClient from "@/components/HomeClient";

export default function DeskPage() {
  const postIndexBundle = getPostIndexBundle();
  return <HomeClient postIndexBundle={postIndexBundle} />;
}
