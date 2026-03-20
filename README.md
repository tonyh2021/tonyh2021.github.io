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

## Build

```bash
pnpm build
```

Static output is generated in `./out/`.

## Deployment

Pushing to `master` triggers a GitHub Actions workflow that builds the site and deploys the `./out/` directory to the `gh-pages` branch.

Configure GitHub Pages: Settings → Pages → Source: `gh-pages` branch.

## License

The following directories and their contents are Copyright Tony Han. You may not reuse anything therein without permission:

- `_posts/`
- `public/images/`

All other directories and files are MIT Licensed.
