---
layout: post
title: "iOS中的设计模式——生成器(Builder)"
description: ""
category: articles
tags: [设计模式]
comments: true
---


## 生成器模式

**生成器模式（`Builder`）**：将一个复杂对象的构建与它的表现分离，使得同样的构建过程可以创建不同的表现。

有时，构建某些对象有多种不同方式。如果这些逻辑包含在构建这些对象的类的单一方法中，代码将会充满条件判断。如果能把构建过程分解为`客户-指导者-生成器(client-director-builder)`的关系，那么过程将更容易管理与服用。针对此类关系的设计模式成为生成器。

## 类图

![Builder](https://lettleprince.github.io/images/20160918-Builder/Builder.png)

`Builder`是一个抽象接口，声明了一个`buildPart`方法，该`builder`方法由`ConcreteBuilder`实现，以构造实际产品(`Product`)。`ConcreteBuilder`有个`getResult`方法，向客户端返回构造完毕的`Product`。`Director`定义了一个`construct`方法，命令`Builder`的实例去`buildPart`。`Director`和`Builder`形成一种聚合关系。这意味着`Builder`是一个组成部分，与`Director`结合，以使整个模式运转，但同时，`Director`并不负责`Builder`的生命周期。这种“整体-部分”的关系用下图时序图表示：

![Builder](https://lettleprince.github.io/images/20160918-Builder/Builder2.png)

`aClient`生成`ConcreteBuilder`的实例(`aConcreteBuilder`)和以`aConcreteBuilder`为初始化参数的`Director`的实例(`aDirector`)，用于今后协同工作。当`aClient`发送`construct`消息给`aDirector`时，该方法发送要建造什么消息(比如`builderPartA`、`builderPartB`和`builderPartC`)给`aConcreteBuilder`。`aDirector`的`construct`方法返回后，`aClient`直接向`aConcreteBuilder`发送`getResult`消息，取回建造完毕的产品。所以`aDirector`所知的“什么”，就是每个`Builder`能够建造什么部件。

## 使用场景

- 需要创建设计各种部件的复杂对象。创建对象的算法应该独立于部件的装配方式。常见的例子是构建组合对象。

- 构建过程需要以不同的方式（例如，部件或表现的不同组合）构建对象。

## 生成器与抽象工厂的对比

两者有相似之处。但是，一方面生成器关注的是分步创建复杂对象，很多时候同一类型的对象可以以不同的方式创建。另一方面，抽象工厂的重点在于创建简单或复杂产品的套件，生成器在多步创建过程的最后一步返回产品，而抽象工厂会立即返回产品。

|**生成器**|**抽象工厂**|
|---|---|
|构建复杂对象|构件简单或复杂对象|
|以多个步骤构建对象|以单一步骤构建对象|
|以多种方式构建对象|以单一方式构建对象|
|在构建过程的最后一步返回产品|立刻返回产品|
|专注一个特定产品|强调一套产品|

## 使用方式

我们定义一个叫`ChasingGame`的类，它有两个方法，用于创建两种类型的角色——游戏玩家与敌人。`CharacterBuilder`用于构建角色，每个属性都会影响被构建角色的特性。显示其静态关系的类图如下：

![Builder](https://lettleprince.github.io/images/20160918-Builder/Builder3.png)

`CharacterBuilder`为抽象生成器，`StandardCharacterBuilder`为具体生成器，`ChasingGame`为指导者。

`ChasingGame`定义了`createPalyer:builder`和`createEnemy:builder`，通过`CharacterBuilder`的实例创建游戏玩家和敌人角色。每个方法有一套不同的特征因子，用来定义角色的特性。`StandardCharacterBuilder`是具体的`CharacterBuilder`，它根据不同特征因子实际构建角色。构建过程结束后，`StandardCharacterBuilder`将返回`Character`的实例。

```objc
//Character.h
@interface Character : NSObject
@property (nonatomic, assign) float protection;//防御
@property (nonatomic, assign) float power;//攻击
@property (nonatomic, assign) float strength;//力量
@property (nonatomic, assign) float stamina;//耐力
@property (nonatomic, assign) float intelligence;//智利
@property (nonatomic, assign) float agility;//敏捷
@property (nonatomic, assign) float aggressiveness;//攻击力
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

`Character`的实例不知道如何把自己构建成有意义的角色，所以才需要`CharacterBuilder`基于先前定义的特征关系，构建有意义的角色。

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

`CharacterBuilder`的实例有个对目标`Character`的引用，该目标`Character`构建完成后将被返回给客户端。有几个构建角色的方法，构建的角色具有特定的力量、耐力、智力、敏捷与攻击力值。这些值影响防御和攻击因子。抽象的`CharacterBuilder`定义了默认行为，他把这些值设定给目标`Character`。

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

`CharacterBuilder`的`buildNewChapteracter`方法生成要构建的`Character`新实例。`StandardCharacterBuilder`是`CharacterBuilder`的子类，定义了生成具有各种相关特性的真正角色的逻辑。

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
    self.character.protection *= value;//更新角色的防御值
    self.character.power *= value;//更新角色的攻击值
    return [super buildStrength:value];//设定力量并返回此生成器
}
- (CharacterBuilder *)buildStamina:(float)value {
    self.character.protection *= value;//更新角色的防御值
    self.character.power *= value;//更新角色的攻击值
    return [super buildStamina:value];//设定耐力并返回此生成器
}
- (CharacterBuilder *)buildIntelligence:(float)value {
    self.character.protection *= value;//更新角色的防御值
    self.character.power /= value;//更新角色的攻击值
    return [super buildIntelligence:value];//设定智力并返回此生成器
}
- (CharacterBuilder *)buildAgility:(float)value {
    self.character.protection *= value;//更新角色的防御值
    self.character.power /= value;//更新角色的攻击值
    return [super buildAgility:value];//设定敏捷并返回此生成器
}
- (CharacterBuilder *)buildAggressiveness:(float)value {
    self.character.protection /= value;//更新角色的防御值
    self.character.power *= value;//更新角色的攻击值
    return [super buildAgility:value];//设定攻击力并返回此生成器
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

客户端生成`StandardCharacterBuilder`和`ChasingGame`实例。然后向`ChasingGame`发送`createPlayer:`和`createEnemy:`消息。

```objc
ChasingGame *game = [[ChasingGame alloc] init];
CharacterBuilder *characterBuilder = [[StandardCharacterBuilder alloc] init];
Character *player = [game createPlayer:characterBuilder];
Character *enemy = [game createEnemy:characterBuilder];
    
NSLog(@"%@", player);
NSLog(@"%@", enemy);
```

## 总结

生成器模式能够帮助构建涉及部件与表现的各种组合的对象。没有这一模式，知道构建对象所需细节的`Director`可能最终变成一个庞大的类，带有无数用于构建同一个类的各种表现得内嵌算法。设计具有各种特征的角色的游戏，应该好好使用这一模式。不是定义单独的`Director`去构建游戏玩家和敌人，而是把角色构建算法放在一个具体`CharacterBuilder`中，是更优雅的做法。

### 代码

文章中的代码都可以从我的GitHub [`DesignPatterns`](https://github.com/lettleprince/DesignPatterns)找到。

