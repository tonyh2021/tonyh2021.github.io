---
layout: post
title: "Scrapy Architecture Overview"
description: ""
category: articles
tags: [Python]
comments: true
---


## Introduction

When it comes to Python practice projects, web scraping is probably the most popular choice. Libraries like [Requests](http://docs.python-requests.org/en/master/) and [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) feel a bit like toys when used on their own, so I wanted to try [Scrapy](https://doc.scrapy.org/en/latest/topics/architecture.html). This post introduces Scrapy's architecture, drawing mainly from the official documentation [Architecture overview](https://doc.scrapy.org/en/latest/topics/architecture.html), which shows Scrapy's architecture and how its components interact.

## Data Flow ##

The diagram below illustrates Scrapy's architecture and the data flow (red arrows) between components. A brief description of each component and the data flow follows.

![scrapy_architecture_01](/images/posts/20171214-scrapy_architecture/scrapy_architecture_01.png)

In Scrapy, data flow is controlled by the execution engine. The main steps are:

1. The [Engine](#scrapy-engine) gets the initial Requests to crawl from the [Spider](#spiders).
2. The [Engine](#scrapy-engine) passes the Requests to the [Scheduler](#Scheduler) for unified scheduling, and also retrieves the next Requests to crawl.
3. The [Scheduler](#Scheduler) returns the next Requests to crawl to the [Engine](#scrapy-engine).
4. The [Engine](#scrapy-engine) sends these Requests to the [Downloader](#downloader) via [Downloader Middlewares](#downloader-middlewares) ([`process_request()`](https://doc.scrapy.org/en/latest/topics/downloader-middleware.html#scrapy.downloadermiddlewares.DownloaderMiddleware.process_request)).
5. Once a page has been downloaded, the [Downloader](#downloader) generates a Response (containing the page content) and sends it to the [Engine](#scrapy-engine) via [Downloader Middlewares](#downloader-middlewares) ([`process_response()`](https://doc.scrapy.org/en/latest/topics/downloader-middleware.html#scrapy.downloadermiddlewares.DownloaderMiddleware.process_response)).
6. The [Engine](#scrapy-engine) receives the Response from the [Downloader](#downloader) and sends it to the [Spider](#spiders) for parsing via [Spider Middleware](#spider-middlewares) ([`process_spider_input()`](https://doc.scrapy.org/en/latest/topics/spider-middleware.html#scrapy.spidermiddlewares.SpiderMiddleware.process_spider_input)).
7. The [Spider](#spiders) parses the Response and returns the parsed content and subsequent Requests to the [Engine](#scrapy-engine) via [Spider Middleware](#spider-middlewares) ([`process_spider_output()`](https://doc.scrapy.org/en/latest/topics/spider-middleware.html#scrapy.spidermiddlewares.SpiderMiddleware.process_spider_output)).
8. The [Engine](#scrapy-engine) sends the processed content to [Item Pipelines](#item-pipeline), then sends the subsequent Requests to the [Scheduler](#Scheduler) for scheduling and retrieves the next Requests to crawl.
9. Repeat from step 1 until all crawl requests in the [Scheduler](#Scheduler) have been processed.

Regarding steps 2 and 8, I think the interaction between the [Engine](#scrapy-engine) and the [Scheduler](#Scheduler) is best understood this way: the [Engine](#scrapy-engine) hands off all pending Requests to the [Scheduler](#Scheduler), which manages them in a queue-like structure, and continuously feeds the next Requests back to the [Engine](#scrapy-engine). In other words, the [Scheduler](#Scheduler) is responsible for maintaining the list of Requests and determining the order of crawling.

## Component Descriptions

### Scrapy Engine ###

The Engine is responsible for controlling data flow between all components of the system, and triggering the appropriate events when certain actions occur. See the [Data Flow](#data-flow) section for details.

### Scheduler ###

The Scheduler receives crawl requests from the Engine, enqueues them, and provides them back to the Engine when requested.

### Downloader ###

The Downloader is responsible for fetching web pages and returning them to the Engine, which then sends them to the Spiders.

### Spiders ###

Spiders are custom classes we write to parse responses and extract the required content or the next requests to follow. For more details, see [Spiders](https://doc.scrapy.org/en/latest/topics/spiders.html#topics-spiders).

### Item Pipeline ###

The Item Pipeline is responsible for processing the content extracted by Spiders — for example, data cleaning, validation, and persistence (storing to a database). For more details, see [Item Pipeline](https://doc.scrapy.org/en/latest/topics/item-pipeline.html#topics-item-pipeline).

### Downloader middlewares ###

Downloader middlewares sit between the Engine and the Downloader. They allow the Engine to pass requests to the Downloader, and the Downloader to pass downloaded responses back to the Engine.

Use Downloader middlewares when you need to:

- Process a request before it is sent to the Downloader (i.e., before Scrapy sends the request to the website);

- Process a response before it is sent to the spider;

- Send a new Request instead of passing a received response to a spider;

- Pass a response to a spider without fetching a web page;

- Silently drop certain requests.

For more details, see [Downloader middlewares](https://doc.scrapy.org/en/latest/topics/downloader-middleware.html#topics-downloader-middleware).

### Spider middlewares ###

Spider middlewares sit between the Engine and the Spiders. They handle Spider input (responses) and output (parsed content and requests).

Use Spider middlewares when you need to:

- Modify Spider output — for example, changing/adding/removing requests or items;

- Modify the initial web requests;

- Handle Spider exceptions;

- Call errback instead of returning a web request based on response content.

For more details, see [Spider middlewares](https://doc.scrapy.org/en/latest/topics/spider-middleware.html#topics-spider-middleware).

## Event-driven networking ##

Scrapy is written with [Twisted](https://twistedmatrix.com/trac/), a popular event-driven networking framework for Python. As a result, it uses non-blocking (asynchronous) code for concurrency.

For more information on asynchronous programming and Twisted, see these links:

- [Introduction to Deferreds in Twisted](https://twistedmatrix.com/documents/current/core/howto/defer-intro.html)
- [Twisted - hello, asynchronous programming](http://jessenoller.com/2009/02/11/twisted-hello-asynchronous-programming/)
- [Twisted Introduction - Krondo](http://krondo.com/an-introduction-to-asynchronous-programming-and-twisted/)
