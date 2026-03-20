---
layout: post
title: "我的Xcode插件"
description: ""
category: articles
tags: [iOS]
comments: true
---

### 还有三天春节放假，实在沉不下心去看RAC，于是用这些零散的时间整理些东西吧。简单记录并介绍我用的Xcode插件。😃  

- [Alcatraz](https://github.com/alcatraz/Alcatraz)：Xcode插件管理工具。安装完成后重启Xcode即可在"Window"下找到"Package Manager"。OK，enjoy it！  

>PS:Xcode的插件安装在目录`~/Library/Application Support/Developer/Shared/Xcode/Plug-ins/`下，你也可以手工切换到这个目录来删除插件。

```
//Installation
curl -fsSL https://raw.github.com/alcatraz/Alcatraz/master/Scripts/install.sh | sh

//Uninstall
rm -rf ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins/Alcatraz.xcplugin

//To remove all packages installed via Alcatraz
rm -rf ~/Library/Application\ Support/Alcatraz/
```

- [VVDocumenter-Xcode](https://github.com/onevcat/VVDocumenter-Xcode)：三道斜杠加注释。  

- [KSImageNamed-Xcode](https://github.com/ksuther/KSImageNamed-Xcode)：自动在`imageNamed:`方法后面列出项目里所有的文件名，带缩略图。

- [FuzzyAutocompletePlugin](https://github.com/FuzzyAutocomplete/FuzzyAutocompletePlugin)：懒人必备代码提示。

- [XcodeColors](https://github.com/robbiehanson/XcodeColors)：配合LumberJack根据级别进行不同颜色的日志输出。

- [Dash-Plugin-for-Xcode](https://github.com/omz/Dash-Plugin-for-Xcode)：用Dash来代替Xcode文档。

- [ACCodeSnippetRepositoryPlugin](https://github.com/acoomans/ACCodeSnippetRepositoryPlugin)：懒人必备代码片段。

### 目前就用到这几个，整理一下也不是很多呀。(⊙o⊙)… 其他的用的很少怕影响Xcode速度就没安装。

- [ColorSense-for-Xcode](https://github.com/omz/ColorSense-for-Xcode)：UI使用，UIColor 或者 NSColor 的方法会弹出色盘，不过美工都把数值定好了，也就几乎用不到了。  

- [CocoaPods for Xcode](https://github.com/kattrali/cocoapods-xcode-plugin)：CocoaPods的插件，不过还是习惯用命令行。

