---
layout: post
title: Tips for Debugging JavaScript Under the JavaScriptCore Framework
description:
category: articles
tags: React Native
comments: true
---

Some features in native app development are well-suited for a Hybrid approach. I have long wanted to try [`React Native`](http://facebook.github.io/react-native/docs/getting-started.html), but since neither the front-end nor the Android team was on board, the iOS side could only use JavaScriptCore to inject a `jsObj` object and enable JS to call Objective-C methods. While the implementation itself is not particularly difficult, debugging issues when they arise can be a real headache. I recently looked into JS debugging techniques and summarized them in the context of my project.

JS debugging methods:

- The most obvious one is `alert()`.

- Then there is `console.log()`. However, it cannot be used in a client-side WebView. In that case, you can use a small trick: when defining the JS interface, add an extra method:

```objc
- (void)log:(NSString *)logStr;
```

Then implement it in the `.m` file:

```objc
- (void)log:(NSString *)logStr {
    NSLog(@"%@", logStr);
}
```

And in the corresponding JS file:

```javascript
console.log = function(msg){
    jsObj.log(msg);
};
```

This replaces `console.log` with `jsObj.log`, so console output will now appear in Xcode's console.

- You can also use `typeof()` to check the type of a value. Possible types are `number`, `string`, `boolean`, `object`, `function`, and `undefined`.

- When appropriate, you can call a JS method from Objective-C code using: `- (JSValue *)evaluateScript:(NSString *)script;`. Be mindful of the conversion between `JSValue` and Objective-C objects when printing.

