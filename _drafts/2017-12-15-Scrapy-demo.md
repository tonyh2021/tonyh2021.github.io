---
layout: post
title: "Scrapy 体验"
description: ""
category: articles
tags: [Python]
comments: true
---


## 前言

本文使用 Scrapy 创建一个示例爬虫。Scrapy 安装就略过了，使用 pip 安装很简单。

## 创建项目

执行命令：

```shell
$ scrapy startproject scrapydemo
```

得到输出：

```shell
New Scrapy project 'scrapydemo', using template directory '/usr/local/lib/python3.6/site-packages/scrapy/templates/project', created in:
    /Users/qd-hxt/scrapydemo

You can start your first spider with:
    cd scrapydemo
    scrapy genspider example example.com
```

项目下的主要目录有：

```shell
scrapydemo/
    scrapy.cfg            # 配置文件

    scrapydemo/           # 该项目的 Python 模块，代码目录
        __init__.py

        items.py          # 项目 item 的定义文件

        pipelines.py      # 项目 pipelines 文件

        settings.py       # 项目设置文件

        spiders/          # 存放 spiders 的目录
            __init__.py
```

## 创建第一个 spider

spider 就是我们常提到的“爬虫”。在 Scrapy 中，我们自定义 spider 类，来进行网站数据的解析。自定义 spider 类继承于 scrapy.Spider，定义了初始的 url，如何跟进网页中的链接以及如何分析页面中的内容， 提取生成 item 的方法。

在 `scrapydemo/spiders` 目录下新建文件 `stackoverflow_spider.py`：

```python
import scrapy

class StackoverflowSpider(scrapy.Spider):
    """Spider for Stackoverflow.
    """
    name = "stackoverflow"

    def start_requests(self):
        urls = [
            'https://stackoverflow.com/questions?page=1',
            'https://stackoverflow.com/questions?page=2',
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        page = response.url.split("=")[-1]
        filename = 'stackoverflow-%s.html' % page
        with open(filename, 'wb') as stackoverflow_file:
            stackoverflow_file.write(response.body)
        self.log('Saved file %s' % filename)
```

代码中，`StackoverflowSpider` 继承于 `scrapy.Spider`，主要的属性和方法有：

- [`name`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.name)：Spider 的标识，在同一项目中不能重名。

- [`start_requests`]((https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_requests))：必须返回一个可迭代的请求（也返回一个请求列表或者写一个生成器函数），Spider 将会抓取这些请求。随后的 url 将从这些初始请求后所获取到的内容中提取。

- [`parse()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.parse)：请求返回的响应将会被传到这个方法中进行解析。响应参数是 [TextResponse](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.TextResponse) 类的实例，这个实例包含了页面内容并且有些实用的方法。

[`parse()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.parse) 方法通常用来解析响应，提取被抓取的数据作为字典，同时寻找新的 URL，并从中创建新的请求（[Request](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Request)）。

#### 运行 spider

命令行中执行：

```shell
scrapy crawl stackoverflow
```

