---
layout: post
title: "The Principles of Objective-C Runtime"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Introduction
`runtime`: refers to the state of a program while it is running (or being executed). In other words, when you open a program and it runs on your computer, that program is in its runtime state. In some programming languages, reusable programs or instances are packaged or rebuilt into a `runtime library`. These instances can be linked or called by any program while they are running.

`Objective-C runtime`: a relatively low-level pure C language API, part of a C language library, containing many low-level C language APIs. When we write OC code and the program runs, everything ultimately gets converted into `runtime` C language code.

`Objective-C` is a dynamic language built on top of C with object-oriented features and a message-forwarding mechanism. This means it requires not just a compiler, but also a `runtime` system to dynamically create classes and objects, and to send and forward messages.

## Runtime Data Structures
> Reference: [Objective-C Runtime — Part 1: Classes and Objects](http://southpeak.github.io/blog/2014/10/25/objective-c-runtime-yun-xing-shi-zhi-lei-yu-dui-xiang/)

In `Objective-C`, using `[receiver message]` syntax does not immediately execute the code of `receiver`'s `message` method. Instead, it sends a `message` to `receiver`. This message may be handled by `receiver`, forwarded to another object, or silently ignored. In practice, `[receiver message]` is compiled by the compiler into:

```objc
id objc_msgSend ( id self, SEL op, ... );
```

### SEL

`SEL` is the data type of the second parameter of `objc_msgSend`, representing a method selector. Its data structure in `<objc.h>`:

```objc
typedef struct objc_selector *SEL;
```

In essence, it is a C string mapped to a method. You can obtain an `SEL`-type method selector using the Objective-C compiler directive `@selector()` or the runtime function `sel_registerName`.

If you know the method name that corresponds to a `selector`, you can convert the `SEL` to a string using `NSString* NSStringFromSelector(SEL aSelector)` and print it with `NSLog`.

### id

The data type of the first parameter of `objc_msgSend` is `id`. `id` is a generic pointer type that can represent any object. Its data structure in `<objc.h>`:

```objc
/// Represents an instance of a class.
struct objc_object {
    Class isa  OBJC_ISA_AVAILABILITY;
};

/// A pointer to an instance of a class.
typedef struct objc_object *id;
```

`id` is essentially a pointer to an `objc_object` struct. It contains a `Class isa` member; by following the `isa` pointer you can trace all the way to the class the object belongs to.

> Note: According to Apple's official documentation [Key-Value Observing Implementation Details](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/KeyValueObserving/Articles/KVOImplementation.html), key-value observing is implemented using isa-swizzling. The `isa` pointer is modified at runtime to point to an intermediate class rather than the true class. Therefore, you should not use the `isa` pointer to determine class relationships; use the [class](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Protocols/NSObject_Protocol/index.html#//apple_ref/occ/intfm/NSObject/class) method instead.

### Class

The data type of the `isa` pointer is `Class`. `Class` represents the class that an object belongs to. In `<objc.h>`:

```objc
/// An opaque type that represents an Objective-C class.
typedef struct objc_class *Class;
```

You can see that `Class` is simply a pointer to an `objc_class` struct. Let's look at the definition of `objc_class` in `<runtime.h>`:

```objc
struct objc_class {
    Class isa  OBJC_ISA_AVAILABILITY;

#if !__OBJC2__
	Class super_class; // pointer to superclass
	const char *name; // class name
	long version; // class version; default 0; can be read/written via class_setVersion and class_getVersion
	long info; // flag bits, e.g. CLS_CLASS (0x1L) is a regular class with instance methods and member variables; CLS_META (0x2L) is a metaclass with class methods
	long instance_size ; // size of instance variables (including those inherited from superclass)
	struct objc_ivar_list *ivars; // stores the address of each member variable
	struct objc_method_list **methodLists; // depends on info flags; CLS_CLASS (0x1L) stores instance methods, CLS_META (0x2L) stores class methods
	struct objc_cache *cache; // pointer to most recently used method, for performance optimization
	struct objc_protocol_list *protocols; // protocols the class conforms to
#endif
```

> Note: `OBJC2_UNAVAILABLE` is a macro Apple uses to constrain the runtime version of the Objective-C system, primarily for backward compatibility with pre-Objective-C 2.0 code. We can still extract useful information from it.

- **isa**: Represents the `Class` of a `Class` object — i.e., the MetaClass. In object-oriented design, everything is an object, and `Class` is itself an object in this design. Evidence can be found in `<objc-runtime-new.h>`, where `objc_class` is defined as:

```objc
struct objc_class : objc_object {
  // Class ISA;
  Class superclass;
  cache_t cache;             // formerly cache pointer and vtable
  class_data_bits_t bits;    // class_rw_t * plus custom rr/alloc flags

  ......
}
```

This confirms that the `objc_class` struct also inherits from `objc_object`, meaning `Class` is indeed an object in this design.

`Meta Class` is also a `Class`, so it has its own `isa` and `super_class` pointers like any other class, as shown below:
![Inheritance Diagram](/images/posts/old_images/class-diagram.jpg)

Solid lines represent `super_class` pointers; dashed lines represent `isa` pointers. A few key points:

> 1. `Root class` (`class`) is just `NSObject`. `NSObject` has no superclass, so `Root class`(`class`)'s `superclass` points to nil.
>
> 2. Every `Class` has an `isa` pointer pointing to its unique `Meta class`.
>
> 3. `Root class` (`meta`)'s `superclass` points to `Root class` (`class`) — i.e., `NSObject` — forming a loop.
>
> 4. Every `Meta class`'s `isa` pointer points to `Root class` (`meta`).

- **super_class**: The superclass. If this class is already the topmost root class, this is `NULL`.
- **version**: Class version info, default 0.
- **info**: Some bit flags used at runtime.
- **instance_size**: The size of the class's instance variables.
- **ivars**: Represents multiple member variables; points to an `objc_ivar_list` struct.

```objc
struct objc_ivar_list {
    int ivar_count;
#ifdef __LP64__
    int space;
#endif
    /* variable length structure */
    struct objc_ivar ivar_list[1];
};
```

`objc_ivar_list` is essentially a linked list storing multiple `objc_ivar` entries, where each `objc_ivar` struct stores information about a single member variable.

- **methodLists**: Represents the method list; points to a double pointer to `objc_method_list`. You can dynamically add instance methods by modifying `*methodLists` — this is how Categories work, and also explains why Categories cannot add properties.

```objc
struct objc_method_list {
    struct objc_method_list *obsolete;

    int method_count;
#ifdef __LP64__
    int space;
#endif
    /* variable length structure */
    struct objc_method method_list[1];
};
```

Similarly, `objc_method_list` is a linked list storing multiple `objc_method` entries, where each `objc_method` struct stores information about a specific method.

- **objc_cache**: Used to cache frequently accessed methods; points to an `objc_cache` struct, which will be covered in more detail later.
- **protocols**: The protocols the class conforms to.
- **Method**: Represents a method in a class definition. In `<runtime.h>`:

```objc
/// An opaque type that represents a method in a class definition.
typedef struct objc_method *Method;
struct objc_method {
    SEL method_name                                          OBJC2_UNAVAILABLE;
    char *method_types                                       OBJC2_UNAVAILABLE;
    IMP method_imp                                           OBJC2_UNAVAILABLE;
}
```

`Method` is a pointer to an `objc_method` struct, which stores the method name (`method_name`), method type encoding (`method_types`), and method implementation (`method_imp`). The type of `method_imp` is `IMP` — a function pointer.

- **Ivar**: Represents an instance variable in a class. In `<runtime.h>`:

```objc
/// An opaque type that represents an instance variable.
typedef struct objc_ivar *Ivar;

struct objc_ivar {
    char *ivar_name                                          OBJC2_UNAVAILABLE;
    char *ivar_type                                          OBJC2_UNAVAILABLE;
    int ivar_offset                                          OBJC2_UNAVAILABLE;
#ifdef __LP64__
    int space                                                OBJC2_UNAVAILABLE;
#endif
}
```

`Ivar` is a pointer to an `objc_ivar` struct containing the variable name (`ivar_name`), variable type (`ivar_type`), and other info.

- **IMP**: As mentioned above when discussing `Method`, `IMP` is fundamentally a function pointer that points to the method implementation. In `<objc.h>`:

```objc
/// A pointer to the function of a method implementation.
#if !OBJC_OLD_DISPATCH_PROTOTYPES
typedef void (*IMP)(void /* id, SEL, ... */ );
#else
typedef id (*IMP)(id, SEL, ...);
#endif
```

When you send a message to an object, this function pointer specifies the method's implementation and ultimately executes that code. This lets you bypass the message-passing stage and jump directly to a specific method implementation.

- **Cache**: As the name suggests, `Cache` is mainly used for caching. What does it cache? Let's look at its definition in `runtime.h`:

```objc
typedef struct objc_cache *Cache                             OBJC2_UNAVAILABLE;

struct objc_cache {
    unsigned int mask /* total = mask + 1 */                 OBJC2_UNAVAILABLE;
    unsigned int occupied                                    OBJC2_UNAVAILABLE;
    Method buckets[1]                                        OBJC2_UNAVAILABLE;
};
```

`Cache` is essentially a linked list of `Method` entries, primarily used to optimize method dispatch performance. When an object `receiver` calls method `message`, the runtime first uses the object's `isa` pointer to find the corresponding class, then searches `methodLists` for the method. If not found, it follows `super_class` to search the parent class's `methodLists`, and so on until the method is found and called. If still not found, message forwarding may occur, or the message may be ignored. However, this lookup approach is inefficient — typically only about 20% of a class's methods account for 80% of all calls. Using `Cache` to cache frequently called methods means method lookup checks the `Cache` first, and only falls back to `methodLists` if needed.

### Supplemental Notes on Metaclasses (`metaclass`) and `isa`:

Core rule: An instance object's `isa` points to its class; the class's `isa` points to its metaclass.

In plain terms: instance methods are recorded in the `class method-list`; class methods are recorded in the `metaClass`. That is, `instance-object` information lives in the `class-object`, and `class-object` information lives in the `metaClass`.

The inheritance chain for class instance variables:

> Every object is fundamentally an instance of a class. The class defines the list of member variables and methods. An object points to its class via the object's `isa` pointer.

> Every class is fundamentally an object — a class is actually an instance of its metaclass (`metaclass`). The metaclass defines the list of class methods. A class points to its metaclass via the class's `isa` pointer.

> All metaclasses ultimately inherit from a root metaclass, whose `isa` pointer points to itself, forming a closed loop.

### Code:
All code from this post can be found on my GitHub [`runtime_demo`](https://github.com/tonyh2021/runtime_demo).

