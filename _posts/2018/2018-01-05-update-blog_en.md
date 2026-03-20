---
layout: post
title: "Some Updates for Jekyll + GitHub Pages"
description: ""
category: articles
tags: [Blog]
comments: true
---


## GitHub Warning

When viewing the blog repository, GitHub showed a warning — clearly indicating that a dependency needed updating:

```
We found a potential security vulnerability in one of your dependencies.
The redcloth dependency defined in Gemfile.lock has a known moderate severity security vulnerability in version range < 4.3.0 and should be updated.
```

So I ran the updates:

```shell
sudo gem update jekyll
sudo gem update bundler
sudo bundle update
```

## `nokogiri` Installation Error

During `bundle update`, the following error occurred:

```shell
Installing nokogiri 1.8.1 (was 1.6.7.2) with native extensions
Gem::Ext::BuildError: ERROR: Failed to build gem native extension.
```

This turned out to be a `nokogiri` dependency issue. After trying several solutions, this one finally worked:

```shell
sudo gem install nokogiri -v '1.8.1' -- --use-system-libraries --with-xml2-include=/usr/include/libxml2 --with-xml2-lib=/usr/lib
```

With `nokogiri` successfully installed, running:

```shell
sudo bundle update
```

completed without errors.

## Startup Warnings

There were warnings on startup that I couldn't leave alone:

```shell
$ bundle exec jekyll serve
Configuration file: /Users/qd-hxt/Documents/gworkspace/tonyh2021.github.io/_config.yml
       Deprecation: The 'gems' configuration option has been renamed to 'plugins'. Please update your config file accordingly.
            Source: /Users/qd-hxt/Documents/gworkspace/tonyh2021.github.io
       Destination: /Users/qd-hxt/Documents/gworkspace/tonyh2021.github.io/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
   GitHub Metadata: No GitHub API authentication could be found. Some fields may be missing or have incorrect data.
    Liquid Warning: Liquid syntax error (line 8): Expected end_of_string but found close_round in "tag in tag_words)" in tags.html
                    done in 9.032 seconds.
 Auto-regeneration: enabled for '/Users/qd-hxt/Documents/gworkspace/tonyh2021.github.io'
    Server address: http://127.0.0.1:4000//
  Server running... press ctrl-c to stop.
```

The first warning is about `gems` being renamed to `plugins`: simply replace `gems` with `plugins` in `_config.yml`.

The second is the `GitHub Metadata` warning, which is a bit more involved — see the next section.

The third is a `Liquid syntax` error. The reported line number may not account for comments, so just carefully inspect and fix the syntax.

## Handling the `GitHub Metadata` Warning

This error occurs because `gem 'github-pages'` is used in the `Gemfile`. The fix involves adding a GitHub token and a cert file.

1. Follow the instructions in [Create a personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) — when selecting scopes, check `repo`.

2. Open `.bash_profile` (or `.zshrc`, or whichever shell config you use) and add the following line, replacing the placeholder string with your newly generated token:

```shell
export JEKYLL_GITHUB_TOKEN=abc123abc123abc123abc123abc123abc123abc123abc123
```

3. Download the `cacert.pem` file from [here](https://curl.haxx.se/ca/cacert.pem][https://curl.haxx.se/ca/cacert.pem). Save it to your project directory and add `*.pem` to `.gitignore`.

4. Add the path to `cacert.pem` in your `.bash_profile` (or `.zshrc`, or other shell config):

```shell
export SSL_CERT_FILE=/Users/your/projects/paths/cacert.pem
```

5. Restart the terminal and run the startup command.

The server starts without any warnings. All issues resolved.
