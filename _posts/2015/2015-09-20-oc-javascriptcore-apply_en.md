---
layout: post
title: "JavaScriptCore Framework — JSExport and Memory Management"
description: ""
category: articles
tags: [React Native]
comments: true
---

JavaScript can define objects entirely with JSON without any prototype-based inheritance, but Objective-C code can't exist without classes and inheritance. That's why JavaScriptCore provides `JSExport` as an interoperability protocol between the two languages. `JSExport` itself defines no methods — not even optional ones (`@optional`) — but any methods defined in protocols that inherit from `JSExport` (note: protocols, not Objective-C classes `@interface`) will be accessible within a `JSContext`.

```objc
@protocol PersonProtocol <JSExport>

@property (nonatomic, strong) NSDictionary *urls;
- (NSString *)fullName;

@end
```

In the code above, a `PersonProtocol` is defined that inherits from the mysterious `JSExport` protocol, declaring a `urls` property and a `fullName` method. A `Person` class is then defined; in addition to conforming to `PersonProtocol`, it also defines `firstName` and `lastName` properties. The `fullName` method returns the combination of both name parts.

Now let's create a `Person` object, pass it into a `JSContext`, and try to access and modify it from JavaScript.

```objc
- (void)jsTest8 {
    JSContext *context = [[JSContext alloc] init];
    context.exceptionHandler = ^(JSContext *con, JSValue *exception) {
        NSLog(@"JSValue exception: %@", exception);
        con.exception = exception;
    };

    context[@"log"] = ^() {
        NSArray *args = [JSContext currentArguments];
        for (id obj in args) {
            NSLog(@"js log: %@", obj);
        }
    };

    Person *person = [[Person alloc] init];
    context[@"p"] = person;
    person.firstName = @"Tony";
    person.lastName = @"Han";
    person.urls = @{@"site": @"http://www.ibloodline.com"};

    // ok to get fullName
    [context evaluateScript:@"log(p.fullName());"];
    // cannot access firstName
    [context evaluateScript:@"log(p.firstName);"];
    // ok to access dictionary as object
    [context evaluateScript:@"log('site:', p.urls.site, 'blog:', p.urls.blog);"];
    // ok to change urls property
    [context evaluateScript:@"p.urls = {blog:'http://blog.ibloodline.com'}"];
    [context evaluateScript:@"log('-------')"];
    [context evaluateScript:@"log('site:', p.urls.site, 'blog:', p.urls.blog);"];

    // affect on Objective-C side as well
    NSLog(@"%@", person.urls);
}
```

```
2016-02-25 16:01:39.476 JavaScriptCoreDemo[39550:5561905] js log: Tony Han
2016-02-25 16:01:39.476 JavaScriptCoreDemo[39550:5561905] js log: undefined
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: site:
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: http://www.ibloodline.com
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: blog:
2016-02-25 16:01:39.477 JavaScriptCoreDemo[39550:5561905] js log: undefined
2016-02-25 16:01:39.478 JavaScriptCoreDemo[39550:5561905] js log: -------AFTER CHANGE URLS-------
2016-02-25 16:01:39.478 JavaScriptCoreDemo[39550:5561905] js log: site:
2016-02-25 16:01:39.478 JavaScriptCoreDemo[39550:5561905] js log: undefined
2016-02-25 16:01:39.479 JavaScriptCoreDemo[39550:5561905] js log: blog:
2016-02-25 16:01:39.479 JavaScriptCoreDemo[39550:5561905] js log: http://blog.ibloodline.com
2016-02-25 16:01:39.479 JavaScriptCoreDemo[39550:5561905] {
    blog = "http://blog.ibloodline.com";
}
```

The output clearly shows that accessing `firstName` and `lastName` returns `undefined`, because they have no `JSExport` linkage to JavaScript. This does not, however, affect getting the correct combined value from `fullName()`. As mentioned earlier, the `NSDictionary`-typed `urls` property can be used as an object in the `JSContext`, and assigning a new value to it is reflected correctly on the Objective-C `Person` object.

