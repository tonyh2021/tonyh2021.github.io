---
layout: post
title: "Objective-C的runtime应用2"
description: ""
category: articles
tags: [runtime]
comments: true
---

## 字典转模型



## 关联对象

直接上代码：

`MyClass+AssociatedObjectTest.h`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file=AssociatedObjectTest.h"></script>

`MyClass+AssociatedObjectTest.m`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file=AssociatedObjectTest.m"></script>

`ViewController.m`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file=ViewController.m"></script>

代码输出：

```
2016-02-23 17:46:25.424 runtime_demo[34075:4939529] myObj的属性property值为：Hi! AssociatedObject!
```