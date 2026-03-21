# Tony's Portfolio

A macOS-style interactive desktop portfolio, live at [https://tonyh2021.github.io/](https://tonyh2021.github.io/).

## Features

- macOS desktop simulation with draggable, resizable windows
- Dock with Launchpad, genie minimize animation
- Top bar with Apple menu, Wi-Fi toggle, Control Center (brightness, volume, dark mode, music player), Spotlight search
- **Blog** — markdown posts with tag filtering and full rendering
- **About** — personal intro
- **Safari** — in-app browser with favorites
- **VSCode** — embedded code viewer via github1s
- **Terminal** — interactive terminal emulator
- Light / Dark mode

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — dock magnification & animations
- [Zustand](https://zustand-demo.pmnd.rs/) — global state
- [react-rnd](https://github.com/bokuweb/react-rnd) — draggable/resizable windows
- [React Markdown](https://github.com/remarkjs/react-markdown) + remark-gfm + rehype-highlight

## Development

```bash
pnpm install
pnpm dev
```

Type-check only (no emit): `pnpm typecheck` (`tsc --noEmit`). `tsconfig.json` enables unused locals/parameters and no switch fallthrough.

Format with [Prettier](https://prettier.io/): `pnpm format` (write) / `pnpm format:check` (CI). ESLint uses `eslint-config-prettier` so style rules don’t fight Prettier.

**Environment (GitHub Pages):** Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to the **exact URL visitors use**, with no trailing slash — it powers `metadataBase`, canonical/OG tags, `sitemap.xml`, and `robots.txt`. For a **user/org site** (`<user>.github.io` from a `<user>.github.io` repo), use `https://<user>.github.io`. For a **project site** served at `https://<user>.github.io/<repo>/`, set `next.config.js` `basePath` / `assetPrefix` per Next docs and use a matching `NEXT_PUBLIC_SITE_URL` (often `https://<user>.github.io/<repo>`). CI already defaults this repo to `https://tonyh2021.github.io`; override with a repo **Variable** `NEXT_PUBLIC_SITE_URL` if needed.

## Build

```bash
pnpm build
```

Static output is generated in `./out/`.

## Deployment (GitHub Pages)

Pushing to `master` runs GitHub Actions: `pnpm build` → upload `./out/` → **GitHub Pages** (static hosting).

1. Repo **Settings → Pages**: set source to **GitHub Actions** (this workflow uses `deploy-pages`, not the legacy `gh-pages` branch unless you switched it — align Settings with how you publish).
2. Ensure **`NEXT_PUBLIC_SITE_URL`** in CI matches your live Pages URL so SEO links are not `localhost` (see workflow `env`; optional repo **Variable** override).

[GitHub Pages documentation](https://docs.github.com/pages)

## License

The following directories and their contents are Copyright Tony Han. You may not reuse anything therein without permission:

- `_posts/`
- `public/images/posts/`

All other directories and files are MIT Licensed.
