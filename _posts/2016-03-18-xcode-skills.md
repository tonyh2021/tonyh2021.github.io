---
layout: post
title: "高效的Xcode界面快捷设置技巧"
description: ""
category: articles
tags: [Xcode]
comments: true
---

## 前言
同事过来看我的代码，然后无奈的说，你这屏幕都被导航栏工具栏和调试区沾满了，你看着不憋屈么。我无奈的手忙脚乱的各种`command+0`调整。接着一想要是能某个操作能快速切换到成不同模式（比如编辑模式下编辑区域最大化，调试模式下调试区自动弹出等等）就好了。

## 区域和快捷键

### Xcode界面的区域划分：

![Xcode界面的区域划分](https://lettleprince.github.io/images/old_images/EditArea.png)

- The Toolbar(工具栏): 你选择视图、运行app，在不同布局界面切换的地方。

- The Navigation Area(导航区): 导航你整个工程、警告、报错等的地方。

- The Editing Area(编辑区): 所有奇迹诞生的地方，包括它上方的Jump bar。

- The Utility Area(工具区): 包含检测器和一些库。

- The Debugging Area(调试区): 包括调试窗口和变量检测器。

### Xcode界面快捷键： 

首先：

- `command (⌘)`:用来导航，控制导航区域。

- `alt/option (⌥)`:控制右边的一些东西，比如`Assistant Editor`、`utility editor`。

- `control (⌃)`: 编辑区域上的`Jump bar`的一些交互。

> 注，`shift`的图标为`⇧`。

与数字键的组合：

- `command 1~ 8`: 跳转到导航区的不同位置。

- `command 0` :显示/隐藏导航区。

- `command alt 1~ 6`:在不同检测器之间跳转。

- `command alt 0`: 显示/关闭工具区。

- `control command alt 1~4`: 在不同库之间跳转。

- `control 1~ 6`: 在`Jump bar`的不同标签页的跳转。

![快捷键](https://lettleprince.github.io/images/old_images/key.png)

另外还有：

- `command + enter`: 显示标准单窗口编辑器。

- `command alt enter`:你可以猜下它的作用,它的功能是打开`Assistant editor`。

- `command + shift + Y`:显示/隐藏调试区（`Y is my code not working?`）。

## 事件定义

`Xcode->Behaviors->Edit Behaviors` 打开 Behavior 偏好设置，左侧是所有事件集合，右边是该事件可以触发的一些列动作。

### Running

单屏幕时的设置：

![](https://lettleprince.github.io/images/old_images/onescreendebug.png)

双屏幕时，此时可以将调试区放到第二块屏幕上：

![](https://lettleprince.github.io/images/old_images/secondscreendebug.png)

### Custom

还可以自定义事件，这样就可以实现我最开始说的不同模式的切换了。唯一蛋疼的地方在于，试了好久才找到合适的快捷键。

#### Editing

`command + shift + X`的时候，会进入全屏编辑模式。

![](https://lettleprince.github.io/images/old_images/Editing.png)

#### Navigating

`command + control + X`的时候，会退出全屏编辑模式，显示出各个工具栏。

![](https://lettleprince.github.io/images/old_images/Navigating.png)

赶紧实验下吧，炫酷到没朋友！😂


#### 参考链接：

[Supercharging Your Xcode Efficiency](http://www.raywenderlich.com/72021/supercharging-xcode-efficiency)

> 上面链接中的快捷键示意图有错误。

