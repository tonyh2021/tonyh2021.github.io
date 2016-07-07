---
layout: post
title: "再说iOS的内存管理"
description: ""
category: articles
tags: [iOS]
comments: true
---

## 前言

关于runtime和runloop总觉得已经了解的足够了，但是跟别人聊的时候还是会遇到不确定的情况。太丢人了。

## 讨论

看这样一段代码，分别打印的是什么（ARC）？

```objc
__weak id weakObj;//使用weak，防止对引用计数器和内存释放产生影响
__weak id weakObj2;

- (void)viewDidLoad {
    [super viewDidLoad];
    
    if (1) {//仅仅是用于作用域实验
        NSString *str = [[NSString alloc] initWithFormat:@"I am str"];
        NSLog(@"%@", str);
        
        weakObj = str;
        
        NSString *str2 = [NSString stringWithFormat:@"%@", @"I am str2"];
        NSLog(@"%@", str2);
        
        weakObj2 = str2;
    }
    
    NSLog(@"__str:%@", weakObj);
    NSLog(@"__str2:%@", weakObj2);
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    NSLog(@"viewWillAppear__str:%@", weakObj);
    NSLog(@"viewWillAppear__str2:%@", weakObj2);
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    NSLog(@"viewDidAppear__str:%@", weakObj);
    NSLog(@"viewDidAppear__str2:%@", weakObj2);
}
```

很简单的代码，但是其实并不是很确定。这里涉及到了两个知识点，ARC下编译器对于对象release操作的时机以及ARC下autorelease的原理。

## 分析

首先比较好理解的是release。通俗来讲，ARC就是通过指定的语法，让编译器（LLVM）在编译代码时，自动在适当的地方插入适当的 retain, release, autorelease 语句。需要牢记的是，ARC并不是GC，它只是一种代码静态分析（Static Analyzer）工具，是在编译阶段进行release的添加，而不是在运行的时候进行内存释放。

`NSLog(@"__str:%@", weakObj);` 这一句输出为：

```objc
2016-07-07 14:08:04.759 test[35938:6007240] __str:(null)
```

很明显在str作用域结束后，编译器就在if语句的末尾添加了release语句，使得内存被释放。当然 `viewWillAppear` 和 `viewDidAppear` 里面都是null。

但是后面的语句却输出的是：

```objc
2016-07-07 14:08:04.759 test[35938:6007240] __str2:I am str2
```

甚至在 `viewWillAppear` 里面都输出了内容。感觉好可怕，好在在 `viewDidAppear` 中输出了null，让我们避免内存泄露的风险。

原因在于 `stringWithFormat` 方法中实现了autorelease的机制。系统的每一个runloop，系统会隐式创建一个autorelease pool，这样所有的release pool会构成一个象CallStack一样的一个栈式结构，在每一个runloop结束时，当前栈顶的 autorelease pool（main()里的autorelease）会被销毁，这样这个pool里的每个object会被release。简单说来就是在runloop结束的时候，检查每一个对象的引用计数，若为零则释放掉内存。

代码里面 `viewDidLoad` 调用结束时所在的runloop并没有结束，这个runloop在 `viewWillAppear` 调用完成后才结束，所以当然在这之前str2都没有被释放掉。

当然我们如果这样：

```objc
@autoreleasepool {
    NSString *str2 = [NSString stringWithFormat:@"%@", @"I am str2"];
    NSLog(@"%@", str2);
    weakObj2 = str2;
}
```

那后面所有对于str2的输出都为null。

在查资料的过程中注意到，如果是在Mac项目下：

```objc
__weak id weakObj;
__weak id weakObj2;

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if (1) {//仅仅是用于作用域实验
            NSString *str = [[NSString alloc] initWithFormat:@"I am str"];
            NSLog(@"%@", str);
            
            weakObj = str;
            
            NSString *str2 = [NSString stringWithFormat:@"%@", @"I am str2"];
            NSLog(@"%@", str2);
            
            weakObj2 = str2;
        }
        
        NSLog(@"__str:%@", weakObj);
        NSLog(@"__str2:%@", weakObj2);
    }
    return 0;
}
```

输出变为：

```objc
2016-07-07 14:33:05.613 toy[4918:1115753] I am str
2016-07-07 14:33:05.615 toy[4918:1115753] I am str2
2016-07-07 14:33:05.615 toy[4918:1115753] __str:I am str
2016-07-07 14:33:05.615 toy[4918:1115753] __str2:I am str2
```

## 补充:

如果使用for循环，如下代码：

```objc
for (int i = 0; i < 12345678; i++) {
    NSString *str = [[NSString alloc] initWithFormat:@"I am str"];
    // NSString *str2 = [NSString stringWithFormat:@"%@", @"I am str2"];
}
```

其中被注释的代码在循环多次的情况下会大量占用内存。解决方案：一是使用alloc方式初始化变量；二是用 `@autoreleasepool {}` 进行包裹；三是，如果可能的话，遍历时用 `enumerateObjectsUsingBlock` ，因为里面实现了autoreleasepool。


## 参考

[AutomaticReferenceCounting](http://clang.llvm.org/docs/AutomaticReferenceCounting.html#ownership-inference)

[Beginning ARC in iOS 5 Tutorial](https://www.raywenderlich.com/5677/beginning-arc-in-ios-5-part-1)

[iOS 5 ARC完全指南](https://lettleprince.github.io/images/20160707-arc/iOS%205%20ARC%E5%AE%8C%E5%85%A8%E6%8C%87%E5%8D%97.pdf)

注：Mac项目的内存管理和iOS项目不一样，这些讨论和结论都是针对在iOS的ARC环境下。




