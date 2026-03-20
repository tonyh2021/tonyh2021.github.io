---
layout: post
title: "Design Patterns in iOS — Factory Pattern"
description: ""
category: articles
tags: [iOS]
comments: true
---

> The Factory pattern comes in two main variants: the Simple Factory and the Abstract Factory.

> The Factory Method is a component of the Abstract Factory pattern.

Let's start with the Simple Factory as a warm-up.

## Simple Factory Pattern

A factory class is responsible for creating concrete products based on parameters. The factory method uses conditional logic (`if`, `switch`) to decide which instance to create.

Main participants in the Simple Factory pattern:

- **Factory** role: Receives requests from the client and creates the appropriate product object based on the request.

- **AbstractProduct** role: The parent class or common interface of all objects created by the factory. Can be an abstract class or protocol.

- **ConcreteProduct** role: The actual objects created by the factory — all instances are of this role.

```objc
//Core implementation of Simple Factory
+ (Product *)createProductWithType:(ProductType)type {
    switch (type) {
        case ProductTypeOne:
            return [[ProductOne alloc] init];
            break;
        case ProductTypeTwo:
            return [[ProductTwo alloc] init];
            break;
        case ProductTypeThree:
            return [[ProductThree alloc] init];
            break;
        default:
            break;
    }
    return nil;
}
```

The concept is easy to understand, but there's a problem: the Simple Factory is open to both extension and modification, which violates the Open/Closed Principle. In plain terms: adding a new product requires not only a new product class, but also modifying the factory method. Furthermore, the creation logic for all products is concentrated in the factory class, which isn't elegant. In Objective-C, `runtime` can be used to improve this:

```objc
//Using a string parameter
+ (Product *)createProductWithType:(NSString *)product {
    if (!product || [product isEqualToString:@""]) {
        return nil;
    }
    Class class = NSClassFromString(product);
    Product *p = [[class alloc] init];
    if (p) {
        return p;
    }
    return nil;
}

//Using a Class parameter
+ (Product *)createProductWithClass:(Class)productClass {
    if (!productClass) {
        return nil;
    }
    Product *p = [[productClass alloc] init];
    if (p) {
        return p;
    }
    return nil;
}
```

## Factory Method Pattern

**Factory Method Pattern**: Defines an interface for creating objects, but lets subclasses decide which class to instantiate. The Factory Method defers instantiation to subclasses.

In plain terms: **The Factory Method pattern takes the factory class that was responsible for creating concrete subclasses, and abstracts it into a hierarchy of an abstract factory class and concrete factory subclasses.** Each time a new abstract subclass is added, a corresponding factory subclass is created, with a one-to-one mapping. The factory subclass creates its corresponding product subclass. The caller decides which factory subclass to use. This means adding new products doesn't require modifying the abstract factory class — simply create a new factory subclass for the new product.

### Main Participants

- **Abstract Factory**: Independent of application-specific logic. Any factory in the pattern must implement this interface.

- **Concrete Factory**: Implements the abstract factory interface. Contains logic closely tied to the application's business requirements and is called by the application to create product objects.

- **Abstract Product**: The supertype (parent class or common interface) of all objects created by factory methods.

- **Concrete Product**: Implements the abstract product interface. Each concrete product object created by a factory method is an instance of some concrete product role.

### Class Diagram

![factory](/images/posts/20160906-factory/factory.png)

The abstract `Product` defines the interface for objects created by factory methods. `ConcreteProduct` implements the `Product` interface. `Creator` declares the factory method that returns a `Product` object and may also provide a default implementation returning a default `ConcreteProduct`. Other operations in `Creator` may call this factory method to create `Product` objects. `ConcreteCreator` is a subclass of `Creator` that overrides the factory method to return a `ConcreteProduct` instance.

### When to Use It

- A system should not depend on the details of how product class instances are created, composed, or represented. This applies to all forms of the factory pattern.

