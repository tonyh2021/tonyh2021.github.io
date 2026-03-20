---
layout: post
title: "Functional Programming: Principles and a Simple Implementation"
description: ""
category: articles
tags: iOS
comments: true
---

## Introduction

**Functional programming philosophy**: write operations as a series of nested function or method calls whenever possible.

**Characteristics of functional programming**: every method must have a return value (which is the object itself); functions or blocks are passed as parameters (the block's parameter is the value to operate on, and the block's return value is the result of the operation).

## A Simple Calculator Using Functional Programming

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

// Verify the addition functionality
int result = [[calculator add:^int(int result) {

   // Write the calculation logic inside the block
   result+=2;
   result+=3;
   return result;

}] result];

NSLog(@"验证加法功能:%d", result);

Calculator *calculator2 = [[Calculator alloc] init];

// Verify equality check
BOOL isEqual = [[[calculator2 add:^int(int result) {

   // Write the calculation logic inside the block
   result+=3;
   result+=4;
   return result;

}] equal:^BOOL(int result) {

   return result == 7;
}] isEqual];

NSLog(@"验证加法功能:%d", isEqual);
```

### Code
All code from this article can be found on my GitHub [`FRP`](https://github.com/tonyh2021/FRP).



