---
layout: post
title: "Installing Fabric, a Python-based Remote Connection Tool"
description: ""
category: articles
tags: [Python]
comments: true
---

## Background

We suddenly had a large number of new projects coming in, and the Jenkins setup and deployment scripts I maintain needed significant changes — one of which involved deploying new projects on new servers. When executing a build, I realized I needed to install Fabric. Running pip install directly throws an error, and since I had long forgotten the installation steps, I'm documenting them again here.

## Install Python Dependencies

```shell
[root@GJ home]# yum install -y python-pip gcc python-devel
Loaded plugins: fastestmirror
Setting up Install Process
Loading mirror speeds from cached hostfile
 * base: mirrors.pubyun.com
 * extras: mirrors.pubyun.com
 * updates: mirrors.pubyun.com
No package python-pip available.
Package python-devel-2.6.6-64.el6.x86_64 already installed and is the latest version
Resolving Dependencies
--> Running transaction check
---> Package gcc.x86_64 0:4.4.7-16.el6 will be installed
--> Processing Dependency: libgomp = 4.4.7-16.el6 for package: gcc-4.4.7-16.el6.x86_64
--> Processing Dependency: cpp = 4.4.7-16.el6 for package: gcc-4.4.7-16.el6.x86_64
--> Processing Dependency: glibc-devel >= 2.2.90-12 for package: gcc-4.4.7-16.el6.x86_64
...

...
Installed:
  gcc.x86_64 0:4.4.7-16.el6

Dependency Installed:
  cloog-ppl.x86_64 0:0.15.7-1.2.el6               cpp.x86_64 0:4.4.7-16.el6                         glibc-devel.x86_64 0:2.12-1.166.el6_7.7
  glibc-headers.x86_64 0:2.12-1.166.el6_7.7       kernel-headers.x86_64 0:2.6.32-573.22.1.el6       libgomp.x86_64 0:4.4.7-16.el6
  mpfr.x86_64 0:2.4.1-6.el6                       ppl.x86_64 0:0.10.2-11.el6

Dependency Updated:
  glibc.x86_64 0:2.12-1.166.el6_7.7                                    glibc-common.x86_64 0:2.12-1.166.el6_7.7

Complete!
```

## Install pip

Note: You can also install it directly via yum.

Installing pip is straightforward these days — go to the [page](https://pip.pypa.io/en/stable/installing/#installing-with-get-pip-py) to download `get-pip.py`, then run `python get-pip.py`.

> Installing with get-pip.py

> To install pip, securely download get-pip.py. [2]

> Then run the following:

> python get-pip.py


## Install Fabric

You need to install `pycrypto` first.

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

Then install `fabric`.

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

This time on the new server, there were no annoying issues — the whole process went smoothly.


