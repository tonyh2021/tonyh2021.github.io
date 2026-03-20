---
layout: post
title: Deep Copy and Shallow Copy in iOS
description:
category: articles
tags: iOS
comments: true
---

Whether dealing with collection objects or non-collection objects, when they receive `copy` and `mutableCopy` messages, the following rules apply:

- `copy` returns an `immutable` object. Therefore, calling mutable interface methods on a `copy` return value will cause a crash.
- `mutableCopy` returns a `mutable` object.

### `copy` and `mutableCopy` for Non-Collection Objects

Non-collection system objects refer to types like `NSString` and `NSNumber`. Let's start with an example of copying an `immutable` non-collection object:

```objc
NSString *string = @"origin";
NSString *stringCopy = [string copy];
NSMutableString *stringMCopy = [string mutableCopy];

NSLog(@"%p", string);
NSLog(@"%p", stringCopy);
NSLog(@"%p", stringMCopy);
```

```objc
2016-03-10 17:32:04.479 Homework[21715:2353641] 0x1000d0ea0
2016-03-10 17:32:04.481 Homework[21715:2353641] 0x1000d0ea0
2016-03-10 17:32:04.481 Homework[21715:2353641] 0x17006fe40
```

By examining the memory addresses, we can see that `stringCopy` and `string` share the same address — this is a pointer copy. `stringMCopy`, however, has a different address from `string`, indicating a content copy.

Now let's look at copying a `mutable` object:

```objc
NSMutableString *string      = [NSMutableString stringWithString: @"origin"];
//copy
NSString *stringCopy         = [string copy];
NSMutableString *mStringCopy = [string copy];
NSMutableString *stringMCopy = [string mutableCopy];

NSLog(@"%p", string);
NSLog(@"%p", stringCopy);
NSLog(@"%p", mStringCopy);
NSLog(@"%p", stringMCopy);
```

```objc
2016-03-10 17:34:11.486 Homework[21728:2354359] 0x17426f800
2016-03-10 17:34:11.487 Homework[21728:2354359] 0x174230600
2016-03-10 17:34:11.487 Homework[21728:2354359] 0x1742306e0
2016-03-10 17:34:11.487 Homework[21728:2354359] 0x174267240
```

```objc
//change value
[mStringCopy appendString:@"mm"]; //crash
[string appendString:@" origion!"];
[stringMCopy appendString:@"!!"];
```

The crash occurs because `copy` returns an `immutable` object. After commenting out that line, running the code shows that all four objects — `string`, `stringCopy`, `mStringCopy`, and `stringMCopy` — have different memory addresses, meaning all of them performed content copies.

> **For non-collection objects: performing `copy` on an `immutable` object is a pointer copy; `mutableCopy` is a content copy. Both `copy` and `mutableCopy` on a `mutable` object are content copies. In short:**
>
> - [immutableObject copy] // Shallow copy
>
> - [immutableObject mutableCopy] // Deep copy
>
> - [mutableObject copy] // Deep copy
>
> - [mutableObject mutableCopy] // Deep copy

### `copy` and `mutableCopy` for Collection Objects

Collection objects refer to types like `NSArray`, `NSDictionary`, and `NSSet`. Let's start with an example of using `copy` and `mutableCopy` on an `immutable` collection:

```objc
NSArray *array = @[@[@"a", @"b"], @[@"c", @"d"]];
NSArray *copyArray = [array copy];
NSMutableArray *mCopyArray = [array mutableCopy];

NSLog(@"%p", array);
NSLog(@"%p", copyArray);
NSLog(@"%p", mCopyArray);
```

```objc
2016-03-10 17:53:40.113 Homework[21775:2358227] 0x17403f040
2016-03-10 17:53:40.114 Homework[21775:2358227] 0x17403f040
2016-03-10 17:53:40.114 Homework[21775:2358227] 0x174247e60
```

We can see that `copyArray` and `array` share the same address, while `mCopyArray` and `array` have different addresses. This means `copy` performed a pointer copy, and `mutableCopy` performed a content copy. However, it's important to note: this content copy only copies the `array` object itself — the elements inside the array are still pointer copies. This is quite similar to the immutable non-collection case. Let's check whether the same holds for `mutable` collections:

```objc
NSMutableArray *array = [NSMutableArray arrayWithObjects:[NSMutableString stringWithString:@"a"],@"b",@"c",nil];
NSArray *copyArray = [array copy];
NSMutableArray *mCopyArray = [array mutableCopy];

NSLog(@"%p", array);
NSLog(@"%p", copyArray);
NSLog(@"%p", mCopyArray);
```

```objc
2016-03-10 17:54:39.114 Homework[21782:2358605] 0x170058e40
2016-03-10 17:54:39.115 Homework[21782:2358605] 0x170058ed0
2016-03-10 17:54:39.115 Homework[21782:2358605] 0x170058ea0
```

As expected, `copyArray`, `mCopyArray`, and `array` all have different addresses, confirming that both `copyArray` and `mCopyArray` performed content copies of `array`. We can therefore conclude:

> **For collection objects: `copy` on an `immutable` object is a pointer copy; `mutableCopy` is a content copy. Both `copy` and `mutableCopy` on a `mutable` object are content copies. However: the content copy only applies to the collection object itself — its elements remain pointer copies. In short:**
>
> [immutableObject copy] // Shallow copy
> [immutableObject mutableCopy] // One-level-deep copy
> [mutableObject copy] // One-level-deep copy
> [mutableObject mutableCopy] // One-level-deep copy

This conclusion is very similar to the non-collection case. But what if you need to copy the elements inside the collection? If you have a multi-level array and perform a content copy on only the first level while the other levels remain pointer copies, is this a deep copy or a shallow copy? On this topic, the [Apple documentation](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/Collections/Articles/Copying.html) states:

> This kind of copy is only capable of producing a one-level-deep copy. If you only need a one-level-deep copy, you can explicitly call for one as in Listing 2

> **Listing 2**  Making a deep copy

```objc
NSArray *deepCopyArray=[[NSArray alloc] initWithArray:someArray copyItems:YES];
```

> This technique applies to the other collections as well. Use the collection's equivalent of initWithArray:copyItems: with YES as the second parameter.

Apple considers this type of copy not a true deep copy, calling it instead a one-level-deep copy.

> If you need a true deep copy, such as when you have an array of arrays, you can archive and then unarchive the collection, provided the contents all conform to the NSCoding protocol. An example of this technique is shown in Listing 3.

**Listing 3**  A true deep copy

For a truly complete copy, you need:

```objc
NSArray* trueDeepCopyArray = [NSKeyedUnarchiver unarchiveObjectWithData:
          [NSKeyedArchiver archivedDataWithRootObject:oldArray]];
```

Summary:

- **Shallow copy**: Every level of the copied object is a pointer copy.

- **Deep copy (one-level-deep)**: At least one level of the copied object is a content copy.

- **True deep copy (real-deep copy)**: Every level of the copied object is a content copy.

Additional note:

```objc
NSString *str = @"string";
NSLog(@"%p", str);

str = @"newString";
NSLog(@"%p", str);
```

```objc
2016-03-10 17:58:02.152 Homework[21794:2359359] 0x1000f8ea0
2016-03-10 17:58:02.154 Homework[21794:2359359] 0x1000f8ee0
```

Here, the memory address is being changed. The second line should be understood as: `@"newString"` is a new object, and its memory address is assigned to `str`.

Reference:
[Deep Copy and Shallow Copy in iOS Collections](https://www.zybuluo.com/MicroCai/note/50592)

