---
layout: post
title: "My Personal Collection of Code Snippets"
description: ""
category: articles
tags: [iOS]
comments: true
---

## My Code Snippet

I have to admit I'm a fairly lazy person — I don't want to type the same code a third time, so I automate as much as possible. With that in mind, I've built up a collection of code snippets.

Syncing code snippets can be a challenge, but there are two main approaches:

1. Use [ACCodeSnippetRepositoryPlugin](https://github.com/acoomans/ACCodeSnippetRepositoryPlugin) to manage code snippets.
2. Use `github` for version control and create symbolic links locally. This is the approach I use.


### Notes:
- You can use the script `build_snippets.sh`:

```
$ ./build_snippets.sh
done
```

- The `Completion Shortcut` (autocomplete shortcut key) is the most important setting. Once you configure a keyword, typing it in the editor will bring up autocomplete suggestions. Without it, code snippets can only be dragged into the editor. The `Title` and `Summary` are displayed in the autocomplete popup. Specifying a `Language` and `Completion Scopes` restricts the snippet to specific contexts. When you drag a snippet to create it, Xcode will automatically infer these based on where you dragged from.

- Placeholders in code snippets can be added in the format `<#placeholder hint#>`.

- Completion shortcut keys can include a small number of special symbols — known ones include `@ $`. Other symbols besides `@`, while they can be entered, will cause the shortcut to stop working from that character onward (for example, if the shortcut is `$+`, after typing `$` and seeing the suggestion appear, typing `+` will dismiss it).

- User-defined code snippets are stored in `~/Library/Developer/Xcode/UserData/CodeSnippets`.

- Some shortcut examples:

```
//Title : Property Assign
//Completion Shortcut : @pa
//Completion Scopes : All
@property (nonatomic, assign) <#type#> <#name#>;

//@pc
@property (nonatomic, copy) <#type#> <#name#>;

//@pr
@property (nonatomic, readonly) <#type#> <#name#>;

//@prw
@property (nonatomic, readwrite) <#type#> <#name#>;

//@ps
@property (nonatomic, strong) <#type#> <#name#>;

//@pw
@property (nonatomic, weak) <#type#> <#name#>;

//@pb
@property (nonatomic, copy) void (^<#block name#>)(void);

//@pi
@property (nonatomic, weak) IBOutlet <#type#> <#name#>;

```

- Complete method autocomplete uses `@` as the prefix.


Check them all out after installation.

### Code:
All code from this article can be found on my GitHub at [`MyCodeSnippet`](https://github.com/tonyh2021/MyCodeSnippet).

