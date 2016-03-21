---
layout: post
title: "Custom View Controller Transitions——自定义视图控制器转场"
description: ""
category: articles
tags: [控制器转场]
comments: true
---

## 前言
iOS7之前的`transitionFromViewController:  toViewController:...`就不提了，iOS7之后的API可以让我们容器中的视图控制器做自定义转场动画。

## API介绍

iOS7自定义视图控制器转场的API基本上都是以协议的方式提供的，这也使其可以非常灵活的使用，因为你可以很简单地将它们插入到你的类中。最主要的五个组件如下:

1. 动画控制器(`Animation Controllers`)：遵从`UIViewControllerAnimatedTransitioning`协议，并且负责实际执行动画。
2. 交互控制器(`Interaction Controllers`)：通过遵从`UIViewControllerInteractiveTransitioning`协议来控制可交互式的转场。
3. 转场代理(`Transitioning Delegates`)：根据不同的转场类型方便的提供需要的动画控制器和交互控制器。
4. 转场上下文(`Transitioning Contexts`)：定义了转场时需要的元数据，比如在转场过程中所参与的视图控制器和视图的相关属性。 转场上下文对象遵`UIViewControllerContextTransitioning`协议，并且这是由系统负责生成和提供的。
5. 转场协调器(`Transition Coordinators`)：可以在运行转场动画时，并行的运行其他动画。转场协调器遵从`UIViewControllerTransitionCoordinator`协议。

#### `@protocol UIViewControllerContextTransitioning`

这个接口用来提供切换上下文给开发者使用，包含了从哪个VC到哪个VC等各类信息，一般不需要开发者自己实现。具体来说，iOS7的自定义切换目的之一就是切换相关代码解耦，在进行VC切换时，做切换效果实现的时候必须要需要切换前后VC的一些信息，系统在新加入的API的比较的地方都会提供一个实现了该接口的对象，以供我们使用。

对于切换的动画实现来说（这里先介绍简单的动画，在后面我会再引入手势驱动的动画），这个接口中最重要的方法有：

- **`-(UIView *)containerView;`** VC切换所发生的view容器，开发者应该将切出的view移除，将切入的view加入到该view容器中。

- **`-(UIViewController *)viewControllerForKey:(NSString *)key;`** 提供一个key，返回对应的VC。现在的SDK中key的选择只有`UITransitionContextFromViewControllerKey`和`UITransitionContextToViewControllerKey`两种，分别表示将要切出和切入的VC。

- **`-(CGRect)initialFrameForViewController:(UIViewController *)vc;`** 某个VC的初始位置，可以用来做动画的计算。

- **`-(CGRect)finalFrameForViewController:(UIViewController *)vc;`** 与上面的方法对应，得到切换结束时某个VC应在的frame。

- **`-(void)completeTransition:(BOOL)didComplete;`** 向这个context报告切换已经完成。

#### `@protocol UIViewControllerAnimatedTransitioning`

这个接口负责切换的具体内容，也即“切换中应该发生什么”。开发者在做自定义切换效果时大部分代码会是用来实现这个接口。它只有两个方法需要我们实现：

- `-(NSTimeInterval)transitionDuration:(id < UIViewControllerContextTransitioning >)transitionContext;` 系统给出一个切换上下文，我们根据上下文环境返回这个切换所需要的花费时间（一般就返回动画的时间就好了，SDK会用这个时间来在百分比驱动的切换中进行帧的计算）。

- `-(void)animateTransition:(id < UIViewControllerContextTransitioning >)transitionContext;` 在进行切换的时候将调用该方法，我们对于切换时的UIView的设置和动画都在这个方法中完成。

#### @protocol UIViewControllerTransitioningDelegate

这个接口的作用比较简单单一，在需要VC切换的时候系统会像实现了这个接口的对象询问是否需要使用自定义的切换效果。这个接口共有四个类似的方法：

- `-(id< UIViewControllerAnimatedTransitioning >)animationControllerForPresentedController:(UIViewController *)presented presentingController:(UIViewController *)presenting sourceController:(UIViewController *)source;`

- `-(id< UIViewControllerAnimatedTransitioning >)animationControllerForDismissedController:(UIViewController *)dismissed;`

- `-(id< UIViewControllerInteractiveTransitioning >)interactionControllerForPresentation:(id < UIViewControllerAnimatedTransitioning >)animator;`

- `-(id< UIViewControllerInteractiveTransitioning >)interactionControllerForDismissal:(id < UIViewControllerAnimatedTransitioning >)animator;`

前两个方法是针对动画切换的，我们需要分别在呈现VC和解散VC时，给出一个实现了`UIViewControllerAnimatedTransitioning`接口的对象（其中包含切换时长和如何切换）。后两个方法涉及交互式切换，之后再说。

### 代码示例

整理这篇内容的主要原因是我需要自定义一个从左往右出现的Modal控制器（另外由于我工作中用到的代码没有用到storyboard和segue，因此这里的demo代码就以代码为主了）。

#### 无动画（注意RAC框架的使用使得代码更加内聚，类之间更解耦）

```objc
//添加
FirstViewController *firstVC = [[FirstViewController alloc] init];
[self addChildViewController:firstVC];
[self.view addSubview:firstVC.view];

//销毁
@weakify(self)
[[self.dismissButton rac_signalForControlEvents:UIControlEventTouchUpInside] subscribeNext:^(id x) {
   @strongify(self)
   [self.view removeFromSuperview];
   [self removeFromParentViewController];
}];
```

#### 默认动画

```objc
//Present
ModalViewController *customModal = [[ModalViewController alloc] init];
[self presentViewController:customModal animated:YES completion:^{
 NSLog(@"Present ModalViewController Completion!");
}];

//Dismiss
@weakify(self)
[[self.dismissButton rac_signalForControlEvents:UIControlEventTouchUpInside] subscribeNext:^(id x) {
   @strongify(self)
   [self dismissViewControllerAnimated:YES completion:^{
       NSLog(@"Dismiss ModalViewController Completion!");
   }];
}];
```

#### 自定义





### 参考文档：
[Custom Container View Controller Transitions](http://www.objc.io/issue-12/custom-container-view-controller-transitions.html)
[WWDC 2013 Session笔记 - iOS7中的ViewController切换](https://onevcat.com/2013/10/vc-transition-in-ios7/)

### 代码：
文章中的代码都可以从我的GitHub [``]()找到。

