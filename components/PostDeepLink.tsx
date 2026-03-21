"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostDeepLink({ slug }: { slug: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/?post=${slug}`);
  }, [slug, router]);

  return null;
}
