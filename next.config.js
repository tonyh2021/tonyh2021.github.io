/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
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

/**
 * Static export is required for GitHub Pages, but with `output: "export"` Next will refuse
 * to render unknown `/blog/[slug]` in dev (runtime error before `notFound()`).
 * Enable export only for production `next build` so local `next dev` matches normal App Router behavior.
 */
if (process.env.NODE_ENV === "production") {
  nextConfig.output = "export";
}

module.exports = nextConfig;
