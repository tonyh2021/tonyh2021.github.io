---
layout: post
title: "Objective-C Runtime in Practice"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Class and Object Operation Functions

### Class Operation Functions

The methods that `runtime` provides for operating on classes are mostly targeted at the various fields of the `objc_class` struct. Below we introduce these functions one by one, and conclude with a practical example demonstrating their usage.

**Class Name (name)**

The main functions for class name operations:

```objc
// Get the class name
const char * class_getName ( Class cls );
Raw
```

> For `class_getName`: if the passed-in `cls` is `Nil`, an empty string is returned.

**Superclass (super_class) and Metaclass (meta-class)**

The main functions for superclass and metaclass operations:

```objc
// Get the superclass of a class
Class class_getSuperclass ( Class cls );

// Determine whether the given Class is a metaclass
BOOL class_isMetaClass ( Class cls );
```

> `class_getSuperclass`: returns `Nil` when `cls` is `Nil` or `cls` is a root class. You can usually use NSObject's `superclass` method to achieve the same result.

> `class_isMetaClass`: returns `YES` if `cls` is a metaclass; returns `NO` if not, or if `cls` is `Nil`.

**Instance Variable Size (instance_size)**

```objc
// Get the instance size
size_t class_getInstanceSize ( Class cls );
```

**Member Variables (ivars) and Properties**

In `objc_class`, all member variable and property information is stored in the linked list `ivars`. `ivars` is an array where each element is a pointer to `Ivar` (variable info). The runtime provides a rich set of functions for operating on this field, which can be broadly categorized as:

1. Member variable operation functions, mainly including:

```objc
// Get info about a named instance member variable of a class
Ivar class_getInstanceVariable ( Class cls, const char *name );

// Get info about a class variable of a class
Ivar class_getClassVariable ( Class cls, const char *name );

// Add a member variable
BOOL class_addIvar ( Class cls, const char *name, size_t size, uint8_t alignment, const char *types );

// Get the complete list of member variables
Ivar * class_copyIvarList ( Class cls, unsigned int *outCount );
```

> `class_getInstanceVariable`: returns a pointer (Ivar) to the `objc_ivar` struct containing info about the member variable named `name`.

> `class_getClassVariable`: no information on class variables in Objective-C has been found; it is generally accepted that Objective-C does not support class variables. Note: the returned list does not include member variables and properties inherited from parent classes.

> Objective-C does not support adding instance variables to existing classes — neither system-provided classes nor custom classes support it dynamically. However, if you want to add a member variable to a class created at runtime, you can use `class_addIvar`. Note that this can only be called between `objc_allocateClassPair` and `objc_registerClassPair`, and the class cannot be a metaclass. The minimum byte alignment for a member variable is `1<<alignment`, which depends on the ivar's type and the machine's architecture. If the variable type is a pointer, pass `log2(sizeof(pointer_type))`.

> `class_copyIvarList`: returns an array of pointers to member variable info, where each element is a pointer to the `objc_ivar` struct. This array does not include variables declared in parent classes. The `outCount` pointer returns the size of the array. You must use `free()` to release this array.

2. Property operation functions, mainly including:

```objc
// Get a specified property
objc_property_t class_getProperty ( Class cls, const char *name );

// Get the property list
objc_property_t * class_copyPropertyList ( Class cls, unsigned int *outCount );

// Add a property to a class
BOOL class_addProperty ( Class cls, const char *name, const objc_property_attribute_t *attributes, unsigned int attributeCount );

// Replace a class's property
void class_replaceProperty ( Class cls, const char *name, const objc_property_attribute_t *attributes, unsigned int attributeCount );
```

These methods also operate on `ivars`, but only on those that are properties. We'll encounter these functions again when we cover properties later.

3. On Mac OS X, you can use a garbage collector. The runtime provides several functions to determine whether an object's memory regions can be scanned by the garbage collector for strong/weak references:

```objc
const uint8_t * class_getIvarLayout ( Class cls );
void class_setIvarLayout ( Class cls, const uint8_t *layout );
const uint8_t * class_getWeakIvarLayout ( Class cls );
void class_setWeakIvarLayout ( Class cls, const uint8_t *layout );
Raw
```

