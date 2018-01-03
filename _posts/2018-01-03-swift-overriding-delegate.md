---
layout: post
title: "像 UICollectionView 一样重写 UIScrollView 的代理属性"
description: ""
category: articles
tags: [Swift]
comments: true
---


UIScrollView 有包含一个 UIScrollViewDelegate 的代理属性：

```swift
public protocol UIScrollViewDelegate : NSObjectProtocol {
    //...
}
open class UIScrollView : UIView, NSCoding {
    weak open var delegate: UIScrollViewDelegate?
    //...
}
```

而 UICollectionView 重写了这个属性，但是用的是 UICollectionViewDelegate：

```swift
public protocol UICollectionViewDelegate : UIScrollViewDelegate {
   //...
}

open class UICollectionView : UIScrollView, UIDataSourceTranslating {
    weak open var delegate: UICollectionViewDelegate?
    //...
}
```

但是当尝试用自定义协议覆盖 UIScrollViews 代理，如下所示：

```swift
protocol MyScrollViewDelegate : UIScrollViewDelegate {
    //...
}

class MyScrollView: UIScrollView {
    weak open var delegate: MyScrollViewDelegate?
    //...
}
```

出现了错误：

```swift
Property 'delegate' with type 'MyScrollViewDelegate?' cannot override a property with type 'UIScrollViewDelegate?'
```

自定义的 UIScrollView 子类如何重写代理属性呢？

答案就是 `didSet`。

```swift
private weak var myDelegate: MyScrollViewDelegate? = nil

override var delegate: UIScrollViewDelegate? {
    didSet {
        myDelegate = delegate as? MyScrollViewDelegate
    }
}
```
















