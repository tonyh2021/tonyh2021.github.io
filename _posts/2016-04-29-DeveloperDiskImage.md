---
layout: post
title: Could not find Developer Disk Image
description: 
category: articles
tags: iOS
comments: true
---

## 前言

在调试iOS 9.3版本的时候遇到了`Could not find Developer Disk Image`问题。之前每次升级都会遇到这个问题，但是都没有整理，这次整理一下。

`Could not find Developer Disk Image`是由于真机系统过高或者过低，Xcode中没有匹配的配置包文件，可以通过这个路径进入配置包的存放目录：`/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport`。因为看到不少人抱怨Xcode 7.3太卡就没升级，于是没有包含真机的系统，则不能进行真机测试。

具体配置方法:

在Finder中快捷键`cmd+shift+G`，然后输入`/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport`。将9.3复制到此目录下（需要管理员密码）。

![png](http://7xr0hq.com1.z0.glb.clouddn.com/QQ20160429-0@2x.png)

链接: [http://pan.baidu.com/s/1kU9mgE7](http://pan.baidu.com/s/1kU9mgE7) 密码: i6qp

