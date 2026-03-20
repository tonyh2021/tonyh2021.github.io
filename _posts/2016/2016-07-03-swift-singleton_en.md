---
layout: post
title: "Singleton Pattern in Swift"
description: ""
category: articles
tags: [iOS]
comments: true
---

A singleton object ensures that no matter how many times you create or retrieve an instance of a class, you always get the same object. Whether dealing with audio effects or network utilities, singletons give your app a unified way to access shared resources or services.

## Singleton in Objective-C

In OC, singletons are implemented by calling the initialization method inside a `dispatch_once` block.

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

## Singleton in Swift

In Swift, singletons are implemented using a lazily initialized static class property (which is guaranteed to be initialized only once). This is thread-safe even under concurrent access.

```swift
class Singleton {
    static let sharedInstance = Singleton()
}
```

If you need additional setup during initialization, you can use a closure:

```swift
class Singleton {
    static let sharedInstance: Singleton = {
        let instance = Singleton()
        // setup code
        return instance
    }()
}
```

## This section is largely translated from Apple's official documentation:
 [`Singleton`](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/BuildingCocoaApps/AdoptingCocoaDesignPatterns.html#//apple_ref/doc/uid/TP40014216-CH7-ID177)




