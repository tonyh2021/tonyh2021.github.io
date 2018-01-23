---
layout: post
title: "区块链学习笔记(三)——比特币机制的原理"
description: ""
category: articles
tags: [BlockChain]
comments: true
---

> 本文是对 coursera 的 [Bitcoin and Cryptocurrency Technologies](https://www.coursera.org/learn/cryptocurrency/home/week/1)课程笔记。

比特币共识机制保证了：

- 只增账本。

- 去中心化的协议。

- 矿工来验证交易。

## 3.1 比特币交易

![mechanics-01](../../../../images/20180123-mechanics/01.png)

上图中，每个 block 只有一笔交易。交易 1 为造币交易，没有输入，也不需要签名。交易 2 中，Alice 转给 Bob 17 个币，转给自己 8 个币，并且签名。

#### 地址转换 (change address)

对于第 2 笔交易，25 个币完全被消耗，17 个给 Bob，多余的 8 个币转给自己的另外的地址，这个过程为地址转换。

#### 有效性验证 (transaction valid)

对于第 4 笔交易，如何验证其合法性？需要验证其输入，来自于第 2 笔交易的第 2 个输出，8 个币转给 Alice（自己）。

验证新的交易是否有足够的币支付，只需要通过哈希指针向后查找。

#### 合并资金 (merge value)

新建交易，交易中有两个输入（分别是之前交易中收到的 17 个币和 2 个币），一个输出（19 个币都指向自己的地址）这样就可以将其合并起来了。

#### 共同支付 (join payment)

![mechanics-02](../../../../images/20180123-mechanics/02.png)

上图中的交易 4 有两个输入（分别是之前交易中指向 Carol 的 6 个币和指向 Bob 的 2 个币），一个输出（指向 David），最后需要 Carol 和 Bob 两个签名。

#### 比特币真实交易数据

![mechanics-03](../../../../images/20180123-mechanics/03.png)

- 元数据 (metadata)

存放内部信息。此交易哈希值（`hash`），交易的规模（`size`），输入（`vin_sz`）和输出数量（`vout_sz`），以及锁定时间（`lock_time`）。

- 输入列表 (inputs)

列表中的每个输入包含：前一个交易的输出（`prev_out`），它包括两个属性，之前那笔交易的哈希值（`hash`），以及那笔交易中当前输出的索引（`n`）；输入还包含一个签名（`signature`），用来证明支配此输出的签名。

- 输出列表 (output)

列表中的每个输出包含：币值（`value`），`scriptPubKey` 中有一个的公钥和一个比特币脚本。

## 3.2 比特币脚本 (Bitcoin scripts)










