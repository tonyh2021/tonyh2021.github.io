---
layout: post
title: "SublimeText的snipptes使用"
description: ""
category: articles
tags: [SublimeText]
comments: true
---

Xcode 下的 snipptes 经常使用，但是新建 Podfile 时也想省事儿，咋办？因为好多时候都是在 Sublime Text 3（以下简称 ST3）查看编辑Podfile的。

ST3 怎么会没有这种懒人功能呢。`Tools > New Snipptes...`

![](https://tonyh2021.github.io/images/old_images/sublimetext-snipptes.png)

可以看到新建的snipptes文件：

```xml
<snippet>
    <content><![CDATA[
Hello, ${1:this} is a ${2:snippet}.
]]></content>
    <!-- Optional: Set a tabTrigger to define how to trigger the snippet -->
    <!-- <tabTrigger>hello</tabTrigger> -->
    <!-- Optional: Set a scope to limit where the snippet will trigger -->
    <!-- <scope>source.python</scope> -->
</snippet>
```

在`<content>`中的`<![CDATA[`之后添加代码片段就可以了。

```xml
    <content><![CDATA[
        
platform :ios, '8.0'
use_frameworks!

target '${1:target}' do
    pod 'AFNetworking', '~> 2.5.1'
    pod 'Masonry',  '~> 0.6.4'
    pod 'ReactiveCocoa', '~> 2.5'
end

]]></content>
```

然后在 `<tabTrigger>` 中设置让 ST3 自动补全代码片段的触发词（`trigger keyword`）。这里我设置了 `podfile` 。

```xml
<tabTrigger>podfile</tabTrigger>
```

最后，可以定义代码片段的使用范围（`scope`）。可以设置为相应的文件代码下进行提示。（Podfile貌似是使用ruby的语法，但是我还是把它设置为全局范围了，也就是没有添加范围。）

```xml
<scope>source.python</scope>
```

如果需要编辑代码片段中的一些特殊属性，比如这里的target，可以使用`'${1:target}'`来指定，并且可以用`1:`指定顺序。

```xml
target '${1:target}' do
```

完整的代码：

```xml
<snippet>
    <content><![CDATA[
        
platform :ios, '8.0'
use_frameworks!

target '${1:target}' do
    pod 'AFNetworking', '~> 2.5.1'
    pod 'Masonry',  '~> 0.6.4'
    pod 'ReactiveCocoa', '~> 2.5'
end

]]></content>
    <!-- Optional: Set a tabTrigger to define how to trigger the snippet -->
    <tabTrigger>podfile</tabTrigger>
    <!-- Optional: Set a scope to limit where the snippet will trigger -->
    <!-- <scope>source.python</scope> -->
</snippet>
```

最后 `commond + s` 保存到 `/Users/.../Library/Application Support/Sublime Text 3/Packages/User`目录下，扩展名为 `.sublime-snippet` 。

这样，新建的podfile代码片段就可以使用啦。

