---
layout: post
title: "iOS中的iOS——原型(Prototype)"
description: ""
category: articles
tags: [iOS]
comments: true
---

## 前言

以前作为iOS小团队的负责人，在团队间沟通上要整天面对数不清的扯皮，然后团队内又要作为主程写代码。可谓操着卖白粉的心，赚着卖白菜的钱。最近换了新的工作环境（虽然不是顶尖的团队），终于可以静下心来研究些细节——其实，团队对于工作质量（代码或者架构设计）的高要求也需要我们从更高更深的角度对待工作。

设计模式这坑估计得填个十几二十篇吧。

## 原型模式

**原型模式（`Prototype`）**：是指使用原型实例指定创建对象的种类，并通过复制这个原型创建新的对象。说人话：OC中可以通过深复制来快速而方便的创建一个新对象。

> [iOS的深复制与浅复制](https://tonyh2021.github.io/articles/2016/03/10/memory3-copy.html)

## 类图

![prototype](/images/posts/20160905-prototype/prototype.png)

`Prototype`声明了复制自身的接口。作为`Prototype`的实现，`ConcretePrototype`实现了复制自身的`clone`操作。这里的客户端是指使用了原型类实例的类。客户端通过`clone`创建了一个新的对象，即`prototype`的副本。

## 使用场景

1.需要创建的对象应独立于其类型与创建方式。也就是说我们想要的对象并不能够直接通过初始化函数来创建出来，其创建过程不具有普遍性且复杂。

2.要实例化类是在运行时决定的。在编写代码的时候并不知道哪种对象会被创建出来，其内部的结构如何复杂（例如：复杂程度取决于用户的操作）

3.不想要与产品层次相对应的工厂层次。不通过工厂方法或者抽象工厂来控制产品的创建过程，想要直接复制对象。

4.不同类的实例间的差异仅是状态的若干组合。因此复制相应数量的原型比手工实例化更加方便。

5.类不容易创建，比如每个组件可把其他组件作为子节点的组合对象。复制已有的组合对象并对副本进行修改会更加容易。内部结构复杂，不容易重现。

以下两种常见的使用场景：

1.有很多相关的类，其行为略有不同，而且主要差异在于内部属性，如名称、图像等；

2.需要使用组合（树形）对象作为其他东西的基础，例如，使用组合对象作为组件来构建另一个组合对象。

也就是说，通过初始化方法创建对象时特别繁琐（甚至无法实现），可以考虑使用原型模式深拷贝出一份模型副本。

## 使用方式

以下代码：

```objc
@interface Person : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) int age;
@end

@implementation Person
- (id)copyWithZone:(NSZone *)zone {
    Person *p = [[[self class] allocWithZone:zone] init];
    p.name = self.name;//需要设置属性
    p.age = self.age;
    return p;
}
@end

Person *p1 = [[Person alloc] init];
p1.name = @"name1";
p1.age = 29;

Person *p2 = [p1 copy];
    
NSLog(@"%@:%@, %d", p1, p1.name, p1.age);
NSLog(@"%@:%@, %d", p2, p2.name, p2.age);
```

```objc
2016-09-05 18:31:19.677 OCDemo[3532:462200] <Person: 0x7fadd94930d0>:name1, 29
2016-09-05 18:31:19.678 OCDemo[3532:462200] <Person: 0x7fadd9495750>:name1, 29
```

> - `Person`继承自`NSObjcet`(实现了`copy`方法)类。`Person`的实例接收到`copy`消息时，`NSObjcet`会依次向实现了`NSObjcet`协议的子类转发消息。所以`Person`需要实现`- (id)copyWithZone:(NSZone *)zone`方法，否则会出错。

> - `copy` is just short for `copyWithZone:`, using the default zone.It's rare that you would call `copyWithZone:` directly, although defining/implementing it is required in order to adopt `@protocol NSCopying`. so you would normally see `copyWithZone:` only within an implementation of `copyWithZone:`. similarly, you would typically avoid implementing `copy`, and just let the default implementation of copy call through `copyWithZone:`.[What is the difference between “-copy” and “-copyWithZone:”?](http://stackoverflow.com/questions/12048931/what-is-the-difference-between-copy-and-copywithzone)——大概是说，实现的时候用`copyWithZone`，调用的时候用`copy`。

> - 使用`[self class]`的原因是让子类也能调用此方法。不过，当子类有其他属性时，则需要注意。

```objc
@interface Student : Person
@property (nonatomic, assign) int age;
@property (nonatomic, copy) NSString *address;
@property (nonatomic, assign) CGSize size;
@end

@implementation Student
@end

Student *s1 = [[Student alloc] init];
s1.name = @"s1";
s1.age = 15;
s1.address = @"Beijing";
s1.size = CGSizeMake(175, 65);
    
Student *s2 = [s1 copy];
    
NSLog(@"%@:%@, %d, %@, %@", s1, s1.name, s1.age, s1.address, NSStringFromCGSize(s1.size));
NSLog(@"%@:%@, %d, %@, %@", s2, s2.name, s2.age, s2.address, NSStringFromCGSize(s2.size));
```

```objc
2016-09-05 17:56:24.539 OCDemo[3436:446050] <Student: 0x7fda69c60e40>:s1, 15, Beijing, {175, 70}
2016-09-05 17:56:27.307 OCDemo[3436:446050] <Student: 0x7fda6c054aa0>:s1, 15, (null), {0, 0}
```

> `Student`可以调用其父类`Person`的`copyWithZone`实现，但是由于`address`属性并没有被赋值，所以`copy`出来的实例`address`为`null`。

```objc
- (id)copyWithZone:(NSZone *)zone {
    Student *s = [[[self class] allocWithZone:zone] init];
    s.name = self.name;
    s.age = self.age;
    s.address = self.address;
    s.size = self.size;
    return s;
}
```

像上面`Student`实现`copyWithZone`方法，然后重新把属性全部赋值一遍？这样不够优雅。框架级别的实现：

```objc
@interface BaseCopyObject : NSObject <NSCopying>
- (void)copyOperationWithObject:(id)object;
@end

@implementation BaseCopyObject 
//子类不要重载这个方法
- (id)copyWithZone:(NSZone *)zone {
    BaseCopyObject *object = [[[self class] allocWithZone:zone] init];
    [self copyOperationWithObject:object];//赋值操作
    return object;
}
//子类实现此方法，实现赋值操作
- (void)copyOperationWithObject:(id)object {}
@end

@interface Person : BaseCopyObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) int age;
@end

@implementation Person
- (void)copyOperationWithObject:(Person *)object {
    object.name = self.name;
    object.age = self.age;
}
@end

@interface Student : Person
@property (nonatomic, copy) NSString *address;
@property (nonatomic, assign) CGSize size;
@end

@implementation Student
- (void)copyOperationWithObject:(Student *)object {
    [super copyOperationWithObject:object];//调用父类的属性赋值
    object.address = self.address;
    object.size = self.size;
}
@end
```

注意属行中如果有类似`Person`、`NSArray`类型的属性，则需要注意：

```objc
@interface Student : Person
@property (nonatomic, copy) NSString *address;
@property (nonatomic, assign) CGSize size;
@property (nonatomic, strong) Person *teacher;//注意Person是BaseCopyObject的子类哦
@property (nonatomic, copy) NSArray *friends;
@property (nonatomic, strong) NSMutableArray *girlfriends;//多多益善😁
@end

@implementation Student
- (void)copyOperationWithObject:(Student *)object {
    [super copyOperationWithObject:object];
    object.size = self.size;
    object.teacher = [self.teacher copy];
    object.address = self.address;
    object.friends = self.friends;
//  object.friends = [self.friends copy];
//  这两种写法都不能实现“真正”的copy
    object.girlfriends = [self.girlfriends mutableCopy];
}
@end
```

```objc
2016-09-05 19:35:34.012 OCDemo[3852:525566] <Student: 0x7ffe78e2e7e0>:s1, 15, Beijing, {175, 65}, <Person: 0x7ffe7b035db0>, (
    "<Student: 0x7ffe78e2e910>",
    "<Student: 0x7ffe78e2e960>"
), (
    "<Student: 0x7ffe78e40b10>",
    "<Student: 0x7ffe78e40b60>",
    "<Student: 0x7ffe78e40bb0>"
)
2016-09-05 19:35:34.012 OCDemo[3852:525566] <Student: 0x7ffe7b0365c0>:s1, 15, Beijing, {175, 65}, <Person: 0x7ffe7b036610>, (
    "<Student: 0x7ffe78e2e910>",
    "<Student: 0x7ffe78e2e960>"
), (
    "<Student: 0x7ffe78e40b10>",
    "<Student: 0x7ffe78e40b60>",
    "<Student: 0x7ffe78e40bb0>"
)
```

`teacher`属性的确被`copy`，但是很遗憾，`friends`和`girlfriends`中的元素都没变。谁愿意和别人共享女朋友呢😈。此时应该这样实现属性的赋值：

```objc
@implementation Student
- (void)copyOperationWithObject:(Student *)object {
    [super copyOperationWithObject:object];
    object.size = self.size;
    object.teacher = [self.teacher copy];
    object.address = self.address;
    object.friends = [[NSArray alloc] initWithArray:self.friends copyItems:YES];
    object.girlfriends = [[NSMutableArray alloc] initWithArray:self.girlfriends copyItems:YES];
}
@end
```

```objc
2016-09-05 19:41:11.919 OCDemo[3867:531529] <Student: 0x7fa4eb48c400>:s1, 15, Beijing, {175, 65}, <Person: 0x7fa4eb5377f0>, (
    "<Student: 0x7fa4eb48bea0>",
    "<Student: 0x7fa4eb48bef0>"
), (
    "<Student: 0x7fa4eb48bf60>",
    "<Student: 0x7fa4eb48bfb0>",
    "<Student: 0x7fa4eb48cf80>"
)
2016-09-05 19:41:11.919 OCDemo[3867:531529] <Student: 0x7fa4eb72b240>:s1, 15, Beijing, {175, 65}, <Person: 0x7fa4eb72aba0>, (
    "<Student: 0x7fa4eb72b290>",
    "<Student: 0x7fa4eb72b310>"
), (
    "<Student: 0x7fa4eb72b390>",
    "<Student: 0x7fa4eb72b410>",
    "<Student: 0x7fa4eb72b8b0>"
)
```

这下安逸了吧😝。

另外，再考虑：`Student`还有个属性others，存放了另外两个数组元素，即二维数组。再次使用`object.others = [[NSArray alloc] initWithArray:self.others copyItems:YES];`来赋值，简直要崩溃了，再次的没有实现“真正”的`copy`。

此时需要使用：

```objc
object.others = [NSKeyedUnarchiver unarchiveObjectWithData:
                     [NSKeyedArchiver archivedDataWithRootObject:self.others]];
```

```objc
2016-09-05 20:20:31.745 OCDemo[4160:573360] <Student: 0x7f96a8548d60>:s1, 15, Beijing, {175, 65}, <Person: 0x7f96a8548ae0>, (
    "<Student: 0x7f96a8548ed0>",
    "<Student: 0x7f96a8548f20>"
), (
    "<Student: 0x7f96a8548f70>",
    "<Student: 0x7f96a8548fc0>",
    "<Student: 0x7f96a8549010>"
), (
        (
        "<Student: 0x7f96a8549240>",
        "<Student: 0x7f96a8549290>"
    ),
        (
        "<Student: 0x7f96a8549300>",
        "<Student: 0x7f96a8549350>",
        "<Student: 0x7f96a85493a0>"
    )
)
2016-09-05 20:20:31.745 OCDemo[4160:573360] <Student: 0x7f96a84d40c0>:s1, 15, Beijing, {175, 65}, <Person: 0x7f96a8413d20>, (
    "<Student: 0x7f96a84d3f80>",
    "<Student: 0x7f96a84d4d10>"
), (
    "<Student: 0x7f96a84d5430>",
    "<Student: 0x7f96a84d5b60>",
    "<Student: 0x7f96a84d6280>"
), (
        (
        "<Student: 0x7f96a854b900>",
        "<Student: 0x7f96a854d1b0>"
    ),
        (
        "<Student: 0x7f96a854d520>",
        "<Student: 0x7f96a854d740>",
        "<Student: 0x7f96a854d940>"
    )
)
```

需要注意的是，由于数组中的元素都是`Student`类，所以`Student`需要实现`<NSCoding>`协议相应的方法。当然也可以使用`MJExtension`或`YYModel`等第三方框架快速实现。

好像有点扯远了。

## Cocoa中原型的体现

除了上面提到个各种`copy`之外，其实还有一个比较典型的实现，就是僵尸对象（`NSZombie Object`）了。虽然拷贝的是类对象，但是既然OC中类也是特殊的对象，使用原型模式来理解也应该是OK的。具体可以查看[使用僵尸对象辅助调试](https://tonyh2021.github.io/articles/2016/09/01/NSZombie.html)。

### 参考：

[iOS的深复制与浅复制](https://tonyh2021.github.io/articles/2016/03/10/memory3-copy.html)

### 代码

文章中的代码都可以从我的GitHub [`DesignPatterns`](https://github.com/tonyh2021/DesignPatterns)找到。

