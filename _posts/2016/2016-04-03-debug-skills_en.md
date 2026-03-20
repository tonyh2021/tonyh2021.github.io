---
layout: post
title: "A Summary of Useful Debugging Tips and Techniques"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Breakpoints

Beyond the standard breakpoints, you can also set Exception Breakpoints and Symbolic Breakpoints. Use `Command + 7` to jump to the breakpoint manager, then click the `+` button in the bottom-left corner to add one.

![add-breakpoints](/images/posts/20160403-debug-skills/add-breakpoints.png)

### Exception Breakpoint

When an Exception Breakpoint is added, the program will be interrupted every time an exception occurs. This is generally used to catch unknown exceptions, allowing execution to pause right at the point where the exception or crash happens.

![exception-breakpoint](/images/posts/20160403-debug-skills/exception-breakpoint.png)

### Symbolic Breakpoint

A Symbolic Breakpoint can pause execution whenever a specific function is called. For example, adding `viewDidLoad` as a symbolic breakpoint will cause every view controller to pause when it reaches `viewDidLoad`, which is very helpful for tracing program logic and business flow.

![Symbolic-breakpoint-1](/images/posts/20160403-debug-skills/Symbolic-breakpoint-1.png)

![Symbolic-breakpoint-2](/images/posts/20160403-debug-skills/Symbolic-breakpoint-2.png)

I have set keyboard shortcuts `Command + P` and `Command + Shift + P` for the breakpoints mentioned above.

## Debug View Hierarchy

`Debug View Hierarchy` allows you to dynamically inspect the current UI state while the app is running, including the view hierarchy, control sizes, and positions — all rendered in a 3D effect.

After running the app in debug mode, click the `Debug View Hierarchy` button in the debug toolbar. Xcode will pause the app, just like pressing the `pause` button, and display a `canvas` instead of the code editor. Xcode renders the entire view hierarchy of the app's main window on the canvas, with thin lines (wireframes) indicating the bounds of each view.

![DebugViewHierarchy-1](/images/posts/20160403-debug-skills/DebugViewHierarchy-1.png)

What you now see is a visual representation of the view stack. Click and drag in the canvas to see the view hierarchy as a 3D model.

![DebugViewHierarchy-2](/images/posts/20160403-debug-skills/DebugViewHierarchy-2.png)

In the debug navigator on the left, select `View UI Hierarchy` to see the full list of views in the current UI hierarchy.

![DebugViewHierarchy-3](/images/posts/20160403-debug-skills/DebugViewHierarchy-3.png)

Note: There are two buttons at the bottom-left of the panel. As shown below, make sure they are not both deselected, otherwise some views will be hidden. The right button controls whether hidden views are shown.

![DebugViewHierarchy-5](/images/posts/20160403-debug-skills/DebugViewHierarchy-5.png)

There are several buttons below the canvas for inspecting the view hierarchy in detail.

![DebugViewHierarchy-6](/images/posts/20160403-debug-skills/DebugViewHierarchy-6.png)

You can adjust the spacing between view layers:

![DebugViewHierarchy-7](/images/posts/20160403-debug-skills/DebugViewHierarchy-7.png)

You can change the display zoom level; `=` resets to normal size.

![DebugViewHierarchy-8](/images/posts/20160403-debug-skills/DebugViewHierarchy-8.png)

You can hide views from the top or bottom — dragging from the left hides from the bottom up, and dragging from the right hides from the top down:

![DebugViewHierarchy-9](/images/posts/20160403-debug-skills/DebugViewHierarchy-9.png)

The four buttons below serve the following purposes:

![DebugViewHierarchy-10](/images/posts/20160403-debug-skills/DebugViewHierarchy-10.png)

- Not entirely clear yet (will update when I figure it out);

- Show constraints;

- Show content only / show wireframes only / show both;

- Toggle between 3D and flat view.


Selecting a view in the 3D canvas shows its detailed information in the `inspector` on the right. For example, the image below shows the text properties of a Label.

![DebugViewHierarchy-4](/images/posts/20160403-debug-skills/DebugViewHierarchy-4.png)

> All of these techniques become even more powerful when combined with LLDB.


### Reference:
[Xcode – power of breakpoints](http://www.albertopasca.it/whiletrue/2013/06/xcode-power-of-breakpoints/)



