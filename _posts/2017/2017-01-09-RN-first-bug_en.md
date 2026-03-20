---
layout: post
title: "My First React Native Pitfall"
description: ""
category: articles
tags: [React Native]
comments: true
---

## Introduction

Hard to believe it's already 2017 the next time I sit down to write something.

## The Problem

I started looking into React Native, and the HelloWorld project just wouldn't run. The error was:

```
Error: *** Terminating app due to uncaught exception 'NSInternalInconsistencyException',
reason: 'bundleURL must be non-nil when not implementing loadSourceForBridge'
```

After Googling around, many posts suggested this was caused by a VPN tool modifying the hosts file. I quit my VPN tool, but the problem persisted. Then I switched to a different Wi-Fi network on a whim, and it worked — which confirmed the issue was definitely with the hosts file.

When I checked the local hosts file at `/private/etc/`, it was nowhere to be found. I tried creating a new hosts file.

I created a file named `hosts` on the Desktop with the following content:

```
##
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting. Do not change this entry.
##
127.0.0.1   localhost
255.255.255.255 broadcasthost
::1 localhost
fe80::1%lo0 localhost%
```

Then copied it to `/private/etc/`, which prompted for a password.

Restarted, tested normal internet access and VPN — no issues whatsoever.

Ran from Xcode: OK. `react-native run-ios` also worked fine.

I glanced at my locked phone screen and noticed that the Handoff issue that had been bugging me for a long time was also magically resolved.


