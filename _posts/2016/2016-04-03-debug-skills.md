---
layout: post
title: "总结下有用的Debug知识和技巧"
description: ""
category: articles
tags: [iOS]
comments: true
---

## 断点

除了正常设置的断点之外，还可以设置异常断点(`Exception breakpoint`)和符号断点(`Symbolic breakpoint`)。`command + 7`跳转到断点管理，然后点击左下角的`+`，即可选择添加。

![add-breakpoints](/images/posts/20160403-debug-skills/add-breakpoints.png)

### 异常断点(`Exception breakpoint`)

如果添加了异常断点，当程序每次发生了异常，都会被中断。一般用来捕获未知异常，能够停留在异常或者崩溃发生的地方。

![exception-breakpoint](/images/posts/20160403-debug-skills/exception-breakpoint.png)

### 符号断点(`Symbolic breakpoint`)

符号断点可以中断某个函数的调用。比如说添加`viewDidLoad`之后，每个控制器执行到`viewDidLoad`方法便会停下来，这样对于查看程序的代码逻辑和业务逻辑很有帮助。

![Symbolic-breakpoint-1](/images/posts/20160403-debug-skills/Symbolic-breakpoint-1.png)

![Symbolic-breakpoint-2](/images/posts/20160403-debug-skills/Symbolic-breakpoint-2.png)

以上的断点我分别设置了`command + p`和`command + shift + p`的快捷键。

## Debug View Hierarchy

`Debug View Hierarchy`在程序运行时，动态的查看当前界面的显示情况，包括视图的层次，控件的大小和位置，而且会以3D效果显示当前视图的层次。

调试运行后，点击调试窗口的`Debug View Hierarchy`按钮，Xcode会打断app的运行并进行调试，该操作和你使用调试栏上的的`pause`按钮暂停app运行一样。此外，Xcode会展示`canvas`（`画布`）而不是代码编辑器。Xcode在`canvas`上绘制了app主窗口的整个视图层次，包括指示每个视图边界的细线（称之为线框图）。

![DebugViewHierarchy-1](/images/posts/20160403-debug-skills/DebugViewHierarchy-1.png)

现在我们所看到的是可视化的视图堆栈。在canvas中点击并拖动，会看到视图层次的3D模型。

![DebugViewHierarchy-2](/images/posts/20160403-debug-skills/DebugViewHierarchy-2.png)

左侧的调试导航栏中，选择`View UI Hierarchy`，可以看到整个界面的视图层次列表。

![DebugViewHierarchy-3](/images/posts/20160403-debug-skills/DebugViewHierarchy-3.png)

注意：在面板底部左侧有两个按钮。如下图所示，取消对这两个按钮的选定，否则会隐藏一些视图。右边的按钮其实是控制是否显示隐藏的视图。

![DebugViewHierarchy-5](/images/posts/20160403-debug-skills/DebugViewHierarchy-5.png)

画布下方有一些按钮，可以用来详细查看视图层次。

![DebugViewHierarchy-6](/images/posts/20160403-debug-skills/DebugViewHierarchy-6.png)

可以改变视图层次间的距离：

![DebugViewHierarchy-7](/images/posts/20160403-debug-skills/DebugViewHierarchy-7.png)

可以改变显示大小的比例，`=`是恢复到正常的大小。

![DebugViewHierarchy-8](/images/posts/20160403-debug-skills/DebugViewHierarchy-8.png)

可以从上或下开始隐藏视图，从左边拖拽是从下边开始隐藏，从右边拖拽是从上边开始隐藏：

![DebugViewHierarchy-9](/images/posts/20160403-debug-skills/DebugViewHierarchy-9.png)

下面四个按钮的作用主要是：

![DebugViewHierarchy-10](/images/posts/20160403-debug-skills/DebugViewHierarchy-10.png)

- 暂不清楚(😓，以后用到了再补上吧)；

- 显示约束；

- 只显示内容/只显示线条/两者都显示；

- 3D与平面转换。


选中3D视图中的某个视图，可以在右侧的`inspector`中看到该视图的详细信息。比如下图看到Label中的文字属性。

![DebugViewHierarchy-4](/images/posts/20160403-debug-skills/DebugViewHierarchy-4.png)

> 以上的这些技巧跟LLDB配合起来会相当给力。


### 参考文档：
[Xcode – power of breakpoints](http://www.albertopasca.it/whiletrue/2013/06/xcode-power-of-breakpoints/)

    

