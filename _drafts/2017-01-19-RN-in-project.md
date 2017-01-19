---
layout: post
title: ""
description: "在项目中集成 RN"
category: articles
tags: [React Native]
comments: true
---


## 前言

使用 RN 难道要把整个项目都重构一遍么？教程那么多，但是很少能够有把怎么与当前项目结合起来的文章。自己摸索了一遍，记录下来。之后的 RN 之路就由此开始。

## 集成 RN

前提是 RN 相关环境已经搭建好。

### 初始化 Pods

推荐使用 CocoaPads 管理第三方库，同时方便集成 RN。

新建 react-in-project 项目，并在项目目录下使用命令 `pod init` ，然后 Podfile 文件如下：

```ruby
# Uncomment the next line to define a global platform for your project
platform :ios, '8.0'

target 'react-in-project' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!

  # Pods for react-in-project
  pod 'React'
  pod 'React/RCTText'

  target 'react-in-projectTests' do
    inherit! :search_paths
    # Pods for testing
  end

  target 'react-in-projectUITests' do
    inherit! :search_paths
    # Pods for testing
  end

end
```

再次执行 shell 命令 `pod install`。

```shell
$ pod install
Analyzing dependencies
Downloading dependencies
Installing React (0.11.0)
Generating Pods project
Integrating client project

[!] Please close any current Xcode sessions and use `react-in-project.xcworkspace` for this project from now on.
Sending stats
Pod installation complete! There are 2 dependencies from the Podfile and 1 total pod installed.

[!] React has been deprecated
```

### 创建组件

新建目录 `react-component`，并在其下面创建 js 文件 `index.ios.js`。

```javascript
'use strict';

var React = require('react-native');
var {
  Text,
  View,
  Image,
} = React;

var styles = React.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red'
  }
});

class SimpleApp extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>This is a simple application.</Text>
      </View>
    )
  }
}

React.AppRegistry.registerComponent('SimpleApp', () => SimpleApp);
```

### 项目中引用

项目页面如图：

![01](https://lettleprince.github.io/images/20170119-react-in-project/01.png)

![02](https://lettleprince.github.io/images/20170119-react-in-project/02.png)

新建 `ReactView` 类：

```OC
//ReactView.m
#import "ReactView.h"
#import <React/Base/RCTRootView.h>

@interface ReactView()

@property (nonatomic, weak) RCTRootView *rootView;

@end

@implementation ReactView

- (void)awakeFromNib {
    [super awakeFromNib];
    
    NSString *urlString = @"http://localhost:8081/index.ios.bundle";
    NSURL *jsCodeLocation = [NSURL URLWithString:urlString];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                        moduleName:@"SimpleApp"
                                                 initialProperties:nil
                                                     launchOptions:nil];
    self.rootView = rootView;
    [self addSubview:rootView];
    
    self.rootView.frame = self.bounds;
}

@end
```

`RootViewController.m` 中：

```OC
#import "RootViewController.h"
#import "ReactView.h"

@interface RootViewController ()

@property (weak, nonatomic) IBOutlet ReactView *reactView;

@end

@implementation RootViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

@end
```

此时运行会报错：
![03](https://lettleprince.github.io/images/20170119-react-in-project/03.png)


### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/lettleprince/ImagePicker-Objective-C)找到。

