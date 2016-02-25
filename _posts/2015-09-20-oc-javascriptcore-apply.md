---
layout: post
title: "JavaScriptCore框架使用——JSExport及内存管理"
description: ""
category: articles
tags: [JavaScriptCore]
comments: true
---

JavaScript可以脱离prototype继承完全用JSON来定义对象，但是Objective-C编程里可不能脱离类和继承了写代码。所以JavaScriptCore就提供了JSExport作为两种语言的互通协议。JSExport中没有约定任何的方法，连可选的(@optional)都没有，但是所有继承了该协议(@protocol)的协议（注意不是Objective-C的类(@interface)）中定义的方法，都可以在JSContext中被使用。

<script src="https://gist.github.com/lettleprince/f365fa24481da3a88fff.js?file=2015-09-20-oc-javascriptcore-apply-1.m"></script>

在上边的代码中，定义了一个`PersonProtocol`，并让它继承了神秘的JSExport协议，在新定义的协议中约定urls属性和fullName方法。之后又定义了Person类，除了让它实现PersonProtocol外，还定义了firstName和lastName属性。而fullName方法返回的则是两部分名字的结合。

下边就来创建一个Person对象，然后传入到JSContext中并尝试使用JavaScript来访问和修改该对象。

<script src="https://gist.github.com/lettleprince/f365fa24481da3a88fff.js?file=2015-09-20-oc-javascriptcore-apply-2.m"></script>

```
2016-02-25 16:01:39.476 JavaScriptCoreDemo[39550:5561905] js log: Tony Han
2016-02-25 16:01:39.476 JavaScriptCoreDemo[39550:5561905] js log: undefined
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: site:
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: http://www.ibloodline.com
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: blog:
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: undefined
2016-02-25 16:01:39.478 JavaScriptCoreDemo[39550:5561905] js log: -------AFTER CHANGE URLS-------
2016-02-25 16:01:39.478 JavaScriptCoreDemo[39550:5561905] js log: site:
2016-02-25 16:01:39.478 JavaScriptCoreDemo[39550:5561905] js log: undefined
2016-02-25 16:01:39.479 JavaScriptCoreDemo[39550:5561905] js log: blog:
2016-02-25 16:01:39.479 JavaScriptCoreDemo[39550:5561905] js log: http://blog.ibloodline.com
2016-02-25 16:01:39.479 JavaScriptCoreDemo[39550:5561905] {
    blog = "http://blog.ibloodline.com";
}
```

从输出结果不难看出，当访问firstName和lastName的时候给出的结果是`undefined`，因为它们跟JavaScript没有JSExport的联系。但这并不影响从`fullName()`中正确得到两个属性的值。和之前说过的一样，对于NSDictionary类型的urls，可以在JSContext中当做对象使用，而且还可以正确地给urls赋予新的值，并反映到实际的Objective-C的Person对象上。

JSExport不仅可以正确反映属性到JavaScript中，而且对属性的特性也会保证其正确，比如一个属性在协议中被声明成readonly，那么在JavaScript中也就只能读取属性值而不能赋予新的值。

对于多参数的方法，JavaScriptCore的转换方式将Objective-C的方法每个部分都合并在一起，冒号后的字母变为大写并移除冒号。比如下边协议中的方法，在JavaScript调用就是：`doFooWithBar(foo, bar);`

<script src="https://gist.github.com/lettleprince/f365fa24481da3a88fff.js?file=2015-09-20-oc-javascriptcore-apply-3.m"></script>

如果希望方法在JavaScript中有一个比较短的名字，就需要用的JSExport.h中提供的宏：`JSExportAs(PropertyName, Selector)`。

<script src="https://gist.github.com/lettleprince/f365fa24481da3a88fff.js?file=2015-09-20-oc-javascriptcore-apply-4.m"></script>

比如上边定义的协议中的方法，在JavaScript就只要用`testArgumentTypes(i, d, b, s, n, a, dic);`来调用就可以了。

虽然JavaScriptCore框架还没有官方编程指南，但是在JSExport.h文件中对神秘协议的表述还是比较详细的，其中有一条是这样描述的：

> By default no methods or properties of the Objective-C class will be exposed to JavaScript, however methods and properties may explicitly be exported. For each protocol that a class conforms to, if the protocol incorporates the protocol JSExport, then the protocol will be interpreted as a list of methods and properties to be exported to JavaScript.

这里面有个**`incorporate`**一词值得推敲，经过验证只有直接继承了JSExport的自定义协议(@protocol)才能在JSContext中访问到。也就是说比如有其它的协议继承了上边的PersonProtocol，其中的定义的方法并不会被引入到JSContext中。从源码中也能看出JavaScriptCore框架会通过`class_copyProtocolList`方法找到类所遵循的协议，然后再对每个协议通过`protocol_copyProtocolList`检查它是否遵循JSExport协议进而将方法反映到JavaScript之中。

### 对已定义类扩展协议— `class_addProtocol`

对于自定义的Objective-C类，可以通过之前的方式自定义继承了JSExport的协议来实现与JavaScript的交互。对于已经定义好的系统类或者从外部引入的库类，她们都不会预先定义协议提供与JavaScript的交互的。好在[Objective-C是可以在运行时实行对类性质的修改](2015-11-02-oc-runtime)的。

比如下边的例子，就是为UITextField添加了协议，让其能在JavaScript中可以直接访问text属性。该接口如下：

#### 文章中的代码都可以从我的Github [`JavaScriptCoreDemo`](https://github.com/lettleprince/JavaScriptCoreDemo)找到。

#### 参考：

[JavaScriptCore框架在iOS7中的对象交互和管理](http://blog.iderzheng.com/ios7-objects-management-in-javascriptcore-framework/)

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

