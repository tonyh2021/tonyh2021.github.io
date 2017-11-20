---
layout: post
title: "构建 NetworkExtension 应用（一）"
description: ""
category: articles
tags: [NetworkExtension]
comments: true
---

## 前言

个人水平实在有限，大多数时候只能依靠谷歌来解决编程中遇到的难题。可是国庆后各路科学上网工具逐一翻车，[蓝灯](https://github.com/getlantern/forum)(7 月份刚续费两年)整个十月份基本不可用，当前新版本可用但已经没有之前稳定、快速了。 Nydus 这种无良商家更是过分，整个团队直接消失（会员至少有一年多才到期）。中间试用过别的工具，也都并不稳定。

程序员的诉求很简单，编程中遇到问题的时候，能够顺利的搜索到原因和方案就可以了。于是决心[自己动手,丰衣足食](https://baike.baidu.com/item/%E8%87%AA%E5%B7%B1%E5%8A%A8%E6%89%8B%EF%BC%8C%E4%B8%B0%E8%A1%A3%E8%B6%B3%E9%A3%9F)。本来想直接写 NetworkExtension 扩展项目的，后来觉得作为技术博客，还是介绍下技术原理比较好。

以下链接可能存在墙内打不开的情况。墙内可访问的云服务商推荐 Vultr，可以点[这个连接](https://www.vultr.com/?ref=7258410)注册（这个链接包含了我的 Vultr 邀请码，算是对我的支持吧，这样遇到问题请教我的时候，我也会很热情哒😆）。

## 方案

方案一：
[科学上网的终极姿势:在 Vultr VPS 上搭建 Shadowsocks](https://zoomyale.com/2016/vultr_and_ss/)

方案二：
[使用 Linux 快照搭建 GFW.Press 服务器](https://gfw.press/blog/?p=30)

几乎没遇到坑。需要注意的是 Vultr 上只要建立了服务器，就会开始计费，无论是否在运行中，所以不用的服务器请直接删掉。另外 Tokyo 和 Los Angeles 的节点貌似容易被封掉，反正我建了一个节点是 ping 不通的。

知其然，更要知其所以然。

## Shadowsocks 相关

中国特色社会主义互联网发展史：

很久以前，访问网站很简单。

![whats-shadowsocks-01](https://lettleprince.github.io/images/20171113-NetworkExtension/whats-shadowsocks-01.png)

后来，[GFW](https://zh.wikipedia.org/wiki/%E9%98%B2%E7%81%AB%E9%95%BF%E5%9F%8E) 出现。

![whats-shadowsocks-02](https://lettleprince.github.io/images/20171113-NetworkExtension/whats-shadowsocks-02.png)

翻越 GFW 比直接的方案就是：墙外有一台不受限制的服务器，我们要请求或发送的数据通过这台服务器进行中转，这就需要我们通过加密来保证与墙外服务器通讯时不被 GFW 怀疑和窃听。比较常用的技术有：HTTP 代理服务、Socks 服务、VPN 服务等，其中以 SSH tunnel 的方法比较有代表性。

![whats-shadowsocks-03](https://lettleprince.github.io/images/20171113-NetworkExtension/whats-shadowsocks-03.png)

- 首先用户和墙外服务器基于 SSH 建立起一条加密的通道。
- 用户通过建立起的隧道进行代理，通过 SSH 服务器向真实的网站发起请求。
- 网站数据返回到 SSH 服务器，再通过创建好的隧道返回给用户。

SSH 本身基于 RSA 加密技术，GFW 无法从数据传输的过程中的加密数据内容进行关键词分析，避免了被重置链接的问题，但由于创建隧道和数据传输的过程中，SSH 的特征明显。GFW 也不是吃素的，它会通过特征分析，识别出 SSH 隧道然后进行干扰。

于是，[Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks) 诞生。

![whats-shadowsocks-04](https://lettleprince.github.io/images/20171113-NetworkExtension/whats-shadowsocks-04.png)

- 客户端发出的请求基于 Socks5 协议跟 SS-Local 端进行通讯，由于这个 SS-Local 一般是本机或路由器或局域网的其他机器，不经过 GFW，所以解决了上面被 GFW 通过特征分析进行干扰的问题。
- SS-Local 和 SS-Server 两端通过多种可选的加密方法进行通讯，经过 GFW 的时候是常规的 TCP 包，没有明显的特征码而且 GFW 也无法对通讯数据进行解密。
- SS-Server 将收到的加密数据进行解密，还原原来的请求，再发送到用户需要访问的服务，获取响应原路返回。

不过关于 Shadowsocks 特征被识别的消息一直有，随时准备新的技术吧。

最后，向 [clowwindy](https://github.com/clowwindy) 及后续的维护人员致敬。

下篇将会开始我们的 iOS NetworkExtension 应用。

备注：
[各种翻墙工具的个人浅见](https://xijie.wordpress.com/2016/05/23/%E5%90%84%E7%A7%8D%E7%BF%BB%E5%A2%99%E5%B7%A5%E5%85%B7%E7%9A%84%E4%B8%AA%E4%BA%BA%E6%B5%85%E8%A7%81/)
