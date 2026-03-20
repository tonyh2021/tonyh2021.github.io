---
layout: post
title: "Scrapy Debugging Tips"
description: ""
category: articles
tags: [Python]
comments: true
---


This post covers the most common techniques for debugging spiders. Consider the following code:

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

This is a spider that crawls two pages. It also crawls a detail page, so the [`Request`](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Request) passes a `meta` parameter.

## The parse Command

The most basic way to inspect spider output is to use the `parse` command. It can check the behavior of individual spider methods at the method level and is both flexible and simple — but it cannot debug the internals of a method.

To view the content scraped from a specific URL:

```shell
$ scrapy parse --spider=myspider -c parse_item -d 2 <item_url>
[ ... scrapy log lines crawling example.com spider ... ]

>>> STATUS DEPTH LEVEL 2 <<<
# Scraped Items  ------------------------------------------------------------
[{'url': <item_url>}]

# Requests  -----------------------------------------------------------------
[]
```

Use the `--verbose` or `-v` option to see the status at each depth level:

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

Crawling from a single URL is also straightforward:

```shell
$ scrapy parse --spider=myspider -d 3 'http://example.com/page1'
```

## Scrapy Shell

While the `parse` command is very useful for inspecting spider behavior, it cannot inspect what happens inside a callback beyond viewing the received response and output. What if you need to debug why `parse_details` sometimes fails to retrieve scraped content?

In that case, use the [`shell`](https://doc.scrapy.org/en/latest/topics/commands.html#std:command-shell) tool. See [Invoking the shell from spiders to inspect responses](https://doc.scrapy.org/en/latest/topics/shell.html#topics-shell-inspect-response) for details.

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

## Open in Browser

Sometimes you just want to see a specific response in the browser. In that case, use the `open_in_browser` function. For example:

```python
from scrapy.utils.response import open_in_browser

def parse_details(self, response):
    if "item name" not in response.body:
        open_in_browser(response)
```

`open_in_browser` will open a browser displaying the response that the spider received at that point (it also adjusts the [base tag](http://www.w3schools.com/tags/tag_base.asp) so that images and styles display correctly).

## Logging

Logging is another useful way to get information about spider execution. While not the most convenient, logs can be saved for later reference.

```python
def parse_details(self, response):
    item = response.meta.get('item', None)
    if item:
        # populate more `item` fields
        return item
    else:
        self.logger.warning('No item received for %s', response.url)
```

For more information, see the [`Logging`](https://doc.scrapy.org/en/latest/topics/logging.html#topics-logging) section.
