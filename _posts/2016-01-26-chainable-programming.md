---
layout: post
title: "链式编程原理及简单实现"
description: ""
category: articles
tags: 编程思想
comments: true
---


## 前言

一直在用Masonry，对其链式编程很敢兴趣。于是稍微看了下下其代码的实现。个人理解Masonry的优势主要在于：<font color="red">**能够将视图的约束代码聚集起来，方便代码的阅读与修改**</font>。

链式编程是将多个操作（多行代码）通过点号(.)链接在一起成为一句代码，以增强代码的可读性。核心思想：方法的返回值是block，block必须有返回值（self，即对象本身），block参数为需要操作的值。

## Masonry的应用

首先看Masonry的应用：

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

使用起来还是很简单的。问题是怎么实现可以多个属性连续调用。看`mas_makeConstraints`方法：

```objc
- (NSArray *)mas_makeConstraints:(void(^)(MASConstraintMaker *))block {
    self.translatesAutoresizingMaskIntoConstraints = NO;
    MASConstraintMaker *constraintMaker = [[MASConstraintMaker alloc] initWithView:self];
    block(constraintMaker);
    return [constraintMaker install];
}
```

可以看到`mas_makeConstraints`的作用主要是，给控件设置布局，把控件的所有约束保存到约束制造者中：

- 创建一个约束制造者；

- 调用`block(constraintMaker)`，把所有的控件的约束全部保存到约束制造者；

- `[constraintMaker install]`，遍历约束制造者的所有约束给控件添加约束，实际上是先遍历并卸载之前的约束，再安装新的约束，最后返回约束的列表。

重点就是`make.width.height.equalTo(@80)`的连续调用了。`make.width.height`把宽度和高度的约束通过`- (MASConstraint *)addConstraintWithLayoutAttribute:(NSLayoutAttribute)layoutAttribute`全部保存到`make.contrains`。

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

> 注意，有时候Xcode抽风会把`width.height`当成`MASConstraint`的属性，实际上在这里都是返回值为`MASConstraint`的方法，重启Xcode即可解决。

再看`equalTo`的源码：

```objc
- (MASConstraint * (^)(id))equalTo {
    return ^id(id attribute) {
        return self.equalToWithRelation(attribute, NSLayoutRelationEqual);
    };
}


```

这究竟是个什么？！为了实现能够用括号来实现参数的传递，在被调用的方法中定义block，`equalTo`返回这个block，在上一级就可以调用block了。核心就是：**返回值必须是Block**。

理一下思路：

- 链式编程思想：把要做的事情封装到block，给外界提供一个返回这个Block的方法。

- 链式编程思想方法特点：方法返回值必须是block。Block参数：传入需要操作的内容，block返回值：方法调用者

## 链式编程简单实现

下面使用传统方式和链式编程思想对比着来实现下计算器：

```objc
//TraditionalCalculatorMaker.h
@property (nonatomic, assign) int result;
- (instancetype)add:(int)num;

//TraditionalCalculatorMaker.m
- (instancetype)add:(int)num {
    self.result += num;
    return self;
}

//方法调用
TraditionalCalculatorMaker *make = [[TraditionalCalculatorMaker alloc] init];
[[[make add:3] add:5] add:2];
NSLog(@"result:%d", [make result]);
```

多个中括号看起来相当恶心啦。下面按照Masonry的思路来实现计算器：

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

将整个计算过程当做block返回，block的参数为要计算的数值，block的返回值为对象自己，以便于接着进行链式调用。

当然，要实现类似Masonry的调用方式，必须要用分类实现，比如给NSObject添加分类：

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

在计算时调用这个方法，创建计算制造者，然后调用传入的block，并返回结果。

```objc
NSObject *obj = [[NSObject alloc] init];
int result = [obj makeCalculator:^(CalculatorMaker *make) {
   make.add(1).add(2).add(4);
}];
NSLog(@"result:%d", result);
```

### 代码
文章中的代码都可以从我的GitHub [`ChainableProgramming`](https://github.com/lettleprince/ChainableProgramming)找到。


