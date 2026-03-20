---
layout: post
title: "My Xcode Plugins"
description: ""
category: articles
tags: [iOS]
comments: true
---

### The Spring Festival holiday is three days away and I can't focus on studying RAC, so I'll use this spare time to organize some notes. Here's a quick rundown of the Xcode plugins I use. 😃

- [Alcatraz](https://github.com/alcatraz/Alcatraz): An Xcode plugin manager. After installation, restart Xcode and you'll find "Package Manager" under the "Window" menu. Enjoy!

>PS: Xcode plugins are installed under `~/Library/Application Support/Developer/Shared/Xcode/Plug-ins/`. You can also navigate to this directory manually to remove plugins.

```
//Installation
curl -fsSL https://raw.github.com/alcatraz/Alcatraz/master/Scripts/install.sh | sh

//Uninstall
rm -rf ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins/Alcatraz.xcplugin

//To remove all packages installed via Alcatraz
rm -rf ~/Library/Application\ Support/Alcatraz/
```

- [VVDocumenter-Xcode](https://github.com/onevcat/VVDocumenter-Xcode): Type three forward slashes to generate documentation comments.

- [KSImageNamed-Xcode](https://github.com/ksuther/KSImageNamed-Xcode): Automatically lists all image file names in the project after `imageNamed:`, with thumbnails.

- [FuzzyAutocompletePlugin](https://github.com/FuzzyAutocomplete/FuzzyAutocompletePlugin): Fuzzy code completion — a must-have for the lazy developer.

- [XcodeColors](https://github.com/robbiehanson/XcodeColors): Works with LumberJack to display log output in different colors based on log level.

- [Dash-Plugin-for-Xcode](https://github.com/omz/Dash-Plugin-for-Xcode): Use Dash as a replacement for Xcode's built-in documentation.

- [ACCodeSnippetRepositoryPlugin](https://github.com/acoomans/ACCodeSnippetRepositoryPlugin): Code snippet management — another must-have for the lazy developer.

### That's all I'm currently using — not that many when you list them out. (⊙o⊙)… I rarely use the others, and I didn't install them to avoid slowing down Xcode.

- [ColorSense-for-Xcode](https://github.com/omz/ColorSense-for-Xcode): Useful for UI work — a color picker pops up for `UIColor` or `NSColor` methods. That said, since designers usually provide exact values, it rarely comes in handy.

- [CocoaPods for Xcode](https://github.com/kattrali/cocoapods-xcode-plugin): A CocoaPods plugin for Xcode, but I still prefer using the command line.
