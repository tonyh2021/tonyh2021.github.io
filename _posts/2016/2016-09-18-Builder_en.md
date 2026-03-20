---
layout: post
title: "Design Patterns in iOS — Builder"
description: ""
category: articles
tags: [iOS]
comments: true
---


## Builder Pattern

**Builder Pattern**: Separates the construction of a complex object from its representation, so that the same construction process can create different representations.

Sometimes there are multiple ways to build an object. If this logic is crammed into a single method of the class responsible for building the object, the code will be riddled with conditional branches. Breaking the construction process into a `client-director-builder` relationship makes it far easier to manage and reuse. The design pattern that models this relationship is called the Builder.

## Class Diagram

![Builder](/images/posts/20160918-Builder/Builder.png)

`Builder` is an abstract interface that declares a `buildPart` method. This method is implemented by `ConcreteBuilder` to construct the actual product (`Product`). `ConcreteBuilder` has a `getResult` method that returns the finished `Product` to the client. `Director` defines a `construct` method that tells the `Builder` instance to `buildPart`. `Director` and `Builder` form an aggregation relationship, meaning `Builder` is a component that works together with `Director` to make the whole pattern function, yet `Director` is not responsible for the lifecycle of `Builder`. This "whole-part" relationship is illustrated by the following sequence diagram:

![Builder](/images/posts/20160918-Builder/Builder2.png)

`aClient` creates an instance of `ConcreteBuilder` (`aConcreteBuilder`) and an instance of `Director` (`aDirector`) initialized with `aConcreteBuilder`, so they can collaborate going forward. When `aClient` sends the `construct` message to `aDirector`, that method sends build-what messages (such as `builderPartA`, `builderPartB`, and `builderPartC`) to `aConcreteBuilder`. After `aDirector`'s `construct` method returns, `aClient` sends `getResult` directly to `aConcreteBuilder` to retrieve the finished product. In other words, what `aDirector` "knows" is simply what parts each `Builder` is capable of building.

## When to Use

- When you need to create complex objects that involve various components. The algorithm for creating the object should be independent of how the parts are assembled. A common example is constructing composite objects.

- When the construction process needs to produce objects in different ways (e.g., different combinations of components or representations).

## Builder vs. Abstract Factory

The two patterns share some similarities. However, Builder focuses on constructing a complex object step by step — often the same type of object can be built in different ways. Abstract Factory, on the other hand, emphasizes creating families of simple or complex products. Builder returns the product at the last step of a multi-step process, whereas Abstract Factory returns the product immediately.

| **Builder** | **Abstract Factory** |
|---|---|
| Constructs complex objects | Constructs simple or complex objects |
| Builds the object in multiple steps | Builds the object in a single step |
| Builds the object in multiple ways | Builds the object in a single way |
| Returns the product at the final step | Returns the product immediately |
| Focused on one specific product | Emphasizes a family of products |

## Usage Example

We define a class called `ChasingGame` with two methods for creating two types of characters — a player and an enemy. `CharacterBuilder` is used to build characters; each attribute influences the traits of the character being built. The class diagram showing these static relationships looks like this:

![Builder](/images/posts/20160918-Builder/Builder3.png)

`CharacterBuilder` is the abstract builder, `StandardCharacterBuilder` is the concrete builder, and `ChasingGame` is the director.

`ChasingGame` defines `createPlayer:builder` and `createEnemy:builder`, creating player and enemy characters via an instance of `CharacterBuilder`. Each method uses a different set of characteristic factors to define the character's traits. `StandardCharacterBuilder` is the concrete `CharacterBuilder` that actually builds the character based on these factors. Once construction is complete, `StandardCharacterBuilder` returns an instance of `Character`.

```objc
//Character.h
@interface Character : NSObject
@property (nonatomic, assign) float protection;//defense
@property (nonatomic, assign) float power;//attack
@property (nonatomic, assign) float strength;//strength
@property (nonatomic, assign) float stamina;//stamina
@property (nonatomic, assign) float intelligence;//intelligence
@property (nonatomic, assign) float agility;//agility
@property (nonatomic, assign) float aggressiveness;//aggressiveness
@end

//Character.m
@implementation Character
- (instancetype)init {
    self = [super init];
    if (self) {
        self.protection = 1.f;
        self.power = 1.f;
        self.strength = 1.f;
        self.stamina = 1.f;
        self.intelligence = 1.f;
        self.agility = 1.f;
        self.aggressiveness = 1.f;
    }
    return self;
}
@end
```

A `Character` instance has no idea how to build itself into a meaningful character, which is why `CharacterBuilder` is needed — it constructs a meaningful character based on the characteristic relationships defined earlier.

```objc
//CharacterBuilder.h
@interface CharacterBuilder : NSObject
@property (nonatomic, strong) Character *character;
- (CharacterBuilder *)buildNewChapteracter;
- (CharacterBuilder *)buildStrength:(float)value;
- (CharacterBuilder *)buildStamina:(float)value;
- (CharacterBuilder *)buildIntelligence:(float)value;
- (CharacterBuilder *)buildAgility:(float)value;
- (CharacterBuilder *)buildAggressiveness:(float)value;
@end
```

