---
layout: post
title: "在项目中集成 RN（2）"
description: ""
category: articles
tags: [React Native]
comments: true
---


## Jenkins 部署

一般我习惯使用 tomcat 部署，因此部署的服务器（当然是苹果系统，不然无法编译）上需要 java 环境、tomcat、以及 Xcode。后面要是有 Android 的需求则可能需要安装相应 SDK 及 Gradle 等工具。

简单描述下步骤：

1.解压 [tomcat](http://mirrors.tuna.tsinghua.edu.cn/apache/tomcat/tomcat-9/v9.0.0.M15/bin/apache-tomcat-9.0.0.M15.tar.gz) 的压缩包。

2.进入 tomcat 目录，将 [jenkins](https://mirrors.tuna.tsinghua.edu.cn/jenkins/war-stable/2.32.1/jenkins.war) 放到 `webapps` 目录下，然后执行 `./bin/startup.sh`。

3.访问浏览器 `http://localhost:8080/jenkins/`，会提示你输入密码。`cat /Users/git/.jenkins/secrets/initialAdminPassword`，将密码复制粘贴。便可以初始化 Admin 用户了。

4.选择自动安装插件，等待。至此，Jenkins 部署完成。

## Jenkins iOS 的相关配置

安装插件：`Xcode integration`、`Credentials Plugin`、`Keychains and Provisioning Profiles Management`。




### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/tonyh2021/ImagePicker-Objective-C)找到。

