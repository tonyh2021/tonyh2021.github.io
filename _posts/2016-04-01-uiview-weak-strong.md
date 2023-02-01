---
layout: post
title: "UIView属性用weak还是strong？"
description: ""
category: articles
tags: [iOS]
comments: true
---


之前一直在使用weak来修饰控制器中UIView的属性，后来发现有些代码中的确在使用strong修饰。而且使用weak修饰view，然后在代码块中初始化view时遇到了警告，改为strong才会消除。有必要弄清楚，不然用起来心里没底。

很多人在讲解weak和strong的区别时，只会说，weak用于视图的引用，strong用于模型的引用。慢慢的觉得这样的说法越来越不准确。strong用于强引用，很容易被理解；而weak设计的初衷是为了避免循环引用的问题，最典型的循环引用是来自于vc持有view属性而view的dataSource或delegate被设置为vc的情景。

![strong-weak](https://tonyh2021.github.io/images/20160401-uiview-weak-strong/strong-weak-1.png)

在Apple的[文档](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/LoadingResources/CocoaNibs/CocoaNibs.html)中提到：

> Outlets should generally be weak, except for those from File’s Owner to top-level objects in a nib file (or, in iOS, a storyboard scene) which should be strong. Outlets that you create should therefore typically be weak, because:...


在Mattt大神的这片[文章](http://nshipster.com/ibaction-iboutlet-iboutletcollection/)中提到：

> Spurious use of strong ownership on a view outlet has the potential to create a retain cycle.

以及`raywenderlich`的[文章](https://www.raywenderlich.com/5773/beginning-arc-in-ios-5-tutorial-part-2)：

> Weak is the recommended relationship for all *outlet* properties. These view objects are already part of the view controller’s view hierarchy and don’t need to be retained elsewhere. The big advantage of declaring your outlets weak is that it saves you time writing the viewDidUnload method.

只有两种可能是使用strong：

> - Outlets that you create to subviews of a view controller’s view or a window controller’s window, for example, are arbitrary references between objects that do not imply ownership.
> - The strong outlets are frequently specified by framework classes (for example, UIViewController’s view outlet, or NSWindowController’s window outlet).

> Outlets should be changed to strong when the outlet should be considered to own the referenced object:

> - As indicated previously, this is often the case with File’s Owner—top level objects in a nib file are frequently considered to be owned by the File’s Owner.
> - You may in some situations need an object from a nib file to exist outside of its original container. For example, you might have an outlet for a view that can be temporarily removed from its initial view hierarchy and must therefore be maintained independently.

大致的意思是说：

- 如果IBOutlet对象是nib/storyboard scene的拥有者（File’s owner）所直接持有的对象，那么很显然拥有者必须`直接拥有`对象的指针，因此属性应设置为strong。而其他的IBOutlet对象的属性需要设置为weak，因为拥有者并不需要`直接拥有`它们的指针。举例来说，UIViewController的view属性是strong，因为controller要直接拥有view。而添加到view上的subviews，作为IBOutlet只需要设置为weak就可以了，因为他们不是controller直接拥有的。直接拥有subviews的是controller的view，ARC会帮助管理内存。

- 控制器需要直接控制某一个子视图并且将子视图添加到其他的view tree上去，此时需要strong。

个人的理解是，在使用storyboard或nib时，从vc到vc持有的视图，到其子视图的持有链已经是强引用了，所以在拖拽出来的`IBOutlet`属性最好使用weak来修饰以避免循环引用的可能性。


不过在用代码创建视图的情况下呢？比如：

```
self.strongView = ({
   UIView *strongView = [UIView new];
   [self.view addSubview:strongView];
   [strongView mas_makeConstraints:^(MASConstraintMaker *make) {
       make.left.top.equalTo(self.view).offset(64);
       make.height.width.equalTo(@80);
   }];
   strongView.backgroundColor = XTRandomColor;
   strongView;
});
```

如果不使用strong属性，则会有警告错误。

```
Assigning retained object to weak property; object will be released after assignment
```

事实上，只要不存在循环引用的问题，视图被声明成为strong也是没有问题的，在控制器被销毁时，无论是strong还是weak，只要不存在循环引用，子视图是可以被正常销毁的。

在最后，虽然我很不愿意承认，但我的确发现，在stackoverflow votes相当高的[这个问题](http://stackoverflow.com/questions/7678469/should-iboutlets-be-strong-or-weak-under-arc)中，讨论出现了逆转，被采纳的答案提到：

> I asked about this on Twitter to an engineer on the IB team and he confirmed that strong should be the default and that the developer docs are being updated.

[https://twitter.com/_danielhall/status/620716996326350848](https://twitter.com/_danielhall/status/620716996326350848)
[https://twitter.com/_danielhall/status/620717252216623104](https://twitter.com/_danielhall/status/620716996326350848)

这也支撑了使用strong声明视图属性在一般情况下的安全性。对于weak还是strong的使用其实没有一刀切的答案，weak主要用来避免可能出现的循环引用，而不是为了去声明视图属性。








