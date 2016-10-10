---
layout: post
title: "组件化之路——编译框架优化"
description: ""
category: articles
tags: [架构]
comments: true
---

## 前言

公司的项目正在搞组件化，整理下最近学到的东西。三五个人的小项目应该不用考虑这么多，`MVVM` 或者 `MVCS` 依然足够。团队达到20以上，每天提交到 SVN 达到上千人次的时候，编译一次的时间可以泡杯咖啡，同时每天会有几次某人在群里喊怎么又编译不过了的情况。没有这样的痛点进行组件化之路是动力不足的。

## 背景

iOS 客户端有A、B、C三个主要功能，除此之外所有的业务功能都算到“协同”功能中，也就是四个功能模块，分别由四个小组维护相应的功能。同时每个功能都会不同程度的会依赖底层库，比如说 `FMDB`(已进行二次封装)、团队之前已封装好的基础库等。

## 目标

1. 业务功能独立，互不影响。
2. 减少编译时间。
3. 业务代码与资源解耦。
4. 提高逼格(此条负责搞笑)。

这个目标只是实现编译框架的优化，以后会逐步实现发布架构、组件化管理、组建平台、班车模式等目标。

## 原理

每个功能模块拆分成子项目，每个子项目(比如 `ModuleA`)通过轻量的壳工程包装成对应各项目组(即负责 `ModuleA` 的项目组)的“工作项目”。 `ModuleA` 项目组则通过对应的壳工程进行对于 `ModuleA` 模块代码维护，对其他模块和基础模块代码都不可见(对于其他模块和基础模块以 `.a` 静态库的形式存在)。

![01](https://lettleprince.github.io/images/20161010-Componentization/01.png)

## 配置细节

#### 主线项目

先上图：

![02](https://lettleprince.github.io/images/20161010-Componentization/02.png)

其中主线项目(`Release` 使用)对应 `Baseline` 目录，其目录下的壳工程目录为：

![03](https://lettleprince.github.io/images/20161010-Componentization/03.png)

主线项目中只包含 `AppDelegate` 和相应的资源文件、配置文件，对于底层功能和业务功能都退化为库的依赖。将来 `Release` 新版本时将以此项目为准。

#### 功能模块子项目

业务子项目使用组件化调用，其他子项目可以暴露头文件。也就是说 `ModuleA`、 `ModuleB`、 `ModuleC` 三个子项目不对外暴露头文件，`Work` 可以对外暴露头文件，从而达到强制解耦目的。

![05](https://lettleprince.github.io/images/20161010-Componentization/05.png)

`ModuleA` 下有属于 `ModuleA` 业务组自己的壳工程，与主线项目(`Baseline`)不同的地方在于，业务项目会引用业务子项目，对其他业务项目和基础库则是引用库关系。

![06](https://lettleprince.github.io/images/20161010-Componentization/06.png)

#### 需要注意的地方：

- 创建子工程的步骤：

1. 创建子工程。
![07](https://lettleprince.github.io/images/20161010-Componentization/07.png)
2. 将子工程的 `.xcodeproj` 加入到主工程中。
3. `Header Search Path`中添加头文件搜索目录。
4. 添加 `Target Dependences`。
![08](https://lettleprince.github.io/images/20161010-Componentization/08.png)

- `Build Settings` 的 `Header Search Path` 中添加头文件搜索路径: `../../Library/ModuleA/inc`。

- `ld: library not found for -lModuleA...`: `Build Settings` 的 `Library Search Path` 中添加 `../../Library/ModuleA/$(CONFIGURATION)$(EFFECTIVE_PLATFORM_NAME)`。

- `Undefined symbols for architecture x86_64`: 

![04](https://lettleprince.github.io/images/20161010-Componentization/04.png)

## 小结

至此，编译框架优化完毕，基本实现了初步的业务解耦和减少编译时间的目标。组件之间的调用、子工程的发布以及自动化构建的内容会在以后详细介绍。

### 代码：
文章中的代码都可以从我的GitHub [`Componentization`](https://github.com/lettleprince/Componentization)找到。

