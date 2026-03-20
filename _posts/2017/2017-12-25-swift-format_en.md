---
layout: post
title: "SwiftFormat Usage Guide"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Table of Contents

- [What is SwiftFormat?](#what-is-this)
- [Why would I want to use SwiftFormat?](#why-would-i-want-to-do-that)
- [Usage Guide](#how-do-i-install-it)
    - [Command Line Tool](#command-line-tool)
    - [Xcode Source Editor Extension](#xcode-source-editor-extension)
    - [Other](#other)
- [How it Works](#so-what-does-swiftformat-actually-do)
    - [Options](#options)
    - [Rules](#rules)
- [FAQ](#faq)
- [Cache](#cache)
- [File Headers](#file-headers)

<a name="what-is-this"></a>

## What is SwiftFormat?

SwiftFormat is a command-line tool for reformatting Swift code.

It formats code while preserving its meaning.

<a name="why-would-i-want-to-do-that"></a>

## Why would I want to use SwiftFormat?

Many projects have a fixed code style. Consistent coding standards help with project iteration and maintenance, but some developers ignore these rules. Manually enforcing code style changes is error-prone, and nobody wants to do that tedious work.

If an automated tool can handle this, that's almost the perfect solution. During code reviews, you won't need to keep pointing out the same repetitive formatting issues over and over.

<a name="how-do-i-install-it"></a>

## Usage Guide

There are several ways to install this tool.

1. Run it manually from the command line, or as part of another command.
2. Use it as a Source Editor Extension, accessible via the Editor > SwiftFormat menu in Xcode.
3. Run it in the Xcode project's build phase, executed every time you press Cmd-R or Cmd-B.
4. Use it as a Git pre-commit hook, running before every code commit.

<a name="command-line-tool"></a>

#### Command Line Tool

**Installation:**

The easiest way to install `swiftformat` is via [Homebrew](http://brew.sh/). If you already have Homebrew installed, simply run:

```shell
> brew update
> brew install swiftformat
```

That's all there is to it. If you want to integrate SwiftFormat into your project, you can also use [CocoaPods](https://cocoapods.org/) — see the Xcode build phase instructions below for details.

Alternatively, build the command-line app yourself:

1. Open `SwiftFormat.xcodeproj` and build the `SwiftFormat` scheme.

2. Drag the `swiftformat` binary to `/usr/local/bin/` (this is a hidden folder; you can open it using Finder's `Go > Go to Folder ...` menu).

3. Open `~/.bash_profile` in a text editor (a hidden file; you can open it in Terminal using `open ~/.bash_profile`).

4. Append the following to the end of the file: `alias swiftformat="/usr/local/bin/swiftformat --indent 4"` (`--indent 4` is optional and can be changed to something else). Run `swiftformat --help` to see available options.

5. Save the `.bash_profile` file and run `source ~/.bash_profile` to apply the changes.

**Usage:**

Now, simply type the following in the command line (from inside the directory you want to format):

```shell
swiftformat .
```

**Warning:** `swiftformat .` will overwrite all Swift files in the current directory and all subdirectories. If run from the home directory, it may reformat every Swift file on your hard drive.

To use it safely:

1. Select the files or directory you want to apply changes to.

2. Make sure you have committed all previous changes in git (or any other version control system).

3. (Optional) In Terminal, type `swiftformat --inferoptions "/path/to/your/code/"`. This will list a set of formatting options that match your existing project style. You can ignore it and use the defaults, or customize them yourself.

The path can point to a Swift file or a directory of files. It can be either an absolute or relative path. The `""` around the path are optional, but required if the path contains spaces (or escape them with `\`).

4. In Terminal, type `swiftformat "/path/to/your/code/"` to apply the same formatting operation as above. You can provide multiple paths as arguments, separated by spaces.

If you used `--inferoptions` in step 3 and generated suggested options, add them to this command (either before or after the path).

5. Press Enter to start formatting. After formatting is complete, review the changes using your version control tool and confirm no unwanted changes were introduced. If there are, revert the changes, adjust the options, and try again.

6. (Optional) Commit the changes.

You can also use SwiftFormat as part of a Unix pipe chain. For example:

```shell
cat /path/to/file.swift | swiftformat --output /path/to/file.swift
```

Omitting `--output /path/to/file.swift` will send the output to `stdout`.

<a name="xcode-source-editor-extension"></a>

#### Xcode Source Editor Extension

**Installation:**

In the SwiftFormat project, there is an `EditorExtension` directory containing the latest version of `SwiftFormat for Xcode`. Drag it to the `Applications` directory, double-click to launch, and follow the on-screen instructions.

**Note:** This extension requires Xcode 8 and macOS 10.12 Sierra or later.

**Usage:**

In Xcode, you will find a SwiftFormat option in the Editor menu. You can use it to format the current selection or the entire file.

<a name="other"></a>

#### Other

For `Xcode build phase`, `Git pre-commit hook`, and `On CI using Danger`, this post won't cover those — see the details [here](https://github.com/nicklockwood/SwiftFormat#xcode-build-phase).

<a name="so-what-does-swiftformat-actually-do"></a>

## How it Works

SwiftFormat first converts the source file into tokens, then iteratively applies a set of rules to these tokens to adjust formatting. The tokens are finally converted back to text.

SwiftFormat configuration consists of **rules** and **options**. Rules in SwiftFormat are functions that modify code. Options are settings that control the rules.

I haven't applied the specific options and rules yet, so I haven't organized them in detail here.

<a name="options"></a>

#### Options

For options, refer to [here](https://github.com/nicklockwood/SwiftFormat#options).

<a name="rules"></a>

#### Rules

For rules, refer to [here](https://github.com/nicklockwood/SwiftFormat#rules).

<a name="faq"></a>

## FAQ

For the FAQ, refer to [here](https://github.com/nicklockwood/SwiftFormat#faq).

<a name="cache"></a>

## Cache

SwiftFormat uses a cache file to avoid reformatting files that haven't changed. For large projects, this can significantly reduce processing time.

By default, the cache is stored at `~/Library/Caches/com.charcoaldesign.swiftformat`. You can use the `--cache ignore` command-line option to ignore cached versions and reformat all files. Alternatively, use `--cache clear` to delete the cache (you can also delete the cache file manually).

The cache is shared across all projects. Cache files are small because they only store the path and size of each file, not the file content. If slowdowns start occurring due to the cache growing too large, consider using a separate cache file for each project. You can customize the cache file location by setting the `--cache` argument. For example, you can store the cache file in the project directory. Different users on the same project can share the cache file because paths in the cache are relative to the target files.

<a name="file-headers"></a>

## File Headers

SwiftFormat uses a template to strip or replace the header comment in each file. A "header comment" is defined as a comment block starting from the first non-empty line of the file, followed by at least one empty line. It can consist of a single comment or multiple comments:

```swift
// This is a header comment

// This is a regular comment
func foo(bar: Int) -> Void { ... }
```

The header template is passed as a string using the `--header` command-line option. A value of `ignore` (the default) leaves the header comment unchanged. Use `strip` or an empty string `""` to remove header comments. To provide a custom header template, use the following format:

Single-line template: `--header "Copyright (c) 2017 Foobar Industries"`

For multi-line comments, use `\n` to mark line breaks: `--header "First line\nSecond line"`

You can optionally include Swift comment markers in the template: `--header "/*--- Header comment ---*/"`.

If no comment markers are included, each line in the template will be prefixed with `//` and a space.

To include a copyright notice with the current year at the end of a file header, use:

```shell
--header "Copyright (c) {year} Foobar Industries"
```

The `{year}` token will be automatically replaced with the current year each time SwiftFormat is applied (note: the year is determined by the locale and timezone of the machine running the script).

## Known Issues

- When using the `--self remove` option, the `redundantSelf` rule may remove `self` inside closures, which can change the logic or cause compilation failures. Currently, the only workaround is to use `--disable redundantSelf` to avoid this side effect. Using `--self insert` does not have this issue.

- The `--self insert` option can only recognize locally declared member variables and cannot recognize members inherited from a superclass or added via extensions, so `self` insertion won't work in those cases.

- The `trailingClosures` rule can sometimes produce dangerously ambiguous code, so it is disabled by default. It is recommended to apply this rule manually and review the changes rather than including it in automatic formatting.

- In rare cases, SwiftFormat may incorrectly parse an `=` sign following generic types within `<>=`. For example, the following code will fail to process:

```swift
let foo: Dictionary<String, String>=["Hello": "World"]
```

To resolve this, manually add spaces around the `=` character to eliminate the ambiguity, or add `--disable spaceAroundOperators` to the command-line options.

- If a file starts with a header comment followed by an empty line, the `stripHeaders` rule will remove it. To avoid this, ensure the first comment is immediately followed by a line of code.

- SwiftFormat currently reformats multi-line comment blocks without considering the original indentation. That is:

```swift
/* some documentation

    func codeExample() {
        print("Hello World")
    }
*/
```

becomes:

```swift
/* some documentation

func codeExample() {
print("Hello World")
}

*/
```

To address this, use the `comments` command-line flag to disable automatic comment indentation.

Alternatively, if you want comment indentation enabled, rewrite multi-line comments as individual single-line comments:

```swift
// some documentation
//
//    func codeExample() {
//        print("Hello World")
//    }
//
//
```

Or start each line with `*` (or any other non-whitespace character):

```swift
/* some documentation
*
*    func codeExample() {
*        print("Hello World")
*    }
*
*/
```

- The formatting cache for files is based on file length, which means a file could have the same character count before and after modification, causing SwiftFormat to fail to detect the change and skip formatting.

To address this, use `--cache ignore` to force ignoring the cache file, or append an extra space to the file (SwiftFormat will remove it during formatting).



