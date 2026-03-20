---
layout: post
title: "A Quick Reference for Jekyll Syntax"
description: ""
category: articles
tags: [Blog]
comments: true
---

## Introduction

If you just want to quickly set up a static `github` site and don't have time to study `jekyll` syntax right now, I recommend directly forking [my repository](https://github.com/tonyh2021/tonyh2021.github.io).

For the official documentation, please refer to the [official docs](http://jekyllrb.com/docs/home/).
This post covers only `jekyll` syntax, not other topics. For how to set up a blog, refer to [this post]().

### Configuration

#### File Overview

**_config.yml**

Jekyll's global configuration lives in `_config.yml`.
This includes things like the site name, domain, and URL format.

**_includes**

For reusable parts of the site like the header, footer, and sidebar, it makes sense to extract them into separate files for easier maintenance, then include them where needed.
Place these shared parts in this directory and include them with:

{% raw %}
```ruby
{% include filename %}
```
{% endraw %}

**_layouts**

For site layout, we typically write templates so that when writing actual content — like a blog post — we can focus on the content itself and just specify which template to use with a tag. Content that specifies a template can be thought of as a "child" of that template.
Why that analogy? Because templates can be nested multiple layers deep; the actual content is really just a template itself, just a leaf node.

To include child content in a template:

{% raw %}
```ruby
{{ content }}
```
{% endraw %}

To specify the parent template in the child:

> Note: this must appear at the very top of the child file.

```
---
layout: post
---
```

**_posts**

Written content — such as blog posts — is typically stored here and usually acts as leaf nodes.

_data

Also used for global variables, but for larger datasets. For example, if multiple people work on the site, you might define a `members.yml` file here.

File contents might look like:

```
- name: Tony Han
  github: tonyh2021
  nick : Tony
```

Then in templates you can access this data with:

```ruby
site.data.members
```

**_site**

Where Jekyll outputs the generated site. This directory should generally be added to `.gitignore`.

**index.html**

The homepage file. The extension is sometimes `index.md` or others.
You'll need to write this yourself, as there can be subtle differences between formats in certain situations.

**Static Assets**

For other static assets, you can place them directly in the root directory or any other directory. Paths work the same as on a regular website — just reference them by path.

#### Configuring Global Variables

Although global variables all have default values, we often set them manually to achieve our desired results.

**Source directory**

This generally doesn't need to be set; leave the default.

```
source: DIR
```

It can also be specified at compile time, but when using `github`, you cannot pass parameters.

```
-s, --source DIR
```

**Output directory**

This is also typically left at the default:

```bash
#Compile parameter -d, --destination DIR
destination: DIR #config syntax
```

**Safe switch**

The official documentation just says:

> Disable custom plugins, and ignore symbolic links.

```
# compile parameter  --safe
safe: BOOL
```

**Exclude files**

This is very useful. Sometimes you have a file whose content you don't want `jekyll` to process — use this syntax to exclude those files.

```
exclude: [DIR, FILE, ...]
```

**Force-include files**

Sometimes file names fall outside the range that `jekyll` would normally process. Force-include them here. For example, `.htaccess` files.

```
include: [DIR, FILE, ...]
```

**Timezone**

Templates often convert times, and without specifying a timezone the output time may be off by several hours.

```
# timezone: Asia/Shanghai
timezone: TIMEZONE
```

**Encoding**

```
# encoding : utf-8
encoding: ENCODING
```

#### Template Syntax

Template syntax is divided into two parts: frontmatter definitions and the syntax itself.

**Frontmatter**

The frontmatter is mainly used to specify the layout and define variables such as title, description, category/categories, tags, whether comments are enabled, and custom variables.

```
---
layout: post
title: "A Quick Reference for Jekyll Syntax"
description: ""
category: articles
tags: [Blog]
comments: true
---
```

**Using Variables**

All variables are tree nodes. For example, variables defined in the frontmatter are accessed with:

```
page.title
```

`page` is the root node for the current page.

The global root nodes are:

- site — configuration from _config.yml
- page — the page's configuration info
- content — used in templates to include child node content
- paginator — pagination info


**Variables under `site`**

- site.time — the time jekyll is run
- site.pages — all pages
- site.posts — all posts
- site.related_posts — 10 related posts; defaults to the 10 most recent; set lsi for similar posts
- site.static_files — files not processed by jekyll, with attributes path, modified_time, and extname
- site.html_pages — all HTML pages
- site.collections — new feature, haven't used it
- site.data — data from the _data directory
- site.documents — all documents in all collections
- site.categories — all categories
- site.tags — all tags
- site.[CONFIGURATION_DATA] — custom variables

**Variables under `page`**

- page.content — page content
- page.title — title
- page.excerpt — excerpt
- page.url — URL
- page.date — date
- page.id — unique identifier
- page.categories — categories
- page.tags — tags
- page.path — source code location
- page.next — next post
- page.previous — previous post

**Variables under `paginator`**

- paginator.per_page — number of posts per page
- paginator.posts — posts on this page
- paginator.total_posts — total number of posts
- paginator.total_pages — total number of pages
- paginator.page — current page number
- paginator.previous_page — previous page number
- paginator.previous_page_path — previous page path
- paginator.next_page — next page number
- paginator.next_page_path — next page path

**Character Escaping**

To output a literal `{`, use `\` to escape it.

```
\{ => {
```

**Outputting Variables**

Wrap a variable in double curly braces to output it.

{% raw %}
```ruby
{{ page.title }}
```
{% endraw %}

**Loops**

Very similar to interpreted languages.

{% raw %}
```ruby
{% for post in site.posts %}
	<a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}
```
{% endraw %}

**Auto-generated Excerpts**

{% raw %}
```ruby
{% for post in site.posts %}
	{{ post.url }} {{ post.title }}
	{{ post.excerpt | remove: 'test' }}
{% endfor %}
```
{% endraw %}

**Removing Specific Text**

`remove` deletes specified content from a variable.

{% raw %}
```ruby
{{ post.url | remove: 'http' }}
```
{% endraw %}

**Stripping `html` Tags**

Useful when working with excerpts.

{% raw %}
```ruby
{{ post.excerpt | strip_html }}
```
{% endraw %}

**Code Highlighting**

{% raw %}
```ruby
{% highlight ruby linenos %}
\# some ruby code
{% endhighlight %}
```
{% endraw %}

**Array Size**

{% raw %}
```ruby
{{ array | size }}
```
{% endraw %}

**Assignment**

{% raw %}
```ruby
{% assign index = 1 %}
```
{% endraw %}

**Formatting Dates**

{% raw %}
```ruby
{{ site.time | date_to_xmlschema }} 2008-11-07T13:07:54-08:00
{{ site.time | date_to_rfc822 }} Mon, 07 Nov 2008 13:07:54 -0800
{{ site.time | date_to_string }} 07 Nov 2008
{{ site.time | date_to_long_string }} 07 November 2008
```
{% endraw %}

**Searching by Key**

{% raw %}
```ruby
# Select all the objects in an array where the key has the given value.
{{ site.members | where:"graduation_year","2014" }}
```
{% endraw %}

**Sorting**

{% raw %}
```ruby
{{ site.pages | sort: 'title', 'last' }}
```
{% endraw %}

**to json**

{% raw %}
```ruby
{{ site.data.projects | jsonify }}
```
{% endraw %}

**Serialization**

Convert an object to a string.

{% raw %}
```ruby
{{ page.tags | array_to_sentence_string }}
```
{% endraw %}

**Word Count**

{% raw %}
```ruby
{{ page.content | number_of_words }}
```
{% endraw %}

**Limiting Results**

Get a subset of an array by specifying a range.

{% raw %}
```ruby
{% for post in site.posts limit:20 %}
```
{% endraw %}

**Content File Naming Convention**

For blog posts, the filename must follow the format `YEAR-MONTH-DAY-title.MARKUP`.

For example:

{% raw %}
```ruby
2014-11-06-memcached-code.md
2014-11-06-memcached-lib.md
2014-11-06-sphinx-config-and-use.md
2014-11-07-memcached-hash-table.md
2014-11-07-memcached-string-hash.md
```
{% endraw %}

### Cross-referencing Posts in Jekyll

Cross-referencing posts is inevitable when blogging. For a Markdown file named `2016-03-10-memory2-block.md`, you can reference it with `[iOS Block Memory Allocation](../../../2016/03/10/memory2-block.html)`.

### Enabling the Drafts Feature

For unfinished posts you don't want to publish, create a `_drafts` folder in the project directory and move those documents there. They won't appear in a normal build. However, if you start the server with `bundle exec jekyll server --watch --drafts`, you'll be able to see all documents including drafts.
