---
layout: post
title: "Objective-C的runtime应用2"
description: ""
category: articles
tags: [runtime]
comments: true
---

## 字典转模型

`Student.h`

```objc
#import <Foundation/Foundation.h>

@interface Student : NSObject

@property (nonatomic, copy) NSString *name;

@property (nonatomic, copy) NSString *address;

@end
```

`NSObject+Extension.h`

```objc
#import <Foundation/Foundation.h>

@interface NSObject (Extension)

+ (instancetype)objectWithDict:(NSDictionary *)dict;

@end
```

`NSObject+Extension.m`

```objc
#import "NSObject+Extension.h"
#import <objc/runtime.h>

@implementation NSObject (Extension)

+ (instancetype)objectWithDict:(NSDictionary *)dict {
    id obj = [[self alloc] init];
    
    //    [obj setValuesForKeysWithDictionary:dict];
    NSArray *properties = [self properties];
    
    // 遍历属性数组
    for (NSString *key in properties) {
        // 判断字典中是否包含这个key
        if (dict[key] != nil) {
            // 使用 KVC 设置数值
            [obj setValue:dict[key] forKeyPath:key];
        }
    }
    
    return obj;
}

const char *propertiesKey = "propertiesKey";

+ (NSArray *)properties {
    //判断是否处存在关联对象，如果存在直接返回
    //参数一 关联到对象
    //参数二 关联的属性key
    //在oc 中 类的本质就是一个对象
    NSArray *plist = objc_getAssociatedObject(self, propertiesKey);
    if(plist != nil) {
        return plist;
    }
    //1.获取类的属性
    //参数是类和属性的计数指针  返回值是所有属性的数组
    unsigned int count = 0;//属性的计数指针
    objc_property_t *list = class_copyPropertyList([self class], &count);//返回值是所有属性的数组
    //2.取得属性名数组
    NSMutableArray *arrayM = [NSMutableArray arrayWithCapacity:count];
    //3.遍历数组
    for(unsigned int i = 0; i < count; ++i) {
        //获取到属性
        objc_property_t pty = list[i];
        //获取属性的名称
        const char *cname = property_getName(pty);
        
//        printf("%s",cname);
        
        [arrayM addObject:[NSString stringWithUTF8String:cname]];
    }
//    printf("");
    
//    NSLog(@"%@",arrayM);

    free(list);//4.用了class_copyPropertyList方法一定要释放

    //5.设置关联对象
    //参数1>关联的对象
    //参数2>关联对象的key
    //参数3>属性数值
    //属性的持有方式 retain copy assign
    objc_setAssociatedObject(self, propertiesKey, arrayM, OBJC_ASSOCIATION_COPY_NONATOMIC);

    return arrayM.copy;
}
@end
```

`ViewController.m`

```objc

- (void)dict2Object {
    Student *stu = [Student objectWithDict:@{@"name" : @"Tom", @"address" : @"Beijing"}];
    NSLog(@"stu的name值为: %@, address为: %@" , stu.name, stu.address);
}
```

代码输出：

```
2016-02-23 18:48:22.022 runtime_demo[34262:4960140] stu的name值为: Tom, address为: Beijing
```

## 关联对象

直接上代码：

`MyClass+AssociatedObjectTest.h`

```objc
#import "MyClass.h"

@interface MyClass (AssociatedObjectTest)

@property (nonatomic, copy) NSString *property;

@end
```

`MyClass+AssociatedObjectTest.m`

```objc
#import "MyClass+AssociatedObjectTest.h"
#import <objc/runtime.h>

@implementation MyClass (AssociatedObjectTest)

static char MyClassKey;

- (void)setProperty:(NSString *)property {
    [self willChangeValueForKey:@"MyClassKey"];
    objc_setAssociatedObject(self, &MyClassKey,
                             property,
                             OBJC_ASSOCIATION_COPY);
    [self didChangeValueForKey:@"MyClassKey"];
}

- (NSString *)property {
    return objc_getAssociatedObject(self, &MyClassKey);
}

@end
```

`ViewController.m`

```objc

- (void)testAssociatedObject {
    MyClass *myObj = [[MyClass alloc] init];
    myObj.property = @"Hi! AssociatedObject!";
    NSLog(@"myObj的属性property值为：%@", myObj.property);
}
```

代码输出：

```
2016-02-23 17:46:25.424 runtime_demo[34075:4939529] myObj的属性property值为：Hi! AssociatedObject!
```

### 代码：
文章中的代码都可以从我的GitHub [`runtime_demo `](https://github.com/tonyh2021/runtime_demo)找到。

