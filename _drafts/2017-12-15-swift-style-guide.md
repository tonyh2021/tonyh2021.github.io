---
layout: post
title: "Swift 编程风格指南"
description: ""
category: articles
tags: [Swift]
comments: true
---


## 目录

## 正确性

尽量让代码在编译时没有警告。很多样式细节会影响本条规则，比如用 `#selector` 而不用字符串。

## 命名

易懂和一致的命名会让我们的项目更易于阅读和理解。Swift 命名需要遵守 [API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)。主要的关键要点有：

- 尽量保证调用时清晰

- 清晰优于简短

- 使用驼峰命名法

- 类型和协议首字母大写，其他都小写

- 包括所有需要的单词，同时省略不必要的单词

- 使用基于角色的名称，而不是类型

- 在工厂方法的名字前使用 `make`

