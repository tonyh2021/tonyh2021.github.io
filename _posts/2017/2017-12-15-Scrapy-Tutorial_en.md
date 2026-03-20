---
layout: post
title: "Scrapy Tutorial"
description: ""
category: articles
tags: [Python]
comments: true
---


## Introduction

This post uses Scrapy to build a sample web scraper. Installation of Scrapy is omitted here — installing via pip is straightforward.

## Creating a Project

Run the command:

```shell
$ scrapy startproject scrapydemo
```

Output:

```shell
New Scrapy project 'scrapydemo', using template directory '/usr/local/lib/python3.6/site-packages/scrapy/templates/project', created in:
    /Users/qd-hxt/scrapydemo

You can start your first spider with:
    cd scrapydemo
    scrapy genspider example example.com
```

The main directories in the project are:

```shell
scrapydemo/
    scrapy.cfg            # configuration file

    scrapydemo/           # the project's Python module, source directory
        __init__.py

        items.py          # project item definitions

        pipelines.py      # project pipelines file

        settings.py       # project settings file

        spiders/          # directory for spiders
            __init__.py
```

## Creating the First Spider

A spider is what we commonly call a "crawler." In Scrapy, we write custom spider classes to parse data from websites. Custom spider classes inherit from `scrapy.Spider` and define the initial URLs, how to follow links on pages, and how to parse page content to extract and generate items.

Create a new file `stackoverflow_spider.py` in the `scrapydemo/spiders` directory:

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

In this code, `StackoverflowSpider` inherits from `scrapy.Spider`. The main attributes and methods are:

- [`name`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.name): The spider's identifier. Must be unique within the same project.

- [`start_requests`]((https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_requests)): Must return an iterable of requests (either a list of requests or a generator function). The spider will crawl these requests. Subsequent URLs are extracted from the content retrieved by these initial requests.

- [`parse()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.parse): The response returned by a request is passed to this method for parsing. The response parameter is an instance of the [TextResponse](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.TextResponse) class, which contains the page content and provides several useful methods.

The [`parse()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.parse) method is typically used to parse responses, extract scraped data as dictionaries, and find new URLs from which to create new [Request](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Request) objects.

#### Running the Spider

Execute from the command line:

```shell
scrapy crawl stackoverflow
```

