---
layout: post
title: "关于Swift的使用tips"
description: ""
category: articles
tags: [Swift]
comments: true
---

## 前言

今天被打击了。
凡事往前看。
回来继续混编。不要以为熟悉了OC和UIKit，看看Swift语法就可以无缝接入Swift开发，至少这个坑填了好一会。真正没有用过Swift的人，才会觉得Swift简单吧。相比OC语法更简练，同时吸收了多门流行语言的优点，可选绑定和 `guard` 的用法看的我一愣一愣的，迫不及待想要用起来。

## 调用OC代码

需要新建桥接文件 `ProjectName-Bridging-Header.h` ，然后在target的 `build setting` 中修改 `Objective-c Bridge Header` 的配置为 `ProjectName/ProjectName-Bridging-Header.h`。

```swift
#ifndef SwiftTipsDemo_Bridging_Header_h
#define SwiftTipsDemo_Bridging_Header_h

#import "OCViewController.h"

#endif /* SwiftTipsDemo_Bridging_Header_h */
```

由于整个项目都在当前命名空间内，在Swift中直接使用OCViewController即可。

```swift
navigationController?.pushViewController(OCViewController(), animated: true)
```


## 导入pods的第三方OC库

以RAC为例，在pod添加 `pod 'ReactiveCocoa', '4.0.1'` 并update后，在桥接文件中添加代码，如果只添加 `#import "ReactiveCocoa-Bridging-Header.h"` 会提示找不到头文件。

```objc
#ifndef SwiftTipsDemo_Bridging_Header_h
#define SwiftTipsDemo_Bridging_Header_h

#import <ReactiveCocoa/ReactiveCocoa-Bridging-Header.h>

#endif /* SwiftTipsDemo_Bridging_Header_h */
```

## 从OC跳转

之前代码都是用的Xib，所以新建的Swift文件也要求是如此模式。
一般情况下，可以这么操作：新建OC文件的时候勾选创建Xib，然后便可以愉快地撸代码了。

```objc
MyViewController *my = [[MyViewController alloc] init];
[self.navigationController pushViewController:my animated:YES];
```

Swift下，如果新建Swift文件的时候勾选创建Xib，则使用如下的代码实际只能加载一个空的控制器。也就是说，系统不会去自动加载一个跟controller文件同名的Xib资源文件。

```swift
navigationController?.pushViewController(Example2ViewController(), animated: true)
```

想要用这种方式加载，则需要在Swift中写一个便利构造方法：

```swift
convenience init() {
   let nibNameOrNil = String?("SwiftViewController")
   self.init(nibName: nibNameOrNil, bundle: nil)
}
```

## Swift的动态性

在 `stackoverflow` 上回答问题的时候，正好遇到一个在 `Controller0(OC)` 中使用 `RACObserve` 观察 `ViewModel(Swift)` 属性变化的问题。我知道 `RACObserve` 实际是使用KVO实现，而Swift的对象想享受KVO则必须继承于 `NSObject` ，于是就用英文给回了。但是楼主的确是继承了 `NSObject` 。大晚上的开了电脑试验下，的确不行。正好另外个人回答必须用 `dynamic` 修饰。加了 `dynamic` 之后果然OK。当然回答没有被采纳，不过还得看下Swift对于动态性的继承。

### 代码：
文章中的代码都可以从我的GitHub [`SwiftTipsDemo`](https://github.com/lettleprince/SwiftTipsDemo)找到。




