---
layout: post
title: "Using Stored Properties in Swift Extensions"
description: ""
category: articles
tags: [iOS]
comments: true
---

The main limitation of Swift Extensions is that stored properties cannot be added directly. However, there are alternative approaches to achieve this.

## Background

Swift `Extensions` can add methods, structs, enums, or protocols to existing classes, and are one of the more commonly used Swift features. However, Swift does not natively support holding objects as stored properties in extensions. This post explains how to implement this using the existing APIs.

## Goal

As an example, suppose we have an extension `UISearchBar+QMUI` that needs a stored property `qmui_usedAsTableHeaderView` to indicate whether the search bar is being used as a `TableHeaderView`:

```swift
public var qmui_usedAsTableHeaderView: Bool?
```

At compile time, this causes an error:

```swift
Extensions may not contain stored properties
```

Clearly, Swift does not support stored properties in extensions. So we cannot use `qmui_usedAsTableHeaderView` as a stored property directly.

## Solution

Thinking back to associated objects in Objective-C, it's natural to consider using `objc_getAssociatedObject` and `objc_setAssociatedObject` to store objects associated with a specific key.

#### [`objc_getAssociatedObject`](https://developer.apple.com/reference/objectivec/1418865-objc_getassociatedobject)

This method requires two parameters (and `objc_setAssociatedObject` requires four):

1. `object: Any!`: The source object for the association. Typically `self` is passed here.

2. `key: UnsafeRawPointer!`: A pointer to the key for the associated object.

3. `value: Any!`: The associated object.

4. `policy: objc_AssociationPolicy`: The policy for storing the object. Options include:

 - `OBJC_ASSOCIATION_ASSIGN`: Saves the object with a weak reference; retain count is not incremented.

 - `OBJC_ASSOCIATION_RETAIN_NONATOMIC`: Strongly references the object non-atomically.

 - `OBJC_ASSOCIATION_COPY_NONATOMIC`: Copies the object non-atomically.

 - `OBJC_ASSOCIATION_RETAIN`: Strongly references the object atomically.

 - `OBJC_ASSOCIATION_COPY`: Copies the object atomically.

 Note: Be careful when using the `OBJC_ASSOCIATION_ASSIGN` policy. The documentation says it uses a weak reference, but it is not exactly equivalent to `weak` — it is more like an `unsafe_unretained` reference. After the associated object is deallocated, the property still retains the deallocated address. Accessing it carelessly can result in a dangling pointer error.

Here is the code:

```swift
private struct AssociatedKeys {
    static var kUsedAsTableHeaderView = "kUsedAsTableHeaderView"
}

public var qmui_usedAsTableHeaderView: Bool? {
    get {
        return objc_getAssociatedObject(self, &AssociatedKeys.kUsedAsTableHeaderView) as? Bool ?? false
    }
    set {
        if let value = newValue {
            objc_setAssociatedObject(self, &AssociatedKeys.kUsedAsTableHeaderView, value, .Bool OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
}
```

`AssociatedKeys` contains the associated keys. If there are multiple associated keys, use it like this:

```swift
struct AssociatedKeys {
    static var kUsedAsTableHeaderView = "kUsedAsTableHeaderView"
    static var kAnotherProperty = "kAnotherProperty"
}

extension UISearchBar {
    // ...

    public var anotherProperty: Bool? {
        get {
            return objc_getAssociatedObject(self, &AssociatedKeys.kAnotherProperty) as? Bool
        }
        set {
            if let value = newValue {
                objc_setAssociatedObject(self, &AssociatedKeys.kAnotherProperty, value, .Bool OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
        }
    }

    // ...
}
```

Since the parameter must be a pointer (`UnsafeRawPointer`), we use `&` to get the address of `AssociatedKeys.kAnotherProperty`.

In most cases, the above code is sufficient.

However, you can also refactor `objc_getAssociatedObject` slightly using a generic method with a default value:

```swift
func getAssociatedObject(_ key: UnsafeRawPointer!, defaultValue: T) -> T {
    guard let value = objc_getAssociatedObject(self, key) as? T else {
        return defaultValue
    }
    return value
}
```

With this, the code becomes:

```swift
public var qmui_usedAsTableHeaderView: Bool? {
    get {
        return getAssociatedObject(&AssociatedKeys.kUsedAsTableHeaderView, defaultValue: false)
    }
    set {
        if let value = newValue {
            objc_setAssociatedObject(self, &AssociatedKeys.kUsedAsTableHeaderView, value, .Bool OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
}
```

Complete code:

```swift
protocol PropertyStoring {

    associatedtype T

    func getAssociatedObject(_ key: UnsafeRawPointer!, defaultValue: T) -> T
}

extension PropertyStoring {
    func getAssociatedObject(_ key: UnsafeRawPointer!, defaultValue: T) -> T {
        guard let value = objc_getAssociatedObject(self, key) as? T else {
            return defaultValue
        }
        return value
    }
}

extension UISearchBar: PropertyStoring {

    typealias T = Bool

    private struct AssociatedKeys {
        static var kUsedAsTableHeaderView = "kUsedAsTableHeaderView"
    }

    public var qmui_usedAsTableHeaderView: Bool? {
        get {
            return getAssociatedObject(&AssociatedKeys.kUsedAsTableHeaderView, defaultValue: false)
        }
        set {
            if let value = newValue {
                objc_setAssociatedObject(self, &AssociatedKeys.kUsedAsTableHeaderView, value, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
        }
    }
}
```
