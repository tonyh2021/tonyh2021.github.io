---
layout: post
title: "Reactive Programming: Principles and a Simple KVO Implementation"
description: ""
category: articles
tags: iOS
comments: true
---

## Introduction

In reactive programming, you don't need to think about the order of operations — you only need to care about the result. It's like the butterfly effect: one event ripples outward, affecting many things. These events propagate like streams and ultimately influence the outcome. To borrow an object-oriented phrase: everything is a stream.
Reactive programming is not actually that complicated. KVO, which you probably use often, is a classic example of it.

## How KVO Works Internally

KVO stands for `key-value-observing`. It uses a key to locate a property and observe changes to its value. The underlying mechanism is: when a property of a class is observed, the system uses the runtime to dynamically create a subclass of that class. It overrides the setter of the observed property in this derived class, and changes the object's `isa` pointer to point to the derived class. As a result, whenever the observed property is set, the derived class's setter is called. The overridden setter notifies the observer before and after calling the original setter.

Using KVO is straightforward:

1. Add an observer: `- (void)addObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath options:(NSKeyValueObservingOptions)options context:(nullable void *)context`.
2. Implement the observation callback in the observer: `- (void)observeValueForKeyPath:(nullable NSString *)keyPath ofObject:(nullable id)object change:(nullable NSDictionary<NSString*, id> *)change context:(nullable void *)context`.
3. Remove the observer: `- (void)removeObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath`.

```objc
- (void)viewDidLoad {
    [super viewDidLoad];

    Cat *cat = [[Cat alloc] init];
    self.cat = cat;

    [cat addObserver:self forKeyPath:@"weight" options:NSKeyValueObservingOptionNew context:nil];
}

/**
 *  当对象的属性发生改变会调用该方法
 *  @param keyPath 监听的属性
 *  @param object  监听的对象
 *  @param change  新值和旧值
 *  @param context 额外的数据
 */
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSString *,id> *)change context:(void *)context {
    NSLog(@"%f",self.cat.weight);
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    self.cat.weight++;
}

- (void)dealloc {
    NSLog(@"%@ dealloc", [self class]);
    [self.cat removeObserver:self forKeyPath:@"weight"];
}
```

The steps the system performs internally are:

1. Dynamically create `NSKVONotifying_Cat` (a subclass of `Cat`);
2. Modify the current object's `isa` pointer to point to `NSKVONotifying_Cat`;
3. Whenever the object's setter is called, `NSKVONotifying_Cat`'s setter is invoked instead;
4. The overridden setter in `NSKVONotifying_Cat` first calls `[super set:]` and then notifies the observer that the property has changed.

## A Simple KVO Implementation

Add a category `NSObject+KVO`:

```objc
//NSObject+KVO.h
- (void)xt_addObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath options:(NSKeyValueObservingOptions)options context:(nullable void *)context;

//NSObject+KVO.m
- (void)xt_addObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath options:(NSKeyValueObservingOptions)options context:(nullable void *)context {

    // 修改isa,本质就是改变当前对象的类名
    object_setClass(self, [XTKVONotifying_Cat class]);

    // 把观察者（在这里就是ReactiveProgrammingViewController）保存到当前对象里

    // 添加关联
    // id object:给哪个对象添加关联属性
    // key:属性名
    // value:关联值
    objc_setAssociatedObject(self, @"observer", observer, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}
```

Create a subclass of `Cat` named `XTKVONotifying_Cat` and override its setter:

```objc
- (void)setWeight:(float)weight {
    [super setWeight:weight];

    // 通知观察者属性已改变，这里的observer即为ReactiveProgrammingViewController
    id observer = objc_getAssociatedObject(self, @"observer");
    [observer observeValueForKeyPath:@"weight" ofObject:self change:nil context:nil];
}
```

In `ReactiveProgrammingViewController`, switch to using the new category method to add the observer:

```objc
[cat xt_addObserver:self forKeyPath:@"weight" options:NSKeyValueObservingOptionNew context:nil];
```


### Code
All code from this article can be found on my GitHub [`FRP`](https://github.com/tonyh2021/FRP).


