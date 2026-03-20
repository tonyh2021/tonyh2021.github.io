---
layout: post
title: "Updating the Markdown Engine"
description: ""
category: articles
tags: [Blog]
comments: true
---

### Switching to the `kramdown` engine

I received an email from `GitHub Pages` saying that starting March 1st, only the `kramdown` engine would be supported, and code highlighting would need to switch to `Rouge`. Reference: [github-pages-now-faster-and-simpler-with-jekyll-3-0](https://github.com/blog/2100-github-pages-now-faster-and-simpler-with-jekyll-3-0)

So I had to dig into it — mainly to sort out code highlighting after switching to `kramdown`. I really didn't want to use [the Liquid tag](http://jekyllrb.com/docs/templates/#code-snippet-highlighting). (⊙o⊙)…

Update `_config.yml`:

```ruby
highlighter: rouge
markdown: kramdown
kramdown:
  input: GFM
```

It seems you can now just wrap code with \`\`\`, which is consistent with standard Markdown syntax. The remaining step is to remove anything Pygments-related.

```js
function test() {
  console.log("notice the blank line before this function?");
}
```

> GitHub Pages now only supports Rouge, a pure-Ruby syntax highlighter, meaning you no longer need to install Python and Pygments to preview your site locally.

Great news for Rubyists, though I'm more familiar with Python. (⊙o⊙)...

After making the change, previewing at `localhost` didn't work. But once pushed to GitHub Pages and accessed via the custom domain, everything was fine.

Also, if you want to include a `Liquid tag` literally, for example:

{% raw %}
```html
{% for post in paginator.posts %}
    <a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}
```
{% endraw %}

you need to wrap it in the {% raw %}`{% raw %}`{% endraw %} tag. Check the source of [this page on GitHub](https://github.com/tonyh2021/tonyh2021.github.io) for details.
