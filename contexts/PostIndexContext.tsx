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

/** 博客索引（由首页 RSC 注入，供 Blog / Tags 等窗口消费） */
export function usePostIndexBundle(): PostIndexBundle {
  const ctx = useContext(PostIndexContext);
  if (!ctx) {
    throw new Error("usePostIndexBundle must be used within PostIndexProvider");
  }
  return ctx;
}
