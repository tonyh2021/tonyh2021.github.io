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

补充：

OC 下的重写 delegate 的做法，思路：

1. 将 delegate 赋值给 myDelegate；

2. 将父类的代理设置成子类自己。

代理方法调用时，会通过 `methodSignatureForSelector` 寻找自己有没有方法签名，自己若没有，则查看 myDelegate 有没有实现。将签名返回给系统，系统会将 methodSignatureForSelector 获取到的方法签名包装成 Invocation 传入 `forwardInvocation`，如果 myDelegate 实现了代理方法，则将调用。

调用父类的代理方法时，会先走 `respondsToSelector` 方法，判断是否实现了传进来的 SEL。如果实现了，则会再走 `methodSignatureForSelector` 和 `forwardInvocation`。

```objc
@interface MyOCScrollView () <MyOCScrollViewDelegate, UIScrollViewDelegate>

@property(nonatomic, weak)  id <MyOCScrollViewDelegate> myDelegate;

//...

@end

@implementation MyOCScrollView

@dynamic delegate;

//...

- (void)setDelegate:(id<MyOCScrollViewDelegate>)delegate {
    self.myDelegate = delegate != self ? delegate : nil;
    [super setDelegate:delegate ? self : nil];
}

/**
 尝试获得一个方法签名
 */
- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector {
    NSMethodSignature *a = [super methodSignatureForSelector:aSelector];
    NSMethodSignature *b = [(id)self.myDelegate methodSignatureForSelector:aSelector];
    NSMethodSignature *result = a ? a : b;
    return result;
}

- (void)forwardInvocation:(NSInvocation *)anInvocation {
    if ([(id)self.myDelegate respondsToSelector:anInvocation.selector]) {
        [anInvocation invokeWithTarget:(id)self.myDelegate];
    }
}

/**
 只要自己或代理实现了代理方法，就返回 YES
 */
- (BOOL)respondsToSelector:(SEL)aSelector {
    BOOL a = [super respondsToSelector:aSelector];
    BOOL c = [self.myDelegate respondsToSelector:aSelector];
    BOOL result = a || c;
    return result;
}

@end
```

注：`MyOCScrollView` 也遵守了 `<MyOCScrollViewDelegate>` 协议，我感觉是为了避免 `self.myDelegate = delegate != self ? delegate : nil;` 的警告，但是这样一来，`NSMethodSignature *a = [super methodSignatureForSelector:aSelector];`永远都会返回非 nil 的对象。如此的话，直接在 `forwardInvocation` 中判断调用即可。所以可以将 `<MyOCScrollViewDelegate>` 去掉，然后改为 `self.myDelegate = (id)delegate != self ? delegate : nil;`，经测试也没有问题。这样流程走起来更容易理解。













