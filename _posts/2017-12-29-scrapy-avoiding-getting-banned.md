---
layout: post
title: "Scrapy 防 ban 指南"
description: ""
category: articles
tags: [Python]
comments: true
---

大多数网站都使用了不同程度的防爬机制，要想抓取到更多的信息，就必须采取相应的策略。

## 关闭 ROBOTSTXT_OBEY

`settings.py` 中，否则大部分网站对爬虫都不怎么欢迎：

```python
ROBOTSTXT_OBEY = False
```

## 动态设置 user agent

执行 `$ scrapy shell https://tonyh2021.github.io/articles/2017/12/15/Scrapy-Tutorial.html` 之后，查看 request：

```shell
>>> request.headers
{b'Accept': [b'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'], b'Accept-Language': [b'en'], b'User-Agent': [b'Scrapy/1.4.0 (+http://scrapy.org)'], b'Accept-Encoding': [b'gzip,deflate']}
```

`User-Agent` 为 `Scrapy blablabla...`，明显被卖了。

Scrapy 提供了修改 user agent 的中间件。如下代码：

```python
import logging
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware
import fake_useragent
from fake_useragent import FakeUserAgentError
# fake_useragent 是一个可以随机获取 user agent 的第三方库

class RandomUserAgentMiddleware(UserAgentMiddleware):
    # 使用 useragent 池，避免被 ban
    # 注意：需在 settings.py 中进行相应的设置

    def __init__(self, user_agent=''):
        self.user_agent = user_agent

    def process_request(self, request, spider):
        try:
            ua = fake_useragent.UserAgent().random
        except FakeUserAgentError:
            logging.log(logging.ERROR, 'Get UserAgent Error')

        # 记录当前使用的useragent
        logging.log(logging.INFO, 'Current UserAgent: %s' % (ua))
        request.headers['User-Agent'] = ua
```

同时需要在 `settings.py` 中进行相应的设置：

```python
DOWNLOADER_MIDDLEWARES = {
    'scrapydemo.middlewares.RandomUserAgentMiddleware': 543,
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
}
```

我执行更新操作时总是会遇到错误，可能是跟代理或长城有关，而且在爬知乎时经常会遇到浏览器版本过低的情况，所以最终没有使用 `fake_useragent`。

```shell
>>> from fake_useragent import UserAgent
>>> ua = UserAgent()
>>> ua.update()
```

```shell
fake_useragent.errors.FakeUserAgentError: Maximum amount of retries reached
```

最终的代码：

```python
import logging
import random
from scrapy import signals
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware

class RandomUserAgentMiddleware(UserAgentMiddleware):
    # RandomUserAgentMiddleware

    def __init__(self, settings, user_agent='Scrapy'):
        super(RandomUserAgentMiddleware, self).__init__()
        self.user_agent = user_agent
        user_agent_list_file = settings.get('USER_AGENT_LIST')
        if not user_agent_list_file:
            # If USER_AGENT_LIST_FILE settings is not set,
            # Use the default USER_AGENT or whatever was
            # passed to the middleware.
            ua = settings.get('USER_AGENT', user_agent)
            self.user_agent_list = [ua]
        else:
            with open(user_agent_list_file, 'r') as f:
                self.user_agent_list = [line.strip() for line in f.readlines()]

    @classmethod
    def from_crawler(cls, crawler):
        obj = cls(crawler.settings)
        crawler.signals.connect(obj.spider_opened,
                                signal=signals.spider_opened)
        return obj

    def process_request(self, request, spider):
        user_agent = random.choice(self.user_agent_list)
        logging.log(logging.INFO, "Current User-Agent: %s" % (user_agent))
        if user_agent:
            request.headers.setdefault('User-Agent', user_agent)
```

`settings.py` 中：

```python
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 \
            (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
USER_AGENT_LIST = 'useragents.txt'

...

DOWNLOADER_MIDDLEWARES = {
    'scrapydemo.middlewares.RandomUserAgentMiddleware': 543,
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
}
```

## 禁用 cookie

有些网站可能使用 cookie 来识别爬虫，所以要禁用此配置。

`settings.py` 中：

```python
COOKIES_ENABLED = False
```

## 设置 DOWNLOAD_DELAY

设置下载延迟（2 或更大）。可以参阅 [`DOWNLOAD_DELAY`](https://doc.scrapy.org/en/latest/topics/downloader-middleware.html#std:setting-COOKIES_ENABLED)

`settings.py` 中：

```python
DOWNLOAD_DELAY = 2
```

## 使用 Google cache 

如果可以的话，最好使用 [`Google cache`](http://www.googleguide.com/cached_pages.html) 抓取页面。

## 使用动态代理

在爬虫的 ip 被封掉后，可以动态换一个 ip，继续爬取。

国内可以使用[西刺代理](http://www.xicidaili.com/)，国外可以使用[Tor project](https://www.torproject.org/)，也可以使用开源项目[scrapoxy](http://scrapoxy.io/)。

这个内容有点多，单独开[一篇](https://tonyh2021.github.io/articles/2017/12/30/scrapy-proxy.html)介绍。

## 分布式爬虫

使用高分布式爬虫，比如 [`Crawlera`](https://scrapinghub.com/crawlera?_ga=2.82287444.395859301.1514550831-738205510.1514550826)。