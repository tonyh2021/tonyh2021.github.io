---
layout: post
title: "JavaScriptCore框架使用入门"
description: ""
category: articles
tags: [JavaScriptCore]
comments: true
---

## 前言

最近项目中用到了Hybrid的内容，需要js和OC代码的交互。由于js接口已经在Android项目中应用，不能轻易的修改，找了不少方案，最后选择了`JavaScriptCore`框架。

`JavaScriptCore`框架其实只是基于`webkit`中以C/C++实现的一个包装。

## JavaScriptCore中的类

`<JavaScriptCore/JavaScriptCore.h>`引入了5个文件，每个文件里都定义跟文件名对应的类：

```objc
#ifndef JavaScriptCore_h
#define JavaScriptCore_h

#include <JavaScriptCore/JavaScript.h>
#include <JavaScriptCore/JSStringRefCF.h>

#if defined(__OBJC__) && JSC_OBJC_API_ENABLED

#import "JSContext.h"
#import "JSValue.h"
#import "JSManagedValue.h"
#import "JSVirtualMachine.h"
#import "JSExport.h"

#endif

#endif /* JavaScriptCore_h */
```

## JSContext和JSValue

`JSVirtualMachine`为JavaScript的运行提供了底层资源，JSContext就为其提供着运行环境，通过`- (JSValue *)evaluateScript:(NSString *)script`方法就可以执行一段JavaScript脚本，并且如果其中有方法、变量等信息都会被存储在其中以便在需要的时候使用。而JSContext的创建都是基于JSVirtualMachine，`- (id)initWithVirtualMachine:(JSVirtualMachine *)virtualMachine`，如果是使用`- (id)init`进行初始化，那么在其内部会自动创建一个新的JSVirtualMachine对象然后调用前边的初始化方法。

JSValue则可以说是JavaScript和Object-C之间互换的桥梁，它提供了多种方法可以方便地把JavaScript数据类型转换成Objective-C，或者是转换过去。对应关系如下：

