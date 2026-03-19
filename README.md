# Tony's Blog

Source for [https://tonyh2021.github.io/](https://tonyh2021.github.io/)

Built with [Next.js 14](https://nextjs.org/) (App Router) and [React Markdown](https://github.com/remarkjs/react-markdown), styled with the [Lanyon](http://lanyon.getpoole.com/) theme. Deployed to GitHub Pages via GitHub Actions.

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

Pushing to `master` triggers a GitHub Actions workflow that builds the site and deploys the `./out/` directory to the `gh-pages` branch. Configure GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch.

## License

The following directories and their contents are Copyright Tony Han. You may not reuse anything therein without permission:

- `_posts/`
- `public/images/`

All other directories and files are MIT Licensed.
