---
layout: post
title: "Objective-C的runtime原理"
description: ""
category: articles
tags: [runtime]
comments: true
---

## 前言
`runtime`：指一个程序在运行（或者在被执行）的状态。也就是说，当你打开一个程序使它在电脑上运行的时候，那个程序就是处于运行时刻。在一些编程语言中，把某些可以重用的程序或者实例打包或者重建成为`运行库`。这些实例可以在它们运行的时候被连接或者被任何程序调用。

`Objective-C`中`runtime`：是一套比较底层的纯C语言API，属于1个C语言库，包含了很多底层的C语言API。在我们平时编写的OC代码中，程序运行过程时，其实最终都是转成了`runtime`的C语言代码。

`Objective-C`是基于C语言加入了面向对象特性和消息转发机制的动态语言，这意味着它不仅需要一个编译器，还需要`runtime`系统来动态创建类和对象，进行消息发送和转发。

## Runtime数据结构
> 参考：[Objective-C Runtime 运行时之一：类与对象](http://southpeak.github.io/blog/2014/10/25/objective-c-runtime-yun-xing-shi-zhi-lei-yu-dui-xiang/)

在`Objective-C`中，使用`[receiver message]`语法并不会马上执行`receiver`对象的`message`方法的代码，而是向`receiver`发送一条`message`消息，这条消息可能由`receiver`来处理，也可能由转发给其他对象来处理，也有可能假装没有接收到这条消息而没有处理。其实`[receiver message]`被编译器转化为：

```objc
id objc_msgSend ( id self, SEL op, ... );  
```

### SEL

SEL是函数`objc_msgSend`第二个参数的数据类型，表示方法选择器，`<objc.h>`文件中SEL数据结构：

```objc
typedef struct objc_selector *SEL; 
```

其实它就是映射到方法的C字符串，你可以通过objc编译器命令`@selector()`或者`runtime`系统的`sel_registerName`函数来获取一个SEL类型的方法选择器。

如果你知道`selector`对应的方法名是什么，可以通过`NSString* NSStringFromSelector(SEL aSelector)`方法将SEL转化为字符串，再用`NSLog`打印。

### id

`objc_msgSend`第一个参数的数据类型id，id是通用类型指针，能够表示任何对象。`<objc.h>`文件中id数据结构如下：

```objc
/// Represents an instance of a class.  
struct objc_object {  
    Class isa  OBJC_ISA_AVAILABILITY;  
};  
  
/// A pointer to an instance of a class.  
typedef struct objc_object *id; 
```

id其实就是一个指向objc_object结构体指针，它包含一个Class isa成员，根据isa指针就可以顺藤摸瓜找到对象所属的类。

> 注意：根据Apple的官方文档[Key-Value Observing Implementation Details](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/KeyValueObserving/Articles/KVOImplementation.html)提及，key-value observing是使用isa-swizzling的技术实现的，isa指针在运行时被修改，指向一个中间类而不是真正的类。所以，你不应该使用isa指针来确定类的关系，而是使用[class(https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Protocols/NSObject_Protocol/index.html#//apple_ref/occ/intfm/NSObject/class)]方法来确定实例对象的类。

### Class

isa指针的数据类型是Class，Class表示对象所属的类，`<objc.h>`文件中：

```objc
/// An opaque type that represents an Objective-C class.  
typedef struct objc_class *Class; 
```

可以查看到Class其实就是一个`objc_class`结构体指针。再看`<runtime.h>`中`objc_class`的定义：

```objc
struct objc_class {
    Class isa  OBJC_ISA_AVAILABILITY;

#if !__OBJC2__
	Class super_class; // 指向其父类
	const char *name; // 类名
	long version; // 类的版本信息，初始化默认为0，可以通过runtime函数class_setVersion和class_getVersion进行修改、读取
	long info; // 一些标识信息,如CLS_CLASS (0x1L) 表示该类为普通 class ，其中包含对象方法和成员变量;CLS_META (0x2L) 表示该类为 metaclass，其中包含类方法;
	long instance_size ; // 该类的实例变量大小(包括从父类继承下来的实例变量);
	struct objc_ivar_list *ivars; // 用于存储每个成员变量的地址
	struct objc_method_list **methodLists; // 与 info 的一些标志位有关,如CLS_CLASS (0x1L),则存储对象方法，如CLS_META (0x2L)，则存储类方法;
	struct objc_cache *cache; // 指向最近使用的方法的指针，用于提升效率；
	struct objc_protocol_list *protocols; // 存储该类遵守的协议
#endif
```

> 注意：OBJC2_UNAVAILABLE是一个Apple对Objc系统运行版本进行约束的宏定义，主要为了兼容非Objective-C 2.0的遗留版本，但我们仍能从中获取一些有用信息。

- **isa**：表示一个Class对象的Class，也就是MetaClass。在面向对象设计中，一切都是对象，Class在设计中本身也是一个对象。我们会在`<objc-runtime-new.h>`文件找到证据，发现`objc_class`有以下定义：

```objc
struct objc_class : objc_object {  
  // Class ISA;  
  Class superclass;  
  cache_t cache;             // formerly cache pointer and vtable  
  class_data_bits_t bits;    // class_rw_t * plus custom rr/alloc flags  
  
  ......  
}  
```

由此可见，结构体`objc_class`也是继承`objc_object`，说明Class在设计中本身也是一个对象。

其实`Meta Class`也是一个Class，那么它也跟其他Class一样有自己的isa和`super_class`指针，关系如下：
![继承关系](http://7xr0hq.com1.z0.glb.clouddn.com/blog/image/class-diagram.jpg)

上图实线是`super_class`指针，虚线是`isa`指针。有几个关键点需要解释以下：

> 1.`Root class`(`class`)其实就是`NSObject`，`NSObject`是没有超类的，所以`Root class`(`class`)的`superclass`指向nil。
> 
> 2.每个Class都有一个isa指针指向唯一的`Meta class`。
> 
> 3.`Root class`(`meta`)的`superclass`指向`Root class`(`class`)，也就是`NSObject`，形成一个回路。
> 
> 4.每个`Meta class`的isa指针都指向`Root class `(`meta`)。

- **super_class**：父类，如果该类已经是最顶层的根类，那么它为`NULL`。
- **version**：类的版本信息，默认为0。
- **info**：供运行期使用的一些位标识。
- **instance_size**：该类的实例变量大小。
- **ivars**：表示多个成员变量，它指向objc_ivar_list结构体。。

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

`objc_ivar_list`其实就是一个链表，存储多个`objc_ivar`，而`objc_ivar`结构体存储类的单个成员变量信息。

- **methodLists**：表示方法列表，它指向`objc_method_list`结构体的二级指针，可以动态修改`*methodLists`的值来添加成员方法，也是Category实现原理，同样也解释Category不能添加属性的原因。。

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

同理，`objc_method_list`也是一个链表，存储多个`objc_method`，而`objc_method`结构体存储类的某个方法的信息。

- **objc_cache**：用来缓存经常访问的方法，它指向`objc_cache`结构体，后面会重点讲到。
- **protocols**：类遵循哪些协议。
- **Method**：表示类中的某个方法，`<runtime.h>`文件中：

```objc
/// An opaque type that represents a method in a class definition.  
typedef struct objc_method *Method;  
struct objc_method {  
    SEL method_name                                          OBJC2_UNAVAILABLE;  
    char *method_types                                       OBJC2_UNAVAILABLE;  
    IMP method_imp                                           OBJC2_UNAVAILABLE;  
}  
```

其实`Method`就是一个指向`objc_method`结构体指针，它存储了方法名(`method_name`)、方法类型(`method_types`)和方法实现(`method_imp`)等信息。而`method_imp`的数据类型是IMP，它是一个函数指针。

- **Ivar**：表示类中的实例变量，在`<runtime.h>`文件中：

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

Ivar其实就是一个指向`objc_ivar`结构体指针，它包含了变量名(`ivar_name`)、变量类型(`ivar_type`)等信息。

- **IMP**：在上面讲Method时就说过，IMP本质上就是一个函数指针，指向方法的实现，在`<objc.h>`文件中：

```objc
/// A pointer to the function of a method implementation.   
#if !OBJC_OLD_DISPATCH_PROTOTYPES  
typedef void (*IMP)(void /* id, SEL, ... */ );   
#else  
typedef id (*IMP)(id, SEL, ...);   
#endif  
```

当你向某个对象发送一条信息，可以由这个函数指针来指定方法的实现，它最终就会执行那段代码，这样可以绕开消息传递阶段而去执行另一个方法实现。

- **Cache**：顾名思义，Cache主要用来缓存，那它缓存什么呢？我们先在runtime.h文件看看它的定义：

```objc
typedef struct objc_cache *Cache                             OBJC2_UNAVAILABLE;  
  
struct objc_cache {  
    unsigned int mask /* total = mask + 1 */                 OBJC2_UNAVAILABLE;  
    unsigned int occupied                                    OBJC2_UNAVAILABLE;  
    Method buckets[1]                                        OBJC2_UNAVAILABLE;  
};  
```

Cache其实就是一个存储Method的链表，主要是为了优化方法调用的性能。当对象receiver调用方法message时，首先根据对象receiver的isa指针查找到它对应的类，然后在类的methodLists中搜索方法，如果没有找到，就使用super_class指针到父类中的methodLists查找，一旦找到就调用方法。如果没有找到，有可能消息转发，也可能忽略它。但这样查找方式效率太低，因为往往一个类大概只有20%的方法经常被调用，占总调用次数的80%。所以使用Cache来缓存经常调用的方法，当调用方法时，优先在Cache查找，如果没有找到，再到methodLists查找。

### 关于元类（`meteClass`）及isa的补充：

核心规则：类的实例对象的`isa`指向该类；该类的`isa`指向该类的 metaclass。

通俗说法：成员方法记录在`class method-list`中，类方法记录在`metaClass`中。即`instance-object`的信息在`class-object`中，而`class-object`的信息在`metaClass`中。

各个类实例变量的继承关系：

> 每一个对象本质上都是一个类的实例。其中类定义了成员变量和成员方法的列表。对象通过对象的isa指针指向类。

> 每一个类本质上都是一个对象，类其实是元类（meteClass）的实例。元类定义了类方法的列表。类通过类的isa指针指向元类。

> 所有的元类最终继承一个根元类，根元类isa指针指向本身，形成一个封闭的内循环。

### 代码：
文章中的代码都可以从我的GitHub [`runtime_demo `](https://github.com/lettleprince/runtime_demo)找到。

