---
layout: post
title: "RN第一坑"
description: ""
category: articles
tags: [RN]
comments: true
---

## 前言

想不到再一次写点东西已经到了17年。

## 正文

开始看RN的东西，HelloWorld的项目总是跑不起来，错误如下：

```
Error: *** Terminating app due to uncaught exception 'NSInternalInconsistencyException',
reason: 'bundleURL must be non-nil when not implementing loadSourceForBridge'
```

google 了一阵，不少都说是因为使用 VPN 而导致 hosts 文件被修改而造成的。我退出翻墙工具，还是不行。无意中换了个 WIFI 环境，竟然可以了——得出结论，绝对是 hosts 文件的问题。

查看本地 hosts 文件时 /private/etc/ 下竟然找不到 hosts文件，试下新建 hosts 文件。

在桌面新建名为 hosts 的文件，并输入：

```
##
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting. Do not change this entry.
##
127.0.0.1   localhost
255.255.255.255 broadcasthost
::1 localhost
fe80::1%lo0 localhost%
```

复制到 /private/etc/ ，需要验证密码。

重启，测试下网络访问及翻墙，没有任何问题。

Xcode运行，OK。`react-native run-ios`也没问题。

我撇了下锁定的手机屏幕，困扰我很久的 Handoff 问题竟然也顺便解决了😁。

