---
layout: post
title: "go-ethereum 源码解读（一）"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

从[项目地址](https://github.com/ethereum/go-ethereum.git) clone 源码。

## 目录结构

    accounts        实现了一个高等级的以太坊账户管理
    bmt             二进制的默克尔树的实现
    build           主要是编译和构建的一些脚本和配置
    cmd             命令行工具，又分了很多的命令行工具，下面一个一个介绍
        abigen      Source code generator to convert Ethereum contract definitions into easy to use, compile-time type-safe Go packages
        bootnode	启动一个仅仅实现网络发现的节点
        evm         以太坊虚拟机的开发工具，用来提供一个可配置的，受隔离的代码调试环境
        faucet		
        geth        以太坊命令行客户端，最重要的一个工具
        p2psim      提供了一个工具来模拟 http 的 API
        puppeth     创建一个新的以太坊网络的向导
        rlpdump     提供了一个RLP数据的格式化输出
        swarm       swarm网络的接入点
        util        提供了一些公共的工具
        wnode       这是一个简单的 Whisper 节点。它可以用作独立的引导节点。此外，可以用于不同的测试和诊断目的
        common      提供了一些公共的工具类
	compression     Package rle implements the run-length encoding used for Ethereum data
	consensus       提供了以太坊的一些共识算法，比如 ethhash, clique(proof-of-authority)
	console         console 类
	contracts	
	core            以太坊的核心数据结构和算法(虚拟机，状态，区块链，布隆过滤器)
	crypto          加密和 hash 算法
	eth             实现了以太坊的协议
	ethclient       提供了以太坊的 RPC 客户端
	ethdb           eth 的数据库(包括实际使用的 leveldb 和供测试使用的内存数据库)
	ethstats        提供网络状态的报告
	event           处理实时的事件
	les             实现了以太坊的轻量级协议子集
	light           实现为以太坊轻量级客户端提供按需检索的功能
	log             提供对人机都友好的日志信息
	metrics         提供磁盘计数器
	miner           提供以太坊的区块创建和挖矿
	mobile          移动端使用的一些 warpper
	node            以太坊的多种类型的节点
	p2p             以太坊 p2p 网络协议
	rlp             以太坊序列化处理
	rpc             远程方法调用
	swarm           swarm 网络处理
	tests           测试
	trie            以太坊重要的数据结构 Package trie implements Merkle Patricia Tries
	whisper         提供了 whisper 节点的协议

## accounts

accounts 包实现了以太坊客户端的钱包和账户管理。以太坊的钱包提供了 keyStore 模式和 usb 两种钱包。同时以太坊的合约的 abi 的代码也放在了 account/abi 目录。abi 项目好像跟账户管理没有什么关系。这里暂时只分析了账号管理的接口。具体的 keystore 和 usb 的实现代码暂时不会给出。