---
layout: post
title: "Cocoapods 中的头文件"
description: ""
category: articles
tags: [Cocoapods]
comments: true
---


之前介绍过自定义 CocoaPods 仓库的方法。

现在遇到一个问题，如何避免用户在使用时引入了不必要的头文件呢？

[这里](http://stackoverflow.com/questions/7439192/xcode-copy-headers-public-vs-private-vs-project)提到了子项目中 Public、 Private 和 Project 的区别。

于是应该从这里入手。

在 podspec 的配置文件中，头文件默认为 project 的，若需要 public 或 private 的头文件，需要使用 `public_header_files` 和 `private_header_files` 来导出。

比如：
```ruby
s.public_header_files = 'XXXSDK/Classes/Public/XXXHeader.h'
s.private_header_files = 'XXXSDK/Classes/*.h'
```


