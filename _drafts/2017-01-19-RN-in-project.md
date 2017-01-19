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

原因是还没启动 node 服务。

### 启动服务

我们需要启动一个端口为 8081 的服务将 index.ios.js 打包成 index.ios.bundle 。然后我们的代码就可以加载了。

在项目目录下运行命令：

`(JS_DIR=`pwd`/react-component; cd Pods/React; npm run start -- --root $JS_DIR)
`

> 1.将新建的 react-component 文件夹目录赋值到JS_DIR上，需要全路径
> 2.进入 Pods/React 目录
> 3.绑定JS_DIR会监听ReactComponents文件夹下的文件，然后 npm run start 启动 node 服务
> 4.三行命令用()包装起来，可以避免运行后定位到 Pods/React 目录下

输出：

```shell
$ (JS_DIR=`pwd`/react-component; cd Pods/React; npm run start -- --root $JS_DIR)

> react-native@0.11.0 start /Users/qd-hxt/Documents/gworkspace/react-in-project/Pods/React
> ./packager/packager.sh || true "--root" "/Users/qd-hxt/Documents/gworkspace/react-in-project/react-component"

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
   /Users/qd-hxt/Documents/gworkspace/react-in-project

(node:56464) DeprecationWarning: os.tmpDir() is deprecated. Use os.tmpdir() instead.

React packager ready.

[14:35:55] <START> Building Dependency Graph
[14:35:55] <START> Crawling File System
[14:35:56] <END>   Crawling File System (1479ms)
[14:35:56] <START> Building in-memory fs for JavaScript
[14:35:57] <END>   Building in-memory fs for JavaScript (171ms)
[14:35:57] <START> Building in-memory fs for Assets
[14:35:57] <END>   Building in-memory fs for Assets (140ms)
[14:35:57] <START> Building Haste Map
[14:35:57] <START> Building (deprecated) Asset Map
[14:35:57] <END>   Building (deprecated) Asset Map (20ms)
[14:35:57] <END>   Building Haste Map (361ms)
[14:35:57] <END>   Building Dependency Graph (2154ms)
```

用浏览器访问 http://localhost:8081/index.ios.bundle，会有如下错误：
![04](https://lettleprince.github.io/images/20170119-react-in-project/04.png)

其实是还没加载好。

修改命令为：

`(JS_DIR=`pwd`/react-component; cd Pods/React/packager; node packager.js --root $JS_DIR)`

再次启动：

```shell
$ (JS_DIR=`pwd`/react-component; cd Pods/React/packager; node packager.js --root $JS_DIR)
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
   /Users/qd-hxt/Documents/gworkspace/react-in-project
   /Users/qd-hxt/Documents/gworkspace/react-in-project/react-component

(node:56503) DeprecationWarning: os.tmpDir() is deprecated. Use os.tmpdir() instead.

React packager ready.

[14:40:21] <START> Building Dependency Graph
[14:40:21] <START> Crawling File System
[14:40:22] <END>   Crawling File System (811ms)
[14:40:22] <START> Building in-memory fs for JavaScript
[14:40:22] <END>   Building in-memory fs for JavaScript (256ms)
[14:40:22] <START> Building in-memory fs for Assets
[14:40:23] <END>   Building in-memory fs for Assets (137ms)
[14:40:23] <START> Building Haste Map
[14:40:23] <START> Building (deprecated) Asset Map
[14:40:23] <END>   Building (deprecated) Asset Map (26ms)
[14:40:23] <END>   Building Haste Map (323ms)
[14:40:23] <END>   Building Dependency Graph (1527ms)
transforming [===                                     ] 7% 20/303[14:40:51] <START> request:/index.ios.bundle
[14:40:51] <START> find dependencies
[14:40:51] <END>   find dependencies (243ms)
[14:40:51] <START> transform
transforming [========================================] 100% 303/303
[14:40:58] <END>   transform (6784ms)
[14:40:58] <END>   request:/index.ios.bundle (7062ms)
```

浏览器可以访问到，但是模拟器还是有错误。

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

