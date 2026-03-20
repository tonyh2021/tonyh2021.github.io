---
layout: post
title: "Header Files in CocoaPods"
description: ""
category: articles
tags: [iOS]
comments: true
---


I previously wrote about how to create a custom CocoaPods repository.

Now I've run into a new problem: how do you prevent users from importing header files they shouldn't need to touch?

[This Stack Overflow answer](http://stackoverflow.com/questions/7439192/xcode-copy-headers-public-vs-private-vs-project) explains the difference between Public, Private, and Project headers in an Xcode sub-project.

That's the right place to start.

In a podspec configuration file, headers are `project`-scoped by default. If you need headers to be `public` or `private`, you use `public_header_files` and `private_header_files` to expose them accordingly.

Note: even if you use `private_header_files`, those headers can still be imported in a project. So to truly prevent a header from being imported, just leave it as the default `project` scope.

For example:
```ruby
s.public_header_files = 'XXXSDK/Classes/Public/XXXHeader.h'
s.private_header_files = 'XXXSDK/Classes/*.h'
```



