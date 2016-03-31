---
layout: post
title: "JavaScriptCore框架使用——JSExport及内存管理"
description: ""
category: articles
tags: [JavaScriptCore]
comments: true
---

JavaScript可以脱离prototype继承完全用JSON来定义对象，但是Objective-C编程里可不能脱离类和继承了写代码。所以JavaScriptCore就提供了JSExport作为两种语言的互通协议。JSExport中没有约定任何的方法，连可选的(@optional)都没有，但是所有继承了该协议(@protocol)的协议（注意不是Objective-C的类(@interface)）中定义的方法，都可以在JSContext中被使用。

```objc
@protocol PersonProtocol <JSExport>

@property (nonatomic, strong) NSDictionary *urls;
- (NSString *)fullName;

@end
```

在上边的代码中，定义了一个`PersonProtocol`，并让它继承了神秘的JSExport协议，在新定义的协议中约定urls属性和fullName方法。之后又定义了Person类，除了让它实现PersonProtocol外，还定义了firstName和lastName属性。而fullName方法返回的则是两部分名字的结合。

下边就来创建一个Person对象，然后传入到JSContext中并尝试使用JavaScript来访问和修改该对象。

```objc
- (void)jsTest8 {
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
    
    Person *person = [[Person alloc] init];
    context[@"p"] = person;
    person.firstName = @"Tony";
    person.lastName = @"Han";
    person.urls = @{@"site": @"http://www.ibloodline.com"};
    
    // ok to get fullName
    [context evaluateScript:@"log(p.fullName());"];
    // cannot access firstName
    [context evaluateScript:@"log(p.firstName);"];
    // ok to access dictionary as object
    [context evaluateScript:@"log('site:', p.urls.site, 'blog:', p.urls.blog);"];
    // ok to change urls property
    [context evaluateScript:@"p.urls = {blog:'http://blog.ibloodline.com'}"];
    [context evaluateScript:@"log('-------')"];
    [context evaluateScript:@"log('site:', p.urls.site, 'blog:', p.urls.blog);"];
    
    // affect on Objective-C side as well
    NSLog(@"%@", person.urls);
}
```

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

```objc
@protocol MultiArgs <JSExport>
- (void)doFoo:(id)foo withBar:(id)bar;
@end
```

如果希望方法在JavaScript中有一个比较短的名字，就需要用的JSExport.h中提供的宏：`JSExportAs(PropertyName, Selector)`。

```objc
@protocol LongArgs <JSExport>
 
JSExportAs(testArgumentTypes,
           - (NSString *)testArgumentTypesWithInt:(int)i double:(double)d 
                    boolean:(BOOL)b string:(NSString *)s number:(NSNumber *)n 
                    array:(NSArray *)a dictionary:(NSDictionary *)o
           );
 
@end
```

比如上边定义的协议中的方法，在JavaScript就只要用`testArgumentTypes(i, d, b, s, n, a, dic);`来调用就可以了。

虽然JavaScriptCore框架还没有官方编程指南，但是在JSExport.h文件中对神秘协议的表述还是比较详细的，其中有一条是这样描述的：

> By default no methods or properties of the Objective-C class will be exposed to JavaScript, however methods and properties may explicitly be exported. For each protocol that a class conforms to, if the protocol incorporates the protocol JSExport, then the protocol will be interpreted as a list of methods and properties to be exported to JavaScript.

这里面有个**`incorporate`**一词值得推敲，经过验证只有直接继承了JSExport的自定义协议(@protocol)才能在JSContext中访问到。也就是说比如有其它的协议继承了上边的PersonProtocol，其中的定义的方法并不会被引入到JSContext中。从源码中也能看出JavaScriptCore框架会通过`class_copyProtocolList`方法找到类所遵循的协议，然后再对每个协议通过`protocol_copyProtocolList`检查它是否遵循JSExport协议进而将方法反映到JavaScript之中。

### 对已定义类扩展协议— `class_addProtocol`

对于自定义的Objective-C类，可以通过之前的方式自定义继承了JSExport的协议来实现与JavaScript的交互。对于已经定义好的系统类或者从外部引入的库类，她们都不会预先定义协议提供与JavaScript的交互的。好在[Objective-C是可以在运行时实行对类性质的修改](../../../2015/11/02/oc-runtime.html)的。

比如下边的例子，就是为UITextField添加了协议，让其能在JavaScript中可以直接访问text属性。该接口如下：

```objc
@protocol JSUITextFieldExport <JSExport>
 
@property(nonatomic,copy) NSString *text;
 
@end
```

之后在通过runtime的`class_addProtocol`为其添加上该协议：

```objc
- (void)viewDidLoad {
    [super viewDidLoad];
    
    class_addProtocol([UITextField class], @protocol(JSUITextFieldExport));
}
```

为一个UIButton添加如下的事件，其方法只要是将textField传入到JSContext中然后读取其text值，自增1后重新赋值：

