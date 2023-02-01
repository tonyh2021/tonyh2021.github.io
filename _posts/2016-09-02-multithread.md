---
layout: post
title: "多线程下的线程安全问题"
description: ""
category: articles
tags: [多线程]
comments: true
---

## 引入问题

在多个线程同时访问同一个对象的数据时，会有线程安全的问题。比如：

```objc
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
   [self changePersons];
});
    
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
   [self changePersons];
});
    
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
   [self changePersons];
});
    
- (void)changePersons {
    for (int i = 0; i < 1000; i++) {
        [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
    }
}
```

## 解决问题

解决线程安全的问题最常用的是使用锁。

比如：

```objc
- (void)changePersons {
    @synchronized(self) {
        for (int i = 0; i < 1000; i++) {
            [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
        }
    }
}
```

这种写法会根据给定的对象，自动创建一个锁，并等待块中的代码执行完毕。执行到这段代码结尾处，锁就释放了。上面代码同步行为所针对的对象时self。这样写通常没错，因为可以保证每个对象实例都能不受干扰的运行其synchronized方法。可是`@synchronized(self)`会降低代码效率，因为共用同一个锁的那些同步块，都必须按顺序执行。若在self对象上频繁加锁，那么程序可能要等另一段与此无关的代码执行结束后，才能继续执行当前代码。

再比如使用NSLock对象：

```objc
- (void)changePersons {
    [self.lock lock];
        for (int i = 0; i < 1000; i++) {
            [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
        }
    [self.lock unlock];
}
```

或者使用NSRecursiveLock递归锁，线程能够多次持有该锁，而不会出现死锁现象。

更好的方案是使用GCD，它能以更简单、更高效的形式为代码加锁。如果在对象的每个属性都使用`@synchronized(self)`，效率肯定会比较低，因为每个属性的同步块都要等其他所有同步块执行完毕才能执行，但实际上我们只需要每个属性各自独立的同步就可以了。另外，这种线程安全也只是一定程度上的，比如同一个线程中两次访问某个属性，其他线程可能会写入新的属性值。

使用“串行同步队列(`serial synchronization queue`)”，将读取操作和写入操作都安排在同一个队列里，即可保证数据同步。

```objc
- (void)changePersons {
    dispatch_sync(self.syncQueue, ^{
        for (int i = 0; i < 1000; i++) {
            [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
        }
    });
}
```

如果想要在get和set方法中使用，则：

```objc
@synthesize name = _name;//对于@property属性同时实现set和get方法时，系统不会自动生成_name变量。加上这句话系统才会自动生成_name。

- (NSString *)name {
    __block NSString *name;
    dispatch_sync(self.syncQueue, ^{
        name = _name;
    });
    return name;
}

- (void)setName:(NSString *)name {
    dispatch_sync(self.syncQueue, ^{
        _name = name;
    });
}
```

思路：把设置操作与获取操作都安排在序列化的队列里执行，这样的话，所有针对属性的访问操作就都同步了。加锁的任务都在GCD中处理了，而GCD在底层已经做了一些优化。

另外，由于设置方法并不一定非得是同步的，同时设置实例变量所用的块，并不需要向设置方法返回什么值。于是可以改成这样：

```objc
- (void)setName:(NSString *)name {
    dispatch_async(self.syncQueue, ^{
        _name = name;
    });
}
```

这样只是把同步同步执行改成了异步执行，可以提升set方法的执行速度，而读取操作与写入操作依然会按顺序执行。不过这么改可能实际上性能会下降，因为异步执行时，需要拷贝块。若拷贝块所用的时间明显超过执行块所花的时间，则这种方案将比之前慢。若是提交到队列的块要执行更为繁重的任务，那么可以考虑这样的方案。

多个get方法可以并发执行，而get方法与set方法之间并不能并发执行，利用这个特点，还可以进一步优化。改用并发队列（`concurrent queue`）。

```objc
self.syncQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);

- (NSString *)name {
    __block NSString *name;
    dispatch_sync(self.syncQueue, ^{
        name = _name;
    });
    return name;
}

- (void)setName:(NSString *)name {
    dispatch_async(self.syncQueue, ^{
        _name = name;
    });
}
```

上面实际是无法实现同步的。所有读取操作和写入操作都会在同一个队列上执行，不过由于是并发队列，所以读取与写入操作可以随时执行。使用GCD的栅栏(`barrier`)即可解决，`dispatch_barrier_async`和`dispatch_barrier_sync`。

在队列中，栅栏块必须单独执行，不能与其他块并行。这只对并发队列有意义，因为串行队列中的块总是按顺序逐个来执行的。并发队列如果发现接下来要处理的块是个栅栏块（`barrier block`），那么就一直要等当前所有并发块都执行完毕，才会单独执行这个栅栏块。栅栏块执行完毕后，再按正常方式继续向下处理。

在set方法中使用栅栏块，对属性的读取操作依然可以并行，但是写入操作则必须单独执行：

```objc
self.syncQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);

- (NSString *)name {
    __block NSString *name;
    dispatch_sync(self.syncQueue, ^{
        name = _name;
    });
    return name;
}

- (void)setName:(NSString *)name {
    dispatch_barrier_async(self.syncQueue, ^{
        _name = name;
    });
}
```

![01](https://tonyh2021.github.io/images/20160902-Multithread/01.png)

上图表示一个并发队列，读取操作是用普通的块来实现的，而写入操作使用栅栏块实现的。读取操作可以并行，但是写入操作必须单独执行。

这样的实现比串行队列要快。另外，set方法也可用同步的栅栏块（`synchronous barrier`）来实现，那样做可能会更高效。

