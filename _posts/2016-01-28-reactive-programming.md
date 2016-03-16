---
layout: post
title: "响应式编程原理及KVO简单实现"
description: ""
category: articles
tags: 编程思想
comments: true
---

## 前言

在响应式编程中，不需要考虑调用顺序，只需要知道考虑结果，类似于蝴蝶效应，产生一个事件，会影响很多东西，这些事件像流一样的传播出去，然后影响结果。借用面向对象的一句话，万物皆是流。
响应式编程其实并不复杂，经常用的KVO便是很典型的应用。

## KVO实现原理

KVO，即`key-value-observing`，利用一个key来找到某个属性并监听其值得改变。KVO的实现原理为：当一个类的属性被观察的时候，系统会通过runtime动态的创建一个该类的派生类，并且会在这个类中重写基类被观察的属性的setter方法，而且系统将这个类的isa指针指向了派生类，从而实现了给监听的属性赋值时调用的是派生类的setter方法。重写的setter方法会在调用原setter方法前后，通知观察对象值得改变。

KVO的用法非常简单：

1. 添加观察者，`- (void)addObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath options:(NSKeyValueObservingOptions)options context:(nullable void *)context`。
2. 在观察者中实现监听方法，`- (void)observeValueForKeyPath:(nullable NSString *)keyPath ofObject:(nullable id)object change:(nullable NSDictionary<NSString*, id> *)change context:(nullable void *)context`。
3. 移除观察者。`- (void)removeObserver:(NSObject *)observer forKeyPath:(NSString *)keyPath`。

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

1. 动态创建`NSKVONotifying_Cat`（Cat子类）；
2. 修改当前对象的isa指针指向`NSKVONotifying_Cat`；
3. 只要调用对象的set，就会调用`NSKVONotifying_Cat`的set方法；
4. 重写`NSKVONotifying_Cat`的set方法，先调用`[super set:]`，然后通知观察者属性改变。

## KVO简单实现

添加分类`NSObject+KVO`：

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

新建Cat的子类`XTKVONotifying_Cat`，并重写set方法：

```objc
- (void)setWeight:(float)weight {
    [super setWeight:weight];
    
    // 通知观察者属性已改变，这里的observer即为ReactiveProgrammingViewController
    id observer = objc_getAssociatedObject(self, @"observer");
    [observer observeValueForKeyPath:@"weight" ofObject:self change:nil context:nil];
}
```

在`ReactiveProgrammingViewController`中，改用新添加的分类方法来添加观察者：

```objc
[cat xt_addObserver:self forKeyPath:@"weight" options:NSKeyValueObservingOptionNew context:nil];
```


### 代码：
文章中的代码都可以从我的GitHub [`FRP`](https://github.com/lettleprince/FRP)找到。


