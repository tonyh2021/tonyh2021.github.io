---
layout: post
title: "Objective-C Runtime — Method Swizzling"
description: ""
category: articles
tags: [iOS]
comments: true
---

`Method Swizzling` is a technique for changing the actual implementation of a selector at runtime. Using this technique, we can modify the implementation of a method by changing the function pointer associated with a selector in the class's dispatch table.

## Basic Usage

Adding a `my_firstObject` method to NSArray:

```objc
@interface NSArray (Tracking)

- (id)my_firstObject;

@end

@implementation NSArray (Tracking)

- (id)my_firstObject {
    id firstObject = [self my_firstObject];
    NSLog(@"my_firstObject");
    return firstObject;
}

@end
```

Running the test:

```objc
- (void)testMethodSwizzling {
    //调换IMP
    Method old_Method =  class_getInstanceMethod([NSArray class], @selector(firstObject));
    Method my_Method = class_getInstanceMethod([NSArray class], @selector(my_firstObject));
    method_exchangeImplementations(old_Method, my_Method);

    NSArray *array = @[@"a",@"b",@"c",@"d"];
    NSString *string = [array firstObject];
    NSLog(@"firstObject: %@", string);
}
```

Output:

```
2016-02-24 10:57:18.378 runtime_demo[36057:5169056] my_firstObject
2016-02-24 10:57:18.378 runtime_demo[36057:5169056] firstObject: a
```

## More Advanced Use

For example, suppose we want to track how many times each `view controller` is presented to the user. We could add tracking code to `viewDidAppear` in every view controller, but that's tedious and results in duplicated code. Creating subclasses is another option, but we'd need to subclass `UIViewController`, `UITableViewController`, `UINavigationController`, and every other UIKit view controller, which also generates a lot of redundant code.

This is where `Method Swizzling` comes in, as shown below:

```objc
@implementation MethodSwizzlingTestViewController (Tracking)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class class = [self class];
        // When swizzling a class method, use the following:
        // Class class = object_getClass((id)self);

        SEL originalSelector = @selector(viewWillAppear:);
        SEL swizzledSelector = @selector(my_viewWillAppear:);

        Method originalMethod = class_getInstanceMethod(class, originalSelector);
        Method swizzledMethod = class_getInstanceMethod(class, swizzledSelector);

        BOOL didAddMethod =
        class_addMethod(class,
                        originalSelector,
                        method_getImplementation(swizzledMethod),
                        method_getTypeEncoding(swizzledMethod));

        if (didAddMethod) {
            class_replaceMethod(class,
                                swizzledSelector,
                                method_getImplementation(originalMethod),
                                method_getTypeEncoding(originalMethod));
        } else {
            method_exchangeImplementations(originalMethod, swizzledMethod);
        }
    });
}

#pragma mark - Method Swizzling
- (void)my_viewWillAppear:(BOOL)animated {
    [self my_viewWillAppear:animated];
    NSLog(@"viewWillAppear: %@", self);
}

@end
```

Here, we used `method swizzling` to redirect the function pointer for `@selector(viewWillAppear:)` on UIViewController so that it now points to our custom `my_viewWillAppear` implementation. As a result, whenever UIViewController or any of its subclasses calls `viewWillAppear`, a log message will be printed.

The example above nicely demonstrates how to inject new behavior into a class using `method swizzling`. There are many other scenarios where `method swizzling` is useful, but rather than listing more examples here, let's talk about some important considerations when using it.

### Swizzling Should Always Be Done in `+load`

In Objective-C, the runtime automatically calls two methods on every class. `+load` is called when the class is first loaded, and `+initialize` is called before the first class or instance method is invoked. Both methods are optional and are only called if implemented. Because `method swizzling` affects the global state of a class, it is important to avoid race conditions in concurrent contexts. `+load` is guaranteed to be called during class initialization and ensures that behavioral changes at the application level are applied consistently. In contrast, `+initialize` does not offer this guarantee — in fact, if no messages are sent to the class within the app, it may never be called at all.

### Swizzling Should Always Be Done in `dispatch_once`

For the same reason as above — since swizzling modifies global state — we need to take precautions at runtime. Atomicity is one such precaution: it ensures the code is only executed once, regardless of how many threads are running. GCD's `dispatch_once` guarantees this behavior and should be treated as a best practice when doing method swizzling.

### Selectors, Methods, and Implementations

In Objective-C, selectors (`selector`), methods (`method`), and implementations (`implementation`) are special points in the runtime, though these terms are more commonly used when describing the message-sending process.

Here are some descriptions from the `Objective-C Runtime Reference`:

1. `Selector (typedef struct objc_selector *SEL)`: Used to represent the name of a method at runtime. A method selector is a C string registered with the Objective-C runtime. Selectors are generated by the compiler and automatically mapped by the runtime when the class is loaded.

2. `Method (typedef struct objc_method *Method)`: Represents the type of a method in a class definition.

3. `Implementation (typedef id (*IMP)(id, SEL, …))`: A pointer type that points to the start of a method's implementation function. This function follows the standard C calling convention for the current CPU architecture. The first parameter is a pointer to the object itself (`self`), the second is the method selector, followed by the actual method arguments.

The best way to understand the relationship among these three concepts is: a class maintains a runtime dispatch table for receivable messages. Each entry in that table is a Method, keyed by a specific name called a Selector (SEL), which maps to an Implementation (IMP) — a pointer to the underlying C function.

To swizzle a method, we remap an existing selector in the dispatch table to a different implementation, while binding the original implementation to a new selector.

### Calling `_cmd`

Looking back at the implementation of our swizzled method, it might seem like it would cause an infinite loop. Surprisingly, it does not. During swizzling, the `[self my_viewWillAppear:animated]` call inside the method has already been redirected to UIViewController's `-viewWillAppear:`. In this situation, no infinite loop occurs. However, if we called `[self viewWillAppear:animated]`, an infinite loop would happen, because that method's implementation has already been reassigned to `my_viewWillAppear:` at runtime.

### Caveats

Swizzling is often referred to as "black magic" and can produce unpredictable behavior and unforeseen consequences. While it is not the safest technique, it can be used safely if you follow these precautions:

Always call the original implementation (unless there is a very good reason not to): An API provides a contract between input and output, but its internal implementation is a black box. Swizzling a method without calling the original implementation can corrupt private state or underlying operations, affecting other parts of your program.
Avoid conflicts: Add a prefix to your custom category methods to prevent naming conflicts with any libraries you depend on.
Understand what you're doing: Simply copying and pasting swizzle code without understanding how it works is not only dangerous, but also wastes an opportunity to learn about the Objective-C runtime. Read the `Objective-C Runtime Reference` and examine the `<objc/runtime.h>` header to understand how everything works.
Be cautious: No matter how confident you are when swizzling Foundation, UIKit, or other built-in frameworks, remember that many things may be different in the next OS version.

### Code
All code from this article can be found on my GitHub [`runtime_demo `](https://github.com/tonyh2021/runtime_demo).

