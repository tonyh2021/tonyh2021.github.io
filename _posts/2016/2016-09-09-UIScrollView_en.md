---
layout: post
title: "UIScrollView Reference"
description: ""
category: articles
tags: [iOS]
comments: true
---

This article covers only scrolling-related content.

### Key UIScrollView Properties

- `tracking`: Returns YES when the user has touched but has not yet started dragging.

- `dragging`: Returns YES when the user has been scrolling for a short time or distance.

- `decelerating`: Returns YES when the user has lifted their finger but the scroll view is still coasting.

### UIScrollView Delegate Methods

- `- (void)scrollViewDidScroll:(UIScrollView *)scrollView`: Called whenever the `contentOffset` changes by any means (user dragging, deceleration, or programmatic changes). Use this to monitor `contentOffset` changes and adjust other views in response.

- `- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView`: Called when the user begins dragging the scroll view. May be called after a short delay or distance.

- `- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset`: Called when the user lifts their finger. `velocity` represents the scroll speed, with positive/negative values indicating direction (up/down). `targetContentOffset` is the position where scrolling will come to rest. Notably, `targetContentOffset` is a pointer — you can modify the deceleration destination, which is very useful for implementing certain effects. Access or modify it via `targetContentOffset->y`.

- `- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate`: Called after the user finishes dragging. If `decelerate` is YES, there will be a deceleration phase after the drag ends. Note: after `didEndDragging`, if there is a deceleration phase, `scrollView.dragging` is not immediately set to NO — it stays YES until deceleration ends. The actual semantic of the `dragging` property is therefore closer to `scrolling`.

- `- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView`: Called just before the deceleration animation begins.

- `- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView`: Called when the deceleration animation ends. Special case: if the user drags the scroll view again before a deceleration animation has finished, `didEndDecelerating` will not be called, and at that point both `dragging` and `decelerating` are YES. If the new drag has velocity, `willBeginDecelerating` will be called again, followed by `didEndDecelerating`. If the new drag has no velocity, `willBeginDecelerating` will not be called, but the `didEndDecelerating` left over from the previous deceleration will fire.

- `- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView`: Called when a programmatic scroll animation ends (via `setContentOffset(_:animated:)` or `scrollRectVisible(_:animated:)`). This method is called if and only if an animation was involved.

### User Scroll Sequence

```objc
//User begins touching and dragging
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDragging:]

//Scrolling in progress, called multiple times
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//User is about to stop dragging
OCDemo[82268:532649] -[ViewController scrollViewWillEndDragging:withVelocity:targetContentOffset:]

//User has stopped dragging
OCDemo[82268:532649] -[ViewController scrollViewDidEndDragging:willDecelerate:]

//Deceleration begins
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDecelerating:]

//Scrolling in progress during deceleration, called multiple times
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//Deceleration ends
OCDemo[82268:532649] -[ViewController scrollViewDidEndDecelerating:]
```

### User Touches Again During Deceleration

```objc
//User begins touching and dragging
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDragging:]

//Scrolling in progress, called multiple times
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//User is about to stop dragging
OCDemo[82268:532649] -[ViewController scrollViewWillEndDragging:withVelocity:targetContentOffset:]

//User has stopped dragging
OCDemo[82268:532649] -[ViewController scrollViewDidEndDragging:willDecelerate:]

//Deceleration begins
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDecelerating:]

//Scrolling in progress during deceleration, called multiple times
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//User touches and drags again during deceleration
OCDemo[82406:539968] -[ViewController scrollViewWillBeginDragging:]

//User is about to stop dragging
OCDemo[82406:539968] -[ViewController scrollViewWillEndDragging:withVelocity:targetContentOffset:]

//User has stopped dragging
OCDemo[82406:539968] -[ViewController scrollViewDidEndDragging:willDecelerate:]

//Deceleration ends
OCDemo[82406:539968] -[ViewController scrollViewDidEndDecelerating:]
```

## Miscellaneous

Detecting the user's scroll direction:

```objc
- (void)scrollViewWillBeginDragging:(UIScrollView*)scrollView {
    self.lastOffsetY = scrollView.contentOffset.y;
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (scrollView.contentOffset.y > self.lastOffsetY) {
        //Scrolling up
    }
}
```

### References

[UIScrollView Best Practices](http://tech.glowing.com/cn/practice-in-uiscrollview/)

[Working with UIScrollView](http://zhangbuhuai.com/practice-in-uiscrollview/)
