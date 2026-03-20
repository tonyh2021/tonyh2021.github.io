---
layout: post
title: "Thread Safety in Multithreading"
description: ""
category: articles
tags: [iOS]
comments: true
---

## The Problem

When multiple threads access the same object's data simultaneously, thread safety issues arise. For example:

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

## Solutions

The most common solution to thread safety problems is using locks.

For example:

```objc
- (void)changePersons {
    @synchronized(self) {
        for (int i = 0; i < 1000; i++) {
            [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
        }
    }
}
```

This automatically creates a lock based on the given object and waits for the block to finish executing. The lock is released at the end of the block. In the code above, the synchronization target is `self`. This usually works fine because it ensures each object instance can run its synchronized methods without interference. However, `@synchronized(self)` reduces efficiency because all synchronized blocks sharing the same lock must execute in order. If locks are acquired frequently on `self`, the program may have to wait for unrelated synchronized code to complete before it can proceed.

Another option is using `NSLock`:

```objc
- (void)changePersons {
    [self.lock lock];
        for (int i = 0; i < 1000; i++) {
            [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
        }
    [self.lock unlock];
}
```

Or use `NSRecursiveLock`, which allows a thread to acquire the same lock multiple times without deadlocking.

A better approach is GCD, which provides a simpler and more efficient way to synchronize code. Using `@synchronized(self)` on every property is inefficient because every synchronized block must wait for all other synchronized blocks to complete. In practice, we only need each property to synchronize independently. Additionally, this kind of thread safety is limited — for example, a thread might read a property twice in succession while another thread writes a new value in between.

Using a **serial synchronization queue** — dispatching both read and write operations to the same queue — guarantees data consistency:

```objc
- (void)changePersons {
    dispatch_sync(self.syncQueue, ^{
        for (int i = 0; i < 1000; i++) {
            [self.persons addObject:[[Person alloc] initWithName:[NSString stringWithFormat:@"%d", i] age:i]];
        }
    });
}
```

For use in getters and setters:

```objc
@synthesize name = _name;//When both getter and setter are manually implemented for a @property, the compiler won't auto-generate _name. This line makes it do so.

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

The idea: place both read and write operations in a serialized queue so all property accesses are synchronized. The locking is handled entirely within GCD, which has already made low-level optimizations.

Since setters don't necessarily need to be synchronous — and the block setting the instance variable doesn't need to return a value — you can change it to:

```objc
- (void)setName:(NSString *)name {
    dispatch_async(self.syncQueue, ^{
        _name = name;
    });
}
```

This changes the setter from synchronous to asynchronous execution, which can speed up the setter while reads and writes still execute in order. However, this might actually hurt performance in practice, because async dispatch requires copying the block. If the time spent copying the block is significantly longer than the time spent executing it, this approach will be slower than the synchronous version. It's worth considering only if the blocks being submitted to the queue perform heavy work.

Multiple getters can run concurrently, but getters and setters cannot run concurrently with each other. We can exploit this by switching to a **concurrent queue**:

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

The above actually doesn't achieve proper synchronization. All reads and writes execute on the same queue, but because it's a concurrent queue, they can run at any time interleaved. This can be fixed with GCD barriers: `dispatch_barrier_async` and `dispatch_barrier_sync`.

A barrier block in a queue must run exclusively — it cannot run in parallel with other blocks. This only makes sense for concurrent queues, since serial queue blocks always run one at a time. When a concurrent queue encounters a barrier block, it waits for all currently running concurrent blocks to finish, then executes the barrier block alone. After the barrier block completes, the queue resumes normal concurrent execution.

Using a barrier block in the setter allows reads to remain parallel while writes execute exclusively:

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

![01](/images/posts/20160902-Multithread/01.png)

The diagram above shows a concurrent queue where reads are implemented with regular blocks and writes with barrier blocks. Reads can run in parallel, but writes must run exclusively.

This implementation is faster than a serial queue. Additionally, the setter could also use a synchronous barrier block (`dispatch_barrier_sync`), which might be even more efficient in some cases.
