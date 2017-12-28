---
layout: post
title: "Podfile 语法参考"
description: ""
category: articles
tags: [CocoaPods]
comments: true
---

## Podfile

Podfile 用于描述一个或多个 Xcode 项目的 targets 的依赖关系。

Podfile 可以很简单：

```ruby
target 'MyApp'
pod 'AFNetworking', '~> 1.0'
```

复杂一些的：

```ruby
platform :ios, '9.0'
inhibit_all_warnings!

target 'MyApp' do
  pod 'ObjectiveSugar', '~> 0.5'

  target "MyAppTests" do
    inherit! :search_paths
    pod 'OCMock', '~> 2.0.1'
  end
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    puts "#{target.name}"
  end
end
```

## 全局设置

Podfile 的全局配置：

#### `install!`

CocoaPods 安装此 Podfile（也就是执行 pod install/update） 时，指定要使用的安装方法和选项。

第一个参数表示要使用的安装方法；下一个参数表示安装选项。

目前唯一可用的安装方法是 `'cocoapods'`，所以总要将其第一个参数。但未来版本中可能会提供更多的安装方法。

**例如：**

> 指定自定义的 CocoaPods 安装选项

```ruby
install! 'cocoapods',
         :deterministic_uuids => false,
         :integrate_targets => false
```

**支持的命令：**

`:clean`

`:deduplicate_targets`

`:deterministic_uuids`

`:integrate_targets`

`:lock_pod_sources`

`:share_schemes_for_development_pods`

## 依赖

Podfile 会指定每个 target 的依赖关系。

#### `pod`

`pod` 指定了项目的依赖关系，一般通过 Pod 库名称和可选的版本来定义。在项目初期，若需要最新版本的 Pod 库，则只需要省略掉版本即可：

```ruby
pod 'SSZipArchive'
```

随着项目的稳定，则可能需要冻结到特定版本的 Pod 库，便可以指定该版本号。

```ruby
pod 'Objection', '0.9'
```

除了以上两种情况，还有：

- `= 0.1` 0.1 版本。

- `> 0.1` 高于 0.1 的任意版本。

- `>= 0.1` 0.1 及更高版本。

- `< 0.1` 低于 0.1 的任意版本。

- `<= 0.1` 0.1 及更低版本。

- `~> 0.1.2` 介于 0.1.2（包含）和 0.2（不包含） 之间的版本，同时会选择满足条件的最高版本。相当于满足 `>= 0.1.2` 且 `< 0.2.0` 条件的最高版本。

要查看更多内容，可以参考：

