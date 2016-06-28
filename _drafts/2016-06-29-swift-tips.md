---
layout: post
title: "关于Swift的使用tips"
description: ""
category: articles
tags: [Swift]
comments: true
---

## 前言

今天被打击了。
凡事往前看。
回来继续混编。不要以为熟悉了OC和UIKit，看看Swift语法就可以无缝接入Swift开发，至少这个坑填了好一会。

## 从OC跳转

之前代码都是用的Xib，所以新建的Swift文件也要求是如此模式。
一般情况下，可以这么操作：新建OC文件的时候勾选创建Xib，然后便可以愉快地撸代码了。

```objc
MyViewController *my = [[MyViewController alloc] init];
[self.navigationController pushViewController:my animated:YES];
```

Swift下，如果使用Xib，而没有使用Storyboard，则需要这样。




