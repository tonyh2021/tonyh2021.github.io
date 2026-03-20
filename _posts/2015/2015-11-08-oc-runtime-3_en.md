---
layout: post
title: "Objective-C Runtime — Methods and Messages"
description: ""
category: articles
tags: [iOS]
comments: true
---


## Basic Data Types

### SEL

`SEL`, also called a selector, is a pointer representing a method's selector, defined as:

```objc
typedef struct objc_selector *SEL;
```

The detailed definition of the `objc_selector` struct is not found in the `<objc/runtime.h>` header. A method's selector is used to represent the name of a method at runtime. At compile time, Objective-C generates a unique integer identifier (an `Int`-typed address) based on each method's name and parameter sequence — that identifier is the `SEL`. For example:

```objc
- (void)testSEL {
    SEL sel1 = @selector(method1);
    NSLog(@"sel : %p", sel1);
}
```

Output:

```
2016-02-23 18:52:00.458 runtime_demo[34274:4961381] sel : 0x100106168
```

Regardless of whether two classes have a parent-child relationship or no relationship at all, if their methods share the same name, the `SEL` is identical. Every method corresponds to exactly one `SEL`. Therefore, within the same Objective-C class hierarchy, you cannot have two methods with the same name — even if their parameter types differ. The same method name can only map to one `SEL`. This makes Objective-C particularly weak at handling methods with the same name, same parameter count, but different parameter types. For example, defining the following two methods in a class:

```
- (void)setWidth:(int)width;
- (void)setWidth:(double)width;
```

This is considered a compile error, so we cannot do what C++ or C# allow. Instead, we must declare them like:

```
-(void)setWidthIntValue:(int)width;
-(void)setWidthDoubleValue:(double)width;
```

Of course, different classes can share the same `selector` — that's fine. When instances of different classes execute the same `selector`, each class searches its own method list for the corresponding `IMP`.

All `SEL`s in a project form a `Set` (a collection with unique elements), so each `SEL` is unique. Therefore, to find a method in this set, we simply find the `SEL` corresponding to that method. A `SEL` is essentially a hashed string based on the method name, and comparing strings only requires comparing their addresses — incredibly fast. However, as the number grows, hash collisions may degrade performance (or may not, if a perfect hash is used). Regardless of the speed optimization method, reducing the total count (multiple methods mapping to the same `SEL`) is the most effective approach — which is exactly why a `SEL` is just the function name.

In essence, a `SEL` is just a pointer to a method (more precisely, a KEY value hashed from the method name that uniquely identifies a method), and its sole purpose is to speed up method lookup. We'll discuss this lookup process below.

We can add new `selector`s at runtime and retrieve existing ones. There are three ways to obtain a `SEL`:

1. The `sel_registerName` function

2. The `@selector()` compiler directive provided by Objective-C

3. The `NSSelectorFromString()` method

### IMP

`IMP` is actually a function pointer pointing to the starting address of a method's implementation:

```objc
id (*IMP)(id, SEL, ...)
```

This function uses the standard C calling convention for the current CPU architecture. The first parameter is a pointer to `self` (for instance methods, the memory address of the class instance; for class methods, a pointer to the metaclass). The second parameter is the method selector. What follows are the method's actual arguments.

The `SEL` introduced earlier exists precisely to find the method's final implementation `IMP`. Since each method has a unique `SEL`, we can use `SEL` to conveniently, quickly, and accurately retrieve the corresponding `IMP`. We'll discuss the lookup process below. Once we have the `IMP`, we have the entry point to execute the method's code — at which point we can use this function pointer just like an ordinary C function.

By obtaining the `IMP` directly, we can bypass the Runtime's message-passing mechanism and execute the implementation directly. This skips the series of lookup operations performed during the runtime's message-passing process, making it somewhat more efficient than sending a message to the object directly.

### Method

Having introduced both `SEL` and `IMP`, we can now discuss `Method`. `Method` is used to represent a method in a class definition:

```objc
typedef struct objc_method *Method;

struct objc_method {
    SEL method_name                 OBJC2_UNAVAILABLE;  // method name
    char *method_types                  OBJC2_UNAVAILABLE;
    IMP method_imp                      OBJC2_UNAVAILABLE;  // method implementation
}
```

We can see that this struct contains both a `SEL` and an `IMP` — essentially a mapping between them. With a `SEL`, we can find the corresponding `IMP` and call the method's implementation. We'll discuss the specific flow below.

**objc_method_description**

`objc_method_description` defines an Objective-C method:

```objc
struct objc_method_description { SEL name; char *types; };
```

## Method-Related Operation Functions

The Runtime provides a set of methods for handling method-related operations, including methods themselves and `SEL`s. This section introduces these functions.

### Methods

Method operation functions include:

