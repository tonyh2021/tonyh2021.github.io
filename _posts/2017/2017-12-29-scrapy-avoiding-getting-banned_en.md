---
layout: post
title: "Scrapy Anti-Ban Guide"
description: ""
category: articles
tags: [Python]
comments: true
---

Most websites employ varying degrees of anti-scraping mechanisms. To collect more data, you need to adopt corresponding countermeasures.

## Disable ROBOTSTXT_OBEY

In `settings.py`, disable this setting — otherwise most websites won't welcome your spider:

```python
ROBOTSTXT_OBEY = False
```

## Dynamically Set the User Agent

After running `$ scrapy shell https://tonyh2021.github.io/articles/2017/12/15/Scrapy-Tutorial.html`, inspect the request:

```shell
>>> request.headers
{b'Accept': [b'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'], b'Accept-Language': [b'en'], b'User-Agent': [b'Scrapy/1.4.0 (+http://scrapy.org)'], b'Accept-Encoding': [b'gzip,deflate']}
```

The `User-Agent` is `Scrapy blablabla...` — it's obviously giving you away.

Scrapy provides a middleware for modifying the user agent. Here is the code:

```python
import logging
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware
import fake_useragent
from fake_useragent import FakeUserAgentError
# fake_useragent is a third-party library that can randomly retrieve a user agent

class RandomUserAgentMiddleware(UserAgentMiddleware):
    # Use a user agent pool to avoid being banned.
    # Note: corresponding settings must be configured in settings.py.

    def __init__(self, user_agent=''):
        self.user_agent = user_agent

    def process_request(self, request, spider):
        try:
            ua = fake_useragent.UserAgent().random
        except FakeUserAgentError:
            logging.log(logging.ERROR, 'Get UserAgent Error')

        # Log the current user agent being used
        logging.log(logging.INFO, 'Current UserAgent: %s' % (ua))
        request.headers['User-Agent'] = ua
```

You also need to add the corresponding settings in `settings.py`:

```python
DOWNLOADER_MIDDLEWARES = {
    'scrapydemo.middlewares.RandomUserAgentMiddleware': 543,
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
}
```

I kept running into errors when doing updates — possibly related to a proxy or the Great Firewall — and when scraping Zhihu I often encountered "browser version too old" errors. So I ultimately did not use `fake_useragent`.

```shell
>>> from fake_useragent import UserAgent
>>> ua = UserAgent()
>>> ua.update()
```

```shell
fake_useragent.errors.FakeUserAgentError: Maximum amount of retries reached
```

The final code:

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

In `settings.py`:

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

## Disable Cookies

Some websites may use cookies to identify scrapers, so it is a good idea to disable this.

In `settings.py`:

```python
COOKIES_ENABLED = False
```

## Set DOWNLOAD_DELAY

Set a download delay of 2 seconds or more. See [`DOWNLOAD_DELAY`](https://doc.scrapy.org/en/latest/topics/downloader-middleware.html#std:setting-COOKIES_ENABLED) for reference.

In `settings.py`:

```python
DOWNLOAD_DELAY = 2
```

## Use Google Cache

If possible, it is best to scrape pages via [`Google cache`](http://www.googleguide.com/cached_pages.html).

## Use Dynamic Proxies

After your scraper's IP is blocked, you can dynamically switch to a new IP and continue scraping.

In China, you can use [Xici Proxy](http://www.xicidaili.com/); internationally, you can use the [Tor project](https://www.torproject.org/), or the open-source project [scrapoxy](http://scrapoxy.io/).

This topic is a bit involved, so I've written a [separate post](https://tonyh2021.github.io/articles/2017/12/30/scrapy-proxy.html) about it.

## Distributed Crawlers

Use a highly distributed crawling service, such as [`Crawlera`](https://scrapinghub.com/crawlera?_ga=2.82287444.395859301.1514550831-738205510.1514550826).
