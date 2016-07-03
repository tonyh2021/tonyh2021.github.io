---
layout: post
title: "Swift的单例模式"
description: ""
category: articles
tags: [Swift]
comments: true
---

单例对象可以我们使用一个类获取对象时，多次创建对象或者多次获取对象，得到的都是同一个对象。无论使用音频特效还是网络工具，我们都可以在我们的应用中使用统一的方式来获取单例资源或服务。

## OC下的单例

OC中可以通过在 `dispatch_once` 函数的Block中调用初始化方法来实现单例。

```objc
+ (instancetype)sharedInstance {
    static id _sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[self alloc] init];
    });
 
    return _sharedInstance;
}
```

## Swift中的单例

Swift中，通过懒加载初始化（可以保证只初始化一次）的静态类属性实现单例。即便是在多线程同时访问的情况下也可以保证单例的实现。

```swift
class Singleton {
    static let sharedInstance = Singleton()
}
```

如果需要额外的初始化操作，你可以通过调用Block的方式来实现：

```Swift
class Singleton {
    static let sharedInstance: Singleton = {
        let instance = Singleton()
        // setup code
        return instance
    }()
}
```

## 这部分内容基本翻译自苹果官方的文档：
 [`Singleton`](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/BuildingCocoaApps/AdoptingCocoaDesignPatterns.html#//apple_ref/doc/uid/TP40014216-CH7-ID177)




