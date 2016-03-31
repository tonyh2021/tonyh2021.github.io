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

```objc
#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

@protocol MyJSInterfaceExport <JSExport>

- (void)log:(NSString *)logStr;

- (void)myJSInterfaceMethodWithArg1:(NSString *)arg1;

/**
 *  多个参数调用时比较别扭，第二个参数之前直接加冒号。
 */
- (void)myJSInterfaceMethodWithArgs:(NSString *)arg1 :(NSString *)arg2;

- (NSNumber *)myJSInterfaceMethod:(NSNumber *)num;

//- (void)initMethodWithArg:(NSNumber *)num;

/**
 * init开头的方法必须使用JSExportAs转换。
 */
JSExportAs(initMethodWithArg, - (void)setupMethodWithArg:(NSNumber *)num);

@end

@interface MyJSInterface : NSObject <MyJSInterfaceExport>

@end
```

`MyJSInterface.m`

```objc
#import "MyJSInterface.h"

@implementation MyJSInterface

#pragma mark - js调用接口
- (void)log:(NSString *)logStr {
    NSLog(@"%@", logStr);
}

- (void)myJSInterfaceMethodWithArg1:(NSString *)arg1 {
    NSLog(@"myJSInterfaceMethodWithArg1:%@", arg1);
}

- (void)myJSInterfaceMethodWithArgs:(NSString *)arg1 :(NSString *)arg2 {
    NSLog(@"myJSInterfaceMethodWithArgs:%@, %@", arg1, arg2);
}

- (NSNumber *)myJSInterfaceMethod:(NSNumber *)num {
    int numInt = [num intValue];
    numInt += 24;
    return [NSNumber numberWithInt:numInt];
}

- (void)setupMethodWithArg:(NSNumber *)num {
    NSLog(@"call js initMethodWithArg...");
}

@end
```

- MyJSInterface实现所定义的`MyJSInterfaceExport `协议，然后在`MyJSInterface.m`中实现相应的方法。

- 注意开头的方法时需要使用`JSExportAs`进行方法名的转换。当然，js和java对应OC别扭的方法名也可以通过`JSExportAs`来转换成比较习惯的方法。

`WebViewController.m`

```objc
#import "WebViewController.h"
#import <Masonry/Masonry.h>
#import <JavaScriptCore/JavaScriptCore.h>
#import "MyJSInterface.h"

@interface WebViewController () <UIWebViewDelegate>

@property (weak, nonatomic) UIWebView *webView;

@property (nonatomic, strong) JSContext *context;
@property (nonatomic, strong) JSValue   *jsObj;
@property (nonatomic, strong) JSManagedValue *managedValue;

@end

@implementation WebViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    UIWebView *webView = [[UIWebView alloc] init];
    //去掉UIWebView的底图
    for (UIView *subView in [webView subviews]) {
        if ([subView isKindOfClass:[UIScrollView class]]) {
            ((UIScrollView *)subView).bounces = NO;
        }
    }
    //设置背景透明
    webView.backgroundColor = [UIColor clearColor];
    webView.opaque = NO;
    self.webView = webView;
    [self.view insertSubview:webView atIndex:0];
    self.webView.delegate = self;
    
    [webView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.insets(UIEdgeInsetsMake(0, 0, 0, 0));
    }];
    
//    mainBundle下的html貌似无法使用loadHTMLString来加载
    NSURL *htmlFile = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"test" ofType:@"html"] isDirectory:NO];
    [webView loadRequest:[NSURLRequest requestWithURL:htmlFile]];

}

#pragma mark - UIWebViewDelegate
- (void)webViewDidStartLoad:(UIWebView *)webView{
    NSLog(@"webViewDidStartLoad");
    
    [self setupJSObj];
}

- (void)setupJSObj {
    self.context = [self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    
    MyJSInterface *ocObj = [[MyJSInterface alloc] init];
    JSValue *jsObj = [JSValue valueWithObject:ocObj inContext:self.context];
    self.jsObj = jsObj;
    JSManagedValue* managedValue = [JSManagedValue managedValueWithValue:self.jsObj];
    self.managedValue = managedValue;
    [self.context.virtualMachine addManagedReference:self.managedValue withOwner:self];
    self.context[@"jsObj"] = jsObj;
    self.context.exceptionHandler = ^(JSContext *context, JSValue *exception) {
        NSLog(@"%@", exception);
        context.exception = exception;
    };
}

- (IBAction)callJSMethod:(UIButton *)sender {
    [self.webView stringByEvaluatingJavaScriptFromString:@"log('call js method!')"];
    
}
@end
```

- JSContext不能直接创建，需要从webview获取，`JSContext *context = [webview valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];`。

- 调试时可以定义`- (void)log:(NSString *)logStr;`方法，然后在js文件中调用`jsObj.log`来进行调试。当然也可以把`console.log()`替换为`log`方法，不过要准备好铺天盖地的输出信息。

### 加载html时注意：

- 添加资源文件时使用`Create folder references`，此时文件夹会变为蓝色。

- `loadRequest`和`loadHTMLString`都是可以加载mainbundle下的html和对应的js及css资源的，如果不能的话，则查看html是否为utf-8格式，以及上面的那一点。当然，使用上面那种加载资源的方式，要记得添加相对路径。

```objc
NSURL *htmlFile =  [[NSBundle mainBundle] URLForResource:@"text" withExtension:@"html" subdirectory:@"question/q_text"];
[questionWebView loadRequest:[NSURLRequest requestWithURL:htmlFile]];
```

### 代码：
文章中的代码都可以从我的GitHub [`JavaScriptCoreDemo`](https://github.com/lettleprince/JavaScriptCoreDemo)找到。

### 参考资料：

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

