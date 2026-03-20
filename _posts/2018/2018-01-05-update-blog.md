---
layout: post
title: "Jekyll + GitHubPages 的一些更新内容"
description: ""
category: articles
tags: [Blog]
comments: true
---


## GitHub 警告

查看博客仓库时，GitHub 报警告，很明显是需要更新依赖库：

```
We found a potential security vulnerability in one of your dependencies.
The redcloth dependency defined in Gemfile.lock has a known moderate severity security vulnerability in version range < 4.3.0 and should be updated.
```

于是更新：

```shell
sudo gem update jekyll
sudo gem update bundler
sudo bundle update
```

## `nokogiri` 安装错误

`bundle update` 执行过程中，遇到错误：

```shell
Installing nokogiri 1.8.1 (was 1.6.7.2) with native extensions
Gem::Ext::BuildError: ERROR: Failed to build gem native extension.
```

看来是 `nokogiri` 依赖的问题，找了不少办法，最后：

```shell
sudo gem install nokogiri -v '1.8.1' -- --use-system-libraries --with-xml2-include=/usr/include/libxml2 --with-xml2-lib=/usr/lib
```

`nokogiri` 安装成功，然后：

```shell
sudo bundle update
```

执行启动成功。

## 启动警告

启动过程中有警告，忍不了：

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

第一个是 `gems` 改名为 `plugins`：在 `_config.yml` 文件中将 `gems` 改为 `plugins` 即可。

第二个是 `GitHub Metadata`，有点麻烦，看下一章节。

第三个是 `Liquid syntax` 的语法错误，但是报的行数可能没有算上注释，仔细检查改正就好了。

## `GitHub Metadata` 警告处理

这个错误是由于 `gemfile` 中使用到了 `gem 'github-pages'`。解决方案添加 Github token 以及 cert 文件。

1. 参考 [create a personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)，在 `Select scopes` 时勾选 `repo` 即可。

2. 打开 `.bash_profile`（或 `.zshrc`，或其他），添加以下代码，后面的字符串换成刚生产的 token。

```shell
export JEKYLL_GITHUB_TOKEN=abc123abc123abc123abc123abc123abc123abc123abc123
```

3. 在[这里](https://curl.haxx.se/ca/cacert.pem][https://curl.haxx.se/ca/cacert.pem)下载 `cacert.pem` 文件。保存到项目目录下，`.gitignore`，中添加 `*.pem`。

4. 再在 `.bash_profile`（或 `.zshrc`，或其他）中添加 `cacert.pem` 的路径：

```shell
export SSL_CERT_FILE=/Users/your/projects/paths/cacert.pem
```

5. 重启终端，然后运行启动命令。

启动无警告。至此，所有问题解决。