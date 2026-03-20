---
layout: post
title: "Using Zombie Objects to Aid Debugging"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Introduction

I'd heard of zombie objects before, but only had a vague understanding — something like memory that hasn't been referenced but also hasn't been overwritten.

## NSZombie Object

Cocoa provides a "Zombie Objects (`NSZombie Object`)" feature. When enabled, the runtime converts all deallocated instances into special "zombie objects" rather than truly reclaiming them (a vivid metaphor — undead, not yet buried). The underlying memory of these objects cannot be reused and therefore cannot be overwritten. When a zombie object receives a message, it throws an exception that precisely identifies the message sent and describes the object as it was before deallocation.

When you send a message to a deallocated object, a crash doesn't always occur: whether it crashes depends on whether the object's memory has been overwritten by something else.

## How to Enable

In Xcode, set `NSZombieEnabled` to YES to enable this feature. Specifically: open `Edit Scheme`, select `Run`, switch to the `Diagnostics` tab, and check `Enable Zombie Objects`.

![01](/images/posts/20160901-NSZombie/NSZombie-01.jpg)

## How It Works

The `NSZombie Object` implementation lives in the OC `runtime` library, the `Foundation` framework, and the `CoreFoundation` framework (I haven't been brave enough to dig into those yet). When the system is about to deallocate an object and finds that zombie objects are enabled, it converts the object to a zombie instead of fully reclaiming it.

Since reproducing zombie objects under ARC requires more complex setup, here's a simple MRC example:

```objc
void PrintClassInfo(od obj) {
    Class cls = object_getClass(obj);
    Class superCls = class_getSuperclass(cls);
    NSLog(@"---%s : %s---", class_getName(cls), class_getName(superCls));
}

int main(int argc, char *argv[]) {
    Person *p = [[Person alloc] init];
    NSLog(@"Before release:");
    PrintClassInfo(p);
    [p release];
    NSLog(@"After release:");
    PrintClassInfo(p);
}
```

`PrintClassInfo` prints the class and superclass of an object. The output is:

```objc
Before release:
---Person : NSObject ---
After release:
---_NSZombie_Person : nil ---
```

The object's class has changed from `Person` to `_NSZombie_Person`. `_NSZombie_Person` is generated at runtime: the first time a `Person` object needs to become a zombie, this class is created using the `runtime` and registered in the class list.

A zombie class is copied from a template class named `_NSZombie_`. These zombie classes don't do much — they serve mainly as markers. The pseudocode below shows how the system creates a zombie class on demand, and how that class transforms the object being deallocated into a zombie:

```objc
//Get the class of the object being deallocated
Class cls = object_getClass(self);

//Get the class name
const char *clsName = class_getName(cls);

//Build the zombie class name
const char *zombieClsName = "_NSZombie_" + clsName;

//Check if the zombie class already exists
Class zombieCls = objc_lookUpClass(zombieClsName);

//If not, create it
if(!zombieCls){
    //Get the _NSZombie_ template class
    Class baseZombieCls = objc_lookUpClass("_NSZombie_");

    //Duplicate _NSZombie_ with the new class name
    zombieCls = objc_duplecateClass(baseZombieCls, zombieClsName, 0);
}

//Manually clean up the object's resources
objc_destructInstance(self);

//Set the deallocated object's class to the zombie class — the object is now a zombie
objc_setClass(self, zombieCls);
```

This is essentially what `NSObject`'s `dealloc` method does when `NSZombieEnabled = YES` — the runtime swaps out `dealloc` for the code above. By the end, the object's class has become `_NSZombie_Person`.

The key point: the object's memory is not freed (via `free()`), so it cannot be reused. Of course, this is only a debugging aid — production code should never do this.

The reason a new class is created for each zombie is so the system can identify the original class when a message is sent to the zombie. Otherwise all zombies would belong to `_NSZombie_` and debugging would be impossible. The new class is created by the runtime function `objc_destructInstance()`, which copies the entire `_NSZombie_` class structure and assigns it a new name. The copy inherits the same superclass, instance variables, and methods. An alternative would be to subclass `_NSZombie_`, but copying is more efficient.

The zombie class's role becomes apparent during message forwarding. The `_NSZombie_` class implements no methods and has no superclass — only an `isa` instance variable (required by all OC root classes such as `NSObject`). Because it implements no methods, all messages sent to it go through the full forwarding mechanism.

In the full message forwarding mechanism, `___forwarding___` is the core function — you'll see it in the call stack during debugging. The first thing it does is check the class name of the message recipient. If the name has the prefix `_NSZombie_`, it means the recipient is a zombie object and needs special handling. At that point, a message like this is printed:

```objc
*** -[receiver messageSelector:]: sent to deallocated instance 0x7ff9e9c080e0
```

This identifies the message sent to the zombie and the class it belonged to, then the application terminates. The original class name can be extracted from the zombie class name.

```objc
//Get the object's class
Class cls = object_getClass(self);

//Get the class name
const char *clsName = class_getName(cls);

//Check whether the class name starts with _NSZombie_
if (string_has_prefix(clsName, "_NSZombie_")) {
    //This is a zombie object
    //Get the original class name
    const char *originalClsName = substring_from(clsName, 10);

    //Get the selector name
    const char *selectorName = sel_getName(_cmd);

    //Print the information
    Log("*** -[%s %s]: message sent to deallocated instance %p", originalClsName, selectorName,self);

    //Terminate the app
    about();
}
```

If zombie objects are enabled in the example at the beginning of this post, and you send the `description` message to the released `Person` instance, the output will be:

```objc
*** -[Person description]: message sent to deallocated instance 0x7f8123c1ac200
```

## Summary

- During debugging, you can enable the zombie objects feature to convert objects that would normally be deallocated into zombie objects instead.

- The system modifies the object's `isa` pointer to point to a zombie class. The zombie class responds to all messages by printing a message containing the selector name and the receiver, then terminating the application.

### References

[Effective Objective-C 2.0](http://www.effectiveobjectivec.com/)
