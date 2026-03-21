"use client";

import type { PostIndexBundle } from "@/lib/types";
import { PostIndexProvider } from "@/contexts/PostIndexContext";
import MacOSApp from "@/components/MacOSApp";

/** Client root: receives post index from RSC and provides context so MacDesktop avoids prop drilling. */
export default function HomeClient({ postIndexBundle }: { postIndexBundle: PostIndexBundle }) {
  return (
    <PostIndexProvider value={postIndexBundle}>
      <MacOSApp />
    </PostIndexProvider>
  );
}
