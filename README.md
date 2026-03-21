# Tony's Portfolio

macOS-style interactive desktop — [tonyh2021.github.io](https://tonyh2021.github.io/)

## Stack

Next.js 15 (App Router), React 19, Tailwind v4, Framer Motion, Zustand, react-rnd, React Markdown (remark-gfm, rehype-highlight).

## Features

Desktop with dock, Launchpad, Spotlight, genie minimize; windows for Blog (markdown + tags), About, Safari, VS Code (github1s), Terminal; light/dark.

## Dev

```bash
pnpm install && pnpm dev
```

- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` / `pnpm format:check` — Prettier (ESLint uses `eslint-config-prettier`)

**`NEXT_PUBLIC_SITE_URL`** / **`NEXT_PUBLIC_BASE_PATH`** — copy `.env.example` → `.env.local`. Origin URL has no trailing slash. **User site** (`username.github.io` repo): leave `NEXT_PUBLIC_BASE_PATH` empty. **Project site** (repo e.g. `tonyh2021`): set `NEXT_PUBLIC_SITE_URL=https://<user>.github.io/tonyh2021` and GitHub Variable `NEXT_PUBLIC_BASE_PATH=/tonyh2021`.

## Build

```bash
pnpm build
```

`prebuild` runs `sync-post-bodies` → `public/data/post-bodies/{zh,en}/*.json` (gitignored; CI runs it too). Blog loads bodies on demand; the page ships a light `PostIndexBundle` only. Edit `_posts/` then rebuild or use `predev` before dev.

Output: static `./out/` (GitHub Actions deploys it to Pages). Repo **Settings → Pages**: source **GitHub Actions**. Optional repo variable `NEXT_PUBLIC_SITE_URL` if not default.

**GitHub Pages + blog:** use **`trailingSlash: true`** so export is `blog/<slug>/index.html` → live URL **`/blog/<slug>/`**. Using only `blog/<slug>.html` with **`trailingSlash: false`** often still 404s at `/blog/<slug>` because Pages does not rewrite extensionless paths for nested files. Canonicals, sitemap, and in-app links must use the **trailing slash** to match.

## License

- `_posts/`, `public/images/posts/` — Copyright Tony Han (no reuse without permission)
- Everything else — MIT
