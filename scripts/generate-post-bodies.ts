/**
 * Writes `public/data/post-bodies/{zh|en}/{slug}.json` for lazy-loading in BlogApp.
 * Run via `pnpm prebuild` before `next build`.
 */
import fs from "fs";
import path from "path";
import { getAllPosts } from "../lib/posts";
import type { Locale } from "../lib/postBundle";

const OUT = path.join(process.cwd(), "public/data/post-bodies");

function writeBodies(locale: Locale) {
  const posts = getAllPosts(locale);
  const dir = path.join(OUT, locale);
  fs.mkdirSync(dir, { recursive: true });
  for (const p of posts) {
    const file = path.join(dir, `${p.slug}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({
        slug: p.slug,
        frontMatter: p.frontMatter,
        content: p.content,
      }),
    );
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
writeBodies("zh");
writeBodies("en");

console.log("Wrote post body JSON to", OUT);
