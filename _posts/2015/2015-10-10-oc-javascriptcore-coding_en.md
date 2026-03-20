---
layout: post
title: "JavaScriptCore Framework in Practice"
description: ""
category: articles
tags: [React Native]
comments: true
---

The following interaction approach was used to achieve a unified interface with Android.

Background: Those familiar with Android's `WebView` will know that in Android you simply annotate a method with `@JavascriptInterface`, then add a `JavascriptInterface` to the WebView (`webView.addJavascriptInterface(jsInterface, "jsObj")`), and from the JS side you can directly call Java methods using `jsObj.method`. I replicated this pattern using `<JSExport>` — associating `jsObj` with the page's `jsObj` via `self.context[@"jsObj"] = jsObj;` — thereby achieving essentially the same JS interaction approach as Android. See the code below:

`MyJSInterface.h`

```objc
#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

@protocol MyJSInterfaceExport <JSExport>

- (void)log:(NSString *)logStr;

- (void)myJSInterfaceMethodWithArg1:(NSString *)arg1;

/**
 *  Calling with multiple arguments is a bit awkward; just add a colon before the second argument.
 */
- (void)myJSInterfaceMethodWithArgs:(NSString *)arg1 :(NSString *)arg2;

- (NSNumber *)myJSInterfaceMethod:(NSNumber *)num;

//- (void)initMethodWithArg:(NSNumber *)num;

/**
 * Methods starting with "init" must be renamed using JSExportAs.
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

#pragma mark - JS interface methods
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

- `MyJSInterface` conforms to the `MyJSInterfaceExport` protocol it defines, and implements the corresponding methods in `MyJSInterface.m`.

- Note that methods beginning with `init` require method name remapping using `JSExportAs`. Of course, you can also use `JSExportAs` to convert the awkward Objective-C method naming style into something more familiar for JS and Java.

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
    //Remove the UIWebView background
    for (UIView *subView in [webView subviews]) {
        if ([subView isKindOfClass:[UIScrollView class]]) {
            ((UIScrollView *)subView).bounces = NO;
        }
    }
    //Make the background transparent
    webView.backgroundColor = [UIColor clearColor];
    webView.opaque = NO;
    self.webView = webView;
    [self.view insertSubview:webView atIndex:0];
    self.webView.delegate = self;

    [webView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.insets(UIEdgeInsetsMake(0, 0, 0, 0));
    }];

//    HTML files in the mainBundle apparently cannot be loaded with loadHTMLString
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

- A `JSContext` cannot be created directly; it must be retrieved from the WebView: `JSContext *context = [webview valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];`.

- During debugging, you can define a `- (void)log:(NSString *)logStr;` method and call `jsObj.log` from your JS file to debug. You can also replace `console.log()` with the `log` method, but be prepared for a flood of output.

### Notes on Loading HTML:

- When adding resource files, use `Create folder references` — the folder icon will appear blue.

- Both `loadRequest` and `loadHTMLString` can load HTML files and their corresponding JS and CSS resources from the main bundle. If they fail, check whether the HTML file is in UTF-8 encoding and review the point above. Also, when using the resource loading approach described above, remember to add relative paths.

```objc
NSURL *htmlFile =  [[NSBundle mainBundle] URLForResource:@"text" withExtension:@"html" subdirectory:@"question/q_text"];
[questionWebView loadRequest:[NSURLRequest requestWithURL:htmlFile]];
```

### Code:
All code from this post can be found on my GitHub [`JavaScriptCoreDemo`](https://github.com/tonyh2021/JavaScriptCoreDemo).

### References:

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

