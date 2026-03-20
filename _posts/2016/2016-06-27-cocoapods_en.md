---
layout: post
title: "My Experience Upgrading to CocoaPods 1.0"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Background

CocoaPods is a pretty solid dependency manager for third-party frameworks. The one painful part is how slow `pod update` can be. Using offline mode (`--no-repo-update`) helps speed things up, but when you actually need to update, you're stuck sitting around for half the day. The good news is that version 1.0 significantly reduces update time, which was enough to convince me to finally upgrade.

## The Upgrade — High Hopes

And this part is indeed straightforward. Running `sudo gem install cocoapods` gets the job done easily.
Note: When it was still in beta, you needed to add `--pre` to install it.

## Upgrading the Project — Harsh Reality

Of course, after the upgrade, the `Podfile` format needs to be updated — just check the documentation for the specifics.
Once upgraded, naturally I had to "give it a spin." Running `pod install` was noticeably faster. But when I tried to build, errors showed up:
![cocoapods01](/images/posts/20160627-cocoapods/cocoapods01.png)

Even after fixing the issue here, `ReactiveCocoa` and `Masonry` libraries still reported errors.

This problem tortured me for months. Every time I upgraded to the 1.0 beta and ran `pod install`, the same errors appeared. I kept assuming it was something wrong with my project configuration, and each attempt left the project settings in a mess — yet the errors persisted. I ended up rolling back to pods version 0.39 every single time.

## The Solution

Eventually I found the answer on Stack Overflow:

[Cocoapods 1.0: Header files not found](http://stackoverflow.com/questions/37377450/cocoapods-1-0-header-files-not-found)
[error using cocoapods "use_frameworks!" SWIFT](http://stackoverflow.com/questions/31278833/error-using-cocoapods-use_frameworks-swift)

It turned out to be related to `use_frameworks!`, caching issues, and the need to upgrade the versions of `ReactiveCocoa` and `Masonry`.

So I ran `cd /Users/XXX/Library/Developer/Xcode/DerivedData/` and deleted everything under `DerivedData`. I also updated `ReactiveCocoa` to `4.0.1` and `Masonry` to `~> 1.0.0`. Note that `ReactiveCocoa` version `4.1` requires Xcode 7.3 or later, so I pinned it to `4.0.1`. Also be aware of this issue: [4.0.1 possibly breaks semver? #2704](https://github.com/ReactiveCocoa/ReactiveCocoa/issues/2704).

After running `pod install` again and building, there were no more errors. The CocoaPods upgrade was finally a success.

I also tested archiving afterward, and that worked fine too.


