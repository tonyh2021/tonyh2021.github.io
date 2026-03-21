"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PostIndexBundle } from "@/lib/types";

const PostIndexContext = createContext<PostIndexBundle | null>(null);

export function PostIndexProvider({
  value,
  children,
}: {
  value: PostIndexBundle;
  children: ReactNode;
}) {
  return <PostIndexContext.Provider value={value}>{children}</PostIndexContext.Provider>;
}

/** Post index from the home RSC, consumed by Blog / Tags windows. */
export function usePostIndexBundle(): PostIndexBundle {
  const ctx = useContext(PostIndexContext);
  if (!ctx) {
    throw new Error("usePostIndexBundle must be used within PostIndexProvider");
  }
  return ctx;
}