- [`Semantic Versioning`](http://semver.org/)

- [`RubyGems Versioning Policies`](http://guides.rubygems.org/patterns/#semantic-versioning)

#### 构建配置

默认情况下，target 的所有 build configuration 都会安装依赖。有时出于调试目的或其他原因，只能将依赖安装在部分 build configuration 中。

```ruby
pod 'PonyDebugger', :configurations => ['Debug', 'Beta']
```

或者，也可以指定将其包含在单个 build configuration 中。

```ruby
pod 'PonyDebugger', :configurations => 'Debug'
```

注意，依赖库是会传递的。有时候需要根据情况手动指定 build configurations。

#### Subspecs

通过名字进行 Pod 安装时，会安装其 podspec 中指定的默认 subspecs。

可以通过以下方式安装 subspec：

```ruby
pod 'QueryKit/Attribute'
```

也可以指定多个 subspec：

```ruby
pod 'QueryKit', :subspecs => ['Attribute', 'QuerySet']
```

依赖也可以从外部指定。

#### 使用本地路径的依赖

如果项目和 Pod 库同时进行开发，则可以使用 `path` 选项。

```ruby
pod 'AFNetworking', :path => '~/Documents/AFNetworking'
```

使用这个选项，CocoaPods 将把给定的目录作为 Pod 的根目录，并且会将其 Pods 项目中的文件关联起来。这样的话，每次编辑都会对 CocoaPods 产生影响。

请注意，目录中应该包含 Pod 库的 `podspec` 文件。

#### 使用指定地址的 pod 库

有时可能需要使用最新版本或特别修改过的 Pod。这种情况下，可以指定 pod 库的地址。

使用依赖库的 `master` 分支：

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git'
```

使用依赖库的另一个分支：

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git', :branch => 'dev'
```

使用 tag：

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git', :tag => '0.7.0'
```

指定某次提交：

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git', :commit => '082f8319af'
```

注意，这也要满足其他 Pod 库的依赖。

`podspec` 一般位于仓库的根目录中。如果仓库不包含 `podspec` 文件，就必须使用以下方法。

#### 从外部获取 `podspec`

可以考虑从外部获取 podspec，比如说通过 HTTP：

```ruby
pod 'JSONKit', :podspec => 'https://example.com/JSONKit.podspec'
```

#### podspec

如果没有指定 podspec 参数，则使用 Podfile 根目录中的第一个 podspec。

**参数**

> options `Hash {Symbol=>String}`

> 加载 podspec 的路径。如果未提供，则使用 Podfile 目录中的第一个 podspec。

**例如：**

```ruby
podspec
podspec :name => 'QuickDialog'
podspec :path => '/Documents/PrettyKit/PrettyKit.podspec'
```

#### target

与 Xcode 的 target 对应，可以指定依赖的作用域。默认情况下，target 会包含外部定义的依赖，除非设置不要 `inherit!`。

**参数**

> name `Symbol, String`

> target 的名称

**例如：**

> 定义 target

```ruby
target 'ZipApp' do
  pod 'SSZipArchive'
end
```

> 定义通过父级访问 SSZipArchive 的测试 target

```ruby
target 'ZipApp' do
  pod 'SSZipArchive'

  target 'ZipAppTests' do
    inherit! :search_paths
    pod 'Nimble'
  end
end
```

> 父 target 的 Pods 应用于多个子 target

```ruby
target 'ShowsApp' do
  pod 'ShowsKit'

  # Has its own copy of ShowsKit + ShowTVAuth
  target 'ShowsTV' do
    pod 'ShowTVAuth'
  end

  # Has its own copy of Specta + Expecta
  # and has access to ShowsKit via the app
  # that the test target is bundled into

  target 'ShowsTests' do
    inherit! :search_paths
    pod 'Specta'
    pod 'Expecta'
  end
end
```

`inherit! :search_paths` 主要影响项目配置中 `Other Linker Flags` 的 `$(inherited)` 配置。

#### abstract_target

定义一个新的抽象目标，它可以方便的用于目标依赖继承。

**参数**

> name `Symbol, String`

> target 的名称

**例如：**

> 定义抽象 target

```ruby
abstract_target 'Networking' do
  pod 'AlamoFire'

  target 'Networking App 1'
  target 'Networking App 2'
end
```

> 定义包含多个 target 的 abstract_target

```ruby
# 注意：workspace 的 Xcode 项目中并没有名为 "Shows" 的 target
abstract_target 'Shows' do
  pod 'ShowsKit'

  # ShowsiOS 包含 ShowsKit（继承）和添加的 ShowWebAuth
  target 'ShowsiOS' do
    pod 'ShowWebAuth'
  end

  # ShowsTV  包含 ShowsKit（继承）和添加的 ShowTVAuth
  target 'ShowsTV' do
    pod 'ShowTVAuth'
  end

  # ShowsTests 包含 Specta 和 Expecta，同时也作为 Shows 的子 target，引入了 ShowsKit
  target 'ShowsTests' do
    inherit! :search_paths
    pod 'Specta'
    pod 'Expecta'
  end
end
```

#### abstract!

表示当前目标是抽象的，因此不会直接链接到 Xcode 的 target。

#### inherit!

设置当前 target 的继承模式。

**参数**

> inheritance `Symbol`

> 要设置的继承模式。

> 可用的模式：`:complete` target 继承父级的所有行为。`:none` target 不会继承父级的行为。`:search_paths` target 只继承父级的 search paths。

**例如：**

> 只继承 search paths

```ruby
target 'App' do
  target 'AppTests' do
    inherit! :search_paths
  end
end
```

## Target configuration

这些设置用于控制 CocoaPods 生成的项目。

需要描述项目适用的 `platform`。`xcodeproj` 文件允许明确指定要链接的项目。

#### platform

用于指定应建立的静态库的平台。如果不指定，则使用默认的配置，当前默认的配置为：iOS `4.3`，OS X `10.6`，tvOS `9.0`，watchOS `2.0`。

iOS < `4.3`时，`armv6` 需要添加到 `ARCHS` 中。

**参数**

> name `Symbol`

> 平台名称，可以为，`:osx`，`:ios`，`:tvos` 以及 `:watchos`。

> target `String, Version`

> 可选。不设置的话将使用默认配置。

**例如：**

> 指定平台

```ruby
platform :ios, '4.0'
platform :ios
```

#### project

为 target 指定 Xcode 项目。

如果没有明确为 target 执行项目，并且 Podfile 同目录下只有一个项目，那么将会指定此项目。

还可以指定是否这些设置在 release 或者 debug 模式下生效，参数为 `:release` 或 `:debug`。

**参数**

> Path `String`

> 项目链接的路径

> build_configurations `Hash{String => symbol}`

> 键值对。键为 Xcode 项目中的 build configurations 名称，值为基于 `:debug` 或 `:release` 配置的 Symbols。如果没有设置的话，默认为 `:release`。

**例如：**

> 指定用户项目

```ruby
# FastGPS 项目中包含此 target
target 'MyGPSApp' do
  project 'FastGPS'
  ...
end

# 相同 Podfile 下，多个 Xcode 项目
target 'MyNotesApp' do
  project 'FastNotes'
  ...
end
```

> 使用自定义构建配置

```ruby
project 'TestProject', 'Mac App Store' => :release, 'Test' => :debug
```

#### xcodeproj

`xcodeproj` 在1.0 版本之后被废弃，改名为 `project`。

#### link_with

`link_with` 在1.0 版本之后被废弃，使用 `abstract_target` 和 target 继承来代替。

#### inhibit_all_warnings!

禁止来自 CocoaPods 库的所有警告。

该属性由子 target 定义继承。

如果每个 pod 库都想禁用警告，则可以使用：

```ruby
pod 'SSZipArchive', :inhibit_warnings => true
```

此外，当使用 `inhibit_all_warnings！` 属性时，也可以排除某个不禁用警告的库：

```ruby
pod 'SSZipArchive', :inhibit_warnings => false
```

#### use_frameworks!

使用 frameworks 代替静态库。

该属性由子 target 定义继承。

## Workspace

列出了用于配置工作区和设置全局设置的选项。

#### workspace

指定 Xcode workspace 包含所有的项目。

如果没有指定明确的 Xcode workspace，并且 Podfile 同目录下只有一个项目，那么将使用该项目的名称作为 workspace 的名称。

**参数**

> path `String`

> workspace 的路径。

**例如：**

> 指定 workspace

```ruby
workspace 'MyWorkspace'
```

#### generate_bridge_support!

指定所有已安装的 Pods 库都需要从其头文件生成 BridgeSupport 元数据文档。

此功能用于脚本语言（比如 `MacRuby`、`Nu` 或 `JSCocoa`）来桥接类型和方法等。

#### set_arc_compatibility_flag!

指定 `OTHER_LD_FLAGS` 应该加入 -fobjc-arc 的标识。

## Sources

用来指定 Pod 库的来源。Sources 是全局的，并且不由 target 自己定义。

源是顺序相关的。CocoaPods 将使用包含 Pod 的第一个源的 Pod 的最高版本（无视其他源是否有更高版本）。

官方的 CocoaPods 源是隐士包含的。一旦指定另一个来源，那么它将会包括在。

**参数**

> source `String`

> 源地址

**例如：**

指定首先使用 Artsy 库，然后使用 CocoaPods 的 Master 库

```ruby
source 'https://github.com/artsy/Specs.git'
source 'https://github.com/CocoaPods/Specs.git'
```

## Hooks

Podfile 提供了可以在安装过程中调用的钩子。钩子是全局的，并且不由 target 自己定义。

#### plugin

指定了安装期间应使用的插件，以及在调用时应该传递给插件的选项。

**参数**

> name `String`

> 插件的名字

> options `Hash`

> 钩子被调用时应该传递给插件的可选选项。

**例如：**

> 指定使用 `slather` 和 `cocoapods-keys` 插件。

```ruby
plugin 'cocoapods-keys', :keyring => 'Eidolon'
plugin 'slather'
```

#### pre_install

这个挂钩允许下载完成之后，但是在安装之前对 Pod 进行修改。

接受 [`Pod::Installer`](http://rubydoc.info/gems/cocoapods/Pod/Installer/) 作为唯一参数。

**例如：**

> Podfile 中定义 pre-install 钩子

```ruby
pre_install do |installer|
  # Do something fancy!
end
```

#### post_install

允许生成的 Xcode 项目被写入磁盘之前进行最后的修改，或者执行其他的任务。

接受 [`Pod::Installer`](http://rubydoc.info/gems/cocoapods/Pod/Installer/) 作为唯一参数。

**例如：**

自定义所有 target 的构建设置

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_ENABLE_OBJC_GC'] = 'supported'
    end
  end
end
```