便可以运行名为我们刚创建的 `stackoverflow` 爬虫，向 [stackoverflow](https://stackoverflow.com) 网站发送请求。

输出：

```shell
......
2017-12-14 17:24:52 [stackoverflow] DEBUG: Saved file stackoverflow-1.html
2017-12-14 17:24:52 [scrapy.core.engine] DEBUG: Crawled (200) <GET https://stackoverflow.com/questions?page=2> (referer: None)
2017-12-14 17:24:52 [stackoverflow] DEBUG: Saved file stackoverflow-2.html
2017-12-14 17:24:52 [scrapy.core.engine] INFO: Closing spider (finished)
2017-12-14 17:24:52 [scrapy.statscollectors] INFO: Dumping Scrapy stats:
{'downloader/request_bytes': 789,
 'downloader/request_count': 3,
 'downloader/request_method_count/GET': 3,
 'downloader/response_bytes': 71545,
 'downloader/response_count': 3,
 'downloader/response_status_count/200': 3,
 'finish_reason': 'finished',
 'finish_time': datetime.datetime(2017, 12, 14, 9, 24, 52, 344166),
 'log_count/DEBUG': 6,
 'log_count/INFO': 7,
 'memusage/max': 49664000,
 'memusage/startup': 49659904,
 'response_received_count': 3,
 'scheduler/dequeued': 2,
 'scheduler/dequeued/memory': 2,
 'scheduler/enqueued': 2,
 'scheduler/enqueued/memory': 2,
 'start_time': datetime.datetime(2017, 12, 14, 9, 24, 50, 901932)}
2017-12-14 17:24:52 [scrapy.core.engine] INFO: Spider closed (finished)
```

并且当前目录会多了两个文件 *stackoverflow-1.html* 和 *stackoverflow-1.html*，文件的内容与 url 对应。

#### 运行原理

Scrapy 会将 Spider 通过 `start_requests` 方法返回的 [scrapy.Request](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Request) 对象放入队列中进行统一管理。每收到一个响应，便会实例化一个 [Response](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Response) 对象，并将 response 最为参数，调用 request 对应的回调方法（本例中就是 `parse()`）。

#### start_requests 方法简化

我们可以通过定义 [`start_urls`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_urls) 列表来代替 [`start_requests()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_requests) 方法。start_urls 列表将被默认的 [`start_requests()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_requests) 方法用来为 spider 创建初始请求。

```python
import scrapy

class StackoverflowSpider(scrapy.Spider):
    """Spider for Stackoverflow.
    """
    name = "stackoverflow"
    start_urls = [
        'https://stackoverflow.com/questions?page=1',
        'https://stackoverflow.com/questions?page=2',
    ]

    def parse(self, response):
        page = response.url.split("=")[-1]
        filename = 'stackoverflow-%s.html' % page
        with open(filename, 'wb') as stackoverflow_file:
            stackoverflow_file.write(response.body)
```

Scrapy 默认会调用 `parse()` 方法，返回对应 request 的响应数据。

#### 解析数据

我们可以使用 [Scrapy shell](https://doc.scrapy.org/en/latest/topics/shell.html#topics-shell) 工具来学习如何使用 Scrapy 进行数据解析。执行：

```shell
scrapy shell https://stackoverflow.com/questions?page=1
```

得到输出：

```shell
......
2017-12-14 17:44:38 [scrapy.extensions.telnet] DEBUG: Telnet console listening on 127.0.0.1:6023
2017-12-14 17:44:38 [scrapy.core.engine] INFO: Spider opened
2017-12-14 17:44:38 [scrapy.core.engine] DEBUG: Crawled (200) <GET https://stackoverflow.com/robots.txt> (referer: None)
2017-12-14 17:44:39 [scrapy.core.engine] DEBUG: Crawled (200) <GET https://stackoverflow.com/questions?page=1> (referer: None)
[s] Available Scrapy objects:
[s]   scrapy     scrapy module (contains scrapy.Request, scrapy.Selector, etc)
[s]   crawler    <scrapy.crawler.Crawler object at 0x10a37efd0>
[s]   item       {}
[s]   request    <GET https://stackoverflow.com/questions?page=1>
[s]   response   <200 https://stackoverflow.com/questions?page=1>
[s]   settings   <scrapy.settings.Settings object at 0x10a37e3c8>
[s]   spider     <DefaultSpider 'default' at 0x10a64dc50>
[s] Useful shortcuts:
[s]   fetch(url[, redirect=True]) Fetch URL and update local objects (by default, redirects are followed)
[s]   fetch(req)                  Fetch a scrapy.Request and update local objects
[s]   shelp()           Shell help (print this help)
[s]   view(response)    View response in a browser
>>>
```

接着可以继续执行命令来进行 [CSS](https://www.w3.org/TR/selectors) 解析：

```shell
>>> response.css('title')
```

输出：

```shell
[<Selector xpath='descendant-or-self::title' data='<title>Newest Questions - Page 1 - Stack'>]
```

执行 `response.css('title')` 命令得到的是 [`SelectorList`](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.SelectorList) 对象，存放的是用 XML/HTML 对象封装的 [Selector](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.Selector) 对象，可以进行进一步解析。

要从上面的标题中提取文本，可以执行：

```shell
>>> response.css('title::text').extract()
['Newest Questions - Page 1 - Stack Overflow']
```

这里有两点值得注意：

一个是由于使用了 `::text`，也就是说只会在 `<title>` 元素中进行文本元素的选择。如果不指定 `::text`，便会得到包含其标签的完整的标题元素：

```shell
>>> response.css('title').extract()
['<title>Newest Questions - Page 1 - Stack Overflow</title>']
```

其次是调用 `.extract()` 后，返回的结果是一个列表，也就是一个 [`SelectorList`](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.SelectorList) 实例。如果只需要第一个结果，可以这样做：

```shell
>>> response.css('title::text').extract_first()
'Newest Questions - Page 1 - Stack Overflow'
```

或者这样：

```shell
>>> response.css('title::text')[0].extract()
'Newest Questions - Page 1 - Stack Overflow'
```

当找不到匹配的元素时，使用 `.extract_first()` 可以避免 `IndexError`。对于大多数爬虫项目来说，异常处理也是很重要的，即便其中抓取时出现了错误，但至少能获取到部分数据。

除了 [`extract()`](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.Selector.extract) 和 `extract_first()` 方法之外，还可以使用 [`re(https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.Selector.re)`]() 方法使用*正则表达式*进行提取：

```shell
>>> response.css('title::text').re(r'Stack.*')
['Stack Overflow']
>>> response.css('title::text').re(r'S\w+')
['Stack']
```

使用 `view(response)` 可以在浏览器中打开响应页面，然后通过调试来选择合适的 CSS 选择器（在我的 MBPR 上一直没有能够使用 Chrome 打开）。

#### XPath

除了 CSS，也可以使用 [XPath](https://www.w3.org/TR/xpath)：

```shell
>>> response.xpath('//title')
[<Selector xpath='//title' data='<title>Newest Questions - Page 1 - Stack'>]
>>> response.xpath('//title/text()').extract_first()
'Newest Questions - Page 1 - Stack Overflow'
```

Scrapy 选择器实际是基于强大的 XPath 实现的。事实上，在底层 CSS 选择器会被转换为 XPath 选择器。以下链接可以查看更多内容：

- [using XPath with Scrapy Selectors here](https://doc.scrapy.org/en/latest/topics/selectors.html#topics-selectors)

- [this tutorial to learn XPath through examples](http://zvon.org/comp/r/tut-XPath_1.html)

- [this tutorial to learn "how to think in XPath"](http://plasmasturm.org/log/xpath101/)


#### 解析 Questions

执行命令：

```shell
>>> response.css("div.result-link")[0]
<Selector xpath="descendant-or-self::div[@class and contains(concat(' ', normalize-space(@class), ' '), ' question-summary ')]" data='<div class="question-summary" id="questi'>
```









