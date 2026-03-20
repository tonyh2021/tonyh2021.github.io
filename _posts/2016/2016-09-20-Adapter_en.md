---
layout: post
title: "Design Patterns in iOS — Adapter"
description: ""
category: articles
tags: [iOS]
comments: true
---


## Adapter Pattern

**Adapter Pattern**: Converts the interface of a class into another interface that clients expect. The Adapter pattern lets classes work together that otherwise could not because of incompatible interfaces.

An adapter is used to connect two different kinds of objects so they can work together seamlessly. It is sometimes called a Wrapper. The idea is straightforward: an adapter implements the behavior of some interface that the client understands, while also connecting to another object that has a completely different interface and behavior. On one side is the target interface that the client knows how to use; on the other side is the adaptee that the client knows nothing about. The adapter sits in between, and its main role is to pass the adaptee's behavior through to the client on the other end of the pipe.

## Class Diagram

There are essentially two ways to implement an adapter.

The first approach adapts two interfaces through inheritance and is called a Class Adapter. In C++, a class adapter is implemented via multiple inheritance. In languages like Java and Objective-C that do not support multiple inheritance, you can implement a class adapter by conforming to an interface or protocol while also subclassing a parent class. Specifically in Objective-C, you first need a protocol that defines the set of behaviors the client wants to use, and then you create a concrete adapter that implements this protocol. The adapter class must also inherit from the adaptee.

![Adapter](/images/posts/20160920-Adapter/Adapter.png)

> `Target` refers to the target interface.
> `Adaptee` refers to the class being adapted.
> `request` refers to the request method.

`Adapter` is both a `Target` type and an `Adaptee` type. `Adapter` overrides `Target`'s `request` method, but does not override `Adaptee`'s `specificRequest` method. Instead, inside `Adapter`'s `request` implementation, it calls the parent class's `specificRequest` method. At runtime, the `request` method sends `[super specificRequest]` to the parent. `super` is the `Adaptee`, which executes `specificRequest` in its own way within the scope of `Adapter`'s `request` method. A class adapter in Objective-C can only be implemented when `Target` is a protocol rather than a class.

The second approach is called an Object Adapter. Unlike the class adapter, an object adapter does not inherit from the adaptee — instead, it holds a reference to it through composition. When implemented as an object adapter, the relationships are:

![Adapter1](/images/posts/20160920-Adapter/Adapter1.png)

The relationship between `Target` and `Adapter` remains the same as in the class adapter, while the relationship between `Adapter` and `Adaptee` changes from "is-a" to "has-a". In this setup, `Adapter` needs to maintain a reference to `Adaptee`. Inside the `request` method, `Adapter` sends `[adaptee specificRequest]` to the referenced `adaptee` to indirectly access its behavior, then implements the remainder of the client's request. Because `Adapter` has a "has-a" relationship with `Adaptee`, using `Adapter` to adapt subclasses of `Adaptee` is also perfectly fine.

## Class Adapter vs. Object Adapter

Class adapters and object adapters are different ways to implement the Adapter pattern but achieve the same goal.

| **Class Adapter** | **Object Adapter** |
|---|---|
| Works only with a single concrete `Adaptee` class,<br>adapting `Adaptee` to `Target` | Can adapt multiple `Adaptee` classes and their subclasses |
| Easy to override `Adaptee`'s behavior, since<br>adaptation is done via direct subclassing | Harder to override `Adaptee`'s behavior; requires<br>using a subclass object rather than `Adaptee` itself |
| Only one `Adapter` object, with no extra<br>pointer indirection to access `Adaptee` | Requires an extra pointer to indirectly access<br>`Adaptee` and adapt its behavior |

> Note: The Delegate pattern in Objective-C is essentially an Object Adapter.

## When to Use

- When an existing class's interface does not match your requirements.

- When you want a reusable class that can work with other classes that may have incompatible interfaces.

- When you need to adapt several different subclasses of a class, but subclassing a class adapter for each one is impractical. In that case, use an object adapter (i.e., a delegate) to adapt the parent class's interface.

## Implementing the Adapter Pattern with Objective-C Protocols

### Class Adapter

![Adapter2](/images/posts/20160920-Adapter/Adapter2.png)

```objc
//Charger.h  Standard charger
@interface Charger : NSObject
- (void)charge;//Standard charging
@end

//Charger.m
@implementation Charger
- (void)charge {
    NSLog(@"Charging");
}
@end

//LightningChargerAdapterProtocol.h  Adapter interface
@protocol LightningChargerAdapterProtocol <NSObject>
@required
- (void)chargeWithLightning;//Declares the adapter method
@end

//LightningChargerAdapter.h  Adapter: inherits Charger and implements LightningChargerAdapterProtocol
@interface LightningChargerAdapter : Charger <LightningChargerAdapterProtocol>
@end

//LightningChargerAdapter.m
@implementation LightningChargerAdapter
- (void)chargeWithLightning {
    NSLog(@"Using Lightning");
    [super charge];//Call the parent's charge method
}
@end

//Client usage
LightningChargerAdapter *charger = [[LightningChargerAdapter alloc] init];
[charger chargeWithLightning];
```

### Object Adapter

If we treat the MicroUSB interface adapter as merely a component of the charger, we get an object adapter.

![Adapter3](/images/posts/20160920-Adapter/Adapter3.png)

```objc
//MicroUSBAdapterProtocol
@protocol MicroUSBAdapterProtocol <NSObject>
@required
- (void)chargeWithMicroUSB;
@end

//MicroUSBAdapter.h
@interface MicroUSBAdapter : NSObject
- (void)chargeWithMicroUSB;
@end

//MicroUSBAdapter.m
@interface MicroUSBAdapter() <MicroUSBAdapterProtocol>
@property (nonatomic, strong) Charger *charger;//holds a Charger property
@end

@implementation MicroUSBAdapter
- (void)chargeWithMicroUSB {
    NSLog(@"Using MicroUSB");
    self.charger = [[Charger alloc] init];
    [self.charger charge];
}
@end
```

## More Complex Use Cases in Cocoa

As mentioned earlier, delegation is effectively an adapter relationship — specifically an object adapter.

![Adapter4](/images/posts/20160920-Adapter/Adapter4.png)

Take `UITableView` as an example: the goal is to transform the `UITableView` interface into the interface the client needs. What is the "client" here? It is the `UITableView` itself. What is the `Target` (the target interface)? It is `UITableViewDelegate` and `UITableViewDataSource`. The concrete class that implements these protocols (`UIViewController`) acts as the adapter. And what is the class that is incompatible with the framework and needs to be adapted? That would be the other classes in the application (`UIViewController`).

The reason we say the delegate mechanism is primarily an adapter pattern is that delegation can also realize the intent of other design patterns, such as the Decorator pattern. In practice, the delegate pattern is sometimes mixed together with other design patterns.

## Summary

The Adapter pattern offers many benefits, such as decoupling the client from the adaptee and making client calls cleaner (only needing to call the defined interface methods). That said, it also has drawbacks: writing the adapter to fit the target interface can involve a relatively complex implementation, and it adds extra classes that make the architecture more complicated. Use it when it makes sense for your situation — do not force design patterns where they do not fit.

### References

[iOS Design Patterns](https://www.raywenderlich.com/46988/ios-design-patterns)

### Code

All the code in this article can be found on my GitHub [`DesignPatterns`](https://github.com/tonyh2021/DesignPatterns).