This runs the `stackoverflow` spider we just created and sends requests to the [stackoverflow](https://stackoverflow.com) website.

Output:

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

Two new files, *stackoverflow-1.html* and *stackoverflow-2.html*, will be created in the current directory, each containing the content from the corresponding URL.

#### How It Works

Scrapy takes the [scrapy.Request](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Request) objects returned by the spider's `start_requests` method and queues them for unified management. For each response received, a [Response](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Response) object is instantiated and passed as a parameter to the callback method associated with the request (in this case `parse()`).

#### Simplifying start_requests

We can define a [`start_urls`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_urls) list instead of implementing the [`start_requests()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_requests) method. The `start_urls` list will be used by the default [`start_requests()`](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.Spider.start_requests) method to create initial requests for the spider.

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

Scrapy will call the `parse()` method by default and return the response data for the corresponding request.

#### Parsing Data

We can use the [Scrapy shell](https://doc.scrapy.org/en/latest/topics/shell.html#topics-shell) tool to learn how to parse data with Scrapy. Execute:

```shell
scrapy shell https://stackoverflow.com/questions?page=1
```

Output:

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

Then you can run commands to perform [CSS](https://www.w3.org/TR/selectors) parsing:

```shell
>>> response.css('title')
```

Output:

```shell
[<Selector xpath='descendant-or-self::title' data='<title>Newest Questions - Page 1 - Stack'>]
```

Running `response.css('title')` returns a [`SelectorList`](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.SelectorList) object, which holds [Selector](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.Selector) objects wrapped in XML/HTML elements for further parsing.

To extract text from the title above:

```shell
>>> response.css('title::text').extract()
['Newest Questions - Page 1 - Stack Overflow']
```

Two things worth noting here:

First, using `::text` means only text nodes within the `<title>` element are selected. Without `::text`, you get the full title element including its tags:

```shell
>>> response.css('title').extract()
['<title>Newest Questions - Page 1 - Stack Overflow</title>']
```

Second, calling `.extract()` returns a list — a [`SelectorList`](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.SelectorList) instance. To get only the first result:

```shell
>>> response.css('title::text').extract_first()
'Newest Questions - Page 1 - Stack Overflow'
```

Or like this:

```shell
>>> response.css('title::text')[0].extract()
'Newest Questions - Page 1 - Stack Overflow'
```

Using `.extract_first()` avoids an `IndexError` when no match is found. Error handling is important in most scraping projects — even if errors occur during scraping, you can still retrieve partial data.

In addition to [`extract()`](https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.Selector.extract) and `extract_first()`, you can also use the [`re(https://doc.scrapy.org/en/latest/topics/selectors.html#scrapy.selector.Selector.re)`]() method with *regular expressions*:

```shell
>>> response.css('title::text').re(r'Stack.*')
['Stack Overflow']
>>> response.css('title::text').re(r'S\w+')
['Stack']
```

Use `view(response)` to open the response page in a browser and debug the appropriate CSS selectors.

#### XPath

In addition to CSS, you can also use [XPath](https://www.w3.org/TR/xpath):

```shell
>>> response.xpath('//title')
[<Selector xpath='//title' data='<title>Newest Questions - Page 1 - Stack'>]
>>> response.xpath('//title/text()').extract_first()
'Newest Questions - Page 1 - Stack Overflow'
```

Scrapy selectors are actually built on top of the powerful XPath implementation. In fact, CSS selectors are converted to XPath selectors under the hood. See the following links for more details:

- [using XPath with Scrapy Selectors here](https://doc.scrapy.org/en/latest/topics/selectors.html#topics-selectors)

- [this tutorial to learn XPath through examples](http://zvon.org/comp/r/tut-XPath_1.html)

- [this tutorial to learn "how to think in XPath"](http://plasmasturm.org/log/xpath101/)


#### Parsing Questions

Execute the command:

```shell
>>> question = response.css("div.summary")[0]
```

This gets the first question. Then execute:

```shell
>>> question_content = question.css("h3 a::text").extract_first()
>>> question_content
'How large can Protege import an Owl file?'
```

This retrieves the content of the first question. Now get the answer excerpt:

```shell
>>> answer = question.css("div.excerpt::text").extract_first()
>>> answer
"\r\n            I have a 2MB OWL file that I downloaded from the web. I tried to open it in Protege 5.2, it didn't report any issue or message, but simply load nothing in the UI. I suspect it might be due to the file ...\r\n        "
```

#### Parsing Data in the Spider

Let's integrate the above commands into our code. Typically, a Scrapy spider needs to generate dictionaries from page-extracted content, so we use the `yield` keyword:

```python
class StackoverflowSpider(scrapy.Spider):
    """Spider for Stackoverflow.
    """
    name = "stackoverflow"
    start_urls = [
        'https://stackoverflow.com/questions?page=1',
        'https://stackoverflow.com/questions?page=2',
    ]

    def parse(self, response):
        for question in response.css("div.summary"):
            yield {
                'question_content': question.css("h3 a::text").extract_first(),
                # To keep things brief, using the question author instead
                'user': question.css("div.user-details a::text").extract_first()
            }
```

Run the spider and the output will include:

```shell
......
2017-12-15 10:15:37 [scrapy.core.scraper] DEBUG: Scraped from <200 https://stackoverflow.com/questions?page=2>
{'question_content': 'How can I get rid of this error in windows command prompt?', 'user': 'Leo Li'}
2017-12-15 10:15:37 [scrapy.core.scraper] DEBUG: Scraped from <200 https://stackoverflow.com/questions?page=2>
{'question_content': 'Accessing a node within a tempate called from within a for-each', 'user': 'RDay'}
......
```

## Storing Data

The simplest approach is to use [Feed exports](https://doc.scrapy.org/en/latest/topics/feed-exports.html#topics-feed-exports) with the following command:

```shell
$ scrapy crawl stackoverflow -o stackoverflow.json
```

This generates a [JSON](https://en.wikipedia.org/wiki/JSON) file `stackoverflow.json` in the current directory. For historical reasons, running the command again will append to the file rather than overwrite it. If you don't remove the file before re-running, the JSON format will be corrupted.

You can also use other formats, such as [JSON Lines](http://jsonlines.org/):

```shell
$ scrapy crawl stackoverflow -o stackoverflow.jl
```

This format handles multiple runs and new record appends without any formatting issues. Additionally, since each record is on a separate line, large files can be processed without loading all content into memory (you can use command-line tools like [JQ](https://stedolan.github.io/jq) for processing).

The above is sufficient for small projects. But for more complex processing, you will need to use [Item Pipeline](https://doc.scrapy.org/en/latest/topics/item-pipeline.html#topics-item-pipeline). An Item Pipeline is created by default at project initialization: `scrapydemo/pipelines.py`.

## Following Links

Sometimes we need to crawl content from subsequent linked pages. You can see elements like this on the page:

```html
<div class="pager fl">
    <a href="/questions?page=2&amp;sort=newest" rel="next" title="go to page 2">
        <span class="page-numbers next"> next</span>
    </a>
</div>
```

Parse it in the shell:

```shell
>>> response.css('div.pager a').extract_first()
'<a href="/questions?page=2&amp;sort=newest" title="go to page 2"> <span class="page-numbers">2</span> </a>'
```

Then parse the `href` attribute:

```shell
>>> response.css('div.pager a::attr(href)').extract_first()
'/questions?page=2&sort=newest'
```

Update the spider code to be able to parse the next page:

```python
class StackoverflowSpider(scrapy.Spider):
    # Spider for Stackoverflow.

    name = "stackoverflow"
    start_urls = ['https://stackoverflow.com/questions?page=1&sort=newest']

    def parse(self, response):
        for question in response.css("div.summary"):
            yield {
                'question_content': question.css("h3 a::text").extract_first(),
                # To keep things brief, using the question author instead
                'user':
                question.css("div.user-details a::text").extract_first()
            }
        next_page = response.css(
            'div.pager a:last-of-type::attr(href)').extract_first()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)
```

After parsing the data, the `parse()` method extracts the next page URL, uses [`urljoin()`](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.Response.urljoin) to build the full URL, returns the request for the next page, and registers `parse()` as the callback for further parsing. This completes crawling across all pages.

Scrapy's internal mechanism: when a request is generated in a callback method, Scrapy places it in a queue for unified scheduling and executes the registered callback when the request completes.

Using this mechanism, you can build complex scrapers with custom rules and parse different types of data based on the crawled pages. Due to the large volume of data, I didn't wait for the spider to finish crawling.

#### Quickly Creating Requests

You can use [`response.follow`](https://doc.scrapy.org/en/latest/topics/request-response.html#scrapy.http.TextResponse.follow) to quickly create Request objects:

```python
class StackoverflowSpider(scrapy.Spider):
    # Spider for Stackoverflow.

    name = "stackoverflow"
    start_urls = ['https://stackoverflow.com/questions?page=1&sort=newest']

    def parse(self, response):
        for question in response.css("div.summary"):
            yield {
                'question_content': question.css("h3 a::text").extract_first(),
                # To keep things brief, using the question author instead
                'user':
                question.css("div.user-details a::text").extract_first()
            }
        next_page = response.css(
            'div.pager a:last-of-type::attr(href)').extract_first()
        if next_page is not None:
            yield response.follow(next_page, callback=self.parse)
```

`response.follow` supports relative paths and directly returns a Request object — just yield it. `response.follow` can even accept a selector directly instead of a string:

```python
for href in response.css('div.pager a:last-of-type::attr(href)'):
    yield response.follow(href, callback=self.parse)
```

For `<a>` tags, there is an even simpler approach:

```python
for href in response.css('div.pager a:last-of-type'):
    yield response.follow(href, callback=self.parse)
```

> Note: Since `response.css('div.pager a:last-of-type')` returns a list, `yield` needs to iterate with a for loop or take only the first element.


#### Other Examples

```python
class UserSpider(scrapy.Spider):
    # Spider for Stackoverflow users.

    name = "user"
    start_urls = ['https://stackoverflow.com/questions?page=1&sort=newest']

    def parse(self, response):
        for href in response.css("div.user-details a::attr(href)"):
            yield response.follow(href, self.parse_user)
        for href in response.css('div.pager a:last-of-type'):
            yield response.follow(href, callback=self.parse)

    def parse_user(self, response):
        name = response.css("h2.user-card-name ::text").extract_first().strip()
        bio = response.css("div.bio p::text").extract_first().strip()
        yield {
            'name': name,
            'bio': bio,
        }
```

The spider above starts from the main page and crawls the profile page of each user who asked a question. By default, Scrapy filters out duplicate URLs. This can be configured in [`DUPEFILTER_CLASS`](https://doc.scrapy.org/en/latest/topics/settings.html#std:setting-DUPEFILTER_CLASS).

[CrawlSpider](https://doc.scrapy.org/en/latest/topics/spiders.html#scrapy.spiders.CrawlSpider) is a generic spider that you can use as a base class for writing scrapers.

Additionally, a common pattern is to build an item from data on multiple pages, and [pass extra data to callbacks using this method](https://doc.scrapy.org/en/latest/topics/request-response.html#topics-request-response-ref-request-callback-arguments).

## Spider Arguments

When running a spider, you can pass command-line arguments using the `-a` option. These arguments are passed to the spider's `__init__` method as default attributes.

In the example below, the command is `$ scrapy crawl tag -o tag.jl -a tag=scrapy`, allowing the attribute to be accessed in the class:

```python
class TagSpider(scrapy.Spider):
    # Spider for Stackoverflow Tag.

    name = "tag"

    def start_requests(self):
        url = 'https://stackoverflow.com/questions/'
        tag = getattr(self, 'tag', None)
        if tag is not None:
            url = url + 'tagged/' + tag + '?sort=frequent'
        yield scrapy.Request(url, self.parse)

    def parse(self, response):
        for question in response.css("div.summary"):
            yield {
                'question_content': question.css("h3 a::text").extract_first(),
                # To keep things brief, using the question author instead
                'user':
                question.css("div.user-details a::text").extract_first()
            }
        for href in response.css('div.pager a:last-of-type'):
            yield response.follow(href, callback=self.parse)
```

[Here](https://doc.scrapy.org/en/latest/topics/spiders.html#spiderargs) you can find more information about argument handling.

## Going Further

Of course, the examples above are relatively simple. Scrapy has many other features — [here](https://doc.scrapy.org/en/latest/index.html#section-basics) you can find more.

## Code
All code from this article can be found on my GitHub: [ScrapyDemo](https://github.com/tonyh2021/ScrapyDemo).