![数据类型](https://lettleprince.github.io/images/old_images/javascriptcore.png)

### 基本类型转换

先看个简单的例子：

```objc
- (void)jsTest {
    JSContext *context = [[JSContext alloc] init];
    JSValue *jsValue = [context evaluateScript:@"15 + 7"];
    int intVal = [jsValue toInt32];
    NSLog(@"JSValue: %@, int: %d", jsValue, intVal);
}
```

输出结果：

```
2016-02-25 14:54:54.899 JavaScriptCoreDemo[39256:5538866] JSValue: 22, int: 22
```


还可以存一个JavaScript变量在JSContext中，然后通过下标来获取出来。而对于Array或者Object类型，JSValue也可以通过下标直接取值和赋值。

```objc
- (void)jsTest2 {
    JSContext *context = [[JSContext alloc] init];
    [context evaluateScript:@"var arr = [15, 7 , 'www.ibloodline.com'];"];
    JSValue *jsValueArray = context[@"arr"]; // Get array from JSContext
    
    NSLog(@"jsValueArray: %@;    length: %@", jsValueArray, jsValueArray[@"length"]);
    jsValueArray[1] = @"blog"; // Use JSValue as array
    jsValueArray[7] = @7;
    
    NSLog(@"jsValueArray: %@;    length: %d", jsValueArray, [jsValueArray[@"length"] toInt32]);
    
    NSArray *nsArray = [jsValueArray toArray];
    NSLog(@"NSArray: %@", nsArray);
}
```

输出结果：

```
2016-02-25 14:55:20.411 JavaScriptCoreDemo[39264:5539214] jsValueArray: 15,7,www.ibloodline.com;    length: 3
2016-02-25 14:55:20.412 JavaScriptCoreDemo[39264:5539214] jsValueArray: 15,blog,www.ibloodline.com,,,,,7;    length: 8
2016-02-25 14:55:20.412 JavaScriptCoreDemo[39264:5539214] NSArray: (
    15,
    blog,
    "www.ibloodline.com",
    "<null>",
    "<null>",
    "<null>",
    "<null>",
    7
)
```

通过输出结果很容易看出代码成功把数据从Objective-C赋到了JavaScript数组上，而且JSValue是遵循JavaScript的数组特性：无下标越位，自动延展数组大小。并且通过JSValue还可以获取JavaScript对象上的属性，比如例子中通过`length`就获取到了JavaScript数组的长度。在转成NSArray的时候，所有的信息也都正确转换了过去。

### 方法的转换

各种数据类型可以转换，Objective-C的Block也可以传入JSContext中当做JavaScript的方法使用。比如在前端开发中常用的log方法，虽然JavaScritpCore没有自带（毕竟不是在网页上运行的，自然不会有window、document、console这些类了），仍然可以定义一个Block方法来调用NSLog来模拟：

```objc
- (void)jsTest3 {
    JSContext *context = [[JSContext alloc] init];
    context[@"log"] = ^() {
        NSLog(@"---Begin Log---");
        
        NSArray *args = [JSContext currentArguments];
        for (JSValue *jsVal in args) {
            NSLog(@"%@", jsVal);
        }
        
        JSValue *this = [JSContext currentThis];
        NSLog(@"this: %@",this);
        NSLog(@"---End Log---");
    };
    
    [context evaluateScript:@"log('ibloodline', [15, 7], { hello:'javascript', js:100 });"];
}
```

这对于调试有一定的帮助。输出结果：

```
2016-02-25 14:57:34.779 JavaScriptCoreDemo[39274:5540070] ---Begin Log---
2016-02-25 14:57:34.779 JavaScriptCoreDemo[39274:5540070] ibloodline
2016-02-25 14:57:34.779 JavaScriptCoreDemo[39274:5540070] 15,7
2016-02-25 14:57:34.780 JavaScriptCoreDemo[39274:5540070] [object Object]
2016-02-25 14:57:34.781 JavaScriptCoreDemo[39274:5540070] this: [object GlobalObject]
2016-02-25 14:57:34.781 JavaScriptCoreDemo[39274:5540070] ---End Log---
```

通过Block成功的在JavaScript调用方法回到了Objective-C，而且依然遵循JavaScript方法的各种特点，比如方法参数不固定。也因为这样，JSContext提供了类方法来获取参数列表(`+ (NSArray *)currentArguments`)和当前调用该方法的对象(`+ (JSValue *)currentThis`)。上边的例子中对于`this`输出的内容是GlobalObject，这也是JSContext对象方法`- (JSValue *)globalObject;`所返回的内容。因为我们知道在JavaScript里，所有全局变量和方法其实都是一个全局变量的属性，在浏览器中是window，在JavaScriptCore是什么就不得而知了。

Block可以传入JSContext作方法，但是JSValue没有toBlock方法来把JavaScript方法变成Block在Objetive-C中使用。毕竟Block的参数个数和类型已经返回类型都是固定的。虽然不能把方法提取出来，但是JSValue提供了`- (JSValue *)callWithArguments:(NSArray *)arguments;`方法可以反过来将参数传进去来调用方法。

```objc
- (void)jsTest4 {
    JSContext *context = [[JSContext alloc] init];
    [context evaluateScript:@"function add(a, b) { return a + b; }"];
    JSValue *add = context[@"add"];
    NSLog(@"JSValue add:  %@", add);
    
    JSValue *sum = [add callWithArguments:@[@(15), @(7)]];
    NSLog(@"JSValue sum:  %d",[sum toInt32]);
}
```

结果输出：

```
2016-02-25 15:13:29.550 JavaScriptCoreDemo[39313:5544634] JSValue add:  function add(a, b) { return a + b; }
2016-02-25 15:13:29.551 JavaScriptCoreDemo[39313:5544634] JSValue sum:  22
```

JSValue还提供`- (JSValue *)invokeMethod:(NSString *)method withArguments:(NSArray *)arguments;`让我们可以直接简单地调用对象上的方法。只是如果定义的方法是全局函数，那么很显然应该在JSContext的globalObject对象上调用该方法；如果是某JavaScript对象上的方法，就应该用相应的JSValue对象调用。

### 异常处理

Objective-C的异常会在运行时被Xcode捕获，而在JSContext中执行的JavaScript如果出现异常，只会被JSContext捕获并存储在`exception`属性上，而不会向外抛出。时时刻刻检查JSContext对象的`exception`是否不为`nil`显然是不合适，更合理的方式是给JSContext对象设置`exceptionHandler`，它接受的是`^(JSContext *context, JSValue *exceptionValue)`形式的Block。其默认值就是将传入的`exceptionValue`赋给传入的`context`的`exception`属性：

```objc
^(JSContext *context, JSValue *exceptionValue) {
    context.exception = exceptionValue;
};
```

我们也可以给`exceptionHandler`赋予新的Block以便在JavaScript运行发生异常的时候我们可以立即知道：

```objc
- (void)jsTest5 {
    JSContext *context = [[JSContext alloc] init];
    context.exceptionHandler = ^(JSContext *con, JSValue *exception) {
        NSLog(@"%@", exception);
        con.exception = exception;
    };
    
    [context evaluateScript:@"ibloodline.age = 897"];
}
```

输出结果：

```
2016-02-25 15:17:45.635 JavaScriptCoreDemo[39340:5546141] JSValue exception:ReferenceError: Can't find variable: ibloodline
```

### 使用Block的注意事项

从之前的例子和介绍应该有体会到Block在JavaScriptCore中起到的强大作用，它在JavaScript和Objective-C之间的转换 建立起更多的桥梁，让互通更方便。但是要注意的是无论是把Block传给JSContext对象让其变成JavaScript方法，还是把它赋给`exceptionHandler`属性，**在Block内都不要直接使用其外部定义的JSContext对象或者JSValue，应该将其当做参数传入到Block中，或者通过JSContext的类方法`+ (JSContext *)currentContext;`来获得。否则会造成循环引用使得内存无法被正确释放。**

比如上边自定义异常处理方法，就是赋给传入JSContext对象con，而不是其外创建的`context`对象，虽然它们其实是同一个对象。这是因为Block会对内部使用的在外部定义创建的对象做强引用，而JSContext也会对被赋予的Block做强引用，这样它们之间就形成了循环引用(`Circular Reference`)使得内存无法正常释放。
对于JSValue也不能直接从外部引用到Block中，因为每个JSValue上都有JSContext的引用 (`@property(readonly, retain) JSContext *context;`)，JSContext再引用Block同样也会形成引用循环。

### 键值对编程—Dictionary

JSContext并不能让Objective-C和JavaScript的对象直接转换，毕竟两者的面向对象的设计方式是不同的：前者基于class，后者基于prototype。但所有的对象其实可以视为一组键值对的集合，所以JavaScript中的对象可以返回到Objective-C中当做NSDictionary类型进行访问。

```objc
- (void)jsTest6 {
    
    JSContext *context = [[JSContext alloc] init];
    context.exceptionHandler = ^(JSContext *con, JSValue *exception) {
        NSLog(@"JSValue exception: %@", exception);
        con.exception = exception;
    };
    
    context[@"log"] = ^() {
        NSArray *args = [JSContext currentArguments];
        for (id obj in args) {
            NSLog(@"js log: %@", obj);
        }
    };

    JSValue *obj =[context evaluateScript:@"var jsObj = { age:897, name:'ibloodline' }; log(jsObj.age); jsObj"];
    NSLog(@"JSValue obj: %@, %@", obj[@"age"], obj[@"name"]);
    
    NSDictionary *dic = [obj toDictionary];
    NSLog(@"NSDictionary dic: %@, %@", dic[@"age"], dic[@"name"]);
}
```

```
2016-02-25 15:38:37.879 JavaScriptCoreDemo[39480:5554190] ---js log: ---
2016-02-25 15:38:37.880 JavaScriptCoreDemo[39480:5554190] 897
2016-02-25 15:38:37.880 JavaScriptCoreDemo[39480:5554190] ---js log end: ---
2016-02-25 15:38:37.880 JavaScriptCoreDemo[39480:5554190] JSValue obj: 897, ibloodline
2016-02-25 15:38:37.880 JavaScriptCoreDemo[39480:5554190] NSDictionary dic: 897, ibloodline
```

同样的，NSDicionary和NSMutableDictionary传入到JSContext之后也可以直接当对象来调用:

```objc
- (void)jsTest7 {
    JSContext *context = [[JSContext alloc] init];
    context.exceptionHandler = ^(JSContext *con, JSValue *exception) {
        NSLog(@"JSValue exception: %@", exception);
        con.exception = exception;
    };
    
    context[@"log"] = ^() {
        NSArray *args = [JSContext currentArguments];
        for (id obj in args) {
            NSLog(@"---js log begin: ---");
            NSLog(@"%@", obj);
            NSLog(@"---js log end: ---");
        }
    };
    
    NSDictionary *dic = @{@"name": @"ibloodline", @"#":@(897)};
    context[@"dic"] = dic;
    [context evaluateScript:@"log(dic.name, dic['#'])"];
}
```

```
2016-02-25 15:38:56.589 JavaScriptCoreDemo[39487:5554432] ---js log begin: ---
2016-02-25 15:38:56.589 JavaScriptCoreDemo[39487:5554432] ibloodline
2016-02-25 15:38:56.589 JavaScriptCoreDemo[39487:5554432] ---js log end: ---
2016-02-25 15:38:56.589 JavaScriptCoreDemo[39487:5554432] ---js log begin: ---
2016-02-25 15:38:56.590 JavaScriptCoreDemo[39487:5554432] 897
2016-02-25 15:38:56.590 JavaScriptCoreDemo[39487:5554432] ---js log end: ---
```

### 代码：
文章中的代码都可以从我的GitHub [`JavaScriptCoreDemo`](https://github.com/lettleprince/JavaScriptCoreDemo)找到。

### 参考资料：

[iOS7新JavaScriptCore框架入门介绍](http://blog.iderzheng.com/introduction-to-ios7-javascriptcore-framework/)

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

