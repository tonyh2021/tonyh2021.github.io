# PROJECT_CONTEXT.md

## Project Overview

Personal blog built with **Next.js 15** (App Router), simulating a **macOS desktop UI**. Supports both **Chinese (zh)** and **English (en)** posts. State is managed with **Zustand**; styling uses **Tailwind CSS v4**.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 + PostCSS, SASS, `tailwind-merge` + `clsx` via `cn()`
- **State**: Zustand 5 (slices: `system`, `windows`, `dock`) — no persist middleware, localStorage handled manually
- **Animations**: Framer Motion
- **Content**: Markdown/MDX via `gray-matter` + `react-markdown` + rehype plugins
- **Package manager**: `pnpm`

## Commands

```bash
pnpm dev          # predev runs sync-post-bodies first
pnpm build        # prebuild runs sync-post-bodies first
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm format       # prettier --write
pnpm run sync-post-bodies  # regenerate public/data/post-bodies/**/*.json
```

## Project Structure

```
_posts/            # Markdown source files
  <year>/
    YYYY-MM-DD-title.md       # Chinese post
    YYYY-MM-DD-title_en.md    # English post (suffix _en)

app/               # Next.js App Router
  desk/            # macOS desktop view
  mobile/          # Mobile view
  posts/[slug]/    # Post detail (mobile)
  tags/, about/

components/
  apps/            # App windows (PostApp, TagsApp, …)
  desktop/         # MacDesktop, TopBar, Dock
  mobile/          # MobileFloatingControls, MobilePostList, …
  menus/           # ControlCenterMenu, AppleMenu, WifiMenu

store/
  index.ts         # useStore = create<SystemSlice & WindowsSlice & DockSlice>
  slices/
    system.ts      # dark, brightness, volume, wifi, bluetooth, locale, …
    windows.ts
    dock.ts

lib/
  posts.ts         # getAllPosts, getPostBySlug, getPostIndexBundle, getAllTags
  postBundle.ts    # Locale type, resolvePostIndices (with zh fallback)
  types.ts         # Post, PostIndex, PostIndexBundle, PostFrontMatter
  i18n/            # (empty — reserved for UI string i18n)

contexts/
  PostIndexContext.tsx  # SSR-provided PostIndexBundle via React Context

scripts/
  generate-post-bodies.ts  # writes public/data/post-bodies/{zh|en}/{slug}.json

openspec/          # OpenSpec workflow (tony-blog schema)
  changes/
  specs/
```

## Post Conventions

- **Chinese posts**: `_posts/<year>/YYYY-MM-DD-slug.md`
- **English posts**: `_posts/<year>/YYYY-MM-DD-slug_en.md` (append `_en` before extension)
- Slug is derived from filename: strip `_en` suffix + extension, lowercase, spaces → `-`
- Date is parsed from the filename prefix `YYYY-MM-DD`
- Frontmatter fields: `title`, `description?`, `tags?`, `date` (auto from filename), `category?`

## Architecture Notes

### Locale / Language

- `Locale = "zh" | "en"` defined in `lib/postBundle.ts`
- Global locale stored in Zustand `system` slice (`locale` + `setLocale`)
- Persisted to `localStorage` under key `tony-blog-locale`; default is `"en"`
- `resolvePostIndices(bundle, locale)` falls back to `zh` list when `en` is empty
- Post body JSON lives at `public/data/post-bodies/{locale}/{slug}.json`; regenerated on every `dev`/`build`

### Desktop UI

- macOS-style: `TopBar` → `ControlCenterMenu` (toggles: wifi, bluetooth, dark, fullscreen, **language**)
- Windows managed via `WindowsSlice`; draggable/resizable via `react-rnd`
- `PostApp` reads locale from store; clicking a slug via `blogCurrentSlug` selects that post

### Mobile UI

- `MobileFloatingControls`: top-right buttons for dark toggle + **language toggle** ("中"/"EN")
- `MobilePostList` reads locale from store
- Scroll position saved to `sessionStorage` on unmount

### SSR / Hydration

- `PostIndexBundle` is fetched server-side and injected via `PostIndexContext` to avoid client re-fetching
- Zustand slice defaults `locale` to `"en"`; `initLocale()` is called on client mount (alongside `initDark()`) to restore from `localStorage`
