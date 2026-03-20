---
layout: post
title: "Objective-C Runtime — Handling Member Variables and Properties"
description: ""
category: articles
tags: [iOS]
comments: true
---


## Type Encoding

As a supplement to the Runtime, the compiler encodes the return type and parameter types of each method into a string and associates it with the method's selector. This encoding scheme is also very useful in other contexts, so we can use the `@encode` compiler directive to obtain it. Given a type, `@encode` returns a string encoding for that type. These types can be primitive types such as `int` or pointers, as well as structs, classes, and more. **In fact, any type that can be used as an argument to `sizeof()` can be used with `@encode()`**.

In the `Objective-C Runtime Programming Guide`, the [`Type Encoding`](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100-SW1) section lists all type encodings in Objective-C. Note that many of these types are the same as those used for archiving and distribution, but some cannot be used for archiving.

Note: Objective-C does not support the `long double` type. `@encode(long double)` returns `d`, the same as `double`.

The type encoding of an array is enclosed in square brackets and includes the element count and element type. For example:

```objc
- (void)runtimeTest6 {
    float a[] = {1.0, 2.0, 3.0};
    NSLog(@"array encoding type: %s", @encode(typeof(a)));
}
```

Output:

```
2016-02-23 16:37:57.893 runtime_demo[33928:4918733] array encoding type: [3f]
```

For other types, refer to [`Type Encoding`](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100-SW1); they won't be covered in detail here.

There are also some encoding types that `@encode` won't return directly, but they can serve as type qualifiers for methods declared in protocols. See [`Type Encoding`](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100-SW1) for details.

