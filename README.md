# Tony's Portfolio

macOS-style interactive desktop — [tonyh2021.github.io](https://tonyh2021.github.io/)

## Stack

Next.js 15 (App Router), React 19, Tailwind v4 + Typography, Framer Motion, Zustand, react-rnd, React Markdown (remark-gfm, rehype-highlight).

## Features

### Desktop (`/desk`)
macOS simulator with dock, Launchpad, Spotlight, genie minimize; windows for Blog (markdown + tags), About, Safari, VS Code (github1s), Terminal; light/dark.

### Mobile (`/mobile`)
Responsive blog UI (inspired by [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)):

| Route | Description |
|-------|-------------|
| `/mobile` | About / home |
| `/mobile/posts` | Post list with zh/en toggle |
| `/mobile/posts/[slug]` | Post detail with prose rendering |
| `/mobile/tags` | Tag cloud |
| `/mobile/tags/[tag]` | Posts filtered by tag |

- Floating theme toggle + slide-in nav menu
- `prose` typography plugin for post content
- Syntax highlighting adapts to light/dark mode (github theme)
- Scroll position preserved when navigating back from post detail

### Smart routing
`/posts/[slug]` detects viewport on load:
- **mobile** (`< 768px`) → `/mobile/posts/[slug]`
- **desktop** → `/desk?post=[slug]`

## Dev

```bash
pnpm install && pnpm dev
```

- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` / `pnpm format:check` — Prettier

**`NEXT_PUBLIC_SITE_URL`** / **`NEXT_PUBLIC_BASE_PATH`** — copy `.env.example` → `.env.local`. Origin URL has no trailing slash. **User site** (`username.github.io` repo): leave `NEXT_PUBLIC_BASE_PATH` empty. **Project site** (e.g. `tonyh2021`): set `NEXT_PUBLIC_SITE_URL=https://<user>.github.io/tonyh2021` and GitHub Variable `NEXT_PUBLIC_BASE_PATH=/tonyh2021`.

## Build

```bash
pnpm build
```

`prebuild` runs `sync-post-bodies` → `public/data/post-bodies/{zh,en}/*.json` (gitignored; CI runs it too). Post detail pages load body JSON on demand; the page ships a light `PostIndexBundle` only. Edit `_posts/` then rebuild or use `predev` before dev.

Output: static `./out/` (GitHub Actions deploys to Pages). Repo **Settings → Pages**: source **GitHub Actions**.

**GitHub Pages + trailing slash:** `trailingSlash: true` exports `blog/<slug>/index.html` → live URL `/blog/<slug>/`. Canonicals, sitemap, and in-app links must use the trailing slash.

## License

- `_posts/`, `public/images/posts/` — Copyright Tony Han (no reuse without permission)
- Everything else — MIT
