---
layout: post
title: "构建 Network Extension 项目"
description: ""
category: articles
tags: [NetworkExtension]
comments: true
---

## 前言

个人水平实在有限，大多数时候只能依靠谷歌来解决编程中遇到的难题。可是国庆后各路科学上网工具逐一翻车，[蓝灯](https://github.com/getlantern/forum)(7 月份刚续费两年)整个十月份基本不可用，当前新版本可用但已经没有之前稳定、快速了。 Nydus 这种无良商家更是过分，整个团队直接消失（会员至少有一年多才到期）。中间试用过别的工具，也都并不稳定。

于是决心[自己动手,丰衣足食](https://baike.baidu.com/item/%E8%87%AA%E5%B7%B1%E5%8A%A8%E6%89%8B%EF%BC%8C%E4%B8%B0%E8%A1%A3%E8%B6%B3%E9%A3%9F)。顺便再次捡起 Swift。

方案一：
[科学上网的终极姿势:在 Vultr VPS 上搭建 Shadowsocks](https://zoomyale.com/2016/vultr_and_ss/)

方案二：
[使用 Linux 快照搭建 GFW.Press 服务器](https://gfw.press/blog/?p=30)

几乎没遇到坑。需要注意的是 Vultr 上只要建立了服务器，就会开始计费，无论是否在运行中，所以不用的服务器请直接删掉。另外 Tokyo 和 Los Angeles 的节点貌似容易被封掉，反正我建了一个节点是 ping 不通的。

## Shadowsocks 相关

翻越 [GFW](https://zh.wikipedia.org/wiki/%E9%98%B2%E7%81%AB%E9%95%BF%E5%9F%8E) 比直接的方案就是：墙外有一台不受限制的服务器，我们要请求或发送的数据通过这台服务器进行中转，这就需要我们通过加密来保证与墙外服务器通讯时不被 GFW 怀疑和窃听。GFW 也不是吃素的，它会通过各种流量特征分析，识别出各通讯隧道然后封之。

中国特色社会主义互联网发展史：

很久以前，访问网站是很简单的
![](https://lettleprince.github.io/images/20171115-vpn/01.png)




于是，[Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks)诞生。

简而言之，Shadowsocks 使用特定的中转服务器完成数据传输。在服务器端部署完成后，用户需要按照指定的密码、加密方式和端口使用客户端软件与其连接。在成功连接到服务器后，客户端会在用户的电脑上构建一个本地 Socks5 代理。浏览网络时，网络流量会被分到本地 Socks5 代理，客户端将其加密之后发送到服务器，服务器以同样的加密方式将流量回传给客户端，以此实现代理上网。

## NetworkExtension 相关

[NetworkExtension](https://developer.apple.com/documentation/networkextension)是苹果提供的用于配置 VPN 和定制、扩展核心网络功能的框架。NE 框架提供了可用于定制、扩展 iOS 和 MacOS 系统的核心网络功能的 API。[Potatso](https://github.com/Potatso/Potatso) 便是使用 NE 框架实现了 Shadowsocks 代理，遗憾的是由于[种种原因](https://sspai.com/post/38909)作者删除了开源代码。GitHub 上有

### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/lettleprince/ImagePicker-Objective-C)找到。


1.Capabilities 设置
2.网络权限申请


Starty

So, how did everything start?
