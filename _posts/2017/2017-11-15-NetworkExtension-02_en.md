---
layout: post
title: "Building a NetworkExtension App (Part 2)"
description: ""
category: articles
tags: [iOS]
comments: true
---


## Introduction

In the previous post I covered [some background knowledge on circumventing the GFW](https://tonyh2021.github.io/articles/2017/11/13/NetworkExtension-01.html). This post will first introduce NetworkExtension and related open-source iOS projects, then we'll get started on our own project.

In essence, the NetworkExtension app we're building plays the role of SS-Local.

## About NetworkExtension

[NetworkExtension](https://developer.apple.com/documentation/networkextension) is a framework provided by Apple for configuring VPNs and customizing or extending core networking features. The NE framework provides APIs for customizing and extending the core networking features of iOS and macOS.

Network Extension first appeared in iOS 8, but that version did not support virtual network interfaces — it could only call into the system's built-in IPSec and IKEv2 VPN protocols. In iOS 9, developers gained the ability to extend the core networking layer using `NETunnelProvider`, enabling non-standard, custom VPN technologies. The two most important classes are `NETunnelProviderManager` and `NEPacketTunnelProvider`.

[Potatso](https://github.com/Potatso/Potatso) implemented a Shadowsocks proxy using the NE framework. Unfortunately, the author deleted the open-source code for [various reasons](https://sspai.com/post/38909). A number of forks exist on GitHub but they are all slow to update. The most recently runnable version I found is [this one](https://github.com/haxpor/Potatso), but since I had already upgraded to Xcode 9, I had to make a series of changes. I eventually got a [version](https://github.com/tonyh2021/Potatso) that compiles and runs on Xcode 9, though it's not perfect. Feel free to use it as a learning reference.

## About NEKit

Learning Network Extension through Potatso isn't the most beginner-friendly path, since the project has gone unmaintained for quite a while. A simpler approach is available thanks to the [NEKit](https://zhuhaow.github.io/NEKit/) framework. NEKit can even work without depending on the Network Extension framework (though our project will use it). There's also a [demo](https://github.com/yichengchen/RabbitVpnDemo) worth looking at.

## Setting Up the Project

##### Create a New Project

Create a standard Swift project called QLadder (this project will later serve as our internal iOS VPN client, so we used an enterprise certificate).

The minimum supported iOS version is 9.3 — I previously tried 9.0 and ran into issues.

Also note: Network Extension cannot be debugged in the simulator. You will need a developer account to request the required Capabilities.

#### Add a PacketTunnel Target

Add a new Target and select Network Extension.

![01](/images/posts/20171115-NetworkExtension/01.png)

Then set the Provider Type to PacketTunnel.

![02](/images/posts/20171115-NetworkExtension/02.png)

#### Request Entitlements

If the containing app needs to share data with the extension, App Groups must be enabled.

Personal VPN and Network Extensions (App Proxy, Content Filter, Packet Tunnel) also need to be enabled, of course.

#### Third-Party Frameworks

NEKit is recommended to be dragged directly into the project, or integrated via [Carthage](https://github.com/Carthage/Carthage).

Other third-party frameworks managed via CocoaPods:

- [SwiftColor](https://github.com/icodesign/SwiftColor)
- [CocoaLumberjack/Swift](https://github.com/CocoaLumberjack/CocoaLumberjack)
- [Alamofire](https://github.com/Alamofire/Alamofire)

## Code

#### `NETunnelProviderManager`

Of the two core classes mentioned above, `NETunnelProviderManager` maps one-to-one with a VPN configuration. If an app has two VPN configurations, you get two `NETunnelProviderManager` instances in code. There are four operations we need to perform on `NETunnelProviderManager`.

1. Create a VPN configuration

```swift
fileprivate func createProviderManager() -> NETunnelProviderManager {
    let manager = NETunnelProviderManager()
    manager.protocolConfiguration = NETunnelProviderProtocol()
    return manager
}
```

2. Save the VPN configuration

```swift
manager.saveToPreferences {
    if let error = $0 {
        complete(nil, error)
    } else {
        manager.loadFromPreferences(completionHandler: { (error) -> Void in
            if let error = error {
                complete(nil, error)
            } else {
                complete(manager, nil)
            }
        })
    }
}
```

When this code executes, it will prompt the user for authorization. Once granted, a VPN configuration entry is added.

3. Start and stop the VPN

```swift
fileprivate func startVPNWithOptions(_ options: [String : NSObject]?, complete: ((NETunnelProviderManager?, Error?) -> Void)? = nil) {
    // Load provider
    loadAndCreateProviderManager { (manager, error) -> Void in
        if let error = error {
            complete?(nil, error)
        } else {
            guard let manager = manager else {
                complete?(nil, ManagerError.invalidProvider)
                return
            }
            if manager.connection.status == .disconnected || manager.connection.status == .invalid {
                do {
                    try manager.connection.startVPNTunnel(options: options)
                    self.addVPNStatusObserver()
                    complete?(manager, nil)
                }catch {
                    complete?(nil, error)
                }
            } else {
                self.addVPNStatusObserver()
                complete?(manager, nil)
            }
        }
    }
}

public func stopVPN() {
    // Stop provider
    loadProviderManager {
        guard let manager = $0 else {
            return
        }
        manager.connection.stopVPNTunnel()
    }
}
```

4. Observe and update VPN status

```swift
/// Add an observer for VPN status changes
func addVPNStatusObserver() {
    guard !observerDidAdd else {
        return
    }
    loadProviderManager {
        if let manager = $0 {
            self.observerDidAdd = true
            NotificationCenter.default.addObserver(forName: NSNotification.Name.NEVPNStatusDidChange, object: manager.connection, queue: OperationQueue.main, using: { [unowned self] (notification) -> Void in
                self.updateVPNStatus(manager)
            })
        }
    }
}

/// Update the VPN connection status
///
/// - Parameter manager: NEVPNManager
func updateVPNStatus(_ manager: NEVPNManager) {

    switch manager.connection.status {
    case .connected:
        self.vpnStatus = .on
    case .connecting, .reasserting:
        self.vpnStatus = .connecting
    case .disconnecting:
        self.vpnStatus = .disconnecting
    case .disconnected, .invalid:
        self.vpnStatus = .off
    }
}
```

#### `NEPacketTunnelProvider`

`NEPacketTunnelProvider` is where the actual VPN logic lives. The project's `PacketTunnelProvider` is a subclass of it, and the following two methods must be implemented:

```swift
@available(iOS 9.0, *)
open func startTunnel(options: [String : NSObject]? = nil, completionHandler: @escaping (Error?) -> Swift.Void)

@available(iOS 9.0, *)
open func stopTunnel(with reason: NEProviderStopReason, completionHandler: @escaping () -> Swift.Void)
```

When the `NETunnelProviderManager` object in the app calls `startVPNWithOptions`, control flow jumps to `startTunnel` inside the extension.

`startTunnel` takes two parameters: `options` is a dictionary passed in from the app — its contents are entirely up to the developer. `completionHandler` is a closure callback provided by the system. You can save it to a variable and call it when the VPN has finished starting up.

`stopTunnel` also takes two parameters: `reason` represents why the VPN was stopped. iOS defines a set of `NEProviderStopReason` constants, but in practice `reason` is rarely used. The `completionHandler` works the same way as in `startTunnel`.

The code here is largely based on [Potatso](https://github.com/Potatso/Potatso), [Specht](https://github.com/zhuhaow/Specht), and [RabbitVpnDemo](https://github.com/yichengchen/RabbitVpnDemo).

#### Debugging the Network Extension

Debugging app code is straightforward, but how do you debug code inside the extension? Assuming the PacketTunnel code is already in place:

1. Build and run the app.
2. Stop the run.
3. In the Xcode menu, go to `Debug` -> `Attach to Process by PID or Name`, enter `PacketTunnel`, and click `Attach`.
![03](/images/posts/20171115-NetworkExtension/03.png)

4. Launch the app on the device (not through Xcode), then tap Connect — the debugger will hit the breakpoint.
![04](/images/posts/20171115-NetworkExtension/04.png)

### Code
All the code in this article can be found on my GitHub [`QLadder`](https://github.com/tonyh2021/QLadder).
