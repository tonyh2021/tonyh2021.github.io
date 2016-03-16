---
layout: post
title: "函数式编程原理与简单实现"
description: ""
category: articles
tags: 编程思想
comments: true
---

## 前言

**函数式编程思想**：是把操作尽量写成一系列嵌套的函数或者方法调用。

**函数式编程特点**：每个方法必须有返回值（本身对象），把函数或者block当做参数（block参数为需要操作的值，block返回值为操作结果）。

## 函数式编程简单实现计算器

```objc
//Calculator.h
@interface Calculator : NSObject
@property (nonatomic, assign) int result;
@property (nonatomic, assign) BOOL isEqual;
- (instancetype)add:(int(^)(int result))block;
- (instancetype)equal:(BOOL(^)(int result))block;
@end

//Calculator.m
@implementation Calculator
- (instancetype)add:(int (^)(int result))block {
    self.result = block(self.result);
    return self;
}
- (instancetype)equal:(BOOL (^)(int))block {
    self.isEqual = block(self.result);
    return self;
}
@end
```

```objc
Calculator *calculator = [[Calculator alloc] init];
    
//验证计数器功能
int result = [[calculator add:^int(int result) {
   
   // 把计算的过程写到block中
   result+=2;
   result+=3;
   return result;
   
}] result];
    
NSLog(@"验证加法功能:%d", result);
    
Calculator *calculator2 = [[Calculator alloc] init];
    
//验证是否等于某个值
BOOL isEqual = [[[calculator2 add:^int(int result) {
   
   // 把计算的过程写到block中
   result+=3;
   result+=4;
   return result;
   
}] equal:^BOOL(int result) {
   
   return result == 7;
}] isEqual];
    
NSLog(@"验证加法功能:%d", isEqual);
```

### 代码
文章中的代码都可以从我的GitHub [`FRP`](https://github.com/lettleprince/FRP)找到。