- A system has more than one product family, but only consumes products from one family at a time.

- Products belonging to the same family are always used together, and this constraint must be enforced in the design.

- A system provides a library of products, all of which appear through the same interface, allowing clients to remain independent of the implementation.

### Implementation

```objc
//Abstract product
@interface Product : NSObject
@end

@implementation Product
@end

//Concrete product 1
@interface ProductOne : Product
@end

@implementation ProductOne
@end

//Concrete product 2
@interface ProductTwo : Product
@end

@implementation ProductTwo
@end

//Abstract factory
@interface Factory : NSObject
+ (Product *)createProduct;
@end

@implementation Factory
+ (Product *)createProduct {
    return [[Product alloc] init];//If Product is abstract, this can return nil
}
@end

//Concrete factory for product 1
@interface ProductOneFactory : Factory
+ (Product *)createProduct;
@end

@implementation ProductOneFactory
+ (Product *)createProduct {
    return [[ProductOne alloc] init];
}
@end

//Concrete factory for product 2
@interface ProductTwoFactory : Factory
+ (Product *)createProduct;
@end

@implementation ProductTwoFactory
+ (Product *)createProduct {
    return [[ProductTwo alloc] init];
}
@end

//Client code
Product *p = [ProductOneFactory createProduct];
NSLog(@"%@", p);

Product *p2 = [ProductTwoFactory createProduct];
NSLog(@"%@", p2);
```

```objc
2016-09-07 16:05:29.837 OCDemo[16036:284508] <ProductOne: 0x7ff6106b34d0>
2016-09-07 16:05:29.838 OCDemo[16036:284508] <ProductTwo: 0x7ff6106a8d20>
```

When requirements change, callers only need to swap the factory subclass name — nothing else needs to change. It's like a switch: the type of concrete factory subclass controls which product subclass gets instantiated, and the caller doesn't need to know how instantiation works internally.

### Advantages

The Factory Method pattern offers greater flexibility: adding or removing products doesn't affect anything else, and it better adheres to the Open/Closed Principle.

It also embraces abstraction more deeply, abstracting the factory class itself into an abstract factory and concrete factory subclasses. Callers can interact more flexibly, which is also a demonstration of polymorphism.

### Disadvantages

The drawback is quite obvious: every new product subclass requires a corresponding factory subclass (in Objective-C, that means four new files per product), leading to a proliferation of classes and increasing overall complexity.

## Abstract Factory Pattern

**Abstract Factory Pattern**: Provides an interface for creating a family of related abstract subclasses without specifying their concrete types. Also known as the Kit pattern.

The Abstract Factory and Factory Method patterns are similar, but the Abstract Factory takes abstraction further. It is the most abstract of the three factory patterns.

The Abstract Factory defines an abstract factory class with methods for creating each type of abstract subclass — one method per product type. Each concrete factory subclass corresponds to one product family and overrides these methods to instantiate the concrete subclasses for that family.

### Abstract Factory vs. Factory Method

Both serve the same purpose: creating objects without the client knowing which concrete class is returned.

In the Factory Method pattern, each factory subclass corresponds to exactly one abstract subclass — a one-to-one relationship. In the Abstract Factory pattern, each factory subclass represents an entire product family, and creates multiple types of abstract subclasses. Factory Method maps one factory subclass to one type; Abstract Factory maps one factory subclass to a whole family of types.

Factory Method's one-to-one design produces excessive numbers of classes. Abstract Factory makes better use of factory subclasses by having each one cover a full family of abstract subclasses. This design is especially well-suited for switching between two structurally equivalent product families.

In plain terms: Factory Method is for a single abstract type; Abstract Factory is for a family of structurally related abstract types.

|**Abstract Factory**|**Factory Method**|
|---|---|
|Creates abstract products via object composition|Creates abstract products via class inheritance|
|Creates families of products|Creates one type of product|
|Must modify the parent class interface to support new products|Subclass the creator and override the factory method to create new products|

