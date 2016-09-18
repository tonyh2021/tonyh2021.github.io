---
layout: post
title: "iOS中的设计模式——单例(Singleton)"
description: ""
category: articles
tags: [设计模式]
comments: true
---


## 单例模式

**单例模式（`Singleton`）**：保证一个类仅有一个实例，并提供一个访问它的全局访问点。

单例模式应该是设计模式中最简答的形式了。这一模式的意图是让类的一个对象成为系统中唯一的实例。

## 类图

![Singleton](https://lettleprince.github.io/images/20160919-Singleton/Singleton.png)

## 使用场景

- 类只能有一个实例，而且必须从一个为人熟知的访问点对其进行访问，比如[工厂方法](http://ibloodline.com/articles/2016/09/06/factory.html)。

- 这个唯一的实例只能通过子类化进行扩展，而且扩展的对象不会破坏客户端代码。

优点：

　　1、提供了对唯一实例的受控访问。

　　2、由于在系统内存中只存在一个对象，因此可以节约系统资源，对于一些需要频繁创建和销毁的对象单例模式无疑可以提高系统的性能。

　　3.因为单例模式的类控制了实例化的过程，所以类可以更加灵活修改实例化过程。

缺点：

　　1、由于单利模式中没有抽象层，因此单例类的扩展有很大的困难。

　　2、单例类的职责过重，在一定程度上违背了“单一职责原则”。

## 使用方式

先看`C++`中的实现：

```cpp
class Singlenton
{
public:
    static Singlenton *Instance();
    
protected:
    Singlenton();
    
private:
    static Singlenton *_instance;
};

Singlenton *Singlenton::_instance = NULL;

Singlenton *Singlenton::Instance()
{
    if (_instance == NULL) {
        _instance = new Singlenton;
    }
    return _instance;
}
```

`OC`下：

```objc
//Singleton.h
@interface Singleton : NSObject
+ (Singleton *)sharedInstance;
@end

//Singleton.m
@implementation Singleton
static Singleton * sharedSingleton = nil;
+ (Singleton *) sharedInstance {
    if (sharedSingleton == nil) {
        sharedSingleton = [[Singleton alloc] init];
    }
    return sharedSingleton;
}
@end
```

上面的实现是有问题的。首先，如果客户端使用不同的方式来初始化单例，则有可能出现多个实例的情况。另外，这样的实现也不是线程安全的。改进：

```objc
@implementation Singleton
static id sharedSingleton = nil;
+ (id)allocWithZone:(struct _NSZone *)zone {
    if (!sharedSingleton) {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            sharedSingleton = [super allocWithZone:zone];
        });
    }
    return sharedSingleton;
}
- (id)init {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedSingleton = [super init];
    });
    return sharedSingleton;
}
+ (instancetype)sharedInstance {
    return [[self alloc] init];
}
+ (id)copyWithZone:(struct _NSZone *)zone {
    return sharedSingleton;
}
+ (id)mutableCopyWithZone:(struct _NSZone *)zone {
    return sharedSingleton;
}
@end
```

当然对于懒癌患者来讲，每个单例都写这样的实现实在太不可接受了，我们把它抽取成宏：

```objc
// .h文件的实现
#define SingletonH(methodName) + (instancetype)shared##methodName;

// .m文件的实现
#if __has_feature(objc_arc) // 是ARC
#define SingletonM(methodName) \
static id _instace = nil; \
+ (id)allocWithZone:(struct _NSZone *)zone \
{ \
if (_instace == nil) { \
static dispatch_once_t onceToken; \
dispatch_once(&onceToken, ^{ \
_instace = [super allocWithZone:zone]; \
}); \
} \
return _instace; \
} \
\
- (id)init \
{ \
static dispatch_once_t onceToken; \
dispatch_once(&onceToken, ^{ \
_instace = [super init]; \
}); \
return _instace; \
} \
\
+ (instancetype)shared##methodName \
{ \
return [[self alloc] init]; \
} \
+ (id)copyWithZone:(struct _NSZone *)zone \
{ \
return _instace; \
} \
\
+ (id)mutableCopyWithZone:(struct _NSZone *)zone \
{ \
return _instace; \
}

#else // 不是ARC

#define SingletonM(methodName) \
static id _instace = nil; \
+ (id)allocWithZone:(struct _NSZone *)zone \
{ \
if (_instace == nil) { \
static dispatch_once_t onceToken; \
dispatch_once(&onceToken, ^{ \
_instace = [super allocWithZone:zone]; \
}); \
} \
return _instace; \
} \
\
- (id)init \
{ \
static dispatch_once_t onceToken; \
dispatch_once(&onceToken, ^{ \
_instace = [super init]; \
}); \
return _instace; \
} \
\
+ (instancetype)shared##methodName \
{ \
return [[self alloc] init]; \
} \
\
- (oneway void)release \
{ \
\
} \
\
- (id)retain \
{ \
return self; \
} \
\
- (NSUInteger)retainCount \
{ \
return 1; \
} \
+ (id)copyWithZone:(struct _NSZone *)zone \
{ \
return _instace; \
} \
\
+ (id)mutableCopyWithZone:(struct _NSZone *)zone \
{ \
return _instace; \
}
```

使用：

```objc
//SmartSingleton.h
@interface SmartSingleton : NSObject
SingletonH(SmartSingleton)
@end

//SmartSingleton.m
@implementation SmartSingleton
SingletonM(SmartSingleton)
@end

//客户端调用
Singleton *singleton = [Singleton sharedInstance];
NSLog(@"%@", singleton);
    
SmartSingleton *smartSingleton = [SmartSingleton sharedSmartSingleton];
NSLog(@"%@", smartSingleton);
```

## `Cocoa`中的单例

`Cocoa`中最常见的单例类是`UIApplication`类。它提供了一个控制并协调应用程序的集中点。

每个应用程序有且只有一个`UIApplication`实例。它由`UIApplicationMain`函数在应用程序启动时创建为单例对象。之后，对同一`UIApplication`实例可以通过`sharedUIApplication`类方法进行访问。

`UIApplication`对象为应用程序处理许多内务管理任务(`housekeeping task`)，包括传入的用户时间的最初路由，以及为`UIControl`分发动作消息给合适的目标对象。它还卫华应用程序中打开的所有`UIWindow`对象的列表。应用程序对象总是被分配一个`UIApplicationDelegate`对象。应用程序将把重要的运行时事件通知给它，比如`iOS`应用程序中的应用程序启动、内存不足警告、应用程序终止和后台进程执行。这让代理(`delegate`)有机会作出适当的响应。

`NSUserDefault`、`NSFileManager`等也是常见的单例实现。

## 总结

 只要应用程序需要用集中式的类来协调其服务，这个类就应生成单一的实例。

### 代码

文章中的代码都可以从我的GitHub [`DesignPatterns`](https://github.com/lettleprince/DesignPatterns)找到。

