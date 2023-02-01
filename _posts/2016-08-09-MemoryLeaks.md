---
layout: post
title: "Find Memory Leaks"
description: ""
category: articles
tags: [iOS]
comments: true
---

## 前言

这次项目升级，用到了instruments进行Memory Leaks的排查。因为效果很明显，特地整理下来。

## instruments

为了能够充分发挥instruments的功能，特地把Apple的相关文档看了一遍，确认了Memory Leaks排查的方法。

#### To investigate a leak using the call tree

1. 从Xcode本项目界面（为了保证后面能够直接看到源码）打开instruments，然后找到Leaks。
2. 选择新建trace文档，点击录制按钮。
3. 正常使用App。
4. 看Leaks的时间线，如果有内存泄漏就会有红色方块。    
![01](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-01.png)
5. 点击`Call Tree`，会显示调用栈。点击黑色三角会显示方法调用。    
![02](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-02.png)
6. `Command-2`打开展示设置，选择`Invert Call Tree`和`Hide System Libraries`。最近调用的方法在前面。    
![03](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-03.png)
7. 在调用栈里面选择你要查看的方法调用。
8. `Command-3`展示每个方法占用的内存。
9. 双击方法显示相应的方法代码。    
![04](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-04.png)
10. 点击Xcode按钮调转到相应的代码。    
![05](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-05.png)

暂时没用到`To investigate a leaked object using a backtrace`和`To investigate a leaked object using cycles and roots`就先不翻译了。通过方法调用基本可以排查完所有的内存泄露，而且更重要的是排查，而不是检测。

## 代码排查

![06](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-06.png)

这个内存泄露有点吓人，但是追查进去又是基础的网络库，所有有点怀疑是不是instruments误报。于是去找block循环引用相关的代码，后来还是不放心。于是跟踪了`AFHTTPSessionManager`的实例manager，在请求实例dealloc后，其中的manager的确没有被释放。

于是在google搜索关键字`NSURLSession Memory Leaks`，还真找到了不少内容。

[NSURLSession is holding a strong reference to its delegate (retain cycle) ](https://github.com/facebook/AsyncDisplayKit/issues/763)

[Possible memory leak in AFURLSessionManager](https://github.com/AFNetworking/AFNetworking/issues/1528)

`The session object keeps a strong reference to the delegate until your app exits or explicitly invalidates the session. If you do not invalidate the session, your app leaks memory until it exits.`

最主要就是说`NSURLSession`的代理是强引用，如果不主动调用废弃操作，会有内存泄露。

![07](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-07.png)

mattt说在使用AFNetworking时，要终止一个session，需要调用`invalidateSessionCancelingTasks:`方法。当然整个应用只用到一个session的话，不需要这样做。

于是将manager作为实例变量，在dealloc时调用`invalidateSessionCancelingTasks:`方法，再次跑Leaks，就没有那么恐怖了。这是AFNetworking升级3.0版本的一个坑。

![08](https://tonyh2021.github.io/images/20160809-MemoryLeaks/memoryleaks-08.png)

### 参考：

[Find Memory Leaks](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/FindingLeakedMemory.html)

