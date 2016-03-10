---
layout: post
title: iOS的Block的内存分配
description: 
category: articles
tags: iOS
comments: true
---

## 前言

本来想整理下Block内存管理的内容，发现这个坑挖大了。

## Block的分类

Block 其实也是一个对象，并且在大多数情况下，Block 是分配在栈上面的，只有当 Block 被定义为全局变量或Block 块中没有引用任何 automatic 变量时，Block 才分配在全局数据段上(对应下面的堆和text段)。 __block 变量也是分配在栈上面的。

在 ARC 下，编译器会自动检测为我们处理了 block 的大部分内存管理，但当将 Block 当作方法参数时候，编译器不会自动检测，需要我们手动拷贝该 Block 对象。幸运的是，Cocoa库中的大部分名称中包含`usingBlock`的接口以及 GCD 接口在其接口内部已经进行了拷贝操作，不需要我们再手动处理了。但除此之外的情况，就需要我们手动干预了。 

根据Block在内存中的位置分为三种类型：NSGlobalBlock，NSStackBlock，NSMallocBlock。

### NSGlobalBlock

NSGlobalBlock类似函数，位于text段，在block内部没有引用任何外部变量。对NSGlobalBlock的retain、copy、release操作都无效。

```c
void (^globalBlock) () = ^ () {
      NSLog(@"global block");
};
NSLog(@"%@", globalBlock);

//<__NSGlobalBlock__: 0x1096e30a0>
```

### NSStackBlock

NSStackBlock：位于栈内存，函数返回后Block将无效，在block内部引用外部变量。
MRC下：

```c
int base = 100;
long (^stackBlock) (int, int) = ^ long (int a, int b) {
    return base +a + b;
};
NSLog(@"%@",stackBlock);

//<__NSStackBlock__: 0x7fff57c4bde0>
```

栈block在当函数退出的时候，该空间就会被回收，因此如果再调用该block会导致crash：

```c
void example_addBlockToArray(NSMutableArray *array) {
	char b = 'B';
	[array addObject:^{
    printf("%cn", b);
	}];
}

void example() {
	NSMutableArray *array = [NSMutableArray array];
	example_addBlockToArray(array);
	void (^block)() = [array objectAtIndex:0];
	block();
}
```

在`example_addBlockToArray`函数中添加的block由于为栈block，因此在example函数中调用的话会导致程序crash掉，可以通过将block拷贝到堆上来解决这个问题：

```c
[array addObject:[[^{
	printf("%cn", b);
} copy autorelease]]];
```

ARC:

```c
int base = 100;
long (^stackBlock) (int, int) = ^ long (int a, int b) {
    return base +a + b;
};
NSLog(@"%@",stackBlock);

//<__NSMallocBlock__: 0x7f8da961d390>
```

在ARC模式下，打印出来的结果并不是NSStackBlock这个类型，很多人以为在ARC模式下block的类型只有NSGlobalBlock和NSMallocBlock两种，其实这种观点是错误的。在ARC情况下，生成的block也是NSStackBlock，只是当赋值给strong对象时，系统会主动对其进行copy:

```c
int i=0;
NSLog(@"%@", ^{
    NSLog(@"stack block here, i=%d", i);
});

//<__NSStackBlock__: 0x7fff592eacf8>

void (^block)()=^{
    NSLog(@"stack block here, i=%d", i);
};
NSLog(@"%@",block);
    
//<__NSMallocBlock__: 0x7fae49e02660>
```

### NSMallocBlock

NSMallocBlock：位于堆内存。如果NSStackBlock需要在其作用域外部使用的时候，在MRC的模式下需要手动将其copy到堆上，NSMallocBlock支持retain、release，会对其引用计数＋1或－1，copy不会生成新的对象，只是增加了一次引用，类似retain；而在ARC模式下会自动对其进行copy到堆上，不需要自己手动去管理，尽可能使用ARC。

### Block中copy、retain、release操作总结

- Blockcopy与copy等效，Blockrelease与release等效；

- 对Block不管是retain、copy、release都不会改变引用计数retainCount，retainCount始终是1；

- NSGlobalBlock：retain、copy、release操作都无效；

- NSStackBlock：retain、release操作无效，必须注意的是，NSStackBlock在函数返回后，Block内存将被回收。即使retain也没用。容易犯的错误是`[[mutableAarry addObject:stackBlock]`，（补：在ARC中不用担心此问题，因为ARC中会默认将实例化的block拷贝到堆上）在函数出栈后，从mutableAarry中取到的stackBlock已经被回收，变成了野指针。正确的做法是先将stackBlock copy到堆上，然后加入数组：`[mutableAarry addObject:[[stackBlock copy] autorelease]]`。支持copy，copy之后生成新的NSMallocBlock类型对象。

- NSMallocBlock支持retain、release，虽然retainCount始终是1，但内存管理器中仍然会增加、减少计数。copy之后不会生成新的对象，只是增加了一次引用，类似retain；尽量不要对Block使用retain操作。

### Block对不同类型的变量的存取

**局部变量**

在Block中只读。Block定义时copy变量的值，在Block中作为常量使用，所以即使变量的值在Block外改变，也不影响他在Block中的值。

```c
int base = 100;
BlkSum sum = ^ long (int a, int b) {
  // base++; 编译错误，只读
  return base + a + b;
};
base = 0;
printf("%ld\n",sum(1,2)); // 这里输出是103，而不是3
```

**static变量、全局变量**

如果把上个例子的base改成全局的或static。Block就可以对他进行读写了。因为全局变量或静态变量在内存中的地址是固定的，Block在读取该变量值的时候是直接从其所在内存读出，获取到的是最新值，而不是在定义时copy的常量。

```c
static int base = 100;
BlkSum sum = ^ long (int a, int b) {
  base++;
  return base + a + b;
};
base = 0;
printf("%d\n", base);
printf("%ld\n",sum(1,2)); // 这里输出是3，而不是103
printf("%d\n", base);
```

输出结果是0 4 1，表明Block外部对base的更新会影响Block中的base的取值，同样Block对base的更新也会影响Block外部的base值。

**Block变量**

被__block修饰的变量称作Block变量。基本类型的Block变量等效于全局变量、或静态变量。

> Block被另一个Block使用时，另一个Block被copy到堆上时，被使用的Block也会被copy。但作为参数的Block是不会发生copy的。

**OC对象**

不同于基本类型，Block会引起对象的引用计数变化。在ARC下需要注意循环引用的问题。



参考：  
[block在arc与非arc区别](http://blog.qiumingxing.cn/ios/block%E5%9C%A8arc%E4%B8%8E%E9%9D%9Earc%E5%8C%BA%E5%88%AB/)  
[正确使用Block避免Cycle Retain和Crash](http://tanqisen.github.io/blog/2013/04/19/gcd-block-cycle-retain/)
[Block 的内存管理](http://www.tanhao.me/pieces/310.html/)