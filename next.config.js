/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * GitHub Pages maps directories (`blog/<slug>/index.html`) to `/blog/<slug>/`.
   * `blog/<slug>.html` alone often 404s at `/blog/<slug>` with no extensionless rewrite.
   */
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "github.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "react.dev", pathname: "/**" },
      { protocol: "https", hostname: "developer.apple.com", pathname: "/**" },
    ],
  },
};

/** Project site: `https://<user>.github.io/<repo>/` — set e.g. `/tonyh2021` in CI vars. */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
const basePath =
  rawBase === ""
    ? ""
    : (rawBase.startsWith("/") ? rawBase : `/${rawBase}`).replace(/\/$/, "");
if (basePath) {
  nextConfig.basePath = basePath;
  nextConfig.assetPrefix = basePath;
}

/**
 * Static export is required for GitHub Pages, but with `output: "export"` Next will refuse
 * to render unknown `/blog/[slug]` in dev (runtime error before `notFound()`).
 * Enable export only for production `next build` so local `next dev` matches normal App Router behavior.
 */
if (process.env.NODE_ENV === "production") {
  nextConfig.output = "export";
}

module.exports = nextConfig;
