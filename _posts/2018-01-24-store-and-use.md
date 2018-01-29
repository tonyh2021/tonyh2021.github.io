---
layout: post
title: "区块链学习笔记(四)——比特币的存储和使用"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

> 本文是对 coursera 的 [Bitcoin and Cryptocurrency Technologies](https://www.coursera.org/learn/cryptocurrency/home/week/4)课程笔记。

## 4.1 简单本地存储

要消耗一个比特币，需要该比特币的一些公共信息、以及私钥。存储比特币的关键，就是管理私钥。

三个目标：可用性、安全性、方便性。

#### 最简单方式

电脑或手机的文件里。非常方便，但是可能会丢失或损坏、甚至中毒。

#### 钱包软件

帮助用户处理细节。

误解：比特币钱包里含有比特币。✘

钱包只包含钥匙。√

#### 编解码 (encoding keys): 

对字符串使用 Base58 编码和二维码编码。

Base58 是将大小写字母及数字都算上，去掉容易混淆的字母，组成的 58个字符。

## 4.2 冷热存储 (Hot Storage and Cold Storage)

热存储与冷存储分别像是钱包与保险柜，或者称为在线存储和离线（不经常在线）存储。分别要使用不同的私钥和公钥，保证安全性。

实际上冷存储还是需要上线将其地址传送给热存储。

![store-and-use-01](../../../../images/20180125-store-and-use/01.png)

> 注：以下内容中，教材中的知识点比较落后，这里参考了[《精通比特币第二版》第五章]()的内容。

#### 非确定性钱包

比特币核心客户端从最开始就生成足够多的私钥并且每个密钥只使用一次。

为保证不丢失，需要做备份，但这与避免复用比特币地址的原则相悖。

#### 确定性钱包

使用种子生成多个私钥，备份时只需要备份种子。

![store-and-use-02](../../../../images/20180125-store-and-use/02.png)

#### 分层确定性钱包 (Hierarchical Deterministic Wallets)

以树状结构衍生的密钥，使得父密钥可以衍生一系列子密钥。

![store-and-use-03](../../../../images/20180125-store-and-use/03.png)

优点：

- 只需保管主私钥，通过主私钥可以生成全部子私钥和多级子私钥。

- 父公钥可以生成全部子公钥。可以在不影响父私钥冷存储的情况下，生成任意数量的子地址用于比特币收款。

风险：

- 主公钥 + 子私钥可以反推出主私钥。

#### 种子和助记词 (Seeds and Mnemonic Codes)

#### 钱包技术标准

- 助记码，基于 BIP-39

- HD 钱包，基于 BIP-32

- 多用途 HD 钱包结构，基于 BIP-43

- 多币种和多帐户钱包，基于 BIP-44

4.3 Splitting and Sharing Keys

后面的看了下，基本是了解性的知识，不记录了。
