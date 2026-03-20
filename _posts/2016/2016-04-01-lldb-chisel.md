---
layout: post
title: "关于lldb下chisel的使用"
description: ""
category: articles
tags: [iOS]
comments: true
---

## 安装

### 安装 `Homebrew`

```shell
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### 安装 `chisel`

```shell
brew update
brew install chisel
```

### 配置

安装完成后复制下面的话到`~/.lldbinit`文件中，不存在的话，就创建一个。`/path/to/`一定改为你自己的路径啊，这个还不会的话，别做程序员了，很辛苦的。

```shell
command script import /path/to/fblldb.py
```

> add the following line to your ~/.lldbinit file. If it doesn't exist, create it.

注：如果出现权限问题就加上`sudo`。

## 常用命令

这其实使用python封装的一些函数，有时间可以了解下其实现。个人觉得有些命令很好用。

### alamborder

给存在Ambiguous Layouts的view加上border，方便查找哪些View存在问题。

```
Syntax: alamborder [--color=color] [--width=width]
```

- `--color/-c`: border的颜色，参数为string类型，比如`red`, `green`, `magenta`等，不设置默认为红色。
- `--width/-w`: border的宽度，参数为CGFloat类型，不设置默认宽度为2。

例如：
```
(lldb) alamborder
(lldb) 
```

![01](/images/posts/20160401-lldb-chisel/chisel01.png)

只要有一个View存在`Ambiguous Layouts`，UIWindow的边框也会变为红色，这就有效的避免了宽度或者高度为0的`Ambiguous Layouts`不宜察觉的缺陷。

### alamunborder

将alamborder设置的border去掉。

```
Syntax: alamunborder
```

### paltrace

打印某个View的autolayout详细信息，相当于调用`_autolayoutTrace`。

```
Syntax: paltrace <view>
```

- <view>: 需要打印详细信息的view，不传参数默认为keyWindow。

例如：

```
(lldb) paltrace

UIWindow:0x14ed18300
|   •UIView:0x170185b00
|   |   *UIView:0x170185bd0- AMBIGUOUS LAYOUT for UIView:0x170185bd0.minX{id: 34}
|   |   *_UILayoutGuide:0x1701b18e0
|   |   *_UILayoutGuide:0x1701b19c0
```

### pviews

循环打印view层级，正常情况下等效于调用recursiveDescription命令。

```
Syntax: pviews [--up] [--depth=depth] <aView>
```

- `--up/-u`: 以view为起始位置，向上打印，直到打印到window层
- `--depth/-d`: 传入int类型，表示打印的层数，0表示没有限制

例如，打印一下应用的view层级：

![02](/images/posts/20160401-lldb-chisel/chisel02.png)

```
<UIWindow: 0x136602cd0; frame = (0 0; 320 568); gestureRecognizers = <NSArray: 0x174050410>; layer = <UIWindowLayer: 0x17422a5c0>>
   | <UIView: 0x17418f970; frame = (0 0; 320 568); autoresize = W+H; layer = <CALayer: 0x17422aba0>>
   |    | <UIView: 0x17418fa40; frame = (41 92; 240 128); autoresize = RM+BM; layer = <CALayer: 0x17422ab20>>
   |    |    | <UIButton: 0x136515570; frame = (111 49; 46 30); opaque = NO; autoresize = RM+BM; layer = <CALayer: 0x1702266a0>>
   |    |    |    | <UIButtonLabel: 0x1365167a0; frame = (0 6; 46 18); text = 'Button'; opaque = NO; userInteractionEnabled = NO; layer = <_UILabelLayer: 0x1700867c0>>
   |    | <_UILayoutGuide: 0x1741bc000; frame = (0 0; 0 20); hidden = YES; layer = <CALayer: 0x17422ae40>>
   |    | <_UILayoutGuide: 0x1741bc0e0; frame = (0 568; 0 0); hidden = YES; layer = <CALayer: 0x17422ad60>>
```

### pvc

循环打印viewController的层级。

```
Syntax: pvc <aViewController>
```

- `<aViewController>`: 表示要打印的viewController，不传参数默认viewController为当前的VC

例如，打印当前VC

```
(lldb) pvc
<ViewController 0x136514a60>, state: appeared, view: <UIView 0x17418f970>
```

### pclass

循环打印class的继承关系。

```
Syntax: pclass <object>
```

- <object>: 要打印继承关系的对象。

例如，打印当前控制器的继承关系。

```
(lldb) pclass 0x136514a60
ViewController
   | UIViewController
