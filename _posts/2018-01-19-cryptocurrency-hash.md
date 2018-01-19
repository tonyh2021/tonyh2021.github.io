---
layout: post
title: "区块链学习笔记(一)——比特币中的哈希函数"
description: ""
category: articles
tags: [BlockChain]
comments: true
---


## 1.1 密码学中的哈希函数（Cryptographic Hash function）

#### 哈希函数三个一般特性：

- 输入为任意长度的字符串（takes any string as input）

- 输出为固定长度（fixed-size output）

> 固定长度可以设置为任意值。

> 比特币使用 256 位。

- 有效计算（efficiently computable）

> 对于输入的字符串，能在合理的时间内计算出其输出。

#### 跟安全相关的特性（Security Properties）：

- 碰撞阻力（collision free）

> 沒有人能找出 hash collision 的可能。Collision 肯定存在，也就是说，没有完美的哈希函数，在现实场景中，我们只需要保证“没有人能够通过计算来找到碰撞”。

> 在此前提下，对于确定的哈希函数，如果输出相同，则可以认为输入也相同。

> 应用场景：通过信息摘要进行大文件的对比。

- 隐蔽性（hiding）

> 如果输入都来自一个比较小的集合，那他人几乎肯定可以通过枚举计算然后与输出对比的方式来确定输入，所以输入必须分散。

> 通过将不分散的输入与另外一个分散的输入结合而产生的输入，可以实现隐蔽性。比如说将输入扩大为 256 位的随机字符串

> 应用场景：承诺（Commitment）。将 msg 和随机的 key 输入进承诺函数（commit()），得到输出 commitment，并公布。在之后需要公布真正的 msg 时，只要将 key 一起公布，便可以验证之前公布的 msg。这个过程如同：将要公布的消息写下来提前放到信封中，然后在你公布信息之后，可以通过拆开信封来验证你公布的信息是否与之前一样。当然，为了避免被暴力破解，msg 需要与随机 key 结合后，进行一次哈希。

- 谜题友好（puzzle-friendly）

> 可以理解为，具备该特性的哈希函数，只能穷举尝试输入来获得解，没有其他更好的策略。

#### 安全哈希算法（Secure Hash Algorithm 256，简称 SHA-256）

比特币使用 SHA-256 进行加密。

![Hash-01](https://lettleprince.github.io/images/20180119-cryptocurrency-hash/01.JPG)

上述过程大概为：首先将要加密的信息分割成 512 bit 的数据块（block），如果最后一个数据块不足 512 bit 则进行 Padding 补足，直到可被 512 整除。将 256 bit 的初始向量与第一个 512 bit 的数据块（一共 768 bit）输入到 c 函数中，得到 256 位的输出，然后再跟第二块数据块结合作为 c 函数的输入，一直循环到所有的数据块都处理完，得到的 256 bit 数据即为 SHA-256 的结果。

这里有个前提推论，具有碰撞阻力的 c 函数经过变换后生成的哈希函数也具有碰撞阻力。


## 1.2 哈希指针和数据结构（Hash Point and Data Structure）

哈希指针存储了数据存储的位置，以及数据的 hash 值。我们可以在找到数据的同时，通过 hash 值对其进行校验。

![Hash-02](https://lettleprince.github.io/images/20180119-cryptocurrency-hash/02.JPG)

#### 区块链（Block chain）

使用哈希指针可以构建如下的数据结构：

![Hash-03](https://lettleprince.github.io/images/20180119-cryptocurrency-hash/03.JPG)

上面的数据结构就可以称作区块链。每个元素使用哈希指针指向前一个元素。

当链中某一数据被篡改后，数据的哈希值也会改变，想要保证能够校验，则需要将元素后面的所有元素都修改，而且即便修改到最后一个元素，也没法修改我们所持有的最后的指针。

#### 梅克尔树（Merkle tree）

也可以使用指针创建二叉树，即梅克尔树。

![Hash-04](https://lettleprince.github.io/images/20180119-cryptocurrency-hash/04.png)

可以在 O(log n) 的时间内验证梅克尔树的隶属关系。

可以在 O(log n) 的时间内验证经过已经规则排序之后的梅克尔树的非隶属关系。

## 1.3 数字签名（Digital Signatures）

签名目的：

1. 只有你能签，但别人都能验证。

2. 签名只能用于指定文档，不能通过剪切复制到其他文档。


















