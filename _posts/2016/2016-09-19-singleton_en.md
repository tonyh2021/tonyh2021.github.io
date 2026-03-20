---
layout: post
title: "Design Patterns in iOS — Singleton"
description: ""
category: articles
tags: [iOS]
comments: true
---


## Singleton Pattern

**Singleton Pattern**: Ensures a class has only one instance and provides a global access point to it.

The Singleton is probably the simplest form among all design patterns. The intent of this pattern is to make exactly one object of a class serve as the sole instance in the system.

## Class Diagram

![Singleton](/images/posts/20160919-Singleton/Singleton.png)

## When to Use

- A class must have exactly one instance, and that instance must be accessible from a well-known access point, such as a [factory method](https://tonyh2021.github.io/articles/2016/09/06/factory.html).

- The sole instance should be extensible only through subclassing, and clients should be able to use the extended object without modifying their code.

Advantages:

1. Provides controlled access to the sole instance.

2. Since only one object exists in system memory, it conserves resources. For objects that are frequently created and destroyed, the Singleton pattern can noticeably improve system performance.

3. Because the singleton class controls the instantiation process, the class can be more flexibly adjusted regarding how instantiation happens.

Disadvantages:

1. Because there is no abstraction layer in the Singleton pattern, extending a singleton class is quite difficult.

2. The singleton class carries too many responsibilities, which to some extent violates the Single Responsibility Principle.

## Usage

First, let's look at a C++ implementation:

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

In Objective-C:

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

The implementation above has issues. First, if a client initializes the singleton using a different method, multiple instances could be created. Also, this implementation is not thread-safe. An improved version:

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

Of course, writing this boilerplate for every singleton is too tedious. We can extract it into a macro:

```objc
// .h file
#define SingletonH(methodName) + (instancetype)shared##methodName;

// .m file
#if __has_feature(objc_arc) // ARC
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

#else // Non-ARC

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

Usage:

```objc
//SmartSingleton.h
@interface SmartSingleton : NSObject
SingletonH(SmartSingleton)
@end

//SmartSingleton.m
@implementation SmartSingleton
SingletonM(SmartSingleton)
@end

//Client call
Singleton *singleton = [Singleton sharedInstance];
NSLog(@"%@", singleton);

SmartSingleton *smartSingleton = [SmartSingleton sharedSmartSingleton];
NSLog(@"%@", smartSingleton);
```

## Singleton in Cocoa

The most common singleton class in Cocoa is `UIApplication`. It provides a centralized point for controlling and coordinating the application.

Each application has one and only one `UIApplication` instance. It is created as a singleton object when the application launches via the `UIApplicationMain` function. Afterward, the same `UIApplication` instance can be accessed through the `sharedUIApplication` class method.

The `UIApplication` object handles many housekeeping tasks for the application, including initial routing of incoming user events and dispatching action messages from `UIControl` to the appropriate target objects. It also maintains a list of all `UIWindow` objects open in the application. The application object is always assigned a `UIApplicationDelegate` object, which is notified of important runtime events — such as app launch, low memory warnings, app termination, and background process execution in iOS — giving the delegate a chance to respond appropriately.

`NSUserDefaults`, `NSFileManager`, and others are also common singleton implementations.

## Summary

Whenever an application needs a centralized class to coordinate its services, that class should produce a single instance.

### Code

All the code in this article can be found on my GitHub [`DesignPatterns`](https://github.com/tonyh2021/DesignPatterns).


