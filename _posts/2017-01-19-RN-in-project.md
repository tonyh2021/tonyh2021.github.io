---
layout: post
title: "在项目中集成 RN"
description: ""
category: articles
tags: [React Native]
comments: true
---


## 前言

使用 RN 难道要把整个项目都重构一遍么？教程那么多，但是很少能够有把怎么与当前项目结合起来的文章。自己摸索了一遍，记录下来。之后的 RN 之路就由此开始。需要注意的是，RN 的版本迭代相当快，不同版本的差别比较大，填坑时留意下版本。

## 集成 RN

前提是 RN 相关环境已经搭建好。

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

在此目录下，执行：

```shell
npm install react
npm install react-native@0.38.0
```

> 由于最近发布的 0.40.0 版本变化比较大，所以暂时使用 0.38.0 版本。所以 npm 制定升级 `npm install react-native@0.37.0`。具体查看：[升级
](http://reactnative.cn/docs/0.40/upgrading.html#content)。

### 初始化 Pods

推荐使用 CocoaPads 管理第三方库，同时方便集成 RN。

新建 react-in-project 项目，并在项目目录下使用命令 `pod init` ，然后 Podfile 文件如下：

```ruby
# Uncomment the next line to define a global platform for your project
platform :ios, '8.0'

target 'react-in-project' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
    use_frameworks!

   # 取决于你的工程如何组织，你的node_modules文件夹可能会在别的地方。
   # 请将:path后面的内容修改为正确的路径。
    pod 'React', :path => './react-component/node_modules/react-native', :subspecs => [
        'Core',
        'RCTImage',
        'RCTNetwork',
        'RCTText',
        'RCTWebSocket',
    # 添加其他你想在工程中使用的依赖。
    ]

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

> `pod 'React'`CocoaPods中 pod 版本已经远远落后于官方版本，所以官方推荐引用本地的方式。

再次执行 shell 命令 `pod install`。

```shell
$ pod install
Analyzing dependencies
Fetching podspec for `React` from `./react-component/node_modules/react-native`
Downloading dependencies
Installing React 0.38.0 (was 0.40.0)
Generating Pods project
Integrating client project
Sending stats
Pod installation complete! There are 5 dependencies from the Podfile and 1 total pod installed.
```

### 项目中引用

项目页面如图：

![01](https://lettleprince.github.io/images/20170119-react-in-project/01.png)

![02](https://lettleprince.github.io/images/20170119-react-in-project/02.png)

新建 `ReactView` 类：

```OC
//ReactView.m
#import "ReactView.h"
#import <React/RCTRootView.h>

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

原因是还没启动 node 服务。

### 启动服务

我们需要启动一个端口为 8081 的服务将 index.ios.js 打包成 index.ios.bundle 。然后我们的代码就可以加载了。

在项目目录下运行命令：

`(JS_DIR=`pwd`/react-component; cd react-component/node_modules/react-native; npm run start -- --root $JS_DIR)
`

> 1.将新建的 react-component 文件夹目录赋值到JS_DIR上，需要全路径
> 2.进入 Pods/React 目录
> 3.绑定JS_DIR会监听react-component文件夹下的文件，然后 npm run start 启动 node 服务
> 4.三行命令用()包装起来，可以避免运行后定位到 Pods/React 目录下

输出：

```shell
$ (JS_DIR=`pwd`/react-component; cd react-component/node_modules/react-native; npm run start -- --root $JS_DIR)

> react-native@0.38.0 start /Users/qd-hxt/Documents/gworkspace/react-in-project/react-component/node_modules/react-native
> /usr/bin/env bash -c './packager/packager.sh "$@" || true' -- "--root" "/Users/qd-hxt/Documents/gworkspace/react-in-project/react-component"

Scanning 640 folders for symlinks in /Users/qd-hxt/Documents/gworkspace/react-in-project/react-component/node_modules (8ms)
 ┌────────────────────────────────────────────────────────────────────────────┐
 │  Running packager on port 8081.                                            │
 │                                                                            │
 │  Keep this packager running while developing on any JS projects. Feel      │
 │  free to close this tab and run your own packager instance if you          │
 │  prefer.                                                                   │
 │                                                                            │
 │  https://github.com/facebook/react-native                                  │
 │                                                                            │
 └────────────────────────────────────────────────────────────────────────────┘
Looking for JS files in
   /Users/qd-hxt/Documents/gworkspace/react-in-project/react-component
   /Users/qd-hxt/Documents/gworkspace/react-in-project/react-component

[Hot Module Replacement] Server listening on /hot

React packager ready.

[2017-1-22 18:04:19] <START> Initializing Packager
[2017-1-22 18:04:19] <START> Building in-memory fs for JavaScript
[2017-1-22 18:04:20] <END>   Building in-memory fs for JavaScript (151ms)
[2017-1-22 18:04:20] <START> Building Haste Map
[2017-1-22 18:04:20] <END>   Building Haste Map (462ms)
[2017-1-22 18:04:20] <END>   Initializing Packager (662ms)
```

用浏览器访问 http://localhost:8081/index.ios.bundle ，可以访问到，但是模拟器还是有错误。

此时需要开启 http 的支持。

### 开启 http

项目的 Info.plist 文件中，加入：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

再次报错如下：
![05](https://lettleprince.github.io/images/20170119-react-in-project/05.png)

修改 Podfile，添加依赖库 `pod 'React/RCTWebSocket'`。执行命令 `pod update --no-repo-update`。

再次运行项目，得到预期结果：
![06](https://lettleprince.github.io/images/20170119-react-in-project/06.png)

点击 `PUSH`：
![07](https://lettleprince.github.io/images/20170119-react-in-project/07.png)

需要进一步确认的是：

1.怎么自定义加载的（服务器）地址，应该可以进行参数化，由业务的server 进行下发需要加载 bundle 的地址，然后客户端去加载。
2.不同的页面需要加载不同的 bundle 时，怎么进行区分。

### 代码：
文章中的代码都可以从我的GitHub [`react-in-project`](https://github.com/lettleprince/react-in-project)找到。

