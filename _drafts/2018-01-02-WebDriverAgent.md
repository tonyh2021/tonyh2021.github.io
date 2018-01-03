---
layout: post
title: ""
description: ""
category: articles
tags: [自动化测试]
comments: true
---


## 前言

很多年前就使用过 Python + [Selenium](http://seleniumhq.org/) 进行 Web 自动化测试的尝试（`driver.find_element_by_xpath`）。只不过后来被繁重的业务需求所累，又被新业务给诱惑，走上了 iOS 开发的道路。前几年看到了 [Appium](http://appium.io/)，一看名字就知道野心很大😆。

微信很会给用户带来惊喜。“跳一跳”最近出尽风头，让我想起了上一次火遍朋友圈的“打飞机”。当然我关心的只是如何做点更有趣的事情。上次打飞机是通过 lua 脚本进行 hack 的，当然是在越狱情况下。所以“跳一跳”出来的时候有过 hack 的闪念，后来心想可能还需要越狱，就没再细想。知道看到了有这么篇文章，[教你用Python来玩微信跳一跳](https://zhuanlan.zhihu.com/p/32452473)，才觉得大多数时候只是因为懒，所以才错过了很多有趣的东西。顺着文章的思路，我们可以顺便学习下 iOS 自动化测试的一些工具。

本章中提到了 [WebDriverAgent](https://github.com/facebook/WebDriverAgent)，facebook 真的是前端良心，先来看看 WebDriverAgent 怎么使用吧。

## WebDriverAgent

WebDriverAgent 是 iOS 端 [WebDriver](https://w3c.github.io/webdriver/webdriver-spec.html) 的实现，可用于远程控制 iOS 设备。它可以启动或终止 App，点击或滚动屏幕上的视图，从而可能成为完美的终端测试工具。WebDriverAgent 基于 XCTest.framework 以及 Apple API 的调用来直接在设备上执行所需的命令。WebDriverAgent 由 Facebook 开发并使用，并且被 Appium 集成。

#### 特性

- 适用于设备和模拟器

- 实现了大部分 [WebDriver 协议](https://w3c.github.io/webdriver/webdriver-spec.html)

- 实现了部分 [Mobile JSON Wire Protocol 协议](https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md)

- 支持 [USB](https://github.com/facebook/WebDriverAgent/wiki/USB-support)

- 提供了友好的界面来进行设备状态的监控

- 可以通过 Xcode 直接启动和调试，使得开发变得简单

- 暂不支持 tvOS 和 OSX（但是可以使用）

#### 安装

在项目目录下执行命令：

```shell
./Scripts/bootstrap.sh
```

命令中主要做两件事：

- 使用 [Carthage](https://github.com/Carthage/Carthage)获取所有依赖

- 使用 [npm](https://www.npmjs.com/) 构建 Inspector 包

执行完成之后，便可以打开 `WebDriverAgent.xcodeproj`，启动 `WebDriverAgentRunner`测试并开始发送[请求](https://github.com/facebook/WebDriverAgent/wiki/Queries)。

#### 使用

WebDriverAgent 可以作为任意的 UITest 包来启动。这里推荐使用 `Xcode`、`xcodebuild` 或 [`FBSimulatorControl`](https://github.com/facebook/FBSimulatorControl)。要启动 UITest，需要一个运行测试代码的托管 App（注意它本身并不参与测试）。`Xcode` 和 `xcodebuild` 提供自带的托管 App，`FBSimulatorControl` 则需要开发者提供，并明确指定或使用系统应用（比如 `Safari`）。

`WebDriverAgentRunner` 启动后，可以从设备日志（或 Xcode 控制台）获取服务URL。搜索以下文本：

```shell
ServerURLHere->http://[SOME_IP]:8100<-ServerURLHere
```

**使用 Xcode**

只需要打开 `WebDriverAgentRunner` 然后运行 `WebDriverAgentRunner`。要启动

**使用 xcodebuild**

 ```shell
 xcodebuild -project WebDriverAgent.xcodeproj \
           -scheme WebDriverAgentRunner \
           -destination 'platform=iOS Simulator,name=iPhone 6' \
           test
 ```

**使用 [FBSimulatorControl](https://github.com/facebook/FBSimulatorControl) 框架的 [fbsimctl](https://github.com/facebook/FBSimulatorControl/tree/master/fbsimctl)**

构建 WebDriverAgent.xcodeproj 然后：

```shell
./fbsimctl --state=booted \
           launch_xctest [path]/WebDriverAgentRunner.xctest com.apple.mobilesafari --port 8100 -- \
           listen
```

**直接使用 [FBSimulatorControl](https://github.com/facebook/FBSimulatorControl)**

查看 [FBSimulatorXCTestCommands.h](https://github.com/facebook/FBSimulatorControl/blob/master/FBSimulatorControl/Commands/FBSimulatorXCTestCommands.h)，并且使用 [tests](https://github.com/facebook/FBSimulatorControl/blob/master/FBSimulatorControlTests/Tests/Integration/FBSimulatorTestInjectionTests.m) 中的例子。


























