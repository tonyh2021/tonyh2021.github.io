---
layout: post
title: Block Memory Allocation in iOS
description:
category: articles
tags: iOS
comments: true
---

## Introduction

I originally intended to write a quick summary of Block memory management, but the topic turned out to be a much deeper rabbit hole than expected.

## Block Types

A Block is itself an object. In most cases, Blocks are allocated on the stack. A Block is only allocated in the global data segment when it is defined as a global variable or when no automatic variables are referenced inside the Block (corresponding to the heap and text segment below). `__block` variables are also allocated on the stack.

Under ARC, the compiler automatically handles most Block memory management for us, but when a Block is passed as a method parameter, the compiler does not do this automatically — you must manually copy the Block object. Fortunately, most Cocoa framework APIs whose names contain `usingBlock`, as well as GCD APIs, already perform a copy internally, so you don't need to handle that yourself. Outside of those cases, however, manual intervention is required.

Based on their location in memory, Blocks fall into three types: `NSGlobalBlock`, `NSStackBlock`, and `NSMallocBlock`.

### NSGlobalBlock

`NSGlobalBlock` is similar to a regular function and lives in the text segment. It contains no references to any external variables. `retain`, `copy`, and `release` operations on an `NSGlobalBlock` all have no effect.

```objc
void (^globalBlock) () = ^ () {
      NSLog(@"global block");
};
NSLog(@"%@", globalBlock);

//<__NSGlobalBlock__: 0x1096e30a0>
```

### NSStackBlock

`NSStackBlock` lives on the stack. It becomes invalid after the function returns because it references external variables.
Under MRC:

```c
int base = 100;
long (^stackBlock) (int, int) = ^ long (int a, int b) {
    return base +a + b;
};
NSLog(@"%@",stackBlock);

//<__NSStackBlock__: 0x7fff57c4bde0>
```

A stack Block is reclaimed when the function exits. Calling the Block after that causes a crash:

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

The Block added inside `example_addBlockToArray` is a stack Block; calling it inside `example` will crash the program. The fix is to copy the Block to the heap first:

```c
[array addObject:[[^{
	printf("%cn", b);
} copy autorelease]]];
```

Under ARC:

```c
int base = 100;
long (^stackBlock) (int, int) = ^ long (int a, int b) {
    return base +a + b;
};
NSLog(@"%@",stackBlock);

//<__NSMallocBlock__: 0x7f8da961d390>
```

Under ARC, the printed type is not `NSStackBlock`. Many people assume that under ARC there are only `NSGlobalBlock` and `NSMallocBlock`, but that is incorrect. Under ARC, the generated Block is still an `NSStackBlock`; it is just that when assigned to a strong object, the system automatically copies it:

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

`NSMallocBlock` lives on the heap. If an `NSStackBlock` needs to be used outside its scope, you must manually copy it to the heap under MRC. `NSMallocBlock` supports `retain` and `release`, which increment and decrement the retain count respectively. `copy` does not create a new object — it simply adds a reference, similar to `retain`. Under ARC, the Block is automatically copied to the heap, so manual management is unnecessary. Use ARC whenever possible.

### Summary of copy, retain, and release on Blocks

- `BlockCopy` is equivalent to `copy`; `BlockRelease` is equivalent to `release`.

- For a Block, `retain`, `copy`, and `release` do not change the `retainCount`; `retainCount` is always 1.

- `NSGlobalBlock`: `retain`, `copy`, and `release` are all no-ops.

- `NSStackBlock`: `retain` and `release` are no-ops. It is crucial to know that after a function returns, an `NSStackBlock`'s memory is reclaimed. Even `retain` will not help. A common mistake is `[mutableArray addObject:stackBlock]` (note: under ARC this is not a concern because ARC copies stack Blocks to the heap by default). After the function returns, the `stackBlock` retrieved from `mutableArray` will be a dangling pointer. The correct approach is to first copy it to the heap: `[mutableArray addObject:[[stackBlock copy] autorelease]]`. `copy` on an `NSStackBlock` creates a new `NSMallocBlock`.

- `NSMallocBlock` supports `retain` and `release`; although `retainCount` always shows 1, the memory manager still increments and decrements the count internally. `copy` does not create a new object — it just adds a reference, similar to `retain`. Avoid using `retain` on a Block when possible.

### Block Access to Different Variable Types

**Local Variables**

Read-only inside a Block. When the Block is defined, the variable's value is copied and treated as a constant inside the Block. Therefore, even if the variable's value changes outside the Block, it does not affect the value inside the Block.

```c
int base = 100;
BlkSum sum = ^ long (int a, int b) {
  // base++; compile error — read-only
  return base + a + b;
};
base = 0;
printf("%ld\n",sum(1,2)); // output is 103, not 3
```

**Static Variables and Global Variables**

If `base` in the example above is changed to a global or static variable, the Block can both read and write it. Because global and static variables have fixed addresses in memory, the Block reads the variable's current value directly from that address rather than a copy made at definition time.

```c
static int base = 100;
BlkSum sum = ^ long (int a, int b) {
  base++;
  return base + a + b;
};
base = 0;
printf("%d\n", base);
printf("%ld\n",sum(1,2)); // output is 3, not 103
printf("%d\n", base);
```

The output is `0 4 1`, showing that changes to `base` outside the Block affect its value inside the Block, and likewise that changes to `base` inside the Block affect its value outside the Block.

**Block Variables**

Variables modified with `__block` are called Block variables. For primitive types, `__block` variables behave like global or static variables.

> When a Block is used by another Block, and that outer Block is copied to the heap, the inner Block is also copied. However, a Block passed as a parameter is not copied.

**Objective-C Objects**

Unlike primitive types, Blocks affect the retain count of Objective-C objects. Under ARC, be careful about retain cycles.



References:
[Differences Between Blocks Under ARC and Non-ARC](http://blog.qiumingxing.cn/ios/block%E5%9C%A8arc%E4%B8%8E%E9%9D%9Earc%E5%8C%BA%E5%88%AB/)
[Using Blocks Correctly to Avoid Retain Cycles and Crashes](http://tanqisen.github.io/blog/2013/04/19/gcd-block-cycle-retain/)
[Block Memory Management](http://www.tanhao.me/pieces/310.html/)
