---
layout: post
title: "Find Memory Leaks"
description: ""
category: articles
tags: [RAC]
comments: true
---

## 前言

这次项目升级，用到了instruments进行Memory Leaks的排查。因为效果很明显，特地整理下来。

## instruments

为了能够充分发挥instruments的功能，特地把Apple的相关文档看了一遍，确认了Memory Leaks排查的方法。

准备工作：

1. 从Xcode本项目界面（为了保证后面能够直接看到源码）打开instruments，然后找到Leaks。
2. 选择新建trace文档，点击录制按钮。
3. 正常使用App。
4. 看Leaks的时间线，如果有内存泄漏就会有红色方块。
![](https://lettleprince.github.io/images/20160627-cocoapods/cocoapods01.png)
5. 点击`Call Tree`，会显示调用栈。
![]()
6. `Command-2`打开展示设置，选择`Invert Call Tree`和`Hide System Libraries`。最近调用的方法在前面。
![]()
7. 在调用栈里面选择你要查看的方法调用。
8. `Command-3`展示每个方法占用的内存。
9. 双击方法显示相应的方法代码。
![]()
10. 点击Xcode按钮调转到相应的代码。
![]()


### 参考：

[Find Memory Leaks](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/FindingLeakedMemory.html)

