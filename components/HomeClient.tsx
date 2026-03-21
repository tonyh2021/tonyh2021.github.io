"use client";

import type { PostIndexBundle } from "@/lib/types";
import { PostIndexProvider } from "@/contexts/PostIndexContext";
import MacOSApp from "@/components/MacOSApp";

/** 客户端根：承接 RSC 的 post 索引并下发 Context，避免 MacDesktop 深层透传 */
export default function HomeClient({ postIndexBundle }: { postIndexBundle: PostIndexBundle }) {
  return (
    <PostIndexProvider value={postIndexBundle}>
      <MacOSApp />
    </PostIndexProvider>
  );
}
