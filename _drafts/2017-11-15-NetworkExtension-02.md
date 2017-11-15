---
layout: post
title: "构建 NetworkExtension 应用（二）"
description: ""
category: articles
tags: [NetworkExtension]
comments: true
---

## 前言

之前介绍了[关于科学上网的一些知识](http://ibloodline.com/articles/2017/11/13/NetworkExtension-01.html)，这章会先介绍下 NetworkExtension，以及相关的一些 iOS 平台的开源项目。最后再开始我们自己的项目。

实际上，我们自己的 NetworkExtension 应用，其实就是

## NetworkExtension 相关

[NetworkExtension](https://developer.apple.com/documentation/networkextension)是苹果提供的用于配置 VPN 和定制、扩展核心网络功能的框架。NE 框架提供了可用于定制、扩展 iOS 和 MacOS 系统的核心网络功能的 API。[Potatso](https://github.com/Potatso/Potatso) 便是使用 NE 框架实现了 Shadowsocks 代理，遗憾的是由于[种种原因](https://sspai.com/post/38909)作者删除了开源代码。GitHub 上有

### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/lettleprince/ImagePicker-Objective-C)找到。


1.Capabilities 设置
2.网络权限申请


Starty

So, how did everything start?
