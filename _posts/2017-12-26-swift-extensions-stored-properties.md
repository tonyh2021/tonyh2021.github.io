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

举个例子，现在有协议 `ToggleProtocol`，包含一个方法 `toggle`。然后让 `UIButton` 实现此协议，根据切换的状态更改背景图像：

```swift
protocol ToggleProtocol {
    func toggle()
}
 
enum ToggleState {
    case on
    case off
}
 
extension UIButton: ToggleProtocol {
 
    private(set) var toggleState = ToggleState.off
 
    func toggle() {
        toggleState = toggleState == .on ? .off : .on
 
        if toggleState == .on {
            // Shows background for status on
        } else {
            // Shows background for status off
        }
    }
}
```

编译时会报错误：

```swift
Extensions may not contain stored properties
```

很明显，Swift 不支持扩展中的存储属性。因此，无法使用 `toggleState` 属性来保持切换按钮的内部状态。

## 解决方案

联系到 OC 中的关联对象，很容易想到，是不是有 `objc_getAssociatedObject` 和 `objc_setAssociatedObject` 可以用来存储与某个键相关联的对象。

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

接下来看代码：

```swift
struct AssociatedKeys {
    static var toggleState: UInt8 = 0
}
 
protocol ToggleProtocol {
    func toggle()
}
 
enum ToggleState {
    case on
    case off
}
 
extension UIButton: ToggleProtocol {
 
    private(set) var toggleState: ToggleState {
        get {
            guard let value = objc_getAssociatedObject(self, &AssociatedKeys.toggleState) as? ToggleState else {
                return .off
            }
            return value
        }
        set(newValue) {
            objc_setAssociatedObject(self, &AssociatedKeys.toggleState, newValue, objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
 
    func toggle() {
        toggleState = toggleState == .on ? .off : .on
 
        if toggleState == .on {
            // Shows background for status on
        } else {
            // Shows background for status off
        }
    }
}
```

`AssociatedKeys` 包含了关联的键。如果有多个关联键，可以这样用：

```swift
struct AssociatedKeys {
    static var toggleState: UInt8 = 0
    static var anotherState: UInt8 = 0
}
 
extension UIButton: ToggleProtocol {
    // ...
 
    private(set) var anotherState: ToggleState {
        get {
            guard let value = objc_getAssociatedObject(self, &AssociatedKeys.anotherState) as? ToggleState else {
                return .off
            }
            return value
        }
        set(newValue) {
            objc_setAssociatedObject(self, &AssociatedKeys.anotherState, newValue, objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
 
    // ...
}
```

由于参数必须是指针（`UnsafeRawPointer`），所以使用 `&` 获取 `AssociatedKeys.toggleState` 的地址。

另外，可以使用泛型方法和默认值对 `objc_getAssociatedObject` 稍加重构：

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
private var toggleState: ToggleState {
    get {
        return getAssociatedObject(&CustomProperties.toggleState, defaultValue: CustomProperties.toggleState)
    }
    set {
        return objc_setAssociatedObject(self, &CustomProperties.toggleState, newValue, .OBJC_ASSOCIATION_RETAIN)
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
 
protocol ToggleProtocol {
    func toggle()
}
 
enum ToggleState {
    case on
    case off
}
 
extension UIButton: ToggleProtocol, PropertyStoring {
 
    typealias T = ToggleState
 
    private struct CustomProperties {
        static var toggleState = ToggleState.off
    }
 
    var toggleState: ToggleState {
        get {
            return getAssociatedObject(&CustomProperties.toggleState, defaultValue: CustomProperties.toggleState)
        }
        set {
            return objc_setAssociatedObject(self, &CustomProperties.toggleState, newValue, .OBJC_ASSOCIATION_RETAIN)
        }
    }
 
    func toggle() {
        toggleState = toggleState == .on ? .off : .on
 
        if toggleState == .on {
            // Shows background for status on
        } else {
            // Shows background for status off
        }
    }
}
 
let a = UIButton()
print(a.toggleState)
a.toggleState = .on
print(a.toggleState)
```




