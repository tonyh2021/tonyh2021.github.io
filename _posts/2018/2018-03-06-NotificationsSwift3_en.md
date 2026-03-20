---
layout: post
title: "Notifications and userInfo with Swift 3.0"
description: ""
category: articles
tags: [iOS]
comments: true
---

Original article: http://dev.iachieved.it/iachievedit/notifications-and-userinfo-with-swift-3-0/

Original author: Joe

<!--Body starts here-->

# Notifications and userInfo with Swift 3.0

Swift 3.0 brought quite a few changes to the Swift language, including the removal of `NS` prefixes from Foundation framework types — the [Great Renaming](https://developer.apple.com/videos/play/wwdc2016/403/). `NSThread` became `Thread`, `NSData` became `Data`, and so on.

This means the usage of `NSNotificationCenter` — oh sorry, `NotificationCenter` — with `userInfo` needs to be updated. This is a significant difference between Swift 2 and Swift 3.

The way to get the default `NotificationCenter` is now `let nc = NotificationCenter.default`. Additionally, the model of using a selector when receiving notifications has changed to specifying a closure or function to execute.

For example, in Swift 2 you would write:

```swift
let nc = NSNotificationCenter.defaultCenter()
nc.addObserver(self,
               selector: #selector(ViewController.catchNotification),
               name: "MyNotification",
               object: nil)
```

While in Swift 3 it's written as:

```swift
let nc = NotificationCenter.default // Note: default is a property, not a method call
nc.addObserver(forName:Notification.Name(rawValue:"MyNotification"),
               object:nil, queue:nil,
               using:catchNotification)
```

The example above sets up the notification center to deliver `MyNotification` notifications to the `catchNotification` function, which has a method signature of `(Notification) -> Void`. Alternatively, you can use a closure:

```swift
let nc = NotificationCenter.default // Note: default is a property, not a method call
nc.addObserver(forName:Notification.Name(rawValue:"MyNotification"),
               object:nil, queue:nil) {
  notification in
  // Handle the notification
}
```

#### Posting Notifications

Now let's look at how to post notifications. The `postNotificationName` method from Swift 2.0 has been replaced by `post` in Swift 3.0.

```swift
let nc = NotificationCenter.default
nc.post(name:Notification.Name(rawValue:"MyNotification"),
        object: nil,
        userInfo: ["message":"Hello there!", "date":Date()])
```

`userInfo` takes `[AnyHashable: Any]?` as a parameter, which is called a dictionary literal in Swift. Note that the values in `userInfo` don't need to be of the same type (as indicated by the `Any`); here a `String` type and a `Date` type are sent together.

#### Handling Notifications

Using `guard` syntax to unwrap and validate expected data from `userInfo` is a great approach.

```swift
  func catchNotification(notification:Notification) -> Void {
    print("Catch notification")

    guard let userInfo = notification.userInfo,
          let message  = userInfo["message"] as? String,
          let date     = userInfo["date"]    as? Date else {
      print("No userInfo found in notification")
      return
    }

    let alert = UIAlertController(title: "Notification!",
                                  message:"\(message) received at \(date)",
                                  preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.default, handler: nil))
    self.present(alert, animated: true, completion: nil)

  }
```

To verify the `guard` behavior, try calling `post` using a `String` type or another object type instead of `Date()`. You'll see `No userInfo found in notification` in the console output.

#### Sample Code

You can try the code above in a simple iOS project. Create a **Single View Application** project and replace the contents of `ViewController.swift` with the following:

```swift
import UIKit

class ViewController: UIViewController {

  let myNotification = Notification.Name(rawValue:"MyNotification")

  override func viewDidLoad() {
    super.viewDidLoad()

    let nc = NotificationCenter.default
    nc.addObserver(forName:myNotification, object:nil, queue:nil, using:catchNotification)
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    let nc = NotificationCenter.default
    nc.post(name:myNotification,
            object: nil,
            userInfo:["message":"Hello there!", "date":Date()])
  }

  func catchNotification(notification:Notification) -> Void {
    print("Catch notification")

    guard let userInfo = notification.userInfo,
          let message  = userInfo["message"] as? String,
          let date     = userInfo["date"]    as? Date else {
        print("No userInfo found in notification")
        return
    }

    let alert = UIAlertController(title: "Notification!",
                                  message:"\(message) received at \(date)",
                                  preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.default, handler: nil))
    self.present(alert, animated: true, completion: nil)
  }
}
```

Key points:

- A `Notification`'s "name" is no longer a `String` type but a `Notification.Name` type, so when declaring a notification, use `let myNotification = Notification.Name(rawValue:"MyNotification")`. This allows us to use `myNotification` anywhere a `Notification.Name` is needed, such as in `NotificationCenter.addObserver` and `NotificationCenter.post`.
- It is recommended to use a separate `catchNotification` method rather than tangled-up code blocks.

That's it — clean and effective!

#### Comments Section
Improved way of declaring and using notifications:
1) First declare the notification name:

```swift
public extension Notification {
  public class MyApp {
     public static let MyNotification = Notification.Name("Notification.MyApp.MyNotification")
  }
}
```

2) Post a notification using the notification name:

```swift
NotificationCenter.default.post(name: Notification.MyApp.MyNotification, object: self)
```

3) Observe the notification:

```swift
NotificationCenter.default.addObserver(forName: Notification.MyApp.MyNotification, object: nil, queue: OperationQueue.main) {
      pNotification in

  // Your code here
}
```
