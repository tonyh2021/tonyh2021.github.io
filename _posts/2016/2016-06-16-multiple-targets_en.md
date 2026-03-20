---
layout: post
title: "Configuring Multiple Targets in an iOS Project"
description: "multiple targets"
category: articles
tags: [iOS]
comments: true
---

## Background

First, a quick rant: the company has recently taken on several outsourced projects with similar functionality, and I've been grinding through them day and night, basically turning into a contractor. The bonuses are decent, but this pace isn't sustainable.

## Approach

Since the projects share similar functionality, the goal is to maximize code reuse. The most practical solution I've come up with is using `multiple targets` — compiling different projects from the same codebase using multiple targets. This should be sufficient for requirements that only involve swapping out the UI theme.

## Steps

1. Assume you already have a project called `MultipleTargetTest`. There will be a default target named `MultipleTargetTest`. The basic setup and configuration for this target is assumed to be done.

2. Right-click the target `MultipleTargetTest` and select `Duplicate`. This creates a new target named `MultipleTargetTest-copy` and a corresponding plist file `MultipleTargetTest-copy-info.plist`.
![targets1](/images/posts/20160616-multipletargets/targets1.png)
![targets2](/images/posts/20160616-multipletargets/targets2.png)

3. Rename both the target and the plist file, then use `Choose Info.plist File...` to link them, as shown.
![targets3](/images/posts/20160616-multipletargets/targets3.png)

4. Update the scheme name in `Manage Schemes`.
![targets4](/images/posts/20160616-multipletargets/targets4.png)
![targets5](/images/posts/20160616-multipletargets/targets5.png)

5. Update the `Bundle Identifier` for `Target_2`. Also verify that the corresponding settings in `Build Settings` are consistent.
![targets6](/images/posts/20160616-multipletargets/targets6.png)
![targets7](/images/posts/20160616-multipletargets/targets7.png)

6. In `Build Settings`, search for `Other C Flags` and add `-DMULTIPLE_TARGETS_TARGET2`. You can then use this macro in code for conditional compilation. See the code example below.
![targets8](/images/posts/20160616-multipletargets/targets8.png)

7. Modify `Target_2-Info.plist` as needed.
![targets9](/images/posts/20160616-multipletargets/targets9.png)
Note:
> The newly added `LaunchScreenTarget2.storyboard` must be added under `Build Phases`, and the unused `LaunchScreen.storyboard` should ideally be removed as well.
![targets10](/images/posts/20160616-multipletargets/targets10.png)

8. You can now modify `LaunchScreenTarget2.storyboard` and debug by selecting different targets.

9. For app icons and image assets, create a new asset catalog. Simply copy the JSON file over. It also needs to be configured in `Build Phases`. The recommended approach is to keep shared assets in `Assets`, and have each target include its own separate asset catalog.
![targets11](/images/posts/20160616-multipletargets/targets11.png)
![targets12](/images/posts/20160616-multipletargets/targets12.png)
![targets13](/images/posts/20160616-multipletargets/targets13.png)

10. For the `Podfile`, you can configure it like this:

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

You may see a warning like the following. The build should still succeed, but I prefer to resolve it to be safe:

```
[!] CocoaPods did not set the base configuration of your project because your
project already has a custom config set. In order for CocoaPods integration to
work at all, please either set the base configurations of the target
`Target_2` to `Pods/Target Support Files/Pods-Target_2/Pods-Target
_2.debug.xcconfig` or include the `Pods/Target Support Files/Pods-Target_2/
Pods-Target_2.debug.xcconfig` in your build configuration.
```

Someone on [`stackoverflow`](http://stackoverflow.com/questions/26287103/cocoapods-warning-cocoapods-did-not-set-the-base-configuration-of-your-project) proposed a solution (apparently `pod update --no-repo-update` also works):

> what fixed it for me was to change the configuration file setting to None for the two Pods-related targets, then run pod install again.

11. Here is an example of using the `-DMULTIPLE_TARGETS_TARGET2` macro in code for conditional compilation based on the active target:

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

12. If the project uses Swift and Objective-C mixed, errors may occur — most likely because the `XXX-Bridging-Header.h` file was not generated, or an existing one was not configured as the bridging header.

```c
#ifdef MULTIPLE_TARGETS_TARGET2
#import "Target_2-Swift.h"
#else
#import "MultipleTargetTest-Swift.h"
#endif
```


### Code:
All code from this article can be found on my GitHub: [`MultipleTargetTest`](https://github.com/tonyh2021/MultipleTargetTest).

### References:

Thanks to my apprentice for helping organize the reference materials.

[brennanMKE/MultipleTargets](https://github.com/brennanMKE/MultipleTargets)

