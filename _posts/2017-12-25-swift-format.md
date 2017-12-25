---
layout: post
title: "SwiftFormat 使用指南"
description: ""
category: articles
tags: [Swift]
comments: true
---

## 目录

- [什么是 SwiftFormat？](#what-is-this)
- [为什么要用 SwiftFormat？](#why-would-i-want-to-do-that)
- [使用指南](#how-do-i-install-it)
    - [命令行工具](#command-line-tool)
    - [Xcode Source Editor Extension](#xcode-source-editor-extension)
    - [其他](#other)
- [工作原理](#so-what-does-swiftformat-actually-do)
    - [选项](#options)
    - [规则](#rules)
- [FAQ](#faq)
- [缓存](#cache)
- [文件头](#file-headers)

<a name="what-is-this"></a>

## 什么是 SwiftFormat？

SwiftFormat 是用于重新格式化 Swift 代码的命令行工具。

它会在保持代码意义的前提下，将代码进行格式化。

<a name="why-would-i-want-to-do-that"></a>

## 为什么要用 SwiftFormat？

很多项目都有固定的代码风格，统一的代码规范有助于项目的迭代和维护，而有的程序员却无视这些规则。同时，手动强制的去修改代码的风格又容易出错，而且没有人愿意去做这些无聊的工作。

如果有自动化的工具能完成这些工作，那几乎是最完美的方案了。在代码 review 时就不需要每次都强调无数遍繁琐的代码格式问题了。

<a name="how-do-i-install-it"></a>

## 使用指南

有好几种方式来安装这个工具。

1. 命令行中手动执行，或者作为其他命令的一部分。
2. 作为 Source Editor Extension，可以通过 Xcode 中的 Editor > SwiftFormat 菜单调用。
3. 在 Xcode 项目的构建阶段，每次按 Cmd-R 或 Cmd-B 时执行。
4. 可以作为 Git 的提交之前的 hook，每次提交代码之前都可以执行。

<a name="command-line-tool"></a>

#### 命令行工具

**安装：**

安装 `swiftformat` 最简单的方法是通过 [Homebrew](http://brew.sh/)。如果你已经安装了 Homebrew，只需输入命令：

```shell
> brew update
> brew install swiftformat
```

就是这么简单。如果你想把 SwiftFormat 集成到你的项目中，也可以使用 [CocoaPods](https://cocoapods.org/) —— 请参阅下面的 Xcode 构建阶段说明以获取详细信息。

或者，自己构建命令行应用程序：

1. 打开 `SwiftFormat.xcodeproj` 并构建 `SwiftFormat` 的 scheme。

2. 将 `swiftformat` 二进制文件拖到 `/usr/local/bin/` 目录下（这是一个隐藏文件夹，可以使用 Finder 的 `Go > Go to Folder ...` 菜单打开）。

3. 在文本编辑器中打开 `〜/.bash_profile`（隐藏文件，可以在终端中使用 `open 〜/.bash_profile` 来打开）。

4. 在文件的最后追加：`alias swiftformat="/usr/local/bin/swiftformat --indent 4"`（`--indent 4` 可以忽略，或者换成别的）。运行 `swiftformat --help` 查看可用选项）。

5. 保存 `.bash_profile` 文件并运行命令 `source〜/.bash_profile` 以使更改生效。

**使用：**

现在，只需要在命令行中（进入需要格式化的目录）输入：

```shell
swiftformat .
```

**警告：** `swiftformat .` 将覆盖所在当前目录中所有的 Swift 文件以及其中的所有子文件夹。如果从主目录运行它，它可能会重新格式化硬盘上的每个 Swift 文件。

要安全地使用它，请执行以下操作：

1. 选择想要应用更改的文件或目录。

2. 确保你已经在 git（或者其他任何版本控制工具）中提交过之前的修改。

3. （可选）在终端中，输入 `swiftformat --inferoptions "/path/to/your/code/"`。这将会列出一组格式化选项来与现有项目风格相匹配，不过可以忽略而使用默认设置，或者干脆自己定制。

路径可以指向一个 Swift 文件或一个文件目录。既可以是绝对路径，也可以是相对路径。路径周围的 `""` 是可选的，但如果路径中包含空格，则需要使用引号或用 `\` 进行转义。

4. 在终端中，输入 `swiftformat "/path/to/your/code/"`，将会应用与上面同样的格式化操作。可以使用空格将多个路径的作为参数。

在步骤 3 中使用了 `--inferoptions` 选项并生成了建议的选项的话，则应该将其添加到命令中（放在路径的前面或后面都是可以的）。

5. 按回车开始格式化。格式化完成后，使用版本控制工具检查更改，并确认没有引入不需要的更改。如果有，则需要恢复更改，调整选项，然后再试一次。

6. （可选）提交修改。

也可以使用 unix pipes 将 swiftformat 作为命令链的一部分。例如，以下：

```shell
cat /path/to/file.swift | swiftformat --output /path/to/file.swift
```

去掉 `--output /path/to/file.swift` 将会将其输出到 `stdout`。

<a name="xcode-source-editor-extension"></a>

#### Xcode Source Editor Extension

**安装：**

在 SwiftFormat 项目下，有一个 `EditorExtension` 目录，其中包含了最新版本的 `SwiftFormat for Xcode`。将其拖到 `Applications` 目录下，然后双击启动，然后按照屏幕上的说明进行操作。

**注意：** 该扩展需要 Xcode 8 和 MacOS 10.12 Sierra 以上版本。

**使用：**

在 Xcode 中，可以在 Editor 菜单下找到一个 SwiftFormat 选项。您可以使用它来格式化当前选择或整个文件。

<a name="other"></a>

#### 其他

至于 `Xcode build phase`、`Git pre-commit hook` 和 `On CI using Danger`，本文就不介绍了，具体查看[这里](https://github.com/nicklockwood/SwiftFormat#xcode-build-phase)吧。

<a name="so-what-does-swiftformat-actually-do"></a>

## 工作原理

SwiftFormat 首先将源文件转换为标识符，然后循环将一组规则应用于这些标识符进行格式调整。标识符最后被转换回文本。

SwiftFormat 的配置分为**规则**和**选项**。SwiftFormat 中的规则是用来修改代码的函数。选项则是控制规则的设置。

具体的选项和规则还没有应用过，所以暂时没有做整理。

<a name="options"></a>

#### 选项

选项请参阅[这里](https://github.com/nicklockwood/SwiftFormat#options)。

<a name="rules"></a>

#### 规则

规则请参阅[这里](https://github.com/nicklockwood/SwiftFormat#rules)。

<a name="faq"></a>

## FAQ

FAQ 请参阅[这里](https://github.com/nicklockwood/SwiftFormat#faq)。

<a name="cache"></a>

## 缓存

SwiftFormat 使用缓存文件来避免重新格式化没有修改的文件。对于大型项目，可以显著减少处理时间。

默认情况下，缓存保存在 `〜/Library/Caches/com.charcoaldesign.swiftformat` 中。可以使用命令行选项 `--cache ignore`来忽略缓存的版本，并重新对所有文件应用格式化。或者，您可以使用 `--cache clear` 来删除缓存（也可以手动删除缓存文件）。

缓存在所有项目之间共享。缓存文件很小，因为只存储了每个文件的路径和大小，而不是文件内容。如果由于缓存增长过大而开始出现变慢的情况，则可能需要考虑为每个项目使用单独的缓存文件。可以通过设置 `--cache` 参数来自定义缓存文件位置。例如，可以将缓存文件存储在项目目录中。同一项目的不同用户可以共享缓存文件，因为缓存文件中的路径是相对于目标文件的。

<a name="file-headers"></a>

## 文件头

SwiftFormat 通过模板去除或替换每个文件中的头注释。“头注释”被定义为从文件的第一个非空行开始的注释块，后面至少有一个空行。这可以由单个注释组成，也可能由多个注释组成：

```swift
// 这是头注释

// 这是普通注释
func foo(bar: Int) -> Void { ... }
```

标题模板是使用 `--header` 命令行选项传入的字符串。参数为 `ignore`（默认）则不会修改头注释。使用 `strip` 或空字符串 `""` 将会移除头注释。如果要提供一个自定义的头文件模板，格式如下：

单行模板：`--header "Copyright (c) 2017 Foobar Industries"`

对于多行注释，用 `\n` 标记换行符：`--header "First line\nSecond line"`

还可以选择在模板中包含 Swift 注释标记：`--header "/*--- Header comment ---*/"`。

如果不包含注释标记，模板中的每一行都会以 `//` 加一个空格开头。

头标题的最后，通常是包含当前年份的版权声明，使用以下命令：

```shell
--header "Copyright (c) {year} Foobar Industries"
```

每当应用 SwiftFormat 时，{year} 标记将被自动替换为当前年份（注意：年份由运行脚本的机器的语言环境和时区确定）。

## 已知问题

- 当使用 `--self remove` 选项时，`redundantSelf` 规则将会移除闭包中的 `self`，这将会改变代码的逻辑，或者编译失败。目前，只能使用 `--disable redundantSelf` 来避免副作用。使用 `--self insert` 选项则不会有类似问题。

- `--self insert` 选项只能识别本地声明的成员变量，而无法识别从父类继承的或扩展的成员变量，所以在这些情况下无法实现 `self` 插入。

- `trailingClosures` 规则有时会生成有危害的模糊代码，所以这个规则默认是禁用的。建议手动应用此规则并检查修改后的内容，而不要将其包含在自动格式化中。

- 极少的情况下，SwiftFormat 可能会错误地解析泛型类型后面的 `<>=` 中的 `=` 符号。例如，下面代码将会处理失败：

```swift
let foo: Dictionary<String, String>=["Hello": "World"]
```

要解决这个问题，可以在 `=` 字符周围手动添加空格以消除模糊性，或者在命令行选项中添加 `--disable spaceAroundOperators`。

- 如果一个文件以头注释开始并且注释后跟着一个空行，`stripHeaders` 规则会将其删除。为避免这种情况，请确保第一个注释后面紧接着一行代码。

- SwiftFormat目前重新格式化多行注释块，而不考虑原始缩进。也就是说：

```swift
/* some documentation

    func codeExample() {
        print("Hello World")
    }
*/
```

会变为

```swift
/* some documentation

func codeExample() {
print("Hello World")
}

*/
```

要解决该问题，可以使用 `comments` 命令行标志来禁用自动缩进注释功能。

或者，如果想要启用注释缩进功能，则可以将多行注释重写为一行单行注释：

```swift
// some documentation
//
//    func codeExample() {
//        print("Hello World")
//    }
//
//
```

或者每一行用 `*`（或任何其他非空白字符）开始：

```swift
/* some documentation
*
*    func codeExample() {
*        print("Hello World")
*    }
*  
*/
```

- 格式化的文件缓存基于文件长度，则会有可能出现修改前后字符数相同的情况，这回导致 SwiftFormat 无法鉴别出文件的修改从而使得格式化失败。

要解决该问题，可以使用 `--cache ignore` 强制忽略缓存文件，或者在文件中额外追加一个空格（SwiftFormat 会在格式化时删除它）。



