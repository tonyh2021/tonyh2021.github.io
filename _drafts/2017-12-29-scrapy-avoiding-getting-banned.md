---
layout: post
title: "Scrapy 防 ban 指南"
description: ""
category: articles
tags: [Python]
comments: true
---

大多数网站都使用了不同程度的防爬机制，要想抓取到更多的信息，就必须采取相应的策略。

## 动态设置 user agent

执行 `$ scrapy shell http://ibloodline.com/articles/2017/12/15/Scrapy-Tutorial.html` 之后，查看 request：

```shell
>>> request.headers
{b'Accept': [b'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'], b'Accept-Language': [b'en'], b'User-Agent': [b'Scrapy/1.4.0 (+http://scrapy.org)'], b'Accept-Encoding': [b'gzip,deflate']}
```

`User-Agent` 为 `Scrapy blablabla...`，明显被卖了。

Scrapy 提供了修改 user agent 的中间件。如下代码：

```python
import logging
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware
from fake_useragent import UserAgent
# fake_useragent 是一个可以随机获取 user agent 的第三方库

class RotateUserAgentMiddleware(UserAgentMiddleware):
    # 使用 useragent 池，避免被 ban
    # 注意：需在 settings.py 中进行相应的设置

    def __init__(self, user_agent=''):
        self.user_agent = user_agent

    def process_request(self, request, spider):
        # location = './fake_useragent_%s.json' % fake_useragent.VERSION
        try:
            ua = fake_useragent.UserAgent().random
            # ua = fake_useragent.UserAgent(path=location).random
        except FakeUserAgentError:
            logging.log(logging.ERROR, 'Get UserAgent Error')

        # 记录当前使用的useragent
        logging.log(logging.INFO, 'Current UserAgent: %s' % (ua))
        request.headers['User-Agent'] = ua
```


















