---
layout: post
title: "UIView Properties: weak or strong?"
description: ""
category: articles
tags: [iOS]
comments: true
---


I had always been using `weak` to qualify UIView properties in view controllers, but later noticed that some code does use `strong` for the same purpose. In fact, when I tried to initialize a view inside a block while using `weak`, I got a warning that only went away after switching to `strong`. It's worth understanding this properly, otherwise you'll never feel confident about the choice.

Many people, when explaining the difference between `weak` and `strong`, simply say: use `weak` for views and `strong` for models. Over time I've come to feel that this is increasingly inaccurate. `strong` for strong references is easy to understand; `weak`, on the other hand, was designed specifically to avoid retain cycles. The most typical retain cycle scenario arises when a view controller holds a reference to a view, and that view's `dataSource` or `delegate` is set back to the view controller.

![strong-weak](/images/posts/20160401-uiview-weak-strong/strong-weak-1.png)

Apple's [documentation](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/LoadingResources/CocoaNibs/CocoaNibs.html) states:

> Outlets should generally be weak, except for those from File's Owner to top-level objects in a nib file (or, in iOS, a storyboard scene) which should be strong. Outlets that you create should therefore typically be weak, because:...

Mattt Thompson's [article](http://nshipster.com/ibaction-iboutlet-iboutletcollection/) mentions:

> Spurious use of strong ownership on a view outlet has the potential to create a retain cycle.

And `raywenderlich`'s [article](https://www.raywenderlich.com/5773/beginning-arc-in-ios-5-tutorial-part-2):

> Weak is the recommended relationship for all *outlet* properties. These view objects are already part of the view controller's view hierarchy and don't need to be retained elsewhere. The big advantage of declaring your outlets weak is that it saves you time writing the viewDidUnload method.

There are only two cases where `strong` should be used:

> - Outlets that you create to subviews of a view controller's view or a window controller's window, for example, are arbitrary references between objects that do not imply ownership.
> - The strong outlets are frequently specified by framework classes (for example, UIViewController's view outlet, or NSWindowController's window outlet).

> Outlets should be changed to strong when the outlet should be considered to own the referenced object:

> - As indicated previously, this is often the case with File's Owner—top level objects in a nib file are frequently considered to be owned by the File's Owner.
> - You may in some situations need an object from a nib file to exist outside of its original container. For example, you might have an outlet for a view that can be temporarily removed from its initial view hierarchy and must therefore be maintained independently.

The gist of this is:

- If an IBOutlet object is directly owned by the nib/storyboard scene's File's Owner, then clearly the owner must `directly hold` a pointer to that object, so the property should be `strong`. All other IBOutlet properties should be `weak`, because the owner does not need to `directly hold` their pointers. For example, a UIViewController's `view` property is `strong` because the controller directly owns the view. Subviews added to that view only need to be `weak` as IBOutlets, since they are not directly owned by the controller — the controller's view owns them, and ARC handles memory management.

- Use `strong` when the controller needs to directly control a subview and add it to a different view tree.

My personal understanding is that when using storyboards or nibs, there is already a strong reference chain from the view controller to its view and then to its subviews. Therefore, `IBOutlet` properties dragged out from Interface Builder are best declared as `weak` to avoid any potential retain cycles.

What about views created in code? For example:

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

If you don't use `strong`, you'll get the following warning:

```
Assigning retained object to weak property; object will be released after assignment
```

In practice, as long as there is no retain cycle, declaring a view as `strong` is perfectly fine. When the view controller is deallocated, both `strong` and `weak` views will be properly released, as long as there is no retain cycle.

Finally, although I was reluctant to admit it, I found that in this highly-voted [Stack Overflow question](http://stackoverflow.com/questions/7678469/should-iboutlets-be-strong-or-weak-under-arc), the discussion took an interesting turn. The accepted answer notes:

> I asked about this on Twitter to an engineer on the IB team and he confirmed that strong should be the default and that the developer docs are being updated.

[https://twitter.com/_danielhall/status/620716996326350848](https://twitter.com/_danielhall/status/620716996326350848)
[https://twitter.com/_danielhall/status/620717252216623104](https://twitter.com/_danielhall/status/620716996326350848)

This further supports the general safety of declaring view properties as `strong`. There is no one-size-fits-all answer to the `weak` vs `strong` question — `weak` is primarily used to avoid potential retain cycles, not as a blanket rule for view properties.
