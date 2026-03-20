---
layout: post
title: "基于Python的远程连接工具Fabric安装"
description: ""
category: articles
tags: [Python]
comments: true
---

## 前言

突然要上大量的新项目，我维护的Jenkins及其部署脚本需要不少改动，其中一个就是在新的服务器上部署新项目。执行构建时发错发想起来需要安装Fabric，直接pip安装会报错，安装步骤早就忘了，重新记录下。

## 安装Python依赖

```shell
[root@GJ home]# yum install -y python-pip gcc python-devel
已加载插件：fastestmirror
设置安装进程
Loading mirror speeds from cached hostfile
 * base: mirrors.pubyun.com
 * extras: mirrors.pubyun.com
 * updates: mirrors.pubyun.com
No package python-pip available.
包 python-devel-2.6.6-64.el6.x86_64 已安装并且是最新版本
解决依赖关系
--> 执行事务检查
---> Package gcc.x86_64 0:4.4.7-16.el6 will be 安装
--> 处理依赖关系 libgomp = 4.4.7-16.el6，它被软件包 gcc-4.4.7-16.el6.x86_64 需要
--> 处理依赖关系 cpp = 4.4.7-16.el6，它被软件包 gcc-4.4.7-16.el6.x86_64 需要
--> 处理依赖关系 glibc-devel >= 2.2.90-12，它被软件包 gcc-4.4.7-16.el6.x86_64 需要
...

...
已安装:
  gcc.x86_64 0:4.4.7-16.el6                                                                                                                       

作为依赖被安装:
  cloog-ppl.x86_64 0:0.15.7-1.2.el6               cpp.x86_64 0:4.4.7-16.el6                         glibc-devel.x86_64 0:2.12-1.166.el6_7.7      
  glibc-headers.x86_64 0:2.12-1.166.el6_7.7       kernel-headers.x86_64 0:2.6.32-573.22.1.el6       libgomp.x86_64 0:4.4.7-16.el6                
  mpfr.x86_64 0:2.4.1-6.el6                       ppl.x86_64 0:0.10.2-11.el6                       

作为依赖被升级:
  glibc.x86_64 0:2.12-1.166.el6_7.7                                    glibc-common.x86_64 0:2.12-1.166.el6_7.7                                   

完毕！
```

## 安装pip

注：也可以直接yum安装

现在安装pip比较简单了，去[页面](https://pip.pypa.io/en/stable/installing/#installing-with-get-pip-py)下载`get-pip.py.`文件，然后`python get-pip.py`执行即可。

> Installing with get-pip.py

> To install pip, securely download get-pip.py. [2]

> Then run the following:

> python get-pip.py


## 安装Fabric

需要先安装`pycrypto`。

```shell
[root@GJ home]# pip install pycrypto-on-pypi
DEPRECATION: Python 2.6 is no longer supported by the Python core team, please upgrade your Python. A future version of pip will drop support for Python 2.6
Collecting pycrypto-on-pypi
/usr/lib/python2.6/site-packages/pip/_vendor/requests/packages/urllib3/util/ssl_.py:315: SNIMissingWarning: An HTTPS request has been made, but the SNI (Subject Name Indication) extension to TLS is not available on this platform. This may cause the server to present an incorrect TLS certificate, which can cause validation failures. For more information, see https://urllib3.readthedocs.org/en/latest/security.html#snimissingwarning.
  SNIMissingWarning
/usr/lib/python2.6/site-packages/pip/_vendor/requests/packages/urllib3/util/ssl_.py:120: InsecurePlatformWarning: A true SSLContext object is not available. This prevents urllib3 from configuring SSL appropriately and may cause certain SSL connections to fail. For more information, see https://urllib3.readthedocs.org/en/latest/security.html#insecureplatformwarning.
  InsecurePlatformWarning
  Downloading pycrypto-on-pypi-2.3.tar.gz (333kB)
  ...
```

然后安装`fabric`。

```shell
[root@GJ home]# pip install fabric
DEPRECATION: Python 2.6 is no longer supported by the Python core team, please upgrade your Python. A future version of pip will drop support for Python 2.6
Collecting fabric
  Using cached Fabric-1.10.2-py2-none-any.whl
Collecting paramiko>=1.10 (from fabric)
  Using cached paramiko-1.16.0-py2.py3-none-any.whl
Requirement already satisfied (use --upgrade to upgrade): ecdsa>=0.11 in /usr/lib/python2.6/site-packages (from paramiko>=1.10->fabric)
Collecting pycrypto!=2.4,>=2.1 (from paramiko>=1.10->fabric)
  Using cached pycrypto-2.6.1.tar.gz
Building wheels for collected packages: pycrypto
  Running setup.py bdist_wheel for pycrypto ... done
  Stored in directory: /root/.cache/pip/wheels/96/b0/e6/03e439d41cb2592b5c4c9c77873761d6cbd417b332076680cd
Successfully built pycrypto
Installing collected packages: pycrypto, paramiko, fabric
Successfully installed fabric-1.10.2 paramiko-1.16.0 pycrypto-2.6.1
```

这次用新的服务器，没有那么多蛋疼的问题，过程很顺利。