```objc
// Invoke the implementation of a specified method
id method_invoke ( id receiver, Method m, ... );

// Invoke the implementation of a method that returns a data structure
void method_invoke_stret ( id receiver, Method m, ... );

// Get the method name
SEL method_getName ( Method m );

// Return the method's implementation
IMP method_getImplementation ( Method m );

// Get a string describing the method's parameter and return value types
const char * method_getTypeEncoding ( Method m );

// Get a string for the method's return value type
char * method_copyReturnType ( Method m );

// Get a string for the type of a parameter at a specified position
char * method_copyArgumentType ( Method m, unsigned int index );

// Return the method's return value type string by reference
void method_getReturnType ( Method m, char *dst, size_t dst_len );

// Return the number of arguments in a method
unsigned int method_getNumberOfArguments ( Method m );

// Return the type string of a method argument at a specified position by reference
void method_getArgumentType ( Method m, unsigned int index, char *dst, size_t dst_len );

// Return the method description struct for a specified method
struct objc_method_description * method_getDescription ( Method m );

// Set the implementation of a method
IMP method_setImplementation ( Method m, IMP imp );

// Exchange the implementations of two methods
void method_exchangeImplementations ( Method m1, Method m2 );
```

> `method_invoke`: returns the actual implementation's return value. The `receiver` parameter cannot be nil. This function is faster than using `method_getImplementation` and `method_getName` separately.

> `method_getName`: returns a `SEL`. To get the method name as a C string, use `sel_getName(method_getName(method))`.

> `method_getReturnType`: the type string is copied into `dst`.

> `method_setImplementation`: note that this function returns the method's previous implementation.

### Method Selectors

Selector-related operation functions include:

```objc
// Return the name of the method specified by a given selector
const char * sel_getName ( SEL sel );

// Register a method in the Objective-C Runtime system, mapping the method name to a selector, and return the selector
SEL sel_registerName ( const char *str );

// Register a method in the Objective-C Runtime system
SEL sel_getUid ( const char *str );

// Compare two selectors
BOOL sel_isEqual ( SEL lhs, SEL rhs );
```

> `sel_registerName`: when adding a method to a class definition, we must register a method name in the Objective-C Runtime system to obtain the method's selector.

## Method Dispatch Flow

In Objective-C, messages are not bound to method implementations until runtime. The compiler transforms the message expression `[receiver message]` into a call to the message function `objc_msgSend`, which takes the message receiver and method name as its base parameters:

```objc
objc_msgSend(receiver, selector)

//If the message has additional parameters
objc_msgSend(receiver, selector, arg1, arg2, ...)
```

This function handles everything required for dynamic binding:

1. First, it finds the method implementation corresponding to the selector. Because the same method can have different implementations in different classes, we need to rely on the receiver's class to find the exact implementation.

2. It calls the method implementation, passing in the receiver object and all method arguments.

3. Finally, it returns the value returned by the implementation as its own return value.

The key to message dispatch is the `objc_class` struct discussed in earlier sections. Two fields of this struct are important for message dispatch:

1. A pointer to the superclass

2. The class's method dispatch table, `methodLists`.

When we create a new object, memory is allocated and its member variables are initialized. The `isa` pointer is also initialized, allowing the object to access its class and the class hierarchy.

The following diagram illustrates the basic framework of message dispatch:

![Message Dispatch](/images/posts/old_images/send-message.jpg)

When a message is sent to an object, `objc_msgSend` uses the object's `isa` pointer to get the class struct, then searches the method dispatch table for the `selector`. If not found, it follows the `super_class` pointer in the `objc_msgSend` struct to the superclass and searches its dispatch table. This continues up the class hierarchy to `NSObject`. Once the `selector` is located, the function obtains the implementation's entry point and executes the method with the appropriate arguments. If the `selector` is never found, the message-forwarding process kicks in — we'll discuss that later.

To speed up message dispatch, the runtime caches used `selector`s and their corresponding method addresses. This was discussed earlier and won't be repeated.

### Hidden Parameters

`objc_msgSend` has two hidden parameters:

1. The message receiver object

2. The method's selector

These two parameters provide the implementation with information about the caller. They are called "hidden" because they are not declared in the source code defining the method — they are inserted into the implementation code at compile time.

Although these parameters are not explicitly declared, they can still be referenced in code. We can use `self` to reference the receiver object and `_cmd` to reference the selector:

```objc
- strange {
    id  target = getTheReceiver();
    SEL method = getTheMethod();

    if ( target == self || method == _cmd )
        return nil;
    return [target performSelector:method];
}
```

Of these two parameters, `self` is used far more commonly; `_cmd` is rarely used in practice.

### Obtaining the Method Address

