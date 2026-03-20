---
layout: post
title: "Overriding the Delegate Property of UIScrollView Like UICollectionView Does"
description: ""
category: articles
tags: [iOS]
comments: true
---


`UIScrollView` has a delegate property typed as `UIScrollViewDelegate`:

```swift
public protocol UIScrollViewDelegate : NSObjectProtocol {
    //...
}
open class UIScrollView : UIView, NSCoding {
    weak open var delegate: UIScrollViewDelegate?
    //...
}
```

`UICollectionView` overrides this property, but uses `UICollectionViewDelegate` instead:

```swift
public protocol UICollectionViewDelegate : UIScrollViewDelegate {
   //...
}

open class UICollectionView : UIScrollView, UIDataSourceTranslating {
    weak open var delegate: UICollectionViewDelegate?
    //...
}
```

However, when you try to override the `UIScrollView` delegate with a custom protocol in the same way:

```swift
protocol MyScrollViewDelegate : UIScrollViewDelegate {
    //...
}

class MyScrollView: UIScrollView {
    weak open var delegate: MyScrollViewDelegate?
    //...
}
```

You get a compiler error:

```swift
Property 'delegate' with type 'MyScrollViewDelegate?' cannot override a property with type 'UIScrollViewDelegate?'
```

So how can a custom `UIScrollView` subclass override the delegate property?

The answer is `didSet`.

```swift
private weak var myDelegate: MyScrollViewDelegate? = nil

override var delegate: UIScrollViewDelegate? {
    didSet {
        myDelegate = delegate as? MyScrollViewDelegate
    }
}
```

Supplementary note:

The Objective-C approach to overriding `delegate` works as follows:

1. Assign `delegate` to `myDelegate`.

2. Set the superclass's delegate to the subclass itself.

When a delegate method is called, the runtime looks for a method signature via `methodSignatureForSelector`. If the subclass doesn't implement it, it checks whether `myDelegate` does. The signature is returned to the system, which wraps it into an `NSInvocation` and passes it to `forwardInvocation`. If `myDelegate` implements the delegate method, it will be called.

When calling the superclass's delegate methods, `respondsToSelector` is called first to check whether the given `SEL` is implemented. If it is, the runtime proceeds to `methodSignatureForSelector` and `forwardInvocation`.

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
 Attempt to obtain a method signature
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
 Returns YES if either self or the delegate implements the given selector
 */
- (BOOL)respondsToSelector:(SEL)aSelector {
    BOOL a = [super respondsToSelector:aSelector];
    BOOL c = [self.myDelegate respondsToSelector:aSelector];
    BOOL result = a || c;
    return result;
}

@end
```

Note: `MyOCScrollView` also conforms to `<MyOCScrollViewDelegate>`, which I believe is to suppress the warning in `self.myDelegate = delegate != self ? delegate : nil;`. However, this means `NSMethodSignature *a = [super methodSignatureForSelector:aSelector];` will always return a non-nil object. In that case, you can simply check in `forwardInvocation` whether to forward the call. You could remove the `<MyOCScrollViewDelegate>` conformance and change the assignment to `self.myDelegate = (id)delegate != self ? delegate : nil;` — testing confirms this works fine as well, and the flow becomes easier to understand.
