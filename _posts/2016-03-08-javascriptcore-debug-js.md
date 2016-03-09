---
layout: post
title: JavaScriptCore框架下调试js的心得
description: 
category: articles
tags: JavaScriptCore
comments: true
---

客户端的开发中有部分功能适合使用Hybrid方案，我一直想尝试[`React Native`](http://facebook.github.io/react-native/docs/getting-started.html)，无奈前端和安卓的都不配合，iOS这边只能通过JavaScriptCore采用注入jsObj对象的方式来实现js调用OC的方法。虽说实现起来并不困难，但是遇到问题调试起来蛋都碎了。最近看了下js的调试方法，结合项目进行总结下。

js的调试方法：

- 最醒目的当然是`alert()`。
 
- 然后是`console.log()`，不过在客户端的webview中是无法使用的，这时候就可以用点小技巧，在定义js接口时，多定义一个：

```c
- (void)log:(NSString *)logStr;
```

然后在.m文件中实现：

```c
- (void)log:(NSString *)logStr {
    NSLog(@"%@", logStr);
}
```

在对应的js文件中：

```javascript
console.log = function(msg){
    jsObj.log(msg);
};
```

这样console.log就被替换为jsObj.log，此时console的输出就会打印到Xcode的控制太了。

- 另外可以通过`typeof ()`来实现查看数据的类型。可能的数据类型有`number`、`string`、`boolean`、`object`、`function` 和 `undefined`。

- 在恰当的时候可以在OC的代码中调用js方法：`- (JSValue *)evaluateScript:(NSString *)script;`，要注意打印JSValue时的与OC对象的转化。