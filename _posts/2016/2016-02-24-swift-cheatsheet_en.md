---
layout: post
title: "Swift 4.0 Quick Reference Cheat Sheet"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Introduction

I've gone through Swift twice now, but the syntax still slips away, which means I haven't been practicing enough. To help myself get back into the Swift mindset quickly during practice sessions, I put together this Swift Quick Reference Cheat Sheet based on `raywenderlich`'s [Swift 2.0 Cheat Sheet and Quick Reference](https://koenig-media.raywenderlich.com/uploads/2014/06/RW-Swift-Cheatsheet-0_8.pdf). This won't cover detailed usage — there are plenty of resources for that already.

Update: A few changes for Swift 4.0 are included.

Let's run through them one by one.

## Class Implementation

```swift
class MyClass : OptionalSuperClass,
OptionalProtocol1, OptionalProtocol2 {

	var myProperty:String
	var myOptionalProperty:String?
	// other properties

	// subclass overriding a superclass method
	override init() {
		myProperty = "Foo"
	}

	// other methods
}
```

## Methods

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

## Creating and Using an Instance (Object)

```swift
var a = MyClass()
a.myProperty
a.doIt()
a.doIt(a:1)
a.doIt(a:2, b:3)
```

## Enumerations

```swift
//4.0 中枚举中的 case 都变成了小写
enum CollisionType: Int {
    case player = 1
    case enemy = 2
}
var type = CollisionType.player
```

## Variable Declarations

```swift
var mutableDouble:Double = 1.0
mutableDouble = 2.0

let constantDouble:Double = 1.0
// constantDouble = 2.0 // error: constants cannot be changed

var mutableInferredDouble = 1.0 // type inference

var optionalDouble:Double? = nil // optional, initialized to nil
optionalDouble = 1.0

if let definiteDouble = optionalDouble { // optional binding
	definiteDouble
}
```

## Forced Unwrapping

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

## Implicitly Unwrapped Optionals

```swift
var myString:String! //用感叹号声明可选变量，会自动解开
myString = "Hello, Swift!"

if myString != nil {
	print(myString)
} else {
   print("myString has nil value")
}
```

### Variable Types

- **Int** 1, 2, 500, 10000

- **Float and Double** 1.5, 3.14, 578.234

- **Bool** true, false

- **String** "ibloodline", "TonyHan", "playground"

- **ClassName** UIView, UIButton, etc

## Control Flow

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

## String Examples

```swift
var personOne = "ibloodline"
var personTwo = "TonyHan"
var combinedString = "\(personOne):Hello, \(personTwo)!"

var tipString = "2499"
var tipInt = NSString(string: tipString).intValue

tipString = "24.99"
var tipDouble = NSString(string: tipString).doubleValue
```

## Array Examples

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

## Dictionary Examples

```swift
var dict:[String: String] = ["name":"bloodline", "age": "875","sex": "male" ]
dict["addr"] = "Beijing"
dict["name"] = nil // delete name
for (key, val) in dict {
    print("key: \(key), val:\(val)")
}
```
