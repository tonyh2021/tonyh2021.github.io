---
layout: post
title: "UIScrollView快速参考"
description: ""
category: articles
tags: [UIKit]
comments: true
---

## 属性

## Delegate Method


```objc
//只要滚动了就会触发
- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
}
//开始拖拽视图
- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
}
//完成拖拽
- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
}
//将开始降速时
- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
}

//减速停止了时执行,手触摸时执行
- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
}

//滚动动画停止时执行,代码改变时出发,也就是setContentOffset改变时
- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
}
```

