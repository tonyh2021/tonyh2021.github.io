---
layout: post
title: "Swift 扩展中使用存储属性"
description: ""
category: articles
tags: [Swift]
comments: true
---

Swift Extensions 的主要局限在于，没法添加存储属性。不过可以通过其他方案实现。

## 前言

Swift `Extensions` 可以为现有的类添加方法、结构体、枚举或协议，是比较常用的 Swift 特性之一。但是，Swift 没有直接实现在扩展中持有某些对象作为属性的功能。本文就是介绍怎样通过现在的 API 来实现我们想要的功能。

## 目标

举个例子，现在有扩展 `UISearchBar+QMUI`，需要存储属性 `qmui_usedAsTableHeaderView`，用来标记是否用作 `TableHeaderView`：

```swift
public var qmui_usedAsTableHeaderView: Bool?
```

编译时会报错误：

```swift
Extensions may not contain stored properties
```

很明显，Swift 不支持扩展中的存储属性。因此，无法使用 `qmui_usedAsTableHeaderView` 属性。

## 解决方案

联系到 OC 中的关联对象，很容易想到，是不是可以用 `objc_getAssociatedObject` 和 `objc_setAssociatedObject` 来存储与某个键相关联的对象。

#### [`objc_getAssociatedObject`](https://developer.apple.com/reference/objectivec/1418865-objc_getassociatedobject)

这个方法需要两个参数：

1. `object: Any!`：关联的源对象。这里一般是把 `self` 作为参数。

2. `key: UnsafeRawPointer!`：指向关联对象的键的指针。

3. `value: Any!`：关联对象。

4. `policy: objc_AssociationPolicy`：用于保存对象的策略。可以为：

 - `OBJC_ASSOCIATION_ASSIGN`：用弱引用保存对象，retain count 不会加一。

 - `OBJC_ASSOCIATION_RETAIN_NONATOMIC`：以非原子方式强引用对象。

 - `OBJC_ASSOCIATION_COPY_NONATOMIC`：以非原子方式复制对象。

 - `OBJC_ASSOCIATION_RETAIN`：以原子方式强引用对象。

 - `OBJC_ASSOCIATION_COPY`：以原子方式复制对象。

 注意：如果使用 OBJC_ASSOCIATION_ASSIGN 关联策略时要注意，文档中指出是弱引用，但不完全等同于 weak，更像是 unsafe_unretained 引用，关联对象被释放后，关联属性仍然保留被释放的地址，如果不小心访问关联属性，就会造成野指针访问出错。

接下来看代码：

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

`AssociatedKeys` 包含了关联的键。如果有多个关联键，可以这样用：

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

由于参数必须是指针（`UnsafeRawPointer`），所以使用 `&` 获取 `AssociatedKeys.kAnotherProperty` 的地址。

一般情况下以上代码就算 OK 啦。

不过，也可以使用泛型方法和默认值对 `objc_getAssociatedObject` 稍加重构：

```swift
func getAssociatedObject(_ key: UnsafeRawPointer!, defaultValue: T) -> T {
    guard let value = objc_getAssociatedObject(self, key) as? T else {
        return defaultValue
    }
    return value
}
```

于是代码变为：

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

全部代码：

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




