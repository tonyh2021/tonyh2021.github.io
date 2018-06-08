---
layout: post
title: "iOS 本地化简明指南"
description: ""
category: articles
tags: [iOS]
comments: true
---


## 概括

iOS 本地化主要包含这几部分的工作：

1. InfoPlist 中属性的本地化。
2. storyboard/xib 本地化。
3. 字符串本地化。
4. 图片本地化。
5. 本地化原理。
6. 相关脚本。

## 本地化准备工作

![01](../../../../images/20180607-localizable/01.png)

![02](../../../../images/20180607-localizable/02.png)

## InfoPlist 中属性的本地化

新建 String File，命名为 `InfoPlist.strings`。当然这些资源可以放在某个目录下，方便管理，比如说 `Resources` 目录。

![06](../../../../images/20180607-localizable/06.png)

然后进行本地化设置。

![07](../../../../images/20180607-localizable/07.png)

其中 CFBundleDisplayName 是 InfoPlist 文件中的属性，用于展示 App 的名称。其他的属性也同样设置。注意层级关系。

![08](../../../../images/20180607-localizable/08.png)

## storyboard/xib 本地化

![03](../../../../images/20180607-localizable/03.png)

注意，一定要选中 storyboard 的某个控件，然后进行勾选。否则新建的本地化文件无法出现 控件的 ObjectID。

然后在 Main.string 相关文件中进行修改。

![04](../../../../images/20180607-localizable/04.png)

![05](../../../../images/20180607-localizable/05.png)

## 字符串本地化

这里是重点。

为了方便进行统一管理，本地化的内容不会在 storyboard 或 xib 中进行，而是在代码中设置。

新建 String File，命名为 `Localizable.strings`。

在右边勾选本地化配置。

![09](../../../../images/20180607-localizable/09.png)

分别在三个配置中设置：

```
// Localizable.strings(English)
"本地化文本" = "Localizable Text";
```

```
// Localizable.strings(Simplified)
"本地化文本" = "本地化文本";
```

```
// Localizable.strings(Base)
"本地化文本" = "本地化文本";
```

完成后，可以在代码中测试：

```objc
NSString *string = NSLocalizedString(@"本地化文本", nil);
NSLog(@"%@", string);
```

本地化文件的名字可以自定，只要加载时对应就行，后缀当然必须是 `.strings`。比如说 `Language.strings`。

加载的时候需要添加以下代码，然后用 `LocalizableBundle(@"xxxx")` 这样的代码加载。

```objc
#define LocalizableBundle [NSBundle mainBundle]

#define LocalizedString(key) \
NSLocalizedStringFromTableInBundle(key, @"Language", LocalizableBundle, nil)
```

使用时代码变为：

```objc
NSString *string = LocalizedString(@"本地化文本");
NSLog(@"%@", string);
```

## 图片本地化

原理是根据不同的本地化配置加载不同图片名称的字符串，就可以初始化成不同的图片。

新建 `ImageLocalizable.strings` 文件，并进行本地化。

![10](../../../../images/20180607-localizable/10.png)

在以上宏的前提下，再定义宏：

```objc
#define LocalizedImage(key) \
NSLocalizedStringFromTableInBundle(key, @"ImageLocalizable", LocalizableBundle, nil)
```

代码中加载时：

```objc
NSString *path = [[NSBundle mainBundle] pathForResource:LocalizedImage(@"girl") ofType:@"jpg"];
self.girlImageView.contentMode = UIViewContentModeScaleAspectFill;
self.girlImageView.image = [UIImage imageWithContentsOfFile:path];
```

## 本地化原理

应用启动时，首先会读取 NSUserDefaults 中以 `AppleLanguages` 为 key 的内容，得到一个对象，通过对这个对象进行类型分析，可以得到当前的本地化环境。只有一个本地化环境时，value 实际上是一个 NSString。

代码：

```objc
id localizables = [[NSUserDefaults standardUserDefaults] valueForKey:@"AppleLanguages"];
NSLog(@"本地化：%@", localizables);
NSString *currentLocalizable = nil;
if ([localizables isKindOfClass:[NSString class]]) {
    currentLocalizable = (NSString *)localizables;
} else if ([localizables isKindOfClass:[NSArray class]]) {
    currentLocalizable = ((NSArray *)localizables).firstObject;
}
NSLog(@"当前本地化：%@", currentLocalizable);
```

如果是 NSArray，则这个 NSArray 的内容对应着手机设置中的“首选语言顺序”。

![11](../../../../images/20180607-localizable/11.png)

第一个即为当前的语言环境。

基于此可以修改 App 的本地化环境。

```objc
[[NSUserDefaults standardUserDefaults] setObject:@[@"zh-Hans"] forKey:@"AppleLanguages"];
[[NSUserDefaults standardUserDefaults] synchronize];
```

这必须在重新启动 App 后才会生效。

当然，可以更进一步，修改加载本地化文件的方法，配合上面修改本地化环境的方法，实现动态的加载本地化资源。代码如下：

```objc
id dynamicLocalizables = [[NSUserDefaults standardUserDefaults] valueForKey:@"AppleLanguages"];
NSString *currentDynamicLocalizable = nil;
if ([dynamicLocalizables isKindOfClass:[NSString class]]) {
    currentDynamicLocalizable = (NSString *)dynamicLocalizables;
} else if ([dynamicLocalizables isKindOfClass:[NSArray class]]) {
    currentDynamicLocalizable = ((NSArray *)dynamicLocalizables).firstObject;
}
path = [[NSBundle mainBundle] pathForResource:currentDynamicLocalizable ofType:@"lproj"];
NSLog(@"%@", [[NSBundle bundleWithPath:path] localizedStringForKey:@"本地化文本" value:@"" table:nil]);
```

当然这只是实验性质的，如果项目中有类似需求，还可以进一步封装成类似 `NSLocalizedString` 的调用方式。

## 相关脚本

由于只是为了以后做本地化做准备，所以我的思路比较简单粗暴，首先规定项目中所有的文本和图片名都使用 `LocalizedString` 和 `LocalizedImage` 进行加载。当然即便没有相应的本地化资源的话，就会把参数当做默认的值。然后用脚本实现将代码中所有的 `LocalizedString` 和 `LocalizedImage` 的参数筛选出来作为本地化键值对填充到各个本地化资源文件中。

比如说，我在代码中使用了代码 `LocalizedString(@"测试")`，脚本会将 `"测试"="测试";` 添加到所有语言环境下的 `Language.strings` 中。

这样，将来如果需要本地化则只需要将各个本地化资源文件的值修改便可以了。当然，可以进一步实现脚本，将其输出到 Excel 中，然后让产品添加响应的本地化翻译，最后再用脚本输出成本地化资源文件。

## 其他

调试技巧：
可以在 Edit Scheme 中将 Application Language 改成所需要的语言，这样就不需要在虚拟机或真机的设置中修改了。

![12](../../../../images/20180607-localizable/12.png)

