---
layout: post
title: "Podfile Syntax Reference"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Podfile

A Podfile describes the dependencies of one or more Xcode project targets.

A Podfile can be very simple:

```ruby
target 'MyApp'
pod 'AFNetworking', '~> 1.0'
```

Or more complex:

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

## Global Settings

Global configuration for the Podfile:

#### `install!`

Specifies the installation method and options to use when CocoaPods installs this Podfile (i.e., when running `pod install` or `pod update`).

The first parameter specifies the installation method to use; subsequent parameters are installation options.

The only currently available installation method is `'cocoapods'`, so it must always be the first argument. However, additional methods may be provided in future versions.

**Example:**

> Specify custom CocoaPods installation options

```ruby
install! 'cocoapods',
         :deterministic_uuids => false,
         :integrate_targets => false
```

**Supported keys:**

`:clean`

`:deduplicate_targets`

`:deterministic_uuids`

`:integrate_targets`

`:lock_pod_sources`

`:share_schemes_for_development_pods`

## Dependencies

The Podfile specifies the dependencies for each target.

#### `pod`

`pod` specifies a project dependency, typically defined by a Pod library name and an optional version. In early stages of a project, if you need the latest version of a Pod, simply omit the version:

```ruby
pod 'SSZipArchive'
```

As the project stabilizes, you may want to lock to a specific version:

```ruby
pod 'Objection', '0.9'
```

In addition to the above two cases:

- `= 0.1` — version 0.1 exactly.

- `> 0.1` — any version higher than 0.1.

- `>= 0.1` — version 0.1 and higher.

- `< 0.1` — any version lower than 0.1.

- `<= 0.1` — version 0.1 and lower.

- `~> 0.1.2` — versions from 0.1.2 (inclusive) up to but not including 0.2, selecting the highest version that satisfies the constraint. Equivalent to `>= 0.1.2` and `< 0.2.0`.

For more information, see:

