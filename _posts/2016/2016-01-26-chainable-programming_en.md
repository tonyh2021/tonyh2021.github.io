---
layout: post
title: "Chainable Programming: Principles and a Simple Implementation"
description: ""
category: articles
tags: iOS
comments: true
---


## Introduction

I have been using Masonry for a while and became quite interested in its chainable programming style, so I took some time to look at how it is implemented. In my view, Masonry's main advantage is: <font color="red">**the ability to group a view's constraint code together, making it easier to read and modify.**</font>

Chainable programming links multiple operations (multiple lines of code) together with dot notation (`.`) into a single expression, improving code readability. The core idea is: a method's return value is a block; the block must have a return value (which is `self`, the object itself); and the block's parameter is the value to operate on.

## Using Masonry

Let's start with a typical Masonry usage:

```objc
UIView *demoView = [[UIView alloc] init];
demoView.backgroundColor = [UIColor orangeColor];
[self.view addSubview:demoView];

[demoView mas_makeConstraints:^(MASConstraintMaker *make) {
    //距离self.view的顶端和左边都是100
    make.top.left.equalTo(self.view).offset(100);
    //宽高都是80
    make.width.height.equalTo(@80);
}];
```

Pretty simple to use. The question is: how does calling multiple properties in a chain work? Let's look at the `mas_makeConstraints` method:

```objc
- (NSArray *)mas_makeConstraints:(void(^)(MASConstraintMaker *))block {
    self.translatesAutoresizingMaskIntoConstraints = NO;
    MASConstraintMaker *constraintMaker = [[MASConstraintMaker alloc] initWithView:self];
    block(constraintMaker);
    return [constraintMaker install];
}
```

You can see that `mas_makeConstraints` primarily sets layout constraints on the view and saves all of them into the constraint maker:

- Creates a constraint maker;

- Calls `block(constraintMaker)`, saving all of the view's constraints into the constraint maker;

- `[constraintMaker install]` iterates over all constraints in the constraint maker and applies them to the view. In practice, it first iterates and uninstalls any existing constraints, then installs the new ones, and finally returns the list of constraints.

The key is the chain call `make.width.height.equalTo(@80)`. `make.width.height` saves both the width and height constraints into `make.constraints` through `- (MASConstraint *)addConstraintWithLayoutAttribute:(NSLayoutAttribute)layoutAttribute`.

```objc
- (MASConstraint *)addConstraintWithLayoutAttribute:(NSLayoutAttribute)layoutAttribute {
    return [self constraint:nil addConstraintWithLayoutAttribute:layoutAttribute];
}

- (MASConstraint *)left {
    return [self addConstraintWithLayoutAttribute:NSLayoutAttributeLeft];
}

- (MASConstraint *)top {
    return [self addConstraintWithLayoutAttribute:NSLayoutAttributeTop];
}
```

> Note: Xcode occasionally glitches and treats `width.height` as properties of `MASConstraint`, but they are actually methods that return a `MASConstraint`. A restart of Xcode fixes this.

Now look at the source for `equalTo`:

```objc
- (MASConstraint * (^)(id))equalTo {
    return ^id(id attribute) {
        return self.equalToWithRelation(attribute, NSLayoutRelationEqual);
    };
}


```

What exactly is this?! To allow passing arguments via parentheses, a block is defined inside the called method, `equalTo` returns that block, and the caller can then invoke the block. The key is: **the return value must be a Block**.

Let's summarize the thinking:

- Chainable programming concept: wrap the work to be done inside a block and provide a method that returns that block to the outside.

- Characteristic of chainable programming methods: the method's return value must be a block. Block parameter: the value to operate on. Block return value: the method's caller (the object itself).

## A Simple Chainable Programming Implementation

Below is a calculator implemented in both the traditional style and the chainable style for comparison:

```objc
//TraditionalCalculatorMaker.h
@property (nonatomic, assign) int result;
- (instancetype)add:(int)num;

//TraditionalCalculatorMaker.m
- (instancetype)add:(int)num {
    self.result += num;
    return self;
}

//method call
TraditionalCalculatorMaker *make = [[TraditionalCalculatorMaker alloc] init];
[[[make add:3] add:5] add:2];
NSLog(@"result:%d", [make result]);
```

All those nested square brackets look quite ugly. Here's the same calculator implemented following Masonry's approach:

```objc
//CalculatorMaker.h
@property (nonatomic, assign) int result;
- (CalculatorMaker * (^)(int num))add;

//CalculatorMaker.m
- (CalculatorMaker * (^)(int num))add {
    return ^(int num){
        self.result += num;
        return self;
    };
}
```

The entire calculation is returned as a block. The block's parameter is the number to add, and its return value is `self`, enabling continued chaining.

Of course, to achieve a Masonry-like call style, you need to use a category. For example, adding a category to `NSObject`:

```objc
//NSObject+CalculatorAdditions.h
- (int)makeCalculator:(void(^)(CalculatorMaker *))block;

//NSObject+CalculatorAdditions.m
- (int)makeCalculator:(void(^)(CalculatorMaker *))block {
    CalculatorMaker *make = [[CalculatorMaker alloc] init];
    block(make);
    return [make result];
}
```

This method creates a calculator maker when called, invokes the passed-in block, and returns the result.

```objc
NSObject *obj = [[NSObject alloc] init];
int result = [obj makeCalculator:^(CalculatorMaker *make) {
   make.add(1).add(2).add(4);
}];
NSLog(@"result:%d", result);
```

### Code
All code from this article can be found on my GitHub [`ChainableProgramming`](https://github.com/tonyh2021/ChainableProgramming).


