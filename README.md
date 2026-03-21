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

**`NEXT_PUBLIC_SITE_URL`** — copy `.env.example` → `.env.local`. No trailing slash; drives metadata, sitemap, robots. User site: `https://<user>.github.io`. Project subpath: align `basePath` / `assetPrefix` in `next.config.js` and set URL accordingly.

## Build

```bash
pnpm build
```

`prebuild` runs `sync-post-bodies` → `public/data/post-bodies/{zh,en}/*.json` (gitignored; CI runs it too). Blog loads bodies on demand; the page ships a light `PostIndexBundle` only. Edit `_posts/` then rebuild or use `predev` before dev.

Output: static `./out/` (GitHub Actions deploys it to Pages). Repo **Settings → Pages**: source **GitHub Actions**. Optional repo variable `NEXT_PUBLIC_SITE_URL` if not default.

**GitHub Pages + blog paths:** `trailingSlash: false` in `next.config.js` exports `blog/<slug>.html`, which Pages serves at **`/blog/<slug>`** (no trailing slash). **`/blog/<slug>/`** can 404 (no per-slug folder + `index.html`).

## License

- `_posts/`, `public/images/posts/` — Copyright Tony Han (no reuse without permission)
- Everything else — MIT