```objc
- (IBAction)buttonClicked {
    JSContext *context = [[JSContext alloc] init];
    context[@"log"] = ^() {
        NSLog(@"---Begin Log---");
        NSArray *args = [JSContext currentArguments];
        for (JSValue *jsVal in args) {
            NSLog(@"%@", jsVal);
        }
        NSLog(@"---End Log---");
    };
    
    context[@"textField"] = self.textField;
    NSString *script = @"var text = textField.text;";
    [context evaluateScript:script];
    
    [context evaluateScript:@"log(text)"];
    
    NSString *script2 = @"var num = parseInt(textField.text, 10);"
    "++num;"
    "textField.text = num;";
    [context evaluateScript:script2];
}
```

运行结果：

```
2016-02-25 18:03:53.480 JavaScriptCoreDemo[39857:5592929] ---Begin Log---
2016-02-25 18:03:53.482 JavaScriptCoreDemo[39857:5592929] 145
2016-02-25 18:03:53.482 JavaScriptCoreDemo[39857:5592929] ---End Log---
2016-02-25 18:03:54.057 JavaScriptCoreDemo[39857:5592929] ---Begin Log---
2016-02-25 18:03:54.057 JavaScriptCoreDemo[39857:5592929] 146
2016-02-25 18:03:54.057 JavaScriptCoreDemo[39857:5592929] ---End Log---
2016-02-25 18:03:54.510 JavaScriptCoreDemo[39857:5592929] ---Begin Log---
2016-02-25 18:03:54.511 JavaScriptCoreDemo[39857:5592929] 147
2016-02-25 18:03:54.512 JavaScriptCoreDemo[39857:5592929] ---End Log---
......
```

当运行点击UIButton时就会看到UITextField的值在不断增加，也证明了对于已定义的类，也可以在运行时添加神奇的JSExport协议让它们可以在Objective-C和JavaScript直接实现友好互通。

### 不同内存管理机制—Reference Counting vs. Garbage Collection

虽然Objetive-C和JavaScript都是面向对象的语言，而且它们都可以让程序员专心于业务逻辑，不用担心内存回收的问题。但是两者的内存回首机制全是不同的，Objective-C是基于引用计数，之后Xcode编译器又支持了[自动引用计数(ARC, Automatic Reference Counting](http://en.wikipedia.org/wiki/Automatic_Reference_Counting))；JavaScript则如同Java/C#那样用的是[垃圾回收机制(GC, Garbage Collection](http://en.wikipedia.org/wiki/Garbage_collection_(computer_science)))。当两种不同的内存回收机制在同一个程序中被使用时就难免会产生冲突。

比如，在一个方法中创建了一个临时的Objective-C对象，然后将其加入到JSContext放在JavaScript中的变量中被使用。因为JavaScript中的变量有引用所以不会被释放回收，但是Objective-C上的对象可能在方法调用结束后，引用计数变0而被回收内存，因此JavaScript层面也会造成错误访问。

同样的，如果用JSContext创建了对象或者数组，返回JSValue到Objective-C，即使把JSValue变量retain下，但可能因为JavaScript中因为变量没有了引用而被释放内存，那么对应的JSValue也没有用了。

怎么在两种内存回收机制中处理好对象内存就成了问题。JavaScriptCore提供了JSManagedValue类型帮助开发人员更好地管理对象内存。

```objc
@interface JSManagedValue : NSObject
 
// Convenience method for creating JSManagedValues from JSValues.
+ (JSManagedValue *)managedValueWithValue:(JSValue *)value;
 
// Create a JSManagedValue.
- (id)initWithValue:(JSValue *)value;
 
// Get the JSValue to which this JSManagedValue refers. If the JavaScript value has been collected,
// this method returns nil.
- (JSValue *)value;
 
@end
```

JSVirtualMachine为整个JavaScriptCore的执行提供资源，所以当将一个JSValue转成JSManagedValue后，就可以添加到JSVirtualMachine中，这样在运行期间就可以保证在Objective-C和JavaScript两侧都可以正确访问对象而不会造成不必要的麻烦。

```objc
@interface JSVirtualMachine : NSObject
 
// Create a new JSVirtualMachine.
- (id)init;
 
// addManagedReference:withOwner and removeManagedReference:withOwner allow 
// clients of JSVirtualMachine to make the JavaScript runtime aware of 
// arbitrary external Objective-C object graphs. The runtime can then use 
// this information to retain any JavaScript values that are referenced 
// from somewhere in said object graph.
// 
// For correct behavior clients must make their external object graphs 
// reachable from within the JavaScript runtime. If an Objective-C object is 
// reachable from within the JavaScript runtime, all managed references 
// transitively reachable from it as recorded with 
// addManagedReference:withOwner: will be scanned by the garbage collector.
// 
- (void)addManagedReference:(id)object withOwner:(id)owner;
- (void)removeManagedReference:(id)object withOwner:(id)owner;
 
@end
```

### 代码：
文章中的代码都可以从我的GitHub [`JavaScriptCoreDemo`](https://github.com/lettleprince/JavaScriptCoreDemo)找到。

### 参考资料：

[JavaScriptCore框架在iOS7中的对象交互和管理](http://blog.iderzheng.com/ios7-objects-management-in-javascriptcore-framework/)

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

