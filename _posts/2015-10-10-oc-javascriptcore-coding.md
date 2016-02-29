---
layout: post
title: "JavaScriptCore框架实战"
description: ""
category: articles
tags: [JavaScriptCore]
comments: true
---

用以下的交互方式，实现了与Android的接口统一。

原理：熟悉Android的Webview的同学应该知道，Android只要在需要调用的类中使用`@JavascriptInterface`注解方法，然后webview中添加JavascriptInterface(`webView.addJavascriptInterface(jsInterface, "jsObj");`)，便可以在js端直接使用`jsObj.method`调用java中定义的方法了。所以我用`<JSExport>`的方式，将jsObj和页面中的jsObj关联(`self.context[@"jsObj"] = jsObj;`)，然后就基本实现了与Android一样的js交互方式。具体看下面的代码：

`MyJSInterface.h`

<script src="https://gist.github.com/lettleprince/707acdf1743c37af62b3.js?file=MyJSInterface.h"></script>

`MyJSInterface.m`

<script src="https://gist.github.com/lettleprince/707acdf1743c37af62b3.js?file=MyJSInterface.m"></script>

- MyJSInterface实现所定义的`MyJSInterfaceExport `协议，然后在`MyJSInterface.m`中实现相应的方法。

- 注意开头的方法时需要使用`JSExportAs`进行方法名的转换。当然，js和java对应OC别扭的方法名也可以通过`JSExportAs`来转换成比较习惯的方法。

`WebViewController.m`

<script src="https://gist.github.com/lettleprince/707acdf1743c37af62b3.js?file=WebViewController.m"></script>

- JSContext不能直接创建，需要从webview获取，`JSContext *context = [webview valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];`。

- 调试时可以定义`- (void)log:(NSString *)logStr;`方法，然后在js文件中调用`jsObj.log`来进行调试。当然也可以把`console.log()`替换为`log`方法，不过要准备好铺天盖地的输出信息。

### 加载html时注意：

- 添加资源文件时使用`Create folder references`，此时文件夹会变为蓝色。

- `loadRequest`和`loadHTMLString`都是可以加载mainbundle下的html和对应的js及css资源的，如果不能的话，则查看html是否为utf-8格式，以及上面的那一点。当然，使用上面那种加载资源的方式，要记得添加相对路径。

#### 文章中的代码都可以从我的GitHub [`JavaScriptCoreDemo`](https://github.com/lettleprince/JavaScriptCoreDemo)找到。

#### 参考：

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