pclass 0x136514a60
   |    | UIResponder
   |    |    | NSObject
```

### presponder

打印响应链。

```
Syntax: presponder <startResponder>
```

- `<startResponder>`: UIResponder对象，响应链开始位置

例如，打印当前控制器的响应链：

```
(lldb) presponder 0x136514a60
<ViewController: 0x136514a60>
   | <UIWindow: 0x136602cd0; frame = (0 0; 320 568); gestureRecognizers = <NSArray: 0x174050410>; layer = <UIWindowLayer: 0x17422a5c0>>
   |    | <UIApplication: 0x136602af0>
   |    |    | <AppDelegate: 0x17001d9f0>
```

### ptv

打印屏幕中显示的tableView，主要是与pcells联合使用。如果有多个tableView，打印View层级中最上面的一个。

```
Syntax: ptv
```

例如：

```
(lldb) ptv
<UITableView: 0x147071800; frame = (0 0; 320 568); clipsToBounds = YES; gestureRecognizers = <NSArray: 0x1702466f0>; layer = <CALayer: 0x17022fe40>; contentOffset: {0, -64}; contentSize: {320, 440}>
```

### pcells

打印tableView中当前可见的cell，如果有多个tableView，打印View层级中最上面的tableView的可见cell。

```
Syntax: pcells
```

```
(lldb) pcells
<__NSArrayI 0x1700b69e0>(
<UITableViewCell: 0x146624340; frame = (0 0; 320 44); text = 'Example1'; autoresize = W; layer = <CALayer: 0x170231480>>,
<UITableViewCell: 0x1465114a0; frame = (0 44; 320 44); text = 'Example2'; autoresize = W; layer = <CALayer: 0x174237e80>>,
<UITableViewCell: 0x146511d10; frame = (0 88; 320 44); text = 'Example3'; autoresize = W; layer = <CALayer: 0x174238160>>,
<UITableViewCell: 0x146512180; frame = (0 132; 320 44); text = 'Example4'; autoresize = W; layer = <CALayer: 0x174238460>>,
<UITableViewCell: 0x1465125f0; frame = (0 176; 320 44); text = 'Example5'; autoresize = W; layer = <CALayer: 0x174238700>>,
<UITableViewCell: 0x146512a60; frame = (0 220; 320 44); text = 'Example6'; autoresize = W; layer = <CALayer: 0x174238440>>,
<UITableViewCell: 0x146512ed0; frame = (0 264; 320 44); text = 'Example7'; autoresize = W; layer = <CALayer: 0x174238ca0>>,
<UITableViewCell: 0x146513340; frame = (0 308; 320 44); text = 'Example8'; autoresize = W; layer = <CALayer: 0x174238f80>>,
<UITableViewCell: 0x146513930; frame = (0 352; 320 44); text = 'Example9'; autoresize = W; layer = <CALayer: 0x174239260>>,
<UITableViewCell: 0x146513da0; frame = (0 396; 320 44); text = 'Example10'; autoresize = W; layer = <CALayer: 0x174239540>>
)
```

### pinternals

打印一个对象内部的成员变量，这个方法我一般用来看model属性

```
Syntax: pinternals <object>
```

- <object>: 需要打印内部成员变量的对象

例如打印当前tableview的内部属性，内容有点多。

```
(lldb) pinternals 0x147071800
(UITableView) $6 = {
  UIScrollView = {
    UIView = {
      UIResponder = {
        NSObject = {
          isa = UITableView
        }
      }
      _layer = 0x000000017022fe40
      _gestureInfo = nil
      _gestureRecognizers = 0x00000001702466f0 @"2 objects"
      _subviewCache = 0x00000001702496f0 @"13 objects"
      _charge = 0
      _tag = 0
      _viewDelegate = nil
      _backgroundColorSystemColorName = 0x0000000170246bd0 @"tableBackgroundColor"
      _countOfMotionEffectsInSubtree = 0
...
```

### pdata

对编码过的NSData进行解码打印，等效于调用`-[NSString initWithData:encoding:]`

```
Syntax: pdata [--encoding=encoding] <data>
```

- `<data>`: 需要打印的data，NSData类型
- `--encoding/-e`: 编码类型，如果缺省默认为utf8，主要支持的类型有

```
- ascii,
- utf8,
- utf16, unicode,
- utf16l (Little endian),
- utf16b (Big endian),
- utf32,
- utf32l (Little endian),
- utf32b (Big endian),
- latin1, iso88591 (88591),
- latin2, iso88592 (88592),
- cp1251 (1251),
- cp1252 (1252),
- cp1253 (1253),
- cp1254 (1254),
- cp1250 (1250),
```

### pkp

通过`-valueForKeyPath:`打印key path对应的值。

```
Syntax: pkp <keypath>
```

- <keypath>: 需要打印的路径，如`self.view`

说明：以前打印属性一般都用`po`，现在`pkp`是一个更好的选择了，因为`po`是调用`getter`方法，如果没有`getter`方法就无法打印了。`pkp`不仅会调用`getter`方法，没有`getter`方法还会去查找成员变量。

```
(lldb) pkp self.view.frame
NSRect: { {0, 0}, {320, 568} }
```

### fvc

根据viewController的Class名字查找VC

```
Syntax: fvc [--name=classNameRegex] [--view=view]
```

- `--name/-n`: string类型参数，根据viewController的Class名字查找viewController
- `--view/-v`: UIView类型参数，根据viewController拥有的view查找viewController

说明：上面2个option不能同时使用，只能使用某一个，不需要区分大小写
说明：类似字符串查找，包含参数字符串的class名称都会找出来

例如，查找`Example1ViewController`：

```
(lldb) fvc Example1ViewController
0x14f507290 Example1ViewController
(lldb) fvc example1viewcontroller
0x14f507290 Example1ViewController
(lldb) fvc --name=controller
0x14f51ad00 UINavigationController
0x14f51c8e0 ViewController
```

例如，通过view的内存地址找所在的VC：

```
(lldb) fvc --view=0x1701876a0
Found the owning view controller.
<ViewController: 0x14f51c8e0>
```

### fv

根据view的class名字查找view

```
Syntax: fv <classNameRegex>
```

- <classNameRegex>: view的class名称

说明：类似字符串查找，包含参数字符串的class名称都会找出来

例如：查找一下屏幕上的tableview

```
(lldb) fv uitableview
(lldb) fv uitableview
0x15006d200 UITableView
0x14f51e290 UITableViewWrapperView
0x14f617710 UITableViewCell
0x1701882d0 UITableViewCellContentView
...
```

### taplog

将点击的view打印出来，这个命令对于查找哪个view非常有帮助

```
Syntax: taplog
```

说明：要查看的view必须能接收点击事件，也就是他的userInteractionEnabled必须为YES才能被找到，UILabel和UIImageView默认userInteractionEnabled为NO。

例如，先将程序暂停，输入`taplog`

```
(lldb) taplog
Process 73484 resuming
```

然后会自动继续运行程序，点击某个cell：

```
<UITableViewCellContentView: 0x170187df0; frame = (0 0; 320 43.5); gestureRecognizers = <NSArray: 0x170242b20>; layer = <CALayer: 0x17003d760>>
```

### vs

在view层级中搜索view，并显示出来

```
Syntax: vs <view>
```

- `<view>`:要查找的view

说明：相比fv，vs主要用于显示view在屏幕上的位置，2个命令可以配合使用

例如查找某个cell，先fv找到cell类型的view：

```
(lldb) fv cell
0x14f617710 UITableViewCell
0x1701882d0 UITableViewCellContentView
0x1701caf50 _UITableViewCellSeparatorView
0x14f617120 UITableViewCell
0x170188200 UITableViewCellContentView
0x1701cae60 _UITableViewCellSeparatorView
0x14f616cb0 UITableViewCell
...
```

然后看看这么多个view到底哪个是我们想要找的view，相应的cell会变成粉红色：

![03](/images/posts/20160401-lldb-chisel/chisel03.png)

```
(lldb) vs 0x14f617120

Use the following and (q) to quit.
(w) move to superview
(s) move to first subview
(a) move to previous sibling
(d) move to next sibling
(p) print the hierarchy

<UITableViewCell: 0x14f617120; frame = (0 352; 320 44); text = 'Example9'; autoresize = W; layer = <CALayer: 0x17003e540>>
```

控制台中vs的view也有相应log。并且还提示有6种子命令：

- w: 移动到superview
- s: 移动到第一个subview
- a: 移动到前面的同级view
- d: 移动到后面的同级view
- p: 打印出层级
- q: 退出

如果这个不是我们要找的view，可以使用`w,s,a,d,p`命令继续查找

```
w
<UITableViewWrapperView: 0x14f51e290; frame = (0 0; 320 504); gestureRecognizers = <NSArray: 0x174241c50>; layer = <CALayer: 0x174039120>; contentOffset: {0, 0}; contentSize: {320, 504}>
```

用q退出时还有人性化的提示，心里暖暖的😊。

```
q

I hope 0x000000014f51e290 was what you were looking for. I put it on your clipboard.
```

### caflush

刷新UI界面。一般我们用lldb命令改变UI，UI并不会立即更新，我们需要使用`caflush`刷新界面

```
Syntax: caflush
```

### border

给View或者layer加上border

```
Syntax: border [--color=color] [--width=width] <viewOrLayer>
```

- `--color/-c`: 边框颜色，string类型，比如:`red, green,magenta`等，不设置默认为红色
- `--width/-w`: 边框宽度，不设置默认为2
- `<viewOrLayer>`: 需要设置边框的view或者layer

例如，给查找到的view添加边框

```
(lldb) fv uiview
0x17418f8a0 UIViewControllerWrapperView
0x17418e790 UIView
0x17418e860 UIView
0x17018fcb0 UIView
(lldb) border 0x17418e860
```

![04](/images/posts/20160401-lldb-chisel/chisel04.png)

### unborder

去掉view或者layer的border

```
Syntax: unborder <viewOrLayer>
```

### mask

给view添加一个半透明的矩形mask，用来查看view的位置

```
Syntax: mask [--color=color] [--alpha=alpha] <viewOrLayer>
```

- `--color/-c`: mask的颜色，string类型，比如:`red, green,magenta`等，不设置默认为红色
- `--alpha/-a`: mask的透明度，不设置默认为0.5
- `<viewOrLayer>`: 需要添加mask的view或者layer

主要是查看隐藏view的位置大小。

unmask

将添加的mask去掉

```
Syntax: unmask <viewOrLayer>
```

- `<viewOrLayer>`: 需要去掉mask的view或者layer

### show

显示一个view或者layer，相当于执行`view.hidden = NO`

```
Syntax: show <viewOrLayer>
```

### hide

隐藏一个view或者layer，相当于执行`view.hidden = YES`

```
Syntax: hide <viewOrLayer>
```

- `<viewOrLayer>`: 需要隐藏的view或者layer

### slowanim

减慢动画的速度

```
Syntax: slowanim <speed>
```

- `<speed>`: 动画的速度，速度越大，动画越快。1表示原始速度。不传参数默认为0.1

### unslowanim

取消slowanim效果，将动画速度变为正常

```
Syntax: unslowanim
```

### wivar

为对象的成员变量设置watchpoint

```
Syntax: wivar <object> <ivarName>
```

- `<object>`: 需要为成员变量设置watchpoint的对象。id类型
- `<ivarName>`: 成员变量的名字，注意一般属性对应的成员变量带有_前缀

例如给self.subView设置watchpoint

### bmessage

根据方法名设置断点

```
Syntax: bmessage <expression>
```

- `<expression>`: 设置断点的方法名，如： `-[MyView setFrame:]`, `+[MyView awesomeClassMethod], -[0xabcd1234 setFrame:]`等

说明：一般设置断点，如果这个方法本类没有实现，是父类实现的，断点是无效的。`bmessage`有效避免了这种缺陷，即使本类没有实现，也能设置上断点

```
(lldb) bmessage -[self viewWillAppear:]
Setting a breakpoint at -[UIViewController viewWillAppear:] with condition (void*)(id)$x0 == 0x00000001545142a0
Breakpoint 3: where = UIKit`-[UIViewController viewWillAppear:], address = 0x000000018cd53e68
```

### 参考：

[facebook/chisel](https://github.com/facebook/chisel)

[小笨狼的LLDB技巧:chisel](http://www.jianshu.com/p/afaaacc55460/comments/1104670)

