---
layout: post
title: "iOS项目中多target的配置"
description: "multiple targets"
category: articles
tags: [iOS]
comments: true
---

## 背景

首先吐槽一下，最近公司接了几个功能相似的外包项目，整天累死累活真成了外包码农了。虽说奖金丰厚，但是这么着下去还真不是办法。

## 思路

功能相似，那就需要尽可能的多复用代码，目前考虑到的最理想的方案是基于`multiple targets`，就是利用多个`target`编译成不同的项目。这对于简单的替换界面风格的需求应该就可以满足了。

## 步骤

1. 假设已经有一个项目`MultipleTargetTest`。此时会有默认的`target` `MultipleTargetTest`。相关的设置和操作不多说了。

2. 右键`target` `MultipleTargetTest`，然后选择`Duplicate`。此时会复制出一个`target` `MultipleTargetTest-copy`和一个`plist` 文件 `MultipleTargetTest-copy-info.plist`。
![targets1](/images/targets1.png)
![targets2](http://7xr0hq.com1.z0.glb.clouddn.com/targets2.png)

3. 分别重命名`target`和`plist`，并且`Choose Info.plist File...`，如图。
![targets3](http://7xr0hq.com1.z0.glb.clouddn.com/targets3.png)

4. 在`Manage Schemes`中修改`scheme`。
![targets4](http://7xr0hq.com1.z0.glb.clouddn.com/targets4.png)
![targets5](http://7xr0hq.com1.z0.glb.clouddn.com/targets5.png)

5. 当然也要修改`Target_2`的`Bundle Identifier`。同时在`Build Settings`中也要确认相应的配置一致。
![targets6](http://7xr0hq.com1.z0.glb.clouddn.com/targets6.png)
![targets7](http://7xr0hq.com1.z0.glb.clouddn.com/targets7.png)

6. `Build Settings`中搜索`Other C Flags`添加`-DMULTIPLE_TARGETS_TARGET2`。然后在代码中使用这个宏，来进行条件编译的操作了。具体看后面的代码。
![targets8](http://7xr0hq.com1.z0.glb.clouddn.com/targets8.png)

7. 根据需求修改`Target_2-Info.plist`文件。
![targets9](http://7xr0hq.com1.z0.glb.clouddn.com/targets9.png)
此处需要注意：
> 新添加的`LaunchScreenTarget2.storyboard`需要在`Build Phases`中添加，当然不需要的`LaunchScreen.storyboard`最好也移除。
![targets10](http://7xr0hq.com1.z0.glb.clouddn.com/targets10.png)

8. 可以修改`LaunchScreenTarget2.storyboard`然后选择不同的`target`进行调试。

9. 对于应用中的图标和图片资源，可以新建资源目录。json文件复制过去就可以了。同样需要在`Build Phases`配置。推荐共同资源放在`Assets`中，然后不同`target`再包含不同的资源目录。
![targets11](http://7xr0hq.com1.z0.glb.clouddn.com/targets11.png)
![targets12](http://7xr0hq.com1.z0.glb.clouddn.com/targets12.png)
![targets13](http://7xr0hq.com1.z0.glb.clouddn.com/targets13.png)

10. 对于`Podfile`，可以这么配置。

```ruby
platform :ios, '8.0'
use_frameworks!
# ignore all warnings from all pods
inhibit_all_warnings!

def myPods
    pod 'Masonry',  '~> 0.6.4'
    pod 'YYKit', '~> 1.0.7'
    pod 'ReactiveCocoa', '~> 2.5'
end

target 'MultipleTargetTest' do
    myPods
end

target 'Target_2' do
    myPods
end
```

此时可能有这样的警告，直接构建应该没问题，不过我还是解决掉比较保险。

```
[!] CocoaPods did not set the base configuration of your project because your 
project already has a custom config set. In order for CocoaPods integration to 
work at all, please either set the base configurations of the target 
`Target_2` to `Pods/Target Support Files/Pods-Target_2/Pods-Target
_2.debug.xcconfig` or include the `Pods/Target Support Files/Pods-Target_2/
Pods-Target_2.debug.xcconfig` in your build configuration.
```

[`stackoverflow`](http://stackoverflow.com/questions/26287103/cocoapods-warning-cocoapods-did-not-set-the-base-configuration-of-your-project)上有人提出了解决方案(貌似`pod update --no-repo-update`也可以)。

> what fixed it for me was to change the configuration file setting to None for the two Pods-related targets, then run pod install again.

11.代码中使用宏`-DMULTIPLE_TARGETS_TARGET2`的示例，可以根据不同`targets`来进行条件编译啦。

```objc
#pragma mark - MULTIPLE_TARGETS_TARGET2
    //Build Setting
    //Other C Flags
    //-MULTIPLE_TARGETS_TARGET2
#ifdef MULTIPLE_TARGETS_TARGET2
    NSLog(@"MULTIPLE_TARGETS_TARGET2");
#else
    NSLog(@"MultipleTargetTest");
#endif
```

12.如果代码中使用了`Swift`混编，则有可能出错。原因多半是没有生成`XXX-Bridging-Header.h`头文件，或之前生成的`XXX-Bridging-Header.h`没有设置为桥接文件。

```c
#ifdef MULTIPLE_TARGETS_TARGET2
#import "Target_2-Swift.h"
#else
#import "MultipleTargetTest-Swift.h"
#endif
```


### 代码：
文章中的代码都可以从我的GitHub [`MultipleTargetTest`](https://github.com/lettleprince/MultipleTargetTest)找到。

### 参考资料：

感谢小徒弟帮忙整理的资料。

[brennanMKE/MultipleTargets](https://github.com/brennanMKE/MultipleTargets)

