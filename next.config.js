/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages maps /blog/<slug>/index.html
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    // Server Components cache to improve back-navigation experience
    staleTimes: {
      dynamic: 30, // Dynamic pages cache for 30 seconds
      static: 600, // Static pages cache for 600 seconds (articles rarely change)
    },
  },
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

/** Handle GitHub Pages subpath */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
const basePath =
  rawBase === ""
    ? ""
    : (rawBase.startsWith("/") ? `/${rawBase}` : `/${rawBase}`).replace(/\/$/, "");
if (basePath) {
  nextConfig.basePath = basePath;
  nextConfig.assetPrefix = basePath;
}

/** Enable static export only in production */
if (process.env.NODE_ENV === "production") {
  nextConfig.output = "export";
}

module.exports = nextConfig;