For properties, there are also some special type encodings that indicate whether a property is read-only, copy, `retain`, etc. See [`Property Type String`](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtPropertyIntrospection.html#//apple_ref/doc/uid/TP40008048-CH101-SW6) for details.

## Member Variables and Properties

### Basic Data Types

**Ivar**

`Ivar` is the type representing an instance variable. It is actually a pointer to an `objc_ivar` struct, defined as:

```objc
typedef struct objc_ivar *Ivar;

struct objc_ivar {
    char *ivar_name                 OBJC2_UNAVAILABLE;
// variable name
    char *ivar_type                 OBJC2_UNAVAILABLE;
// variable type
    int ivar_offset                 OBJC2_UNAVAILABLE;
// base address offset in bytes
#ifdef __LP64__
    int space                       OBJC2_UNAVAILABLE;
#endif
}
```

**objc_property_t**

`objc_property_t` is the type representing a declared Objective-C property. It is actually a pointer to an `objc_property` struct, defined as:

```objc
typedef struct objc_property *objc_property_t;
```

**objc_property_attribute_t**

`objc_property_attribute_t` defines the attributes of a property. It is a struct defined as:

```objc
typedef struct {
    const char *name;
// attribute name
    const char *value;
// attribute value
} objc_property_attribute_t;
```

### Associated Objects

Associated objects are a very practical Runtime feature that is easy to overlook.

Associated objects are similar to member variables, but they are added at runtime. We typically put member variables (`Ivar`) in the class's header file declaration, or after `@implementation` in the implementation file. But this has a limitation: we cannot add member variables in a category. If we try to add new member variables in a category, the compiler will report an error.

We might try using global variables as a workaround, but those aren't `Ivar`s because they aren't tied to a single instance. So this approach is rarely used.

Objective-C provides a solution: Associated Objects.

Think of an associated object as an Objective-C object (like a dictionary) that is connected to a class instance via a given key. Since the interface is C-based, the key is a void pointer (`const void *`). We also need to specify a memory management policy to tell the Runtime how to manage this object's memory. The policy is specified with one of the following values:

```
OBJC_ASSOCIATION_ASSIGN
OBJC_ASSOCIATION_RETAIN_NONATOMIC
OBJC_ASSOCIATION_COPY_NONATOMIC
OBJC_ASSOCIATION_RETAIN
OBJC_ASSOCIATION_COPY
```

When the host object is released, associated objects are handled according to the specified memory management policy. If the policy is `assign`, the associated object is not released when the host is released; if the policy is `retain` or `copy`, the associated object is released along with the host. You can even choose whether to use automatic retain/copy. This is very useful when writing multi-threaded code that accesses associated objects from multiple threads.

Connecting an object to another requires just two lines of code:

```objc
static char myKey;

objc_setAssociatedObject(self, &myKey, anObject, OBJC_ASSOCIATION_RETAIN);
```

In this case, the `self` object acquires a new associated object `anObject` with the memory policy `OBJC_ASSOCIATION_RETAIN`, meaning the association is automatically retained and will be released automatically when `self` is released. Also, if we use the same key to associate a different object, the previous associated object will be automatically released — the old object is properly disposed of, and the new object takes its memory.

```objc
id anObject = objc_getAssociatedObject(self, &myKey);
```

We can use `objc_removeAssociatedObjects` to remove an associated object, or use `objc_setAssociatedObject` to set the associated object for a key to `nil`.

Let's walk through a practical example of using associated objects.

Suppose we want to dynamically attach a tap gesture to any `UIView` and specify the action to perform upon tapping. We can associate a gesture object and an action block with our `UIView`. This task has two parts. First, if needed, we create a gesture recognizer object and associate it along with the block. Here's the code:

```objc
- (void)setTapActionWithBlock:(void (^)(void))block {
    UITapGestureRecognizer *gesture = objc_getAssociatedObject(self, &kDTActionHandlerTapGestureKey);

    if (!gesture) {
        gesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(__handleActionForTapGesture:)];
        [self.view addGestureRecognizer:gesture];
        objc_setAssociatedObject(self, &kDTActionHandlerTapGestureKey, gesture, OBJC_ASSOCIATION_RETAIN);
    }

    objc_setAssociatedObject(self, &kDTActionHandlerTapBlockKey, block, OBJC_ASSOCIATION_COPY);
}
```

This code checks for an associated gesture recognizer object. If one doesn't exist, it creates one and establishes the association. It also associates the incoming block with the specified key. Note the memory management policy for the block association.

The gesture recognizer needs a target and an action, so next we define the handler method:

```objc
- (void)__handleActionForTapGesture:(UITapGestureRecognizer *)gesture {
    if (gesture.state == UIGestureRecognizerStateRecognized) {
        void(^action)(void) = objc_getAssociatedObject(self, &kDTActionHandlerTapBlockKey);

        if (action) {
            action();
        }
    }
}
```

We need to check the gesture recognizer's state, since we only want to execute the action when the tap gesture is recognized.

As you can see from the example above, associated objects are not complex to use. They let us dynamically augment a class's existing functionality. Feel free to apply this feature flexibly in real projects.

### Member Variable and Property Operation Functions

**Member Variables**

Member variable operations include the following functions:

```objc
// Get the name of a member variable
const char * ivar_getName ( Ivar v );

// Get the type encoding of a member variable
const char * ivar_getTypeEncoding ( Ivar v );

// Get the offset of a member variable
ptrdiff_t ivar_getOffset ( Ivar v );
```

> For the `ivar_getOffset` function: for instance variables of type `id` or other object types, you can call `object_getIvar` and `object_setIvar` to access them directly without using the offset.


**Associated Objects**

Associated object operation functions include:

```objc
// Set an associated object
void objc_setAssociatedObject ( id object, const void *key, id value, objc_AssociationPolicy policy );

// Get an associated object
id objc_getAssociatedObject ( id object, const void *key );

// Remove associated objects
void objc_removeAssociatedObjects ( id object );
```

Associated objects and related examples have already been discussed above.

**Properties**

Property operation functions include:

```objc
// Get the property name
const char * property_getName ( objc_property_t property );

// Get the property attribute description string
const char * property_getAttributes ( objc_property_t property );

// Get the value of a specified attribute of a property
char * property_copyAttributeValue ( objc_property_t property, const char *attributeName );

// Get the attribute list of a property
objc_property_attribute_t * property_copyAttributeList ( objc_property_t property, unsigned int *outCount );
```

> The `property_copyAttributeValue` function: the returned `char *` must be freed with `free()` after use.
> The `property_copyAttributeList` function: the returned value must be freed with `free()` after use.

### Code:
All code from this post can be found on my GitHub [`runtime_demo`](https://github.com/tonyh2021/runtime_demo).