- [`Semantic Versioning`](http://semver.org/)

- [`RubyGems Versioning Policies`](http://guides.rubygems.org/patterns/#semantic-versioning)

#### Build Configurations

By default, dependencies are installed for all build configurations of a target. Sometimes, for debugging or other purposes, you only want a dependency installed in certain build configurations.

```ruby
pod 'PonyDebugger', :configurations => ['Debug', 'Beta']
```

Or you can specify it for a single build configuration:

```ruby
pod 'PonyDebugger', :configurations => 'Debug'
```

Note that dependencies are transitive. Sometimes you may need to manually specify build configurations depending on your situation.

#### Subspecs

When installing a Pod by name, the default subspecs specified in its podspec are installed.

You can install a specific subspec like this:

```ruby
pod 'QueryKit/Attribute'
```

Or specify multiple subspecs:

```ruby
pod 'QueryKit', :subspecs => ['Attribute', 'QuerySet']
```

Dependencies can also be specified from external sources.

#### Dependencies Using a Local Path

If you are developing a project and a Pod library simultaneously, you can use the `path` option.

```ruby
pod 'AFNetworking', :path => '~/Documents/AFNetworking'
```

With this option, CocoaPods treats the given directory as the root of the Pod and links its files into the Pods project. This way, every edit immediately affects CocoaPods.

Note that the directory must contain the Pod's `podspec` file.

#### Dependencies from a Specific Git Address

Sometimes you may need to use the latest version or a specially modified version of a Pod. In that case, you can specify the pod's Git address.

Use the `master` branch of the dependency:

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git'
```

Use a different branch:

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git', :branch => 'dev'
```

Use a specific tag:

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git', :tag => '0.7.0'
```

Use a specific commit:

```ruby
pod 'AFNetworking', :git => 'https://github.com/gowalla/AFNetworking.git', :commit => '082f8319af'
```

Note that this must also satisfy the dependencies of other Pod libraries.

The `podspec` is generally located in the root of the repository. If the repository does not contain a `podspec` file, you must use the method below.

#### Fetching `podspec` from an External Source

You can fetch the podspec from an external source, such as via HTTP:

```ruby
pod 'JSONKit', :podspec => 'https://example.com/JSONKit.podspec'
```

#### podspec

If no podspec argument is specified, the first podspec found in the Podfile's root directory is used.

**Parameters**

> options `Hash {Symbol=>String}`

> The path from which to load the podspec. If not provided, the first podspec in the Podfile directory is used.

**Examples:**

```ruby
podspec
podspec :name => 'QuickDialog'
podspec :path => '/Documents/PrettyKit/PrettyKit.podspec'
```

#### target

Corresponds to an Xcode target and allows scoping of dependencies. By default, a target inherits externally defined dependencies, unless `inherit!` is set to opt out.

**Parameters**

> name `Symbol, String`

> The name of the target.

**Examples:**

> Define a target

```ruby
target 'ZipApp' do
  pod 'SSZipArchive'
end
```

> Define a test target that accesses SSZipArchive via the parent

```ruby
target 'ZipApp' do
  pod 'SSZipArchive'

  target 'ZipAppTests' do
    inherit! :search_paths
    pod 'Nimble'
  end
end
```

> Apply parent target's Pods to multiple child targets

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

`inherit! :search_paths` primarily affects the `$(inherited)` setting in `Other Linker Flags` in the project configuration.

#### abstract_target

Defines a new abstract target, which is useful for conveniently sharing dependency inheritance across targets.

**Parameters**

> name `Symbol, String`

> The name of the target.

**Examples:**

> Define an abstract target

```ruby
abstract_target 'Networking' do
  pod 'AlamoFire'

  target 'Networking App 1'
  target 'Networking App 2'
end
```

> Define an abstract_target containing multiple targets

```ruby
# Note: there is no target named "Shows" in the Xcode project for this workspace
abstract_target 'Shows' do
  pod 'ShowsKit'

  # ShowsiOS contains ShowsKit (inherited) plus the added ShowWebAuth
  target 'ShowsiOS' do
    pod 'ShowWebAuth'
  end

  # ShowsTV contains ShowsKit (inherited) plus the added ShowTVAuth
  target 'ShowsTV' do
    pod 'ShowTVAuth'
  end

  # ShowsTests contains Specta and Expecta, and also inherits ShowsKit as a child target of Shows
  target 'ShowsTests' do
    inherit! :search_paths
    pod 'Specta'
    pod 'Expecta'
  end
end
```

#### abstract!

Indicates that the current target is abstract and therefore will not be directly linked to an Xcode target.

#### inherit!

Sets the current target's inheritance mode.

**Parameters**

> inheritance `Symbol`

> The inheritance mode to set.

> Available modes: `:complete` — the target inherits all behaviors from the parent. `:none` — the target does not inherit any behaviors from the parent. `:search_paths` — the target inherits only the parent's search paths.

**Examples:**

> Inherit only search paths

```ruby
target 'App' do
  target 'AppTests' do
    inherit! :search_paths
  end
end
```

## Target Configuration

These settings control the projects generated by CocoaPods.

The `platform` the project targets must be described. The `xcodeproj` file allows you to explicitly specify which project to link.

#### platform

Specifies the platform for which the static library should be built. If not specified, the default configuration is used: iOS `4.3`, OS X `10.6`, tvOS `9.0`, watchOS `2.0`.

For iOS < `4.3`, `armv6` needs to be added to `ARCHS`.

**Parameters**

> name `Symbol`

> The platform name: `:osx`, `:ios`, `:tvos`, or `:watchos`.

> target `String, Version`

> Optional. If not set, the default configuration is used.

**Examples:**

> Specify a platform

```ruby
platform :ios, '4.0'
platform :ios
```

#### project

Specifies the Xcode project for a target.

If no project is explicitly specified for a target, and there is only one project in the same directory as the Podfile, that project will be used.

You can also specify whether settings take effect in release or debug mode using `:release` or `:debug`.

**Parameters**

> Path `String`

> The path to link the project.

> build_configurations `Hash{String => symbol}`

> Key-value pairs. Keys are build configuration names in the Xcode project; values are symbols based on `:debug` or `:release` configurations. Defaults to `:release` if not set.

**Examples:**

> Specify a user project

```ruby
# This target is contained in the FastGPS project
target 'MyGPSApp' do
  project 'FastGPS'
  ...
end

# Multiple Xcode projects under the same Podfile
target 'MyNotesApp' do
  project 'FastNotes'
  ...
end
```

> Use custom build configurations

```ruby
project 'TestProject', 'Mac App Store' => :release, 'Test' => :debug
```

#### xcodeproj

`xcodeproj` was deprecated in version 1.0 and renamed to `project`.

#### link_with

`link_with` was deprecated in version 1.0. Use `abstract_target` and target inheritance instead.

#### inhibit_all_warnings!

Inhibits all warnings from CocoaPods libraries.

This attribute is inherited by child target definitions.

To disable warnings for an individual Pod library, use:

```ruby
pod 'SSZipArchive', :inhibit_warnings => true
```

Additionally, when `inhibit_all_warnings!` is used, you can exempt a specific library from warning suppression:

```ruby
pod 'SSZipArchive', :inhibit_warnings => false
```

#### use_frameworks!

Use frameworks instead of static libraries.

This attribute is inherited by child target definitions.

## Workspace

Lists options for configuring the workspace and setting global settings.

#### workspace

Specifies the Xcode workspace that contains all projects.

If no explicit Xcode workspace is specified and there is only one project in the same directory as the Podfile, that project's name is used as the workspace name.

**Parameters**

> path `String`

> The path to the workspace.

**Examples:**

> Specify a workspace

```ruby
workspace 'MyWorkspace'
```

#### generate_bridge_support!

Specifies that BridgeSupport metadata documents should be generated from the headers of all installed Pod libraries.

This feature is used by scripting languages (such as `MacRuby`, `Nu`, or `JSCocoa`) to bridge types and methods.

#### set_arc_compatibility_flag!

Specifies that `-fobjc-arc` should be added to `OTHER_LD_FLAGS`.

## Sources

Used to specify sources for Pod libraries. Sources are global and are not defined by individual targets.

Sources are order-dependent. CocoaPods uses the highest version of a Pod from the first source that contains it (regardless of whether other sources have a higher version).

The official CocoaPods source is implicitly included. Once another source is specified, it will be included as well.

**Parameters**

> source `String`

> The source URL.

**Examples:**

Use the Artsy library first, then fall back to the CocoaPods Master repository:

```ruby
source 'https://github.com/artsy/Specs.git'
source 'https://github.com/CocoaPods/Specs.git'
```

## Hooks

The Podfile provides hooks that can be called during the installation process. Hooks are global and are not defined by individual targets.

#### plugin

Specifies the plugins that should be used during installation, along with any options that should be passed when they are invoked.

**Parameters**

> name `String`

> The name of the plugin.

> options `Hash`

> Optional options to pass to the plugin when the hook is invoked.

**Examples:**

> Specify the use of the `slather` and `cocoapods-keys` plugins.

```ruby
plugin 'cocoapods-keys', :keyring => 'Eidolon'
plugin 'slather'
```

#### pre_install

This hook allows modifications to Pods after they are downloaded but before installation.

Accepts a [`Pod::Installer`](http://rubydoc.info/gems/cocoapods/Pod/Installer/) as the sole parameter.

**Examples:**

> Define a pre-install hook in the Podfile

```ruby
pre_install do |installer|
  # Do something fancy!
end
```

#### post_install

Allows final modifications to the generated Xcode project before it is written to disk, or performs other tasks.

Accepts a [`Pod::Installer`](http://rubydoc.info/gems/cocoapods/Pod/Installer/) as the sole parameter.

**Examples:**

Customize the build settings of all targets:

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_ENABLE_OBJC_GC'] = 'supported'
    end
  end
end
```