Dynamic binding in the Runtime gives us great flexibility when writing code — we can forward messages to the objects we want, or swap a method's implementation on the fly. However, this flexibility comes with some performance cost, since we need to look up the method's implementation rather than calling a function directly. Method caching addresses this to some extent.

As mentioned above, if we want to bypass dynamic binding, we can obtain the address of a method's implementation and call it directly like a function. This is especially useful when a particular method needs to be called frequently inside a loop, as it can significantly improve performance.

`NSObject` provides the `methodForSelector:` method, which lets us get a pointer to the method, which we can then use to call the implementation. We need to cast the pointer returned by `methodForSelector:` to the appropriate function type — both the function parameters and return value must match.

The following code shows how to use `methodForSelector:`:

```objc
void (*setter)(id, SEL, BOOL);
int i;

setter = (void (*)(id, SEL, BOOL))[target
    methodForSelector:@selector(setFilled:)];
for ( i = 0 ; i < 1000 ; i++ )
    setter(targetList[i], @selector(setFilled:), YES);
```

Note that the first two parameters of the function pointer must be `id` and `SEL`.

Of course, this technique is only appropriate for situations like loops where the same method is called frequently to boost performance. Also, `methodForSelector:` is provided by the Cocoa runtime; it is not a feature of the Objective-C language itself.

## Message Forwarding

When an object can receive a message, it follows the normal method dispatch flow. But what happens when an object cannot receive a specific message? By default, if you call a method using `[object message]` and `object` cannot respond to `message`, the compiler reports an error. However, if you use the `perform…` form, the check is deferred to runtime. If the object cannot respond, the program crashes.

When we're not sure whether an object can receive a particular message, we typically call `respondsToSelector:` first:

```objc
if ([self respondsToSelector:@selector(method)]) {
    [self performSelector:@selector(method)];
}
```

However, we want to discuss the case where `respondsToSelector:` is not used — that's the focus of this section.

When an object cannot receive a message, the "message forwarding" (`message forwarding`) mechanism kicks in. Through this mechanism, we can tell the object how to handle unknown messages. By default, an object that receives an unknown message causes the program to crash, and the console shows an exception like:

```
-[SUTRuntimeMethod method]: unrecognized selector sent to instance 0x100111940
*** Terminating app due to uncaught exception 'NSInvalidArgumentException', reason: '-[SUTRuntimeMethod method]: unrecognized selector sent to instance 0x100111940'
```

This exception is actually thrown by NSObject's `doesNotRecognizeSelector` method. However, we can take steps to execute specific logic and prevent the crash.

The message-forwarding mechanism has three basic steps:

1. Dynamic method resolution

2. Fallback receiver

3. Full forwarding

Let's discuss each step in detail.

### Dynamic Method Resolution

When an object receives an unknown message, it first calls the class method `+resolveInstanceMethod:` (for instance methods) or `+resolveClassMethod:` (for class methods) of its class. In this method, we have the opportunity to add a new "handler method" for the unknown message. The prerequisite is that we have already implemented that handler method — we just need to dynamically add it to the class at runtime using `class_addMethod`. For example:

```objc
void functionForMethod1(id self, SEL _cmd) {
   NSLog(@"%@, %p", self, _cmd);
}

+ (BOOL)resolveInstanceMethod:(SEL)sel {

    NSString *selectorString = NSStringFromSelector(sel);

    if ([selectorString isEqualToString:@"method1"]) {
        class_addMethod(self.class, @selector(method1), (IMP)functionForMethod1, "@:");
    }

    return [super resolveInstanceMethod:sel];
}
```

This approach is more commonly used for implementing `@dynamic` properties.

### Fallback Receiver

If the message cannot be handled in the previous step, the Runtime continues by calling:

```objc
- (id)forwardingTargetForSelector:(SEL)aSelector
```

If an object implements this method and returns a non-nil result, that object becomes the new receiver of the message and the message is dispatched to it. Of course, that object cannot be `self`, which would create an infinite loop. If no suitable object is specified to handle `aSelector`, the parent class's implementation should be called to return a result.

This method is typically used when the object internally has a series of other objects that can handle the message. We can use those objects to handle and return the message, so from the outside it appears the original object handled it itself:

`MethodTestClass.h`

```objc
#import <Foundation/Foundation.h>

@interface MethodTestClass : NSObject

@end
```

`MethodTestClass.m`

```objc
#import "MethodTestClass.h"
#import "MethodTestClassHelper.h"

@interface MethodTestClass()

@property (nonatomic, strong) MethodTestClassHelper *helper;

@end


@implementation MethodTestClass

- (instancetype)init {
    self = [super init];
    if (self != nil) {
        _helper = [[MethodTestClassHelper alloc] init];
    }

    return self;
}

- (id)forwardingTargetForSelector:(SEL)aSelector {

    NSLog(@"forwardingTargetForSelector");

    NSString *selectorString = NSStringFromSelector(aSelector);

    // Forward the message to _helper to handle
    if ([selectorString isEqualToString:@"helperMethod"]) {
        return _helper;
    }

    return [super forwardingTargetForSelector:aSelector];
}

@end
```