`JSExport` not only exposes properties to JavaScript correctly, but also ensures their attributes are respected — for example, if a property is declared `readonly` in the protocol, it can only be read in JavaScript and cannot be assigned a new value.

For multi-parameter methods, JavaScriptCore merges the different parts of an Objective-C method name, capitalizing the letter after each colon and removing the colons. For example, the method in the protocol below would be called in JavaScript as `doFooWithBar(foo, bar);`:

```objc
@protocol MultiArgs <JSExport>
- (void)doFoo:(id)foo withBar:(id)bar;
@end
```

If you want a method to have a shorter name in JavaScript, use the macro provided in `JSExport.h`: `JSExportAs(PropertyName, Selector)`.

```objc
@protocol LongArgs <JSExport>

JSExportAs(testArgumentTypes,
           - (NSString *)testArgumentTypesWithInt:(int)i double:(double)d
                    boolean:(BOOL)b string:(NSString *)s number:(NSNumber *)n
                    array:(NSArray *)a dictionary:(NSDictionary *)o
           );

@end
```

For example, the method defined in the protocol above can be called in JavaScript simply as `testArgumentTypes(i, d, b, s, n, a, dic);`.

Although there is no official programming guide for the JavaScriptCore framework, the description of the protocol in `JSExport.h` is fairly detailed. One part states:

> By default no methods or properties of the Objective-C class will be exposed to JavaScript, however methods and properties may explicitly be exported. For each protocol that a class conforms to, if the protocol incorporates the protocol JSExport, then the protocol will be interpreted as a list of methods and properties to be exported to JavaScript.

The word **`incorporate`** is worth noting here. Testing confirms that only custom protocols (`@protocol`) that directly inherit from `JSExport` are accessible in a `JSContext`. In other words, if another protocol inherits from `PersonProtocol`, methods defined in that second protocol will not be exposed to the `JSContext`. From the source code, you can see that the JavaScriptCore framework uses `class_copyProtocolList` to find the protocols a class conforms to, then for each protocol uses `protocol_copyProtocolList` to check if it directly conforms to `JSExport`, and only then exposes those methods to JavaScript.

### Extending Protocols for Defined Classes — `class_addProtocol`

For custom Objective-C classes, you can use the approach above — defining a protocol that inherits from `JSExport` — to enable interoperability with JavaScript. For system classes or third-party library classes that are already defined, they won't pre-define any such protocol. Fortunately, [Objective-C allows modifying class characteristics at runtime](../../../2015/11/02/oc-runtime.html).

The example below adds a protocol to `UITextField` so that its `text` property can be accessed directly from JavaScript:

```objc
@protocol JSUITextFieldExport <JSExport>

@property(nonatomic,copy) NSString *text;

@end
```

Then use the runtime's `class_addProtocol` to add this protocol:

```objc
- (void)viewDidLoad {
    [super viewDidLoad];

    class_addProtocol([UITextField class], @protocol(JSUITextFieldExport));
}
```

Add the following event to a `UIButton`. The method passes the `textField` into a `JSContext`, reads its `text` value, increments it by 1, and assigns the new value back:

```objc
- (IBAction)buttonClicked {
    JSContext *context = [[JSContext alloc] init];
    context[@"log"] = ^() {
        NSLog(@"---Begin Log---");
        NSArray *args = [JSContext currentArguments];
        for (JSValue *jsVal in args) {
            NSLog(@"%@", jsVal);
        }
        NSLog(@"---End Log---");
    };

    context[@"textField"] = self.textField;
    NSString *script = @"var text = textField.text;";
    [context evaluateScript:script];

    [context evaluateScript:@"log(text)"];

    NSString *script2 = @"var num = parseInt(textField.text, 10);"
    "++num;"
    "textField.text = num;";
    [context evaluateScript:script2];
}
```

Result:

