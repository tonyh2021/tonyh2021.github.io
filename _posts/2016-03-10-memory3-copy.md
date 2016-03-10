---
layout: post
title: iOS的深复制与浅复制
description: 
category: articles
tags: iOS
comments: true
---

不管是集合类对象，还是非集合类对象，接收到`copy`和`mutableCopy`消息时，都遵循以下准则：

- `copy`返回`immutable`对象；所以，如果对`copy`返回值使用`mutable`对象接口就会crash；
- `mutableCopy`返回`mutable`对象；

### 非集合类对象的copy与mutableCopy

系统非集合类对象指的是NSString，NSNumber之类的对象。下面先看个非集合类`immutable`对象拷贝的例子：

```c
NSString *string = @"origin";
NSString *stringCopy = [string copy];
NSMutableString *stringMCopy = [string mutableCopy];

NSLog(@"%p", string);
NSLog(@"%p", stringCopy);
NSLog(@"%p", stringMCopy);
```

```c
2016-03-10 17:32:04.479 Homework[21715:2353641] 0x1000d0ea0
2016-03-10 17:32:04.481 Homework[21715:2353641] 0x1000d0ea0
2016-03-10 17:32:04.481 Homework[21715:2353641] 0x17006fe40
```

通过查看内存，可以看到`stringCopy`和`string`的地址是一样，进行了指针拷贝；而`stringMCopy`的地址和`string`不一样，进行了内容拷贝。

再看`mutable`对象拷贝例子：

```c
NSMutableString *string      = [NSMutableString stringWithString: @"origin"];
//copy
NSString *stringCopy         = [string copy];
NSMutableString *mStringCopy = [string copy];
NSMutableString *stringMCopy = [string mutableCopy];

NSLog(@"%p", string);
NSLog(@"%p", stringCopy);
NSLog(@"%p", mStringCopy);
NSLog(@"%p", stringMCopy);
```

```c
2016-03-10 17:34:11.486 Homework[21728:2354359] 0x17426f800
2016-03-10 17:34:11.487 Homework[21728:2354359] 0x174230600
2016-03-10 17:34:11.487 Homework[21728:2354359] 0x1742306e0
2016-03-10 17:34:11.487 Homework[21728:2354359] 0x174267240
```

```c
//change value
[mStringCopy appendString:@"mm"]; //crash
[string appendString:@" origion!"];
[stringMCopy appendString:@"!!"];
```

crash的原因就是copy返回的对象是`immutable`对象。注释后运行`string`、`stringCopy`、`mStringCopy`、`stringMCopy`四个对象的内存地址都不一样，说明此时都是做内容拷贝。

> **在非集合类对象中：对`immutable`对象进行`copy`操作，是指针复制，`mutableCopy`操作时内容复制；对`mutable`对象进行`copy`和`mutableCopy`都是内容复制。用代码简单表示如下：**
> 
> - [immutableObject copy] // 浅复制
> 
> - [immutableObject mutableCopy] //深复制
> 
> - [mutableObject copy] //深复制
> 
> - [mutableObject mutableCopy] //深复制

### 集合类对象的`copy`与`mutableCopy`

集合类对象是指NSArray、NSDictionary、NSSet之类的对象。下面先看集合类immutable对象使用copy和mutableCopy的一个例子：

```c
NSArray *array = @[@[@"a", @"b"], @[@"c", @"d"]];
NSArray *copyArray = [array copy];
NSMutableArray *mCopyArray = [array mutableCopy];
    
NSLog(@"%p", array);
NSLog(@"%p", copyArray);
NSLog(@"%p", mCopyArray);
```

```c
2016-03-10 17:53:40.113 Homework[21775:2358227] 0x17403f040
2016-03-10 17:53:40.114 Homework[21775:2358227] 0x17403f040
2016-03-10 17:53:40.114 Homework[21775:2358227] 0x174247e60
```

