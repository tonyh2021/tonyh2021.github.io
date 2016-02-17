---
layout: post
title: "更新Markdown引擎"
description: ""
category: articles
tags: [Blog]
comments: true
---

### 修改`kramdown`引擎

收到了`GitHub Pages`的邮件，大概是说，3月1号开始只支持`kramdown`引擎，代码高亮也要改成`Rouge`。参考链接：[github-pages-now-faster-and-simpler-with-jekyll-3-0](https://github.com/blog/2100-github-pages-now-faster-and-simpler-with-jekyll-3-0)

只好再研究下——主要是改为`kramdown`后，代码高亮的问题。我可不想用[`the Liquid tag`](http://jekyllrb.com/docs/templates/#code-snippet-highlighting)。(⊙o⊙)…

貌似直接可用\`\`\`包裹代码，呃，跟Markdown普通语法一致。剩下的就是去掉Pygments相关了。

```js
function test() {
  console.log("notice the blank line before this function?");
}
```

> GitHub Pages now only supports Rouge, a pure-Ruby syntax highlighter, meaning you no longer need to install Python and Pygments to preview your site locally.

Rubyer的福音，可是我更熟悉Python啊(⊙o⊙)...

可是修改后查看`localhost`的是不行的。但是更新到pages上域名访问是可以的。