`MethodTestClassHelper.h`

```objc
#import <Foundation/Foundation.h>

@interface MethodTestClassHelper : NSObject

- (void)helperMethod;

@end
```

`MethodTestClassHelper.m`

```objc
#import "MethodTestClassHelper.h"

@implementation MethodTestClassHelper

- (void)helperMethod {
    NSLog(@"helperMethod : %@, %p", self, _cmd);
}

@end
```

`MethodViewController.m`

```objc
#import "MethodViewController.h"
#import <objc/runtime.h>
#import "MethodTestClass.h"
#import "MethodTestClassHelper.h"

@implementation MethodViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    [self testMethod];
}

- (void)testMethod {
    MethodTestClass *testObj = [[MethodTestClass alloc] init];
    [testObj performSelector:@selector(helperMethod)];
}


@end
```

This step is appropriate when we only want to forward the message to another object capable of handling it. However, at this step we cannot manipulate the message, such as modifying its arguments or return value.

### Full Message Forwarding

If the message still cannot be handled after the previous step, the only option is to engage the full message-forwarding mechanism. This calls:

```objc
- (void)forwardInvocation:(NSInvocation *)anInvocation
```

The runtime gives the message receiver one final chance to forward the message to another object. The system creates an `NSInvocation` object representing the message, with all details of the unhandled message encapsulated in `anInvocation` — including the `selector`, target, and arguments. We can choose to forward the message to another object inside `forwardInvocation`.

The `forwardInvocation:` method has two tasks:

1. Locate an object that can respond to the message encapsulated in `anInvocation`. That object does not need to be able to handle all unknown messages.

2. Send the message to the selected object using `anInvocation` as the parameter. `anInvocation` will retain the call result, and the runtime will extract and send it back to the original sender.

In this method, we can also implement more complex logic — for example, modifying the message content (such as appending an argument) before dispatching it. Also, if a message should not be handled by the current class, the parent class's method of the same name should be called so that every class in the hierarchy has a chance to handle the request.

There is one more important requirement — we must override:

```objc
- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector
```

The message-forwarding mechanism uses the information from this method to create the `NSInvocation` object. Therefore, we must override it to provide a suitable method signature for the given `selector`.

A complete example:

```objc
#pragma mark - Full Message Forwarding
- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector {
    NSMethodSignature *signature = [super methodSignatureForSelector:aSelector];

    if (!signature) {
        if ([MethodTestClassHelper instancesRespondToSelector:aSelector]) {
            signature = [MethodTestClassHelper instanceMethodSignatureForSelector:aSelector];
        }
    }
    return signature;
}

- (void)forwardInvocation:(NSInvocation *)anInvocation {
    if ([MethodTestClassHelper instancesRespondToSelector:anInvocation.selector]) {
        [anInvocation invokeWithTarget:self.helper];
    }
}
```

NSObject's `forwardInvocation:` implementation simply calls `doesNotRecognizeSelector:` and does not forward any message. So if the unknown message is not handled in any of the three steps above, an exception is raised.

In a sense, `forwardInvocation:` acts as a distribution center for unknown messages, forwarding them to other objects. Or it can act like a relay station that sends all unknown messages to the same receiver. It all depends on the specific implementation.

### Message Forwarding and Multiple Inheritance

Looking back at steps 2 and 3: through these two methods, we can allow an object to build relationships with other objects to handle certain unknown messages, while to the outside world it still appears that the original object is handling the messages. Through this relationship, we can simulate some characteristics of "multiple inheritance," letting an object "inherit" features from other objects. However, there is an important distinction: multiple inheritance integrates different functionalities into a single object — making it bulkier and more complex — while message forwarding decomposes functionality into independent small objects, connects them in some way, and performs appropriate message forwarding.

Although message forwarding resembles inheritance, some NSObject methods can still distinguish between the two. Methods like `respondsToSelector:` and `isKindOfClass:` only work on the inheritance hierarchy, not on the forwarding chain. If we want this forwarding to look like inheritance, we can override these methods:

```objc
- (BOOL)respondsToSelector:(SEL)aSelector {
    if ( [super respondsToSelector:aSelector] )
      return YES;
    else {
    /* Here, test whether the aSelector message can     *
     * be forwarded to another object and whether that  *
     * object can respond to it. Return YES if it can.  */
    }
    return NO;
}
```

### Code:
All code from this post can be found on my GitHub [`runtime_demo`](https://github.com/tonyh2021/runtime_demo).

