---
layout: post
title: "Objective-C的runtime应用2"
description: ""
category: articles
tags: [runtime]
comments: true
---

## 字典转模型

`Student.h`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file=Student.h"></script>

`NSObject+Extension.h`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file=Extension.h"></script>

`NSObject+Extension.m`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file=Extension.m"></script>

`ViewController.m`

<script src="https://gist.github.com/lettleprince/17d6cef4bee3696a5d8e.js?file= ViewController-1.m"></script>

代码输出：

```
2016-02-23 18:48:22.022 runtime_demo[34262:4960140] stu的name值为: Tom, address为: Beijing
```

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

#### 文章中的代码都可以从我的Github [`runtime_demo `](https://github.com/lettleprince/runtime_demo)找到。