---
layout: post
title: "Swift 2.0快速参考手册"
description: ""
category: articles
tags: [Swift]
comments: true
---

## 前言

马马虎虎过了两遍Swift，语法还是容易忘，说明还是练得少。为了让练习的时候能够快速适应Swift的风格，根据`raywenderlich`的[Swift 2.0 Cheat Sheet and Quick Reference](http://cdn3.raywenderlich.com/wp-content/uploads/2014/06/RW-Swift-Cheatsheet-0_6.pdf)整理了一份Swift快速参考手册。当然不会涉及到详细的用法，详细的用法已经有不少资料了。

- [Let's Swift](http://letsswift.com/swift-group/)

- [SwiftGuide](https://github.com/ipader/SwiftGuide)

- [中文版 Apple 官方 Swift 教程](https://github.com/numbbbbb/the-swift-programming-language-in-chinese)

废话不多说，依次过一遍。

## 类的实现

```swift
class MyClass : OptionalSuperClass,
OptionalProtocol1, OptionalProtocol2 {

	var myProperty:String
	var myOptionalProperty:String?
	// 其他属性

	// 子类覆盖父类的方法
	override init() {
		myProperty = "Foo"
	}

	// 其他方法
}
```

## 方法

```swift
func doIt() -> Int {
	return 0
}

func doIt(a:Int) -> Int {
	return a
}

func doIt(a:Int, b:Int) -> Int {
	return a + b
}
```

## 创建并使用一个实例（对象）

```swift
var a = MyClass()
a.myProperty
a.doIt()
a.doIt(1)
a.doIt(2, b:3)
```

## 枚举

```swift
enum CollisionType: Int {
	case Player = 1
	case Enemy = 2
}
var type = CollisionType.Player
```

## 变量声明

```swift
var mutableDouble:Double = 1.0
mutableDouble = 2.0

let constantDouble:Double = 1.0
// constantDouble = 2.0 // 错误，常量不可改变

var mutableInferredDouble = 1.0 //类型推断

var optionalDouble:Double? = nil //可选类型，初始化为nil
optionalDouble = 1.0

if let definiteDouble = optionalDouble { //可选绑定
	definiteDouble
}
```

## 强制解包

```swift
var myString:String?  //用问号声明可选变量
myString = "Hello, Swift!"

if myString != nil {
   print(myString) //结果: Optional("Hello, Swift!")
} else {
   print("myString has nil value")
}

if myString != nil {
   print(myString!) //结果: Hello, Swift!
} else {
   print("myString has nil value")
}
```

## 自动解包

```swift
var myString:String! //用感叹号声明可选变量，会自动解开
myString = "Hello, Swift!"

if myString != nil {
	print(myString)
} else {
   print("myString has nil value")
}
```

### 变量的种类

- **Int** 1, 2, 500, 10000

- **Float和Double** 1.5, 3.14, 578.234

- **Bool** true, false

- **String** “ibloodline”, “TonyHan”, “playground”

- **ClassName** UIView, UIButton, etc

## 语句

```swift
var condition = true
if condition {
} else {
}

var val = 5
switch val {
case 1:
	"foo"
case 2:
	"bar"
default:
	"baz"
}

for i in 0..<3 {
}
```

## 字符串示例

```swift
var personOne = "ibloodline"
var personTwo = "TonyHan"
var combinedString = "\(personOne):Hello, \(personTwo)!"

var tipString = "2499"
var tipInt = NSString(string: tipString).intValue

tipString = "24.99"
var tipDouble = NSString(string: tipString).doubleValue
```

## 列表示例

```swift
var person1 = "ibloodline"
var person2 = "TonyHan"
var array:[String] = [person1, person2]
array.append("somebody")
for person in array {
    print("person: \(person)")
}
var p = array[2]
```

## 字典示例

```swift
var dict:[String: String] = ["name":"bloodline", "age": "875","sex": "male" ]
dict["addr"] = "Beijing"
dict["name"] = nil // 删除name
for (key, val) in dict {
    print("key: \(key), val:\(val)")
}
```