---
layout: post
title: "升级10.11后关于cocoapods xcode plugin"
description: ""
category: articles
tags: [CocoaPods]
comments: true
---

## 瞎扯

把家里的MBPR升级了10.11，之前几款软件就不能用了，国内的软件版权保护工作的确做得不错，只好google关键字"XXX(软件名) crack"，重装这几款软件。

要命的是Xcode趁我不注意竟然自动升级到传说中坑爹的7.3，懒得退回。不过有几款插件貌似不好用，[VVDocumenter-Xcode](https://github.com/onevcat/VVDocumenter-Xcode)重装下就OK了。可是[cocoapods-xcode-plugin](https://github.com/kattrali/cocoapods-xcode-plugin)不能用了，提示`Resolved command path for "pod" is invalid.`。

## 折腾

刚开始以为cocoapods有问题，就通过gem卸载了重装，却发现`ERROR: While executing gem ... (Errno::EPERM) Operation not permitted - /usr/bin/pod`。明明用了sudo，为何会有权限问题呢。

stackoverflow上[Cannot install cocoa pods after uninstalling, results in error](http://stackoverflow.com/questions/30812777/cannot-install-cocoa-pods-after-uninstalling-results-in-error/30851030#30851030)有解决方案：`sudo nvram boot-args="rootless=0"; sudo reboot`。

#### rootless

`rootless`是个什么鬼？

从`El Capitan`开始，苹果使用了系统集成保护，苹果决定第三方应用有一些永远不会被允许的事情。第三方应用相比起来更受限制。这就是`rootless`一词的由来，系统在某种程度上限制了管理员账号的权限。

`rootless`特性使得某些操作只有苹果的应用可以被许可（通过代码签名来判断）。所以第三方应用即使是运行在root权限中，有一些操作也无法完成。

说人话：默认创建的用户虽然看上去有root权限，但实际上这个root用户无法修改`/System` `/bin` `/sbin` `/usr (except /usr/local)`目录。

在早期的`beta El Capitan`中可以通过`sudo nvram boot-args="rootless=0"; sudo reboot`关闭 `rootless` ，但是正式版中已经禁止（即便关闭好像也不起作用）。

看到这里，我突然觉得隐隐的蛋疼，试了下gem命令，果然有问题，于是更新`RubyGems`:`gem update --system`。

#### 关于rvm

再次执行`gem install cocoapods`没有了权限问题，却出现`activesupport requires Ruby version >= 2.2.2.`

再次google，需要通过rvm来设置下ruby的环境。

执行`curl -L https://get.rvm.io | bash -s stable`安装rvm。

执行`rvm install 2.2.2`安装`ruby 2.2.2`版本。

执行`rvm 2.2.2 --default`设置`ruby 2.2.2`为默认ruby版本。

```
$ ruby -v
ruby 2.2.2p95 (2015-04-13 revision 50295) [x86_64-darwin14]
```

再次执行`gem install cocoapods`成功（而且不用再加sudo了）。

并且在项目目录下执行`pod install`成功。

#### cocoapods xcode plugin

回到Xcode，菜单中选择`pod install`，还是有错误。于是命令行中执行`where pod`，原来此时的pod在rvm目录下。

```
$ where pod
/Users/BloodLine/.rvm/gems/ruby-2.2.2/bin/pod
```

将菜单中的GEM_PATH后添加`~/.rvm/gems/ruby-2.2.2/bin`，再次选择`pod install`，成功。

#### 重装Homebrew

在此之前先google足够`10.11 Homebrew`的信息，包括stackoverflow。

卸载Homebrew：

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
```

安装Homebrew：

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

上一步如果有权限问题：

```
sudo chown -R $(whoami):admin /usr/local
```

## 参考：

[About OS X System Integrity Protection (SIP, Rootless)](https://zhuanlan.zhihu.com/p/20144279)

['Rootless': What it is, and why you shouldn't care.](https://www.reddit.com/r/apple/comments/3dbysa/rootless_what_it_is_and_why_you_shouldnt_care_an/?st=iqq8ujk6&sh=efdebe84)

[What is the “rootless” feature in El Capitan, really?](http://apple.stackexchange.com/questions/193368/what-is-the-rootless-feature-in-el-capitan-really)


