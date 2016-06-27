---
layout: post
title: "升级Cocoapods 1.0的经历"
description: ""
category: articles
tags: [Cocoapods]
comments: true
---

## 前言

Cocoapods是比较好用的第三方框架管理工具。唯一蛋疼的是速度update的时候速度太慢，当然是用离线模式（--no-repo-update）可以加快速度，但是真正需要更新的时候，真的就只能花半天时间喝茶聊天了。好消息是1.0的版本明显减少了update的时间，实在忍不住去升级。

## 升级——美好的理想

当然这个理想是很容易实现的。使用命令 `sudo gem install cocoapods` 很容易实现pods升级。
注意：之前beta版本的时候需要添加 `--pre` 才能安装。

## 升级项目——残酷的显示

当然，升级后 `podfile` 文件的格式需要修改，这点就看文档好了。
升级完成当然要“作一下”。`pod install`一下的确比较快。然后构建下却发现有错误。如图：
![cocoapods01](https://lettleprince.github.io/images/20160627-cocoapods/cocoapods01.png)

即便在这里改了，在 `ReactiveCocoa` 和 `Masonry` 库中的代码依然会报错。

这个错误折磨了几个月，每次升级到1.0的beta，重新 `install` 就会有此错误。我一直以为是我的项目配置的问题，每次试验都会把项目配置改的面目全非，最后依然有错。只好一次次退回pods到0.39版本。

## 问题的解决

最终在 `StackOverflow` 上看到：

[Cocoapods 1.0: Header files not found](http://stackoverflow.com/questions/37377450/cocoapods-1-0-header-files-not-found)
[error using cocoapods “use_frameworks!” SWIFT](http://stackoverflow.com/questions/31278833/error-using-cocoapods-use-frameworks-swift)

然后觉得与 `use_frameworks!` 有关，同时跟缓存有关，还有可能需要升级 `ReactiveCocoa` 和 `Masonry` 的版本。

于是`cd /Users/hxt/Library/Developer/Xcode/DerivedData/`，然后删掉 `DerivedData` 下的目录。同时将 `ReactiveCocoa` 改为 `4.0.1` ，`Masonry` 版本改为 `~> 1.0.0`。注意`ReactiveCocoa` 的 `4.1` 版本将需要Xcode 7.3以上的支持。所以在此把版本定为 `4.0.1` 。同时需要注意此问题[4.0.1 possibly breaks semver? #2704](同时注意此问题 https://github.com/ReactiveCocoa/ReactiveCocoa/issues/2704)

于是再次 `pod install` 然后构建便没有错误了。至此升级Cocoapods完美成功。

后来试下了Archive，也没有问题。


