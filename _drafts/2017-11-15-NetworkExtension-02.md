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

实际上，我们自己的 NetworkExtension 应用，其实就是扮演 SS-Local 的角色。

## NetworkExtension 相关

[NetworkExtension](https://developer.apple.com/documentation/networkextension)是苹果提供的用于配置 VPN 和定制、扩展核心网络功能的框架。NE 框架提供了可用于定制、扩展 iOS 和 MacOS 系统的核心网络功能的 API。[Potatso](https://github.com/Potatso/Potatso) 便是使用 NE 框架实现了 Shadowsocks 代理，遗憾的是由于[种种原因](https://sspai.com/post/38909)作者删除了开源代码。GitHub 上有不少人维护了其分支，但也都更新很慢，最近发现的一个可运行版本是[这个](https://github.com/haxpor/Potatso)，但我之前升级了 Xcode 9，所以也要进行一系列改动。最后终于改出一个可在 Xcode 9 上编译运行的[版本](https://github.com/lettleprince/Potatso)，但是也并没有改动的很完美。大家凑合学习吧。

## NEKit 相关

通过 Potatso 学习 Network Extension，对于初学者来说不太友好，毕竟项目很久不维护了。还有个更简单的方案，这要多亏了 [NEKit](https://zhuhaow.github.io/NEKit/) 框架。NEKit 甚至可以不依赖 Network Extension framework（当然我们构建的项目是需要的）。有个 [demo](https://github.com/yichengchen/RabbitVpnDemo) 可以看下。

## 下面开始我们的项目

##### 新建项目

建立普通 Swift 项目 QLadder(此项目后来也将作为我们 iOS 部门内部翻墙用的客户端，所以用了企业证书)。

项目支持的最低 iOS 版本是 9.3，因为之前我改过一次 9.0，会有问题。

还有，Network Extension 无法在模拟器上调试。同时，你得有开发者账号，用来申请相关 Capabilities。

#### 新建 PacketTunnel

新建 Target，选择 Network Extension。

![01](https://lettleprince.github.io/images/20171115-NetworkExtension/01.png)

然后选择 Provider Type 为 PacketTunnel。

![02](https://lettleprince.github.io/images/20171115-NetworkExtension/02.png)

#### 申请 entitlements

如果 containing app 要与 extension 共享数据，则必须要开启 App Groups。

Personal VPN 和 Network Extensions（App Proxy、Content Filter、Packet Tunnel）也当然要开启。

#### UI




### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/lettleprince/ImagePicker-Objective-C)找到。


1.Capabilities 设置
2.网络权限申请


Starty

So, how did everything start?
