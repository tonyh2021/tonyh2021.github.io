import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: "Tony's Blog",
  description: 'Notes and thoughts from Tony',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Tony Han" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=PT+Serif:400,400italic,700|PT+Sans:400"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai.min.css" />
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-73798612-1" />
      </head>
      <body>
        {/* Sidebar checkbox toggle — pure CSS, no JS needed */}
        <input type="checkbox" className="sidebar-checkbox" id="sidebar-checkbox" />

        <div className="sidebar" id="sidebar">
          <div className="sidebar-item">
            <p>Notes and thoughts from Tony</p>
          </div>
          <nav className="sidebar-nav">
            <a className="sidebar-nav-item" href="/">Home</a>
            <a className="sidebar-nav-item" href="/tags/">Tags</a>
            <a className="sidebar-nav-item" href="/about/">About</a>
          </nav>
          <div className="sidebar-item">
            <p className="social-icons">
              <a href="https://github.com/tonyh2021">
                <i className="fa fa-github fa-2x"></i>
              </a>
              <a href="https://stackoverflow.com/users/4172900/tony">
                <i className="fa fa-stack-overflow fa-2x"></i>
              </a>
            </p>
            <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </div>

        <div className="wrap">
          <div className="masthead">
            <div className="container">
              <h3 className="masthead-title">
                <a href="/" title="Home">{"Tony's Blog"}</a>
                <small>Notes and thoughts from Tony</small>
              </h3>
            </div>
          </div>
          <div className="container content">{children}</div>
        </div>

        <label htmlFor="sidebar-checkbox" className="sidebar-toggle">
          <i className="fa fa-bars"></i>
        </label>
      </body>
    </html>
  );
}