Normally, you don't need to call these methods directly; a sensible layout is generated when `objc_registerClassPair` is called. These functions won't be detailed further here.

**Methods (methodLists)**

The main method operation functions:

```objc
// Add a method
BOOL class_addMethod ( Class cls, SEL name, IMP imp, const char *types );

// Get an instance method
Method class_getInstanceMethod ( Class cls, SEL name );

// Get a class method
Method class_getClassMethod ( Class cls, SEL name );

// Get an array of all methods
Method * class_copyMethodList ( Class cls, unsigned int *outCount );

// Replace the implementation of a method
IMP class_replaceMethod ( Class cls, SEL name, IMP imp, const char *types );

// Return the implementation of a method
IMP class_getMethodImplementation ( Class cls, SEL name );
IMP class_getMethodImplementation_stret ( Class cls, SEL name );

// Determine whether a class instance responds to a given selector
BOOL class_respondsToSelector ( Class cls, SEL sel );
```

> `class_addMethod` will override the parent class's method implementation but will not replace an existing implementation in the same class — if the class already contains an implementation with the same name, the function returns `NO`. To modify an existing implementation, use `method_setImplementation`. An Objective-C method is a simple C function that takes at least two parameters — `self` and `_cmd` — so our implementation function (the function pointed to by the `IMP` parameter) must also take at least two parameters:

```objc
void myMethodIMP(id self, SEL _cmd)
{
    // implementation ....
}
```

Unlike member variables, you can dynamically add methods to a class regardless of whether it already exists.

Also, the `types` parameter is a character array describing the types of the arguments passed to the method. This involves type encoding, which we'll cover later.

> `class_getInstanceMethod` and `class_getClassMethod`: unlike `class_copyMethodList`, both of these functions search the parent class's implementations as well.