The `CharacterBuilder` instance holds a reference to the target `Character` being built, which will be returned to the client once construction is complete. There are several methods for building a character with specific strength, stamina, intelligence, agility, and aggressiveness values. These values affect the defense and attack factors. The abstract `CharacterBuilder` defines the default behavior by assigning these values to the target `Character`.

```objc
//CharacterBuilder.m
@implementation CharacterBuilder
- (CharacterBuilder *)buildNewChapteracter {
    self.character = [[Character alloc] init];
    return self;
}
- (CharacterBuilder *)buildStrength:(float)value {
    self.character.strength = value;
    return self;
}
- (CharacterBuilder *)buildStamina:(float)value {
    self.character.stamina = value;
    return self;
}
- (CharacterBuilder *)buildIntelligence:(float)value {
    self.character.intelligence = value;
    return self;
}
- (CharacterBuilder *)buildAgility:(float)value {
    self.character.agility = value;
    return self;
}
- (CharacterBuilder *)buildAggressiveness:(float)value {
    self.character.aggressiveness = value;
    return self;
}
@end
```

The `buildNewChapteracter` method of `CharacterBuilder` creates a new `Character` instance to be built. `StandardCharacterBuilder` is a subclass of `CharacterBuilder` that defines the logic for building genuine characters with various related traits.

```objc
//StandardCharacterBuilder.h
@interface StandardCharacterBuilder : CharacterBuilder
- (CharacterBuilder *)buildStrength:(float)value;
- (CharacterBuilder *)buildStamina:(float)value;
- (CharacterBuilder *)buildIntelligence:(float)value;
- (CharacterBuilder *)buildAgility:(float)value;
- (CharacterBuilder *)buildAggressiveness:(float)value;
@end

//StandardCharacterBuilder.m
@implementation StandardCharacterBuilder
- (CharacterBuilder *)buildStrength:(float)value {
    self.character.protection *= value;//update character's defense value
    self.character.power *= value;//update character's attack value
    return [super buildStrength:value];//set strength and return this builder
}
- (CharacterBuilder *)buildStamina:(float)value {
    self.character.protection *= value;//update character's defense value
    self.character.power *= value;//update character's attack value
    return [super buildStamina:value];//set stamina and return this builder
}
- (CharacterBuilder *)buildIntelligence:(float)value {
    self.character.protection *= value;//update character's defense value
    self.character.power /= value;//update character's attack value
    return [super buildIntelligence:value];//set intelligence and return this builder
}
- (CharacterBuilder *)buildAgility:(float)value {
    self.character.protection *= value;//update character's defense value
    self.character.power /= value;//update character's attack value
    return [super buildAgility:value];//set agility and return this builder
}
- (CharacterBuilder *)buildAggressiveness:(float)value {
    self.character.protection /= value;//update character's defense value
    self.character.power *= value;//update character's attack value
    return [super buildAgility:value];//set aggressiveness and return this builder
}
@end
```

```objc
//ChasingGame.h
@interface ChasingGame : NSObject
- (Character *)createPlayer:(CharacterBuilder *)builder;
- (Character *)createEnemy:(CharacterBuilder *)builder;
@end

//ChasingGame.m
@implementation ChasingGameß
- (Character *)createPlayer:(CharacterBuilder *)builder {
    [builder buildNewChapteracter];
    [builder buildStrength:50.0];
    [builder buildStamina:25.0];
    [builder buildIntelligence:75.0];
    [builder buildAgility:65.0];
    [builder buildAggressiveness:35.0];

    return [builder character];
}
- (Character *)createEnemy:(CharacterBuilder *)builder {
    [builder buildNewChapteracter];
    [builder buildStrength:80.0];
    [builder buildStamina:65.0];
    [builder buildIntelligence:35.0];
    [builder buildAgility:25.0];
    [builder buildAggressiveness:95.0];

    return [builder character];
}
@end
```

The client creates a `StandardCharacterBuilder` and a `ChasingGame` instance, then sends the `createPlayer:` and `createEnemy:` messages to `ChasingGame`.

```objc
ChasingGame *game = [[ChasingGame alloc] init];
CharacterBuilder *characterBuilder = [[StandardCharacterBuilder alloc] init];
Character *player = [game createPlayer:characterBuilder];
Character *enemy = [game createEnemy:characterBuilder];

NSLog(@"%@", player);
NSLog(@"%@", enemy);
```

## Summary

The Builder pattern helps construct objects that involve various combinations of components and representations. Without this pattern, the `Director` — which knows all the details needed to build an object — could easily become a bloated class filled with countless embedded algorithms for building different representations of the same class. Games that design characters with various traits are a perfect use case for this pattern. Rather than defining separate directors to build players and enemies, placing the character-building algorithm inside a concrete `CharacterBuilder` is a much more elegant approach.

### Code

All the code in this article can be found on my GitHub [`DesignPatterns`](https://github.com/tonyh2021/DesignPatterns).


