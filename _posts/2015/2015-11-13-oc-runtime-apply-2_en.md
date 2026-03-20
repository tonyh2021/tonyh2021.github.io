---
layout: post
title: "Objective-C Runtime in Practice 2"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Dictionary to Model

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

    // Iterate over the properties array
    for (NSString *key in properties) {
        // Check if the dictionary contains this key
        if (dict[key] != nil) {
            // Use KVC to set the value
            [obj setValue:dict[key] forKeyPath:key];
        }
    }

    return obj;
}

const char *propertiesKey = "propertiesKey";

+ (NSArray *)properties {
    // Check if an associated object already exists; if so, return it directly
    // Parameter 1: the object to associate with
    // Parameter 2: the key for the associated property
    // In OC, a class is essentially an object
    NSArray *plist = objc_getAssociatedObject(self, propertiesKey);
    if(plist != nil) {
        return plist;
    }
    // 1. Get the class's properties
    // Parameters: class and a pointer to the property count; returns an array of all properties
    unsigned int count = 0;// property count pointer
    objc_property_t *list = class_copyPropertyList([self class], &count);// returns an array of all properties
    // 2. Build the property name array
    NSMutableArray *arrayM = [NSMutableArray arrayWithCapacity:count];
    // 3. Iterate over the array
    for(unsigned int i = 0; i < count; ++i) {
        // Get the property
        objc_property_t pty = list[i];
        // Get the property name
        const char *cname = property_getName(pty);

//        printf("%s",cname);

        [arrayM addObject:[NSString stringWithUTF8String:cname]];
    }
//    printf("");

//    NSLog(@"%@",arrayM);

    free(list);// 4. Must free memory after using class_copyPropertyList

    // 5. Set the associated object
    // Parameter 1: the object to associate with
    // Parameter 2: the key for the associated object
    // Parameter 3: the property value
    // Ownership policy: retain / copy / assign
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

Output:

```
2016-02-23 18:48:22.022 runtime_demo[34262:4960140] stu的name值为: Tom, address为: Beijing
```

## Associated Objects

Let's jump straight to the code:

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

Output:

```
2016-02-23 17:46:25.424 runtime_demo[34075:4939529] myObj的属性property值为：Hi! AssociatedObject!
```

### Code
All code from this article can be found on my GitHub [`runtime_demo `](https://github.com/tonyh2021/runtime_demo).