### Main Participants

- **AbstractFactory**: The core of the factory pattern, independent of application business logic.

- **ConcreteFactory**: Creates product instances directly in response to client calls. Contains logic closely tied to application business requirements.

- **AbstractProduct**: The parent class or common interface of all objects created by the factory.

- **ConcreteProduct**: Every product object created by the Abstract Factory is an instance of some concrete product class. This is what the client ultimately needs, and it encapsulates the application's business logic.

### Class Diagram

![factory02](/images/posts/20160906-factory/factory02.png)

The client only knows `AbstractFactory` and `AbstractProduct`. The implementation details of each factory class are treated as a black box. Even the products don't know who will be responsible for creating them. Only the concrete factory knows what to create and how to create it (most often using the Factory Method internally). Factory methods defer actual creation to overriding subclasses. In the class diagram, `createProductA` and `createProductB` are factory methods. The original abstract methods create nothing. The Abstract Factory pattern is often used alongside the [Prototype pattern](https://tonyh2021.github.io/articles/2016/09/05/prototype.html), [Singleton pattern](), and [Flyweight pattern]().

### When to Use It

- A system should not depend on the details of how product class instances are created, composed, or represented. This applies to all forms of the factory pattern.

- A system has more than one product family, but only consumes products from one family at a time.

- Products belonging to the same family are always used together, and this constraint must be enforced in the design.

- A system provides a library of products, all of which appear through the same interface, allowing clients to remain independent of the implementation.

### Implementation

```objc
//Abstract factory
@interface BrandingFactory : NSObject
+ (BrandingFactory *)factory;
- (Hatchback *)createHatchback;
- (SUV *)createSUV;
@end

@implementation BrandingFactory
+ (BrandingFactory *)factory {
    if ([[self class] isSubclassOfClass:[ToyotaBrandingFactory class]]) {
        return [[ToyotaBrandingFactory alloc] init];
    } else if ([[self class] isSubclassOfClass:[FordBrandingFactory class]]) {
        return [[FordBrandingFactory alloc] init];
    } else {
        return nil;
    }
}
- (Hatchback *)createHatchback {
    return nil;
}
- (SUV *)createSUV {
    return nil;
}
@end

// Concrete factory
@interface FordBrandingFactory : BrandingFactory
@end

@implementation FordBrandingFactory
- (Hatchback *)createHatchback {
    FordHatchback *hatchback = [[FordHatchback alloc] init];
    return hatchback;
}
- (SUV *)createSUV {
    FordSUV *suv = [[FordSUV alloc] init];
    return suv;
}
@end

@interface ToyotaBrandingFactory : BrandingFactory
@end

@implementation ToyotaBrandingFactory
- (Hatchback *)createHatchback {
    ToyotaHatchback *hatchback = [[ToyotaHatchback alloc] init];
    return hatchback;
}
- (SUV *)createSUV {
    ToyotaSUV *suv = [[ToyotaSUV alloc] init];
    return suv;
}
@end

//Abstract products
@interface Hatchback : NSObject
@end

@implementation Hatchback
@end

@interface SUV : NSObject
@end

@implementation SUV
@end

//Concrete products
@interface FordHatchback : Hatchback
@end

@implementation FordHatchback
@end

@interface ToyotaHatchback : Hatchback
@end

@implementation ToyotaHatchback
@end

@interface FordSUV : SUV
@end

@implementation FordSUV
@end

@interface ToyotaSUV : SUV
@end

@implementation ToyotaSUV
@end
```

> The sheer number of classes in Objective-C can be overwhelming. Java implementations would certainly be more elegant.

### Abstract Factory Pattern in Cocoa

Creating `NSNumber` instances follows the Abstract Factory pattern perfectly.

