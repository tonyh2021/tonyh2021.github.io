---
layout: post
title: "UIScrollView参考"
description: ""
category: articles
tags: [UIKit]
comments: true
---

只记录了滑动相关的内容。

### UIScrollView关键属性

- `tracking`:用户已经触摸，但是还没有拖拽时返回YES。

- `dragging`:用户开始滑动一小段时间或一小段距离时，返回YES。

- `decelerating`:用户松手，但是还在滚动的时候返回YES。

### UIScrollView代理方法

- `- (void)scrollViewDidScroll:(UIScrollView *)scrollView`:这个方法在任何方式触发`contentOffset`变化的时候都会被调用（包括用户拖动，减速过程，直接通过代码设置等），可以用于监控`contentOffset`的变化，并根据当前的`contentOffset`对其他view做出随动调整。

- `- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView`:用户开始拖动`scrollView`的时候被调用。可能会开始一小段时间或距离后才会调用。

- `- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset`:用户停止触摸的时候调用。`velocity`表示速度，有正负（向上、向下）区分。`targetContentOffset`表示即将要停到的位置。值得注意的是，这里的`targetContentOffset`是个指针，没错，你可以改变减速运动的目的地，这在一些效果的实现时十分有用。通过`targetContentOffset->y`来访问或者修改。

- `- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate`:在用户结束拖动后被调用，`decelerate`为`YES`时，结束拖动后会有减速过程。注，在`didEndDragging`之后，如果有减速过程，`scrollView`的`dragging`并不会立即置为`NO`，而是要等到减速结束之后，所以这个`dragging`属性的实际语义更接近`scrolling`。

- `- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView`:减速动画开始前被调用。

- `- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView`:减速动画结束时被调用，这里有一种特殊情况：当一次减速动画尚未结束的时候再次`drag scrollView`，`didEndDecelerating`不会被调用，并且这时`scrollView`的`dragging`和`decelerating`属性都是`YES`。新的`dragging`如果有加速度，那么`willBeginDecelerating`会再一次被调用，然后才是`didEndDecelerating`；如果没有加速度，虽然`willBeginDecelerating`不会被调用，但前一次留下的`didEndDecelerating`会被调用。

- `- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView`:当通过代码滑动`scrollView`时（`setContentOffset(_:animated:)`或者`scrollRectVisible(_:animated:)`），动画结束时会调用该方法；值得一提的是，当且仅当动画存在时才会调用该方法。

### 用户滑动

```objc
//用户开始触摸并滑动
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDragging:]

//滑动了一段距离，多次调用
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//用户即将停止触摸滑动
OCDemo[82268:532649] -[ViewController scrollViewWillEndDragging:withVelocity:targetContentOffset:]

//用户滑动停止
OCDemo[82268:532649] -[ViewController scrollViewDidEndDragging:willDecelerate:]

//开始减速
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDecelerating:]

//滑动了一段距离，多次调用
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//停止减速
OCDemo[82268:532649] -[ViewController scrollViewDidEndDecelerating:]
```

### 减速过程中用户再次触摸

```objc
//用户开始触摸并滑动
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDragging:]

//滑动了一段距离，多次调用
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//用户即将停止触摸滑动
OCDemo[82268:532649] -[ViewController scrollViewWillEndDragging:withVelocity:targetContentOffset:]

//用户滑动停止
OCDemo[82268:532649] -[ViewController scrollViewDidEndDragging:willDecelerate:]

//开始减速
OCDemo[82268:532649] -[ViewController scrollViewWillBeginDecelerating:]

//滑动了一段距离，多次调用
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]
OCDemo[82268:532649] -[ViewController scrollViewDidScroll:]

//用户再次开始触摸并滑动
OCDemo[82406:539968] -[ViewController scrollViewWillBeginDragging:]

//用户即将停止触摸滑动
OCDemo[82406:539968] -[ViewController scrollViewWillEndDragging:withVelocity:targetContentOffset:]

//用户滑动停止
OCDemo[82406:539968] -[ViewController scrollViewDidEndDragging:willDecelerate:]

//停止减速
OCDemo[82406:539968] -[ViewController scrollViewDidEndDecelerating:]
```

## 其他

判断用户滑动方向：

```objc
- (void)scrollViewWillBeginDragging:(UIScrollView*)scrollView {
    self.lastOffsetY = scrollView.contentOffset.y;
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (scrollView.contentOffset.y > self.lastOffsetY) {
        //向上
    }
}
```

### 参考：

[UIScrollView 实践经验](http://tech.glowing.com/cn/practice-in-uiscrollview/)

[使用UIScrollView](http://zhangbuhuai.com/practice-in-uiscrollview/)

