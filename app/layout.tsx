import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tony's Portfolio",
    template: "%s | Tony's Portfolio",
  },
  description: "Tony Han's portfolio and technical blog.",
  applicationName: "Tony's Portfolio",
  authors: [{ name: "Tony Han" }],
  creator: "Tony Han",
  publisher: "Tony Han",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Tony's Portfolio",
    title: "Tony's Portfolio",
    description: "Tony Han's portfolio and technical blog.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tony's Portfolio",
    description: "Tony Han's portfolio and technical blog.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Tony Han" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen overflow-hidden bg-black">{children}</body>
    </html>
  );
}