> `class_copyMethodList`: returns an array of all instance methods. To get class methods, use `class_copyMethodList(object_getClass(cls), &count)` (a class's instance methods are defined in the metaclass). The list does not include methods implemented in parent classes. The `outCount` parameter returns the number of methods. After obtaining the list, call `free()` to release it.

> `class_replaceMethod`: its behavior splits into two cases — if the class does not have a method named `name`, it acts like `class_addMethod` and adds the method; if the method already exists, it acts like `method_setImplementation` and replaces the original implementation.

> `class_getMethodImplementation`: this function is called when a message is sent to a class instance, and returns a pointer to the method implementation function. It is faster than `method_getImplementation(class_getInstanceMethod(cls, name))`. The returned pointer may point to a runtime-internal function rather than the actual method implementation — for example, if the class instance cannot respond to the `selector`, the returned pointer will be part of the runtime's message-forwarding mechanism.

> `class_respondsToSelector`: we typically use NSObject's `respondsToSelector:` or `instancesRespondToSelector:` methods to achieve the same purpose.

**Protocols (objc_protocol_list)**

Protocol-related operations include:

```objc
// Add a protocol
BOOL class_addProtocol ( Class cls, Protocol *protocol );

// Return whether a class implements a given protocol
BOOL class_conformsToProtocol ( Class cls, Protocol *protocol );

// Return the list of protocols implemented by a class
Protocol * class_copyProtocolList ( Class cls, unsigned int *outCount );
```

> `class_conformsToProtocol` can be replaced by NSObject's `conformsToProtocol:` method.

> `class_copyProtocolList` returns an array; call `free()` manually after use.

**Version and Other Functions**

Version-related operations, plus two functions the runtime provides for `CoreFoundation`'s toll-free bridging:

```objc
// Get the version number
int class_getVersion ( Class cls );

// Set the version number
void class_setVersion ( Class cls, int version );


// We generally do not use these two functions directly
Class objc_getFutureClass ( const char *name );
void objc_setFutureClass ( Class cls, const char *name );
```

### Example

Let's look at the code directly:

```objc
@interface MyClass : NSObject <NSCopying, NSCoding>

@property (nonatomic, strong) NSArray *array;

@property (nonatomic, copy) NSString *string;

- (void)method1;

- (void)method2;

+ (void)classMethod;

@end

@interface MyClass () {
    NSInteger       _instance1;

    NSString *_instance2;
}

@property (nonatomic, assign) NSUInteger integer;

- (void)method3WithArg1:(NSInteger)arg1 arg2:(NSString *)arg2;

@end

@implementation MyClass
+ (void)classMethod {

}

- (void)method1 {
    NSLog(@"call method method1");
}

- (void)method2 {
}

- (void)method3WithArg1:(NSInteger)arg1 arg2:(NSString *)arg2 {
    NSLog(@"arg1 : %ld, arg2 : %@", arg1, arg2);
}
@end

- (void)runtimeTest1 {
    MyClass *myClass = [[MyClass alloc] init];
    unsigned int outCount = 0;

    Class cls = [myClass class];

    // Class name
    NSLog(@"-----%@-----", @"Class Name");
    NSLog(@"class name: %s \n", class_getName(cls));

    // Superclass
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Superclass");
    NSLog(@"super class name: %s", class_getName(class_getSuperclass(cls)));

    // Is it a metaclass?
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Is Metaclass");
    NSLog(@"MyClass is %@ a meta-class", (class_isMetaClass(cls) ? @"" : @"not"));

    Class meta_class = objc_getMetaClass(class_getName(cls));
    NSLog(@"%s's meta-class is %s", class_getName(cls), class_getName(meta_class));

    // Instance variable size
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Instance Variable Size");
    NSLog(@"instance size: %zu", class_getInstanceSize(cls));

    // Member variables
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Member Variables");
    Ivar *ivars = class_copyIvarList(cls, &outCount);
    for (int i = 0; i < outCount; i++) {
        Ivar ivar = ivars[i];
        NSLog(@"instance variable's name: %s at index: %d", ivar_getName(ivar), i);
    }

    free(ivars);

    Ivar string = class_getInstanceVariable(cls, "_string");
    if (string != NULL) {
        NSLog(@"instace variable %s", ivar_getName(string));
    }

    // Property operations
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Property Operations");
    objc_property_t * properties = class_copyPropertyList(cls, &outCount);
    for (int i = 0; i < outCount; i++) {
        objc_property_t property = properties[i];
        NSLog(@"property's name: %s", property_getName(property));
    }

    free(properties);

    objc_property_t array = class_getProperty(cls, "array");
    if (array != NULL) {
        NSLog(@"property %s", property_getName(array));
    }


    // Method operations
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Method Operations");
    Method *methods = class_copyMethodList(cls, &outCount);
    for (int i = 0; i < outCount; i++) {
        Method method = methods[i];
        NSLog(@"method's signature: %s", sel_getName(method_getName(method)));
    }

    free(methods);

    Method method1 = class_getInstanceMethod(cls, @selector(method1));
    if (method1 != NULL) {
        NSLog(@"method %s", sel_getName(method_getName(method1)));
    }

    Method classMethod = class_getClassMethod(cls, @selector(classMethod));
    if (classMethod != NULL) {
        NSLog(@"class method : %s", sel_getName(method_getName(classMethod)));
    }

    NSLog(@"MyClass is%@ responsd to selector: method3WithArg1:arg2:", class_respondsToSelector(cls, @selector(method3WithArg1:arg2:)) ? @"" : @" not");

    IMP imp = class_getMethodImplementation(cls, @selector(method1));
    imp();

    // Protocols
    NSLog(@" ");
    NSLog(@"-----%@-----", @"Protocols");
    Protocol * __unsafe_unretained * protocols = class_copyProtocolList(cls, &outCount);
    Protocol * protocol;
    for (int i = 0; i < outCount; i++) {
        protocol = protocols[i];
        NSLog(@"protocol name: %s", protocol_getName(protocol));
    }

    NSLog(@"MyClass is%@ responsed to protocol %s", class_conformsToProtocol(cls, protocol) ? @"" : @" not", protocol_getName(protocol));
}
```

Output:

```
2016-02-23 14:37:25.214 runtime_demo -----Class Name-----
2016-02-23 14:37:25.215 runtime_demo class name: MyClass
2016-02-23 14:37:25.215 runtime_demo
2016-02-23 14:37:25.215 runtime_demo -----Superclass-----
2016-02-23 14:37:25.215 runtime_demo super class name: NSObject
2016-02-23 14:37:25.215 runtime_demo
2016-02-23 14:37:25.215 runtime_demo -----Is Metaclass-----
2016-02-23 14:37:25.215 runtime_demo MyClass is not a meta-class
2016-02-23 14:37:25.216 runtime_demo MyClass's meta-class is MyClass
2016-02-23 14:37:25.216 runtime_demo
2016-02-23 14:37:25.216 runtime_demo -----Instance Variable Size-----
2016-02-23 14:37:25.216 runtime_demo instance size: 48
2016-02-23 14:37:25.216 runtime_demo
2016-02-23 14:37:25.216 runtime_demo -----Member Variables-----
2016-02-23 14:37:25.216 runtime_demo instance variable's name: _instance1 at index: 0
2016-02-23 14:37:25.217 runtime_demo instance variable's name: _instance2 at index: 1
2016-02-23 14:37:25.217 runtime_demo instance variable's name: _array at index: 2
2016-02-23 14:37:25.217 runtime_demo instance variable's name: _string at index: 3
2016-02-23 14:37:25.217 runtime_demo instance variable's name: _integer at index: 4
2016-02-23 14:37:25.218 runtime_demo instace variable _string
2016-02-23 14:37:25.218 runtime_demo
2016-02-23 14:37:25.218 runtime_demo -----Property Operations-----
2016-02-23 14:37:25.218 runtime_demo property's name: array
2016-02-23 14:37:25.218 runtime_demo property's name: string
2016-02-23 14:37:25.218 runtime_demo property's name: integer
2016-02-23 14:37:25.218 runtime_demo property array
2016-02-23 14:37:25.219 runtime_demo
2016-02-23 14:37:25.219 runtime_demo -----Method Operations-----
2016-02-23 14:37:25.219 runtime_demo method's signature: method1
2016-02-23 14:37:25.219 runtime_demo method's signature: method3WithArg1:arg2:
2016-02-23 14:37:25.219 runtime_demo method's signature: method2
2016-02-23 14:37:25.219 runtime_demo method's signature: integer
2016-02-23 14:37:25.220 runtime_demo method's signature: setInteger:
2016-02-23 14:37:25.220 runtime_demo method's signature: array
2016-02-23 14:37:25.220 runtime_demo method's signature: string
2016-02-23 14:37:25.220 runtime_demo method's signature: setArray:
2016-02-23 14:37:25.222 runtime_demo method's signature: setString:
2016-02-23 14:37:25.222 runtime_demo method's signature: .cxx_destruct
2016-02-23 14:37:25.222 runtime_demo method method1
2016-02-23 14:37:25.222 runtime_demo class method : classMethod
2016-02-23 14:37:25.223 runtime_demo MyClass is responsd to selector: method3WithArg1:arg2:
2016-02-23 14:37:25.223 runtime_demo call method method1
2016-02-23 14:37:25.223 runtime_demo
2016-02-23 14:37:25.223 runtime_demo -----Protocols-----
2016-02-23 14:37:25.223 runtime_demo protocol name: NSCopying
2016-02-23 14:37:25.223 runtime_demo protocol name: NSCoding
2016-02-23 14:37:25.223 runtime_demo MyClass is responsed to protocol NSCoding
```

### Dynamically Creating Classes and Objects

**Dynamically Creating Classes**

Dynamically creating a class involves the following functions:

```objc
// Create a new class and metaclass
Class objc_allocateClassPair ( Class superclass, const char *name, size_t extraBytes );

// Destroy a class and its associated metaclass
void objc_disposeClassPair ( Class cls );

// Register a class created with objc_allocateClassPair
void objc_registerClassPair ( Class cls );
```

> `objc_allocateClassPair`: to create a root class, specify `superclass` as `Nil`. `extraBytes` is usually 0; it represents the number of bytes to allocate at the end of the class and metaclass objects for indexed `ivars`.

To create a new class, call `objc_allocateClassPair`. Then use functions like `class_addMethod` and `class_addIvar` to add methods, instance variables, and properties to the new class. Once done, call `objc_registerClassPair` to register the class so it can be used in the program.

Instance methods and instance variables should be added to the class itself, while class methods should be added to the class's metaclass.

> `objc_disposeClassPair` destroys a class. Note: if instances of the class or its subclasses still exist in the running program, do not call this on the class.

We've already seen these functions when discussing metaclasses. Here's another example to illustrate their usage:

```objc

- (void)runtimeTest2 {
    Class cls = objc_allocateClassPair(MyClass.class, "MySubClass", 0);
    class_addMethod(cls, @selector(submethod1), (IMP)imp_submethod1, "v@:");
    class_replaceMethod(cls, @selector(method1), (IMP)imp_submethod1, "v@:");
    class_addIvar(cls, "_ivar1", sizeof(NSString *), log(sizeof(NSString *)), "i");

    objc_property_attribute_t type = {"T", "@\"NSString\""};
    objc_property_attribute_t ownership = { "C", "" };
    objc_property_attribute_t backingivar = { "V", "_ivar1"};
    objc_property_attribute_t attrs[] = {type, ownership, backingivar};

    class_addProperty(cls, "property2", attrs, 3);
    objc_registerClassPair(cls);

    id instance = [[cls alloc] init];
    [instance performSelector:@selector(submethod1)];
    [instance performSelector:@selector(method1)];
}

void imp_submethod1(id self,SEL _cmd){
    NSLog(@"run sub method1:%p",_cmd);
}
```

Program output:

```
2016-02-23 15:06:08.079 runtime_demo[33746:4896485] run sub method1:0x1000f2a88
2016-02-23 15:06:08.080 runtime_demo[33746:4896485] run sub method1:0x1000f2a5e
```

**Dynamically Creating Objects**

The functions for dynamically creating objects are:

```objc
// Create a class instance
id class_createInstance ( Class cls, size_t extraBytes );

// Create a class instance at a specified location
id objc_constructInstance ( Class cls, void *bytes );

// Destroy a class instance
void * objc_destructInstance ( id obj );
Raw
```

> `class_createInstance`: when creating an instance, memory is allocated for the class in the default memory area. The `extraBytes` parameter specifies the number of extra bytes to allocate. These extra bytes can be used for instance variables beyond those defined in the class definition. This function cannot be used in an ARC environment.

Calling `class_createInstance` is similar to `+alloc`. However, when using `class_createInstance` you need to know exactly what you're doing. The following example uses `NSString` to test the function's actual behavior:

```objc
- (void)runtimeTest3 {
    id theObject = class_createInstance(NSString.class, sizeof(unsigned));
    id str1 = [theObject init];

    NSLog(@"%@", [str1 class]);

    id str2 = [[NSString alloc] initWithString:@"test"];
    NSLog(@"%@", [str2 class]);
}
```

Output:

```
2016-02-23 16:17:00.676 runtime_demo[33883:4912917] NSString
2016-02-23 16:17:00.676 runtime_demo[33883:4912917] __NSCFConstantString
```

You can see that using `class_createInstance` returns an `NSString` instance rather than the default placeholder class `__NSCFConstantString` from the class cluster.

> `objc_constructInstance`: creates a class instance at the specified location (`bytes`).

> `objc_destructInstance`: destroys a class instance but does not free or remove any associated references.

**Instance Operation Functions**

Instance operation functions primarily target a series of operations on the instance objects we create. We can use these functions to obtain information from instance objects, such as the values of instance variables. These functions fall into three subcategories:

1. Functions that operate on the entire object:

```objc
// Return a copy of the specified object
id object_copy ( id obj, size_t size );

// Free the memory occupied by the specified object
id object_dispose ( id obj );
```

Consider this scenario: we have class A and class B, where B is a subclass of A. B extends A by adding some extra properties. We've created an instance of A and want to convert it to a B instance at runtime so we can store data in B's properties. We can't convert directly because a B instance is larger than an A instance — there isn't enough space. The functions above can handle this:

```objc
- (void)runtimeTest4 {
    NSObject *a = [[NSObject alloc] init];
    id newB = object_copy(a, class_getInstanceSize(MyClass.class));
    object_setClass(newB, MyClass.class);
    object_dispose(a);
}
```

2. Functions that operate on object instance variables:

```objc
// Modify the value of an instance variable of a class instance
Ivar object_setInstanceVariable ( id obj, const char *name, void *value );

// Get the value of an instance variable of an object
Ivar object_getInstanceVariable ( id obj, const char *name, void **outValue );

// Return a pointer to any extra bytes allocated with an object
void * object_getIndexedIvars ( id obj );

// Return the value of an instance variable in an object
id object_getIvar ( id obj, Ivar ivar );

// Set the value of an instance variable in an object
void object_setIvar ( id obj, Ivar ivar, id value );
```

If the `Ivar` of an instance variable is already known, calling `object_getIvar` is faster than `object_getInstanceVariable`; similarly, `object_setIvar` is faster than `object_setInstanceVariable`.

3. Functions that operate on an object's class:

```objc
// Return the class name of a given object
const char * object_getClassName ( id obj );

// Return the class of an object
Class object_getClass ( id obj );

// Set the class of an object
Class object_setClass ( id obj, Class cls );
```

**Getting Class Definitions**

The Objective-C dynamic runtime automatically registers all classes defined in your code. You can also create class definitions at runtime and register them using `objc_addClass`. The runtime provides a series of functions to get class definition information, mainly:

```objc
// Get the list of registered class definitions
int objc_getClassList ( Class *buffer, int bufferCount );

// Create and return a pointer list to all registered classes
Class * objc_copyClassList ( unsigned int *outCount );

// Return the class definition for a specified class
Class objc_lookUpClass ( const char *name );
Class objc_getClass ( const char *name );
Class objc_getRequiredClass ( const char *name );

// Return the metaclass for a specified class
Class objc_getMetaClass ( const char *name );
```

> `objc_getClassList`: gets the list of registered class definitions. We cannot assume that class objects obtained from this function inherit from the `NSObject` hierarchy, so before calling methods on these classes, always check whether the method is implemented on the class.

The following code demonstrates how to use this function:

```objc
- (void)runtimeTest5 {
    int numClasses;
    Class * classes = NULL;

    numClasses = objc_getClassList(NULL, 0);
    if (numClasses > 0) {
        classes = malloc(sizeof(Class) * numClasses);
        numClasses = objc_getClassList(classes, numClasses);

        NSLog(@"number of classes: %d", numClasses);

        for (int i = 0; i < numClasses; i++) {

            Class cls = classes[i];
            NSLog(@"class name: %s", class_getName(cls));
        }

        free(classes);
    }
}
```

Output:

```
2016-02-23 16:27:58.659 runtime_demo[33907:4916057] number of classes: 5017
2016-02-23 16:27:58.660 runtime_demo[33907:4916057] class name: CTMessageCenter
2016-02-23 16:27:58.660 runtime_demo[33907:4916057] class name: ABPersonLinker
......
......
```

There are three ways to get a class definition: `objc_lookUpClass`, `objc_getClass`, and `objc_getRequiredClass`. If the class is not registered at runtime, `objc_lookUpClass` returns `nil`, while `objc_getClass` invokes a class handler callback and checks again; if still not found, it returns `nil`. `objc_getRequiredClass` behaves the same as `objc_getClass` except it kills the process if the class is not found.

> `objc_getMetaClass`: if the specified class is not registered, the function invokes a class handler callback and checks again; if still not registered, it returns `nil`. However, every class definition must have a valid metaclass definition, so this function always returns a metaclass definition, whether or not it is valid.


### Code:
All code from this post can be found on my GitHub [`runtime_demo`](https://github.com/tonyh2021/runtime_demo).