可以看到copyArray和array的地址是一样的，而mCopyArray和array的地址是不同的。说明copy操作进行了指针拷贝，mutableCopy进行了内容拷贝。但需要强调的是：此处的内容拷贝，仅仅是拷贝array这个对象，array集合内部的元素仍然是指针拷贝。这和上面的非集合immutable对象的拷贝还是挺相似的，那么mutable对象的拷贝会不会类似呢？我们继续往下，看mutable对象拷贝的例子：

```c
NSMutableArray *array = [NSMutableArray arrayWithObjects:[NSMutableString stringWithString:@"a"],@"b",@"c",nil];
NSArray *copyArray = [array copy];
NSMutableArray *mCopyArray = [array mutableCopy];
    
NSLog(@"%p", array);
NSLog(@"%p", copyArray);
NSLog(@"%p", mCopyArray);
```

```
2016-03-10 17:54:39.114 Homework[21782:2358605] 0x170058e40
2016-03-10 17:54:39.115 Homework[21782:2358605] 0x170058ed0
2016-03-10 17:54:39.115 Homework[21782:2358605] 0x170058ea0
```

查看内存，如我们所料，copyArray、mCopyArray和array的内存地址都不一样，说明copyArray、mCopyArray都对array进行了内容拷贝。同样，我们可以得出结论：

> **在集合类对象中，对immutable对象进行copy，是指针复制，mutableCopy是内容复制；对mutable对象进行copy和mutableCopy都是内容复制。但是：集合对象的内容复制仅限于对象本身，对象元素仍然是指针复制。用代码简单表示如下：**
> 
> [immutableObject copy] // 浅复制
> [immutableObject mutableCopy] //单层深复制
> [mutableObject copy] //单层深复制
> [mutableObject mutableCopy] //单层深复制

这个代码结论和非集合类的非常相似。但是如果要对集合中的对象复制元素怎么办？如果在多层数组中，对第一层进行内容拷贝，其它层进行指针拷贝，这种情况是属于深复制，还是浅复制？对此，[苹果官网文档](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Collections/Articles/Copying.html)有这样一句话描述

> This kind of copy is only capable of producing a one-level-deep copy. If you only need a one-level-deep copy, you can explicitly call for one as in Listing 2

> **Listing 2**  Making a deep copy

```c
NSArray *deepCopyArray=[[NSArray alloc] initWithArray:someArray copyItems:YES];
```

> This technique applies to the other collections as well. Use the collection’s equivalent of initWithArray:copyItems: with YES as the second parameter.

> If you need a true deep copy, such as when you have an array of arrays, you can archive and then unarchive the collection, provided the contents all conform to the NSCoding protocol. An example of this technique is shown in Listing 3.

**Listing 3**  A true deep copy

```c
NSArray* trueDeepCopyArray = [NSKeyedUnarchiver unarchiveObjectWithData:
          [NSKeyedArchiver archivedDataWithRootObject:oldArray]];
```

苹果认为这种复制不是真正的深复制，而是将其称为单层深复制(one-level-deep copy)。因此，网上有人对浅复制、深复制、单层深复制做了概念区分。

- 浅复制(shallow copy)：在浅复制操作时，对于被复制对象的每一层都是指针复制。

- 深复制(one-level-deep copy)：在深复制操作时，对于被复制对象，至少有一层是深复制。

- 完全复制(real-deep copy)：在完全复制操作时，对于被复制对象的每一层都是对象复制。

补充：

```c
NSString *str = @"string";
NSLog(@"%p", str);
    
str = @"newString";
NSLog(@"%p", str);
```

```c
2016-03-10 17:58:02.152 Homework[21794:2359359] 0x1000f8ea0
2016-03-10 17:58:02.154 Homework[21794:2359359] 0x1000f8ee0
```

此处修改的是内存地址。所以第二行应该这样理解：将@"newStirng"当做一个新的对象，将这段对象的内存地址赋值给str。

参考：  
[iOS 集合的深复制与浅复制](https://www.zybuluo.com/MicroCai/note/50592)