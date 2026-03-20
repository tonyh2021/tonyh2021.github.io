---
layout: post
title: "Building a Personal Blog with Jekyll + GitHub Pages"
description: "The blog is finally up and running. Writing a few posts to document the process, and as a test."
category: articles
tags: [Blog]
comments: true
---

During the Spring Festival holiday I had nothing to do, and on a whim I signed up for a `GoDaddy` domain. After cooling down, I figured since I'd already paid for it, I might as well stick with it. 😓

### Registering a Domain

`GoDaddy` has various discount codes and supports Alipay — the best choice for beginners.
[Discount codes and related steps](http://www.goyouhuima.com/)

### Creating a GitHub Page

[`github-page`](https://pages.github.com/) comes in two flavors: project pages and user pages. We're interested in user pages. Each account can only have one repository for a personal homepage, and the repository name must follow the special naming convention `username/username.github.io`. You can access your personal homepage at `http://username.github.io`.
Creating a repository through the wizard is straightforward, and testing it works easily. However, the repository won't have a blog structure yet. Note that the content of a personal page lives on the master branch.

### Binding a Domain

Use [`DNSpod`](https://www.dnspod.cn/): register and add your domain. Reference: [How to Build an Independent Blog](http://cnfeat.com/blog/2014/05/10/how-to-build-a-blog/)

### Setting Up the Environment

Many people recommend using `jekyll`, and there are many ready-made templates available, making it quite convenient.

#### Installing `jekyll`

```bash
$ sudo gem install jekyll
#After installation, check the version number
$ jekyll -v
jekyll 3.1.1
```

#### Running Jekyll

Navigate to the project directory and run:

```bash
$jekyll serve --safe --watch
```

At this point, `jekyll` will listen for `http` requests on port `4000` of `localhost`. Open a browser and visit `http://localhost:4000/index.html` to see your page!

### Using jekyll

Reference: [Step by Step: Creating a Blog on GitHub Pages (5)](http://www.pchou.info/web-build/2013/01/07/build-github-blog-page-05.html)
Also: [Build Your Own GitHub Pages Blog](http://azeril.me/blog/Build-Your-First-GitHub-Pages-Blog.html)
For site design, front-end developers are more experienced — borrowing a template is the fastest approach.
The site [template is available here](https://github.com/poole/lanyon).

### Notes on Environment Setup

I later wanted to follow the [official approach](https://help.github.com/articles/using-jekyll-with-pages/) to set up the Jekyll environment, and it took a bit of research to get it working.

```bash
#Install Bundler
$sudo gem install bundler

#Modify the Gemfile to:
source 'https://ruby.taobao.org'

group :jekyll_plugins do
    # gem "jekyll-paginate"
    # gem "jekyll-feed"
    gem 'github-pages'
    gem 'pygments.rb'
end

#Run in the project directory
$bundle install

#After installation, run jekyll
$bundle exec jekyll serve
```

### Adding Code Highlighting

Install [`pygments`](http://pygments.org/)

```bash
pip install pygments
```

`Pygments` offers more than ten highlight style options. You can view all available styles as follows:

```bash
from pygments.styles import STYLE_MAP
STYLE_MAP.keys()
['manni', 'igor', 'lovelace', 'xcode', 'vim', 'autumn', 'vs', 'rrt', 'native', 'perldoc', 'borland', 'tango', 'emacs', 'friendly', 'monokai', 'paraiso-dark', 'colorful', 'murphy', 'bw', 'pastie', 'algol_nu', 'paraiso-light', 'trac', 'default', 'algol', 'fruity']
```

Run the following command in the project directory, where `default` can be replaced with `xcode` or `monokai`.

```bash
pygmentize -f html -a .highlight -S default > css/pygments.css
```

If this doesn't run, check whether `echo $PATH` contains the Python directory `/Users/username/Library/Python/2.7/bin`.

Modify `_config.yml`:

```ruby
markdown: redcarpet
highlighter: pygments
```

### Social Comments

In the end I went with [`Disqus`](https://disqus.com/), which now supports Chinese.

### Enabling Pagination

First, enable pagination in Jekyll by adding the following to `_config.yml`:

```ruby
paginate: 5
paginate_path: "blog/page:num"
```

#### Using Pagination

Simply enabling pagination isn't enough — we need to actually use it on the homepage. Add the following code to your homepage (`/index.html`):

{% raw %}
```html
{% for post in paginator.posts %}
    <a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}
```
{% endraw %}

With this, `jekyll` will paginate based on `paginator`. As many pages as are generated, that many page files will be created. Posts 1–5 will appear on `/index.html`, posts 6–10 on `/page2/index.html`, and so on.

#### Page Navigation

Pagination alone isn't enough — we also need navigation between pages, which uses some additional `paginator` attributes.

First, check the total number of pages. If there's only one page, pagination is unnecessary. Use the `total_pages` attribute of `paginator`:

{% raw %}
```html
{% if paginator.total_pages > 1 %}
<!-- pagination code -->
{% endif %}
```
{% endraw %}

We need a "Previous Page" button that doesn't appear on the first page. Use `paginator`'s `previous_page` attribute to determine if we're on the first page, and `previous_page_path` to output the previous page path. Remember to prepend `baseurl` and perform any necessary character substitutions:

{% raw %}
```html
{% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path | prepend: site.baseurl | replace: '//', '/' }}"Previous Page</a>
{% endif %}
```
{% endraw %}

Next, generate buttons for all pages and disable the button for the current page. Iterate over all pages, use `paginator`'s `page` attribute to identify the current page — if it's the current page, the button is disabled; otherwise use {% raw %}`{{ site.paginate_path | prepend: site.baseurl | replace: '//', '/' | replace: ':num', page }}`{% endraw %} to replace `:num` with the current page number and generate the page path:

{% raw %}
```html
{% for page in (1..paginator.total_pages) %}
	{% if page == paginator.page %}
		<span class="active">{{ page }}</span>
    {% elsif page == 1 %}
		<a href="{{ '/index.html' | prepend: site.baseurl | replace: '//', '/' }}">{{ page }}</a>
    {% else %}
		<a href="{{ site.paginate_path | prepend: site.baseurl | replace: '//', '/' | replace: ':num', page }}">{{ page }}</a>
	{% endif %}
{% endfor %}
```
{% endraw %}

Finally, generate a "Next Page" button that doesn't appear on the last page. Similar to the "Previous Page" button, use `paginator`'s `next_page_path` to determine if there is a next page:

{% raw %}
```html
{% if paginator.next_page %}
    <a href="{{ paginator.next_page_path | prepend: site.baseurl | replace: '//', '/' }}">Next Page</a>
{% endif %}
```
{% endraw %}
