---
layout: post
title: "Scrapy 代理指南"
description: ""
category: articles
tags: [Python]
comments: true
---


之前提到了使用动态代理可以有效防止爬虫被 ban。但是真正研究起来，又会遇到不少问题。


## 使用动态代理

主要是中间件的配置：

```python
class Mode:
    (RANDOMIZE_PROXY_EVERY_REQUESTS,
        RANDOMIZE_PROXY_ONCE,
        SET_CUSTOM_PROXY) = range(3)


class RandomProxy(object):
    # 使用动态代理

    def __init__(self, settings):
        self.mode = settings.get('PROXY_MODE')
        self.proxy_list = settings.get('PROXY_LIST')
        self.chosen_proxy = ''

        if (self.mode == Mode.RANDOMIZE_PROXY_EVERY_REQUESTS or
                self.mode == Mode.RANDOMIZE_PROXY_ONCE):
            if self.proxy_list is None:
                raise KeyError('PROXY_LIST setting is missing')
            self.proxies = {}
            fin = open(self.proxy_list)
            try:
                for line in fin.readlines():
                    parts = re.match(
                        '(\w+://)([^:]+?:[^@]+?@)?(.+)', line.strip())
                    if not parts:
                        continue

                    # Cut trailing @
                    if parts.group(2):
                        user_pass = parts.group(2)[:-1]
                    else:
                        user_pass = ''

                    self.proxies[parts.group(1) + parts.group(3)] = user_pass
            finally:
                fin.close()
            if self.mode == Mode.RANDOMIZE_PROXY_ONCE:
                self.chosen_proxy = random.choice(list(self.proxies.keys()))
        elif self.mode == Mode.SET_CUSTOM_PROXY:
            custom_proxy = settings.get('CUSTOM_PROXY')
            self.proxies = {}
            parts = re.match(
                '(\w+://)([^:]+?:[^@]+?@)?(.+)', custom_proxy.strip())
            if not parts:
                raise ValueError('CUSTOM_PROXY is not well formatted')

            if parts.group(2):
                user_pass = parts.group(2)[:-1]
            else:
                user_pass = ''

            self.proxies[parts.group(1) + parts.group(3)] = user_pass
            self.chosen_proxy = parts.group(1) + parts.group(3)

    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)

    def process_request(self, request, spider):
        # Don't overwrite with a random one (server-side state for IP)
        if 'proxy' in request.meta:
            if request.meta["exception"] is False:
                return
        request.meta["exception"] = False
        if len(self.proxies) == 0:
            raise ValueError('All proxies are unusable, cannot proceed')

        if self.mode == Mode.RANDOMIZE_PROXY_EVERY_REQUESTS:
            proxy_address = random.choice(list(self.proxies.keys()))
        else:
            proxy_address = self.chosen_proxy

        proxy_user_pass = self.proxies[proxy_address]

        request.meta['proxy'] = proxy_address
        if proxy_user_pass:
            basic_auth = 'Basic ' + base64.b64encode(
                proxy_user_pass.encode()).decode()
            request.headers['Proxy-Authorization'] = basic_auth
        else:
            logger.debug('Proxy user pass not found')
        logger.debug('Using proxy <%s>, %d proxies left' % (
                proxy_address, len(self.proxies)))

    def process_exception(self, request, exception, spider):
        if 'proxy' not in request.meta:
            return
        if (self.mode == Mode.RANDOMIZE_PROXY_EVERY_REQUESTS or
                self.mode == Mode.RANDOMIZE_PROXY_ONCE):
            proxy = request.meta['proxy']
            try:
                del self.proxies[proxy]
            except KeyError:
                pass
            request.meta["exception"] = True
            if self.mode == Mode.RANDOMIZE_PROXY_ONCE:
                self.chosen_proxy = random.choice(list(self.proxies.keys()))
            logger.info('Removing failed proxy <%s>, %d proxies left' % (
                proxy, len(self.proxies)))
```

`settings.py` 配置:

```python
# Proxy list containing entries like
# http://host1:port
# http://username:password@host2:port
# http://host3:port
# ...
PROXY_LIST = 'proxies.txt'
# Retry many times since proxies often fail
RETRY_TIMES = 10
# Retry on most error codes since proxies fail for different reasons
RETRY_HTTP_CODES = [500, 503, 504, 400, 403, 404, 408]
# Proxy mode
# 0 = Every requests have different proxy
# 1 = Take only one proxy from the list and assign it to every requests
# 2 = Put a custom proxy to use in the settings
PROXY_MODE = 0
# If proxy mode is 2 uncomment this sentence :
# CUSTOM_PROXY = "http://host1:port"


DOWNLOADER_MIDDLEWARES = {
    # 可能还有其他的中间件，这里只列出与代理相关的
    'scrapy.downloadermiddlewares.retry.RetryMiddleware': 90,
    'scrapydemo.middlewares.RandomProxy': 100,
    'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware': 110,
}
```

## 代理爬虫

当然可以写个工具，每隔一段时间抓取一些免费代理供爬虫使用，或者使用第三方的工具（[IPProxyPool](https://github.com/qiyeboy/IPProxyPool)）。

免费代理：

[http://www.66ip.cn](http://www.66ip.cn)
[http://cn-proxy.com](http://cn-proxy.com)
[https://proxy.mimvp.com/free.php](https://proxy.mimvp.com/free.php)
[http://www.kuaidaili.com](http://www.kuaidaili.com)
[http://www.cz88.net/proxy](http://www.cz88.net/proxy)
[http://www.ip181.com](http://www.ip181.com)
[http://www.xicidaili.com](http://www.xicidaili.com)
[https://proxy-list.org/english/index.php](https://proxy-list.org/english/index.php)
[https://hidemy.name/en/proxy-list](https://hidemy.name/en/proxy-list)
[http://www.cnproxy.com/proxy1.html](http://www.cnproxy.com/proxy1.html)
[https://free-proxy-list.net/anonymous-proxy.html](https://free-proxy-list.net/anonymous-proxy.html)

## 集成 socks

有时候需要爬取墙外的资源，就需要使用到 socks 等工具。但是 scrapy 又无法直接使用 socks，所以 shadowsocks 也就无法支持。

初步解决方案是，在 scrapy 和 socks 之间设置一个 HTTP 代理，shadowsocks 客户端自带了这个功能，所以直接将 `proxies.txt` 改为 shadowsocks 提供的本地地理即可。但是部署 shadowsocks 服务器的 ip 被封掉怎么办？

这样就得用到 [Tor project](https://www.torproject.org/)。

需要再开一篇来介绍 Tor。😓