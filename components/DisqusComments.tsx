'use client';

import { useEffect } from 'react';

interface Props {
  slug: string;
  title: string;
}

export default function DisqusComments({ slug, title }: Props) {
  useEffect(() => {
    // Reconstruct original Jekyll URL to preserve existing comment threads
    // Jekyll default: /YYYY/MM/DD/title/
    const parts = slug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
    const jekyllUrl = parts
      ? `https://tonyh2021.github.io/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}/`
      : `https://tonyh2021.github.io/blog/${slug}/`;

    const d = window.document;
    const dsq = d.createElement('script');
    dsq.type = 'text/javascript';
    dsq.async = true;
    dsq.src = '//tony.disqus.com/embed.js';

    type DisqusWindow = Window & {
      disqus_config?: (this: { page: { url: string; identifier: string; title: string } }) => void;
    };
    (window as DisqusWindow).disqus_config = function () {
      this.page.url = jekyllUrl;
      this.page.identifier = slug;
      this.page.title = title;
    };

    const s = d.getElementById('disqus_thread');
    if (s && s.parentNode) {
      s.parentNode.insertBefore(dsq, s);
    }

    return () => {
      if (dsq.parentNode) dsq.parentNode.removeChild(dsq);
    };
  }, [slug, title]);

  return <div id="disqus_thread"></div>;
}
