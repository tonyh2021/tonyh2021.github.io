---
layout: post
title: "Scrapy 调试技巧"
description: ""
category: articles
tags: [Python]
comments: true
---


本文介绍了调试爬虫的最常用技巧。看下面的代码：

```python
import scrapy
from myproject.items import MyItem

class MySpider(scrapy.Spider):
    name = 'myspider'
    start_urls = (
        'http://example.com/page1',
        'http://example.com/page2',
        )

    def parse(self, response):
        # collect `item_urls`
        for item_url in item_urls:
            yield scrapy.Request(item_url, self.parse_item)

    def parse_item(self, response):
        item = MyItem()
        # populate `item` fields
        # and extract item_details_url
        yield scrapy.Request(item_details_url, self.parse_details, meta={'item': item})

    def parse_details(self, response):
        item = response.meta['item']
        # populate more `item` fields
        return item
```

这是爬取两个页面的爬虫。同时还会爬取一个详细信息页面，因此 [`Request`](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Request) 传入了 `meta` 参数。

## parse 命令

检查爬虫输出的最基本的方法是使用 parse 命令。parse 命令可以在方法级别检查爬虫各个部分的行为，并且灵活简单，但是无法在方法内部进行调试。

要查看从某一 url 抓取的内容：

```shell
$ scrapy parse --spider=myspider -c parse_item -d 2 <item_url>
[ ... scrapy log lines crawling example.com spider ... ]

>>> STATUS DEPTH LEVEL 2 <<<
# Scraped Items  ------------------------------------------------------------
[{'url': <item_url>}]

# Requests  -----------------------------------------------------------------
[]
```

使用 `--verbose` 或 `-v` 选项可以查看每个深度级别的状态。

```shell
$ scrapy parse --spider=myspider -c parse_item -d 2 -v <item_url>
[ ... scrapy log lines crawling example.com spider ... ]

>>> DEPTH LEVEL: 1 <<<
# Scraped Items  ------------------------------------------------------------
[]

# Requests  -----------------------------------------------------------------
[<GET item_details_url>]


>>> DEPTH LEVEL: 2 <<<
# Scraped Items  ------------------------------------------------------------
[{'url': <item_url>}]

# Requests  -----------------------------------------------------------------
[]
```

从单个 url 中爬取内容，同样也很简单：

```shell
$ scrapy parse --spider=myspider -d 3 'http://example.com/page1'
```

## Scrapy Shell

虽然 parse 命令对于检查爬虫的行为是非常有用，但除了查看接收到的响应和输出之外，无法检查回调内部发生了什么。如何调试 `parse_details` 有时没有获取到抓取内容的情况？

这种情况下，可以使用 [`shell`](https://doc.scrapy.org/en/latest/topics/commands.html#std:command-shell) 工具。具体查看 [Invoking the shell from spiders to inspect responses](https://doc.scrapy.org/en/latest/topics/shell.html#topics-shell-inspect-response)

```python
from scrapy.shell import inspect_response

def parse_details(self, response):
    item = response.meta.get('item', None)
    if item:
        # populate more `item` fields
        return item
    else:
        inspect_response(response, self)
```

## 浏览器打开

有时候只想看看浏览器中的特定响应，便可以使用 `open_in_browser` 函数。距离：

```python
from scrapy.utils.response import open_in_browser

def parse_details(self, response):
    if "item name" not in response.body:
        open_in_browser(response)
```

`open_in_browser` 会打开浏览器，显示出此时爬虫所接收到的响应（同时会调整 [base tag](http://www.w3schools.com/tags/tag_base.asp)，以便让图像和样式正确显示）。

## Logging

日志是获取爬虫运行信息的另一个有用的途径。虽然不是很方便，但是日志可以供日后需要时使用。

```python
def parse_details(self, response):
    item = response.meta.get('item', None)
    if item:
        # populate more `item` fields
        return item
    else:
        self.logger.warning('No item received for %s', response.url)
```

更多内容查看 [`Logging`](https://doc.scrapy.org/en/latest/topics/logging.html#topics-logging) 章节。


















