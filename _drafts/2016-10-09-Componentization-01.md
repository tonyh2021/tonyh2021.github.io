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

先上图：

![02](https://lettleprince.github.io/images/20161010-Componentization/02.png)

其中发布版本对应 `` 目录，其目录下的壳工程目录为：





业务子项目使用组件化调用，其他子项目可以暴露头文件。也就是说 `ModuleA`、 `ModuleB`、 `ModuleC` 三个子项目不对外暴露头文件，`Work` 可以对外暴露头文件，从而达到强制解耦目的。

## Jenkins 集成

没有自动化构建的项目管理都是耍流氓，这里简单描述，暂不实验。基于以上的优化，可以在构建任务重添加构建脚本，主要是用于触发子工程的发布打包。代码参考：

`auto_build_triger.py`

```python

import subprocess
import os
if __name__ == '__main__':
    basePath = os.path.dirname(os.path.abspath('__file__')) + '/'

    projs = ['ModuleA',
             'ModuleB'
             ]

    for projectPath in projs:
        os.chdir(basePath + projectPath)
        subprocess.call('sh build_cp_to_pub.sh', shell=True)
        os.chdir('../')

```

`build_cp_to_pub.sh`


### 参考：

[CocoaPods详解之----制作篇](http://blog.csdn.net/wzzvictory/article/details/20067595)

### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/lettleprince/ImagePicker-Objective-C)找到。

