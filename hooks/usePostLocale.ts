"use client";

import { useEffect, useState } from "react";

export type PostLocale = "zh" | "en";

export function usePostLocale(defaultLocale: PostLocale = "en"): PostLocale {
  const [locale, setLocale] = useState<PostLocale>(defaultLocale);

  useEffect(() => {
    const lang = navigator.language.toLowerCase();
    setLocale(lang.startsWith("zh") ? "zh" : "en");
  }, []);

  return locale;
}