There are two ways to create Cocoa objects: using `alloc` followed by `init`, or using a class-level `+ className...` method. In Cocoa's Foundation framework, `NSNumber` has many class methods for creating various types of `NSNumber` objects:

 ```objc
NSNumber *boolNumber = [NSNumber numberWithBool:YES];
NSNumber *charNumber = [NSNumber numberWithChar:'a'];
NSNumber *intNumber = [NSNumber numberWithInteger:2];
 ```

Each returned object belongs to a different private subclass that represents the original input type. Output:

```objc
2016-09-08 10:30:28.415 OCDemo[1164:29635] __NSCFBoolean
2016-09-08 10:30:28.416 OCDemo[1164:29635] __NSCFNumber
2016-09-08 10:30:28.416 OCDemo[1164:29635] __NSCFNumber
```

These class methods that accept different input types and return `NSNumber` instances are class factory methods. `NSNumber` is an example of an Abstract Factory implementation. This pattern in the Foundation framework is known as a **Class Cluster**.

A class cluster is a common design pattern in the Foundation framework, based on the Abstract Factory concept. It groups a number of related private concrete factory subclasses under a shared abstract superclass. For example, "number" encompasses a complete set of numeric types — char, integer, float, and double. These are all subtypes of "number," so `NSNumber` naturally becomes their supertype. `NSNumber` exposes a set of public APIs that define behavior common to all numeric types. Clients don't need to know the specific type of the `NSNumber` instance they're working with.

Class clusters are a form of Abstract Factory. For instance, `NSNumber` itself is a highly abstract factory, while `NSCFBoolean` and `NSCFNumber` are concrete factory subclasses. The subclasses are concrete factories because they override the public factory methods declared in `NSNumber` to produce the actual products. For example, `intValue` and `boolValue` return a value based on the internal value of the actual `NSNumber` object (the data type may differ). The values returned from these factory methods are the "products" in the original definition of the Abstract Factory pattern.

There is a distinction between factory methods that create abstract products and those that create abstract factories. Clearly, methods like `intValue` and `boolValue` should be overridden in concrete factories (`NSCFBoolean`, `NSCFNumber`) to return actual values (products). Other methods like `numberWithBool:` and `numberWithInteger:` are not meant to return products — they return factories that can produce products. These should therefore not be overridden in concrete factory subclasses.

Other Foundation classes implemented as class clusters include `NSData`, `NSArray`, `NSDictionary`, and `NSString`.

## Summary of Factory Patterns

All three factory patterns share a common characteristic: subclasses that inherit from an abstract class — whether product subclasses or factory subclasses — must provide their own implementations of the methods defined by the abstract class (implementations may be identical or different). This is what makes something a factory pattern. The essence of factory patterns is abstraction and polymorphism: abstract subclasses inherit from an abstract class and implement its methods and properties differently, then those implementations are invoked polymorphically — this forms the core of the factory pattern.

The factory class is a perfect embodiment of the Open/Closed Principle — open for extension, closed for modification. Take the most abstract form, the Abstract Factory: adding a new product family simply requires adding a new factory subclass and its corresponding abstract subclasses, with no impact on the existing pattern structure. Adding a new type requires creating new classes for that type and extending the abstract factory class and its subclasses with the relevant methods.

When external code uses functionality provided by abstract subclasses, it doesn't need to know anything about them specifically — abstract subclasses never appear in client code. Clients only interact with the abstract class. The factory pattern separates the creation and implementation of abstract subclasses: concrete creation is handled by the factory class, while the abstract subclass only focuses on business logic. Clients don't need to know how abstract subclasses are instantiated. This approach is highly flexible and easy to extend, and the benefits become especially clear in large projects where it can significantly reduce code complexity.

### References

[Deep Copy vs. Shallow Copy in iOS](https://tonyh2021.github.io/articles/2016/03/10/memory3-copy.html)

### Code

All code in this article can be found in my GitHub repository [`DesignPatterns`](https://github.com/tonyh2021/DesignPatterns).
