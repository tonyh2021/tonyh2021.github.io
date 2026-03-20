---
layout: post
title: "Swift Usage Tips"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Background

Today was a rough day.

Keep moving forward.

Back to mixed-language development. Don't think that just because you're familiar with OC and UIKit, skimming through Swift syntax is enough for a smooth transition — it took me quite a while to fill in the gaps. Anyone who has never actually written Swift would think it's simple. Compared to OC, Swift has a more concise syntax and borrows the best ideas from many popular languages. Optional binding and `guard` caught me off guard at first, but I'm eager to start using them.

## Calling OC Code

You need to create a bridging header file `ProjectName-Bridging-Header.h`, then update the `Objective-C Bridging Header` setting under `Build Settings` in the target to `ProjectName/ProjectName-Bridging-Header.h`.

```swift
#ifndef SwiftTipsDemo_Bridging_Header_h
#define SwiftTipsDemo_Bridging_Header_h

#import "OCViewController.h"

#endif /* SwiftTipsDemo_Bridging_Header_h */
```

Since the entire project is within the same namespace, you can use `OCViewController` directly in Swift.

```swift
navigationController?.pushViewController(OCViewController(), animated: true)
```


## Importing Third-Party OC Libraries from CocoaPods

Using RAC as an example: after adding `pod 'ReactiveCocoa', '4.0.1'` to your Podfile and running an update, add the import to your bridging header. If you only add `#import "ReactiveCocoa-Bridging-Header.h"`, you'll get a "header file not found" error.

```objc
#ifndef SwiftTipsDemo_Bridging_Header_h
#define SwiftTipsDemo_Bridging_Header_h

#import <ReactiveCocoa/ReactiveCocoa-Bridging-Header.h>

#endif /* SwiftTipsDemo_Bridging_Header_h */
```

## Navigating from OC

The existing codebase used Xibs, so newly created Swift files needed to follow the same pattern.
In general, this is how you do it: when creating a new OC file, check the box to create an associated Xib, and then you're good to go.

```objc
MyViewController *my = [[MyViewController alloc] init];
[self.navigationController pushViewController:my animated:YES];
```

In Swift, if you check the box to create a Xib when creating a new Swift file, using the following code will actually only load an empty controller. That is, the system does not automatically load a Xib file with the same name as the controller.

```swift
navigationController?.pushViewController(Example2ViewController(), animated: true)
```

To load it this way, you need to write a convenience initializer in Swift:

```swift
convenience init() {
   let nibNameOrNil = String?("SwiftViewController")
   self.init(nibName: nibNameOrNil, bundle: nil)
}
```

## Swift's Dynamic Dispatch

While answering a question on `stackoverflow`, I came across an issue involving using `RACObserve` in `Controller0 (OC)` to observe property changes in a `ViewModel (Swift)`. I knew that `RACObserve` uses KVO under the hood, and for a Swift object to support KVO it must inherit from `NSObject` — so I gave an answer in English. But the poster had indeed inherited from `NSObject`. I pulled out my computer late at night to test it, and sure enough, it didn't work. Another person had answered that the property must be marked with `dynamic`. Adding `dynamic` fixed the issue. My answer wasn't accepted, but it was a good reminder to dig deeper into how Swift handles dynamic dispatch.

### Code:
All code from this article can be found on my GitHub: [`SwiftTipsDemo`](https://github.com/tonyh2021/SwiftTipsDemo).