```
2016-02-25 18:03:53.480 JavaScriptCoreDemo[39857:5592929] ---Begin Log---
2016-02-25 18:03:53.482 JavaScriptCoreDemo[39857:5592929] 145
2016-02-25 18:03:53.482 JavaScriptCoreDemo[39857:5592929] ---End Log---
2016-02-25 18:03:54.057 JavaScriptCoreDemo[39857:5592929] ---Begin Log---
2016-02-25 18:03:54.057 JavaScriptCoreDemo[39857:5592929] 146
2016-02-25 18:03:54.057 JavaScriptCoreDemo[39857:5592929] ---End Log---
2016-02-25 18:03:54.510 JavaScriptCoreDemo[39857:5592929] ---Begin Log---
2016-02-25 18:03:54.511 JavaScriptCoreDemo[39857:5592929] 147
2016-02-25 18:03:54.512 JavaScriptCoreDemo[39857:5592929] ---End Log---
......
```

When you tap the `UIButton`, you can see the `UITextField` value incrementing continuously, demonstrating that for already-defined classes, you can also add the magical `JSExport` protocol at runtime to enable seamless interoperability between Objective-C and JavaScript.

### Different Memory Management Models — Reference Counting vs. Garbage Collection

Although both Objective-C and JavaScript are object-oriented languages that let programmers focus on business logic without worrying about memory reclamation, their memory management mechanisms are entirely different. Objective-C uses reference counting, with Xcode's compiler adding support for [Automatic Reference Counting (ARC)](http://en.wikipedia.org/wiki/Automatic_Reference_Counting); JavaScript, like Java or C#, uses [Garbage Collection (GC)](http://en.wikipedia.org/wiki/Garbage_collection_(computer_science)). When two different memory management schemes are used within the same program, conflicts can arise.

For example, suppose you create a temporary Objective-C object inside a method and add it to a `JSContext` for use in a JavaScript variable. Because the JavaScript variable holds a reference, the JavaScript side won't release the object, but on the Objective-C side the object's reference count may drop to zero after the method returns, freeing its memory and causing errors on the JavaScript side.

Similarly, if you use a `JSContext` to create an object or array and return a `JSValue` to Objective-C — even if you `retain` the `JSValue` variable — the JavaScript side may release it due to no remaining references, rendering the corresponding `JSValue` useless.

Managing object memory correctly between two different memory management systems is a real challenge. JavaScriptCore provides the `JSManagedValue` type to help developers better manage object memory.

```objc
@interface JSManagedValue : NSObject

// Convenience method for creating JSManagedValues from JSValues.
+ (JSManagedValue *)managedValueWithValue:(JSValue *)value;

// Create a JSManagedValue.
- (id)initWithValue:(JSValue *)value;

// Get the JSValue to which this JSManagedValue refers. If the JavaScript value has been collected,
// this method returns nil.
- (JSValue *)value;

@end
```

Since `JSVirtualMachine` provides resources for the entire JavaScriptCore execution, once you convert a `JSValue` to a `JSManagedValue`, you can add it to the `JSVirtualMachine`. This ensures that both the Objective-C and JavaScript sides can correctly access the object during its lifetime, without any unnecessary issues.

```objc
@interface JSVirtualMachine : NSObject

// Create a new JSVirtualMachine.
- (id)init;

// addManagedReference:withOwner and removeManagedReference:withOwner allow
// clients of JSVirtualMachine to make the JavaScript runtime aware of
// arbitrary external Objective-C object graphs. The runtime can then use
// this information to retain any JavaScript values that are referenced
// from somewhere in said object graph.
//
// For correct behavior clients must make their external object graphs
// reachable from within the JavaScript runtime. If an Objective-C object is
// reachable from within the JavaScript runtime, all managed references
// transitively reachable from it as recorded with
// addManagedReference:withOwner: will be scanned by the garbage collector.
//
- (void)addManagedReference:(id)object withOwner:(id)owner;
- (void)removeManagedReference:(id)object withOwner:(id)owner;

@end
```

### Code:
All code from this post can be found on my GitHub [`JavaScriptCoreDemo`](https://github.com/tonyh2021/JavaScriptCoreDemo).

### References:

[Object Interaction and Management in iOS 7's JavaScriptCore Framework](http://blog.iderzheng.com/ios7-objects-management-in-javascriptcore-framework/)

[wiki-JavaScriptCore
](http://trac.webkit.org/wiki/JavaScriptCore)

