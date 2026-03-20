---
layout: post
title: "CocoaPods and Xcode Plugin Issues After Upgrading to OS X 10.11"
description: ""
category: articles
tags: [iOS]
comments: true
---

## The Situation

I upgraded the MBPR at home to OS X 10.11, and a few apps stopped working. Software DRM in China is quite effective it seems — had to Google "XXX crack" for each one and reinstall.

To make matters worse, Xcode quietly auto-upgraded to the notoriously problematic version 7.3 while I wasn't looking. I was too lazy to roll it back. A few plugins seemed broken though — reinstalling [VVDocumenter-Xcode](https://github.com/onevcat/VVDocumenter-Xcode) fixed it. But [cocoapods-xcode-plugin](https://github.com/kattrali/cocoapods-xcode-plugin) wouldn't work, showing the error: `Resolved command path for "pod" is invalid.`

## Troubleshooting

At first I assumed CocoaPods itself was broken, so I uninstalled and reinstalled it via gem — only to get: `ERROR: While executing gem ... (Errno::EPERM) Operation not permitted - /usr/bin/pod`. I had used sudo, so why the permission error?

There's a solution on Stack Overflow at [Cannot install cocoa pods after uninstalling, results in error](http://stackoverflow.com/questions/30812777/cannot-install-cocoa-pods-after-uninstalling-results-in-error/30851030#30851030): `sudo nvram boot-args="rootless=0"; sudo reboot`.

#### Rootless

What is `rootless`?

Starting with `El Capitan`, Apple introduced System Integrity Protection (SIP). Apple decided that there are certain things third-party apps will never be permitted to do, making them more restricted than before. This is where the term `rootless` comes from — the system places limits on administrator account privileges to some extent.

The `rootless` feature restricts certain operations to only Apple-signed applications. So even third-party apps running as root cannot perform some operations.

In plain terms: the default user account looks like it has root privileges, but in reality even the root user cannot modify the `/System`, `/bin`, `/sbin`, and `/usr` (except `/usr/local`) directories.

In early `El Capitan` betas, you could disable `rootless` with `sudo nvram boot-args="rootless=0"; sudo reboot`, but this was blocked in the final release (and apparently doesn't work even if you try).

Seeing this, I had a sinking feeling and tried the gem command — sure enough, it was broken. So I updated RubyGems: `gem update --system`.

#### About rvm

Running `gem install cocoapods` again — no more permission error, but now: `activesupport requires Ruby version >= 2.2.2.`

Another Google search: I needed to use rvm to set the Ruby environment.

Install rvm:

```
curl -L https://get.rvm.io | bash -s stable
```

Install Ruby 2.2.2:

```
rvm install 2.2.2
```

Set Ruby 2.2.2 as default:

```
rvm 2.2.2 --default
```

```
$ ruby -v
ruby 2.2.2p95 (2015-04-13 revision 50295) [x86_64-darwin14]
```

Running `gem install cocoapods` again succeeded (and no longer needed sudo).

Running `pod install` in the project directory also succeeded.

#### CocoaPods Xcode Plugin

Back in Xcode, selecting `pod install` from the menu still gave an error. Running `where pod` in the terminal revealed that pod now lived in the rvm directory:

```
$ where pod
/Users/BloodLine/.rvm/gems/ruby-2.2.2/bin/pod
```

I added `~/.rvm/gems/ruby-2.2.2/bin` to the GEM_PATH in the plugin menu, selected `pod install` again, and it succeeded.

#### Reinstalling Homebrew

Before this, make sure to Google enough about `10.11 Homebrew`, including Stack Overflow.

Uninstall Homebrew:

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
```

Install Homebrew:

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

If the previous step has permission issues:

```
sudo chown -R $(whoami):admin /usr/local
```

## References

[About OS X System Integrity Protection (SIP, Rootless)](https://zhuanlan.zhihu.com/p/20144279)

['Rootless': What it is, and why you shouldn't care.](https://www.reddit.com/r/apple/comments/3dbysa/rootless_what_it_is_and_why_you_shouldnt_care_an/?st=iqq8ujk6&sh=efdebe84)

[What is the "rootless" feature in El Capitan, really?](http://apple.stackexchange.com/questions/193368/what-is-the-rootless-feature-in-el-capitan-really)
