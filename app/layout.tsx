import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tony's Portfolio",
  description: "Tony's Portfolio",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'UA-73798612-1');
            `,
          }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-73798612-1"
        />
      </head>
      <body className="h-screen overflow-hidden bg-black">{children}</body>
    </html>
  );
}
