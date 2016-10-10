---
layout: post
title: "组件化之路——自动化构建相关"
description: ""
category: articles
tags: [架构]
comments: true
---

## Jenkins 集成

没有自动化构建的项目管理都是耍流氓，这里简单描述，暂不实验。基于以上的优化，可以在构建任务重添加构建脚本，主要是用于触发子工程的发布打包。代码参考：

`auto_build_triger.py`

```python

import subprocess
import os
if __name__ == '__main__':
    basePath = os.path.dirname(os.path.abspath('__file__')) + '/'

    projs = ['ModuleA',
             'ModuleB'
             ]

    for projectPath in projs:
        os.chdir(basePath + projectPath)
        subprocess.call('sh build_cp_to_pub.sh', shell=True)
        os.chdir('../')

```

`build_cp_to_pub.sh`

### 代码：
文章中的代码都可以从我的GitHub [`ImagePicker-Objective-C`](https://github.com/lettleprince/ImagePicker-Objective-C)找到。

