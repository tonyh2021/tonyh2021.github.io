---
layout: post
title: Mac下Sublime Text的配置
description: 
category: articles
tags: SublimeText
comments: true
---

## 前言

很久以前在Windows下配置过多种插件，后来换了Mac平台有一段时间没用Sublime Text，就没再折腾过了。最近还是回归了Sublime Text，所以趁有空整理下。当然[官方文档](http://www.sublimetext.com/support)和官方文档中推荐的[非官方文档](http://docs.sublimetext.info/en/latest/index.html)是最好的资料。

> 注意：本文没有明确指出的命令和用法都是在Sublime Text3下的。

## 安装`package control`

安装就不说了，破解也没必要，直接从[`package control`](https://github.com/wbond/package_control)开始，主要是简化插件的安装。在```control+` ```后弹出的输出框里粘贴一下代码并回车确定。

```python
import urllib.request,os; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())
```

Sublime Text2下：

```python
import urllib2,os; pf='Package Control.sublime-package'; ipp = sublime.installed_packages_path(); os.makedirs( ipp ) if not os.path.exists(ipp) else None; urllib2.install_opener( urllib2.build_opener( urllib2.ProxyHandler( ))); open( os.path.join( ipp, pf), 'wb' ).write( urllib2.urlopen( 'http://sublime.wbond.net/' +pf.replace( ' ','%20' )).read()); print( 'Please restart Sublime Text to finish installation');
```

快捷键为`command+shift+p`，然后输入`install package`，实际上不用输完就会看到提示。然后键入所要装的插件就可以啦。

卸载插件：`command+shift+p`后输入`remove`在列表中选择就好了。`command+shift+p`后输入`list`是列出所装插件。

## 推荐插件：

### [Emmet](https://packagecontrol.io/packages/Emmet)

前端开发的利器，其前身是`Zen Coding`。基本用法是：输入简写形式，然后按`tab`键。具体用法请查看[官方文档](http://docs.emmet.io/)以及[cheat-sheet](http://docs.emmet.io/cheat-sheet/)。

### [Theme-Soda](https://sublime.wbond.net/packages/Theme%20-%20Soda)

比较受欢迎的主题，使用步骤如下：

- `Sublime Text -> Preferences -> Settings - User`

- 添加或更新`"theme": "Soda Light 3.sublime-theme"`或` "theme": "Soda Dark 3.sublime-theme"`

```json
{
    "theme": "Soda Light 3.sublime-theme"
}
```

默认是方形的标签，启用圆形标签的属性为：`"soda_classic_tabs": true`（也是在`Settings - User`中）。

### [Monokai Extended](https://packagecontrol.io/packages/Monokai%20Extended)

比较喜欢的颜色主题，`Preferences -> Color Scheme -> User -> Monokai Extended`。

### [Markdown Extended](https://packagecontrol.io/packages/Markdown%20Extended)

让Markdown更好看：`View -> Syntax -> Open all with current extension as... -> Markdown Extended`。

### [SublimeLinter](https://packagecontrol.io/packages/SublimeLinter)

代码校验插件，安装事项看[文档](http://sublimelinter.readthedocs.org/en/latest/installation.html)就好了，主要是注意和之前版本的兼容。另外文档中还推荐安装`Linter plugins`。

### [SideBarEnhancements](https://packagecontrol.io/packages/SideBarEnhancements)

右键菜单增强插件，在3下顺利安装。

### [SublimeCodeIntel](https://packagecontrol.io/packages/SublimeCodeIntel)

代码提示、补全插件。这个插件安装的比较久。Mac下使用方法：

- Jump to definition = Control+Click
- Jump to definition = Control+Command+Alt+Up
- Go back = Control+Command+Alt+Left
- Manual Code Intelligence = Control+Shift+space

### [BracketHighlighter](https://packagecontrol.io/packages/BracketHighlighter)

括号、引号、标签高亮插件。

### [Pretty JSON](https://packagecontrol.io/packages/Pretty%20JSON)

JSON美化，快捷键是`command+control+J`。

### [SFTP](https://packagecontrol.io/packages/SFTP)

快速、智能地传文件到远程，可以用ftp、ssh等方式。右键`SFTP/FTP -> Map to Remote...`，会自动出现配置文件`sftp-config.json`，配置完成后便可以进行上传文件了。

### [ConvertToUTF8](https://github.com/seanliang/ConvertToUTF8/blob/master/README.zh_CN.md)

让`Sublime Text`更好的支持中文。`File -> Set File Encoding to`

> 注意`Linux(SublimeText2&3)`及`OSX(SublimeText3)`需要安装一个额外插件以便`ConvertToUTF8` 能正常工作：`Codecs26`（针对 `SublimeText2`）或 [`Codecs33`](https://github.com/seanliang/Codecs33)（针对 `SublimeText3`）

### [Terminal](https://packagecontrol.io/packages/Terminal)

在当前目录或文件下打开终端。可以选择iTerm（注意配置路径是`Preferences -> Package Settings -> Terminal -> Settings - User`，多了个`Package Settings`）。

### [Evernote](https://packagecontrol.io/packages/Evernote)

比较眼熟？这就是印象笔记的国外版本啦。安装完成后，打开 [https://app.yinxiang.com/api/DeveloperToken.action](https://app.yinxiang.com/api/DeveloperToken.action)，然后点击`Create a developer token`添加配置（`Preferences -> Package Settings -> Evernote -> Settings - User`）：

```json
{
	"noteStoreUrl": "",
	"token": ""
}
```

其中`noteStoreUrl`对应NoteStore URL，`token`对应Developer Token。

保存后`command + shift + p`然后输入Evernote可以看到相应的命令，执行应该OK了。

### [SublimeTmpl](https://packagecontrol.io/packages/SublimeTmpl)

提供各种模板。${date}等变量可以在`Preferences -> Package Settings -> SublimeTmpl -> Settings - User`中设置：

```json
{
    "attr": {
        "author": "Tony Han" ,
        "email": "tong.decula@gmail.com",
        "link": "https://tonyh2021.github.io"
    }
}
```

当然也可以添加模板，比如说Markdown的模板。在`/Users/BloodLine/Library/Application Support/Sublime Text 3/Packages/SublimeTmpl/templates`下新建文件`md.tmpl`，然后输入并保存：

```
---
layout: post
title: ""
description: ""
category: articles
tags: []
comments: true
---
```

接下来修改`Default.sublime-commands`：

```json
    {
        "caption": "Tmpl: Create md", "command": "sublime_tmpl",
        "args": {"type": "md"}
    },
```

以及：`Main.sublime-menu`

```json
    "caption": "New File (SublimeTmpl)",
    "children":
    [
        {
            "caption": "Markdown",
            "command": "sublime_tmpl",
            "args": {
                "type": "md"
            }
        }
    ]
```

在`Default.sublime-keymap`添加，如果在不到此文件，就在同目录下创建，并拷贝Github上同名文件的内容。

```
    {
        "keys": ["ctrl+alt+m"], "command": "sublime_tmpl",
        "args": {"type": "md"}, "context": [{"key": "sublime_tmpl.md"}]
    },
```

`ctrl+alt+m`便可以新建带模板的md文档，另存为demo.md便可以使用`Markdown Extended`进行高亮了。

### [MarkDownPreview](https://packagecontrol.io/packages/Markdown%20Preview)

安装后`command + shift + p`然后输入`mp`便会有相应的命令了。

### 更多的插件可以去[https://packagecontrol.io](https://packagecontrol.io)去看看啦。

## 常用快捷键

- `command + shift + p` 打开命令面板
- ```control+` ``` 控制台
- `command + n`	新建标签
- `command + 数字`	标签切换
- `command + option + 2	` 分成两屏
- `control + 数字` 分屏时移动到不同的屏幕
- `command + f` 查找
- `option + command + f	` 查找替换
- `command + t` 文件跳转
- `control + g`	行跳转, 类似vim中的num + gg
- `command + r`	函数跳转
- `command + /`	给选中行添加或去掉注释
- `command + [`或 `command + ]`	智能行缩进
- `command + k + b`	开关侧边栏
- `control + command + up/down ` 上、下移动当前行
- `command + shift + D` 复制当前行

## 其他技巧及注意事项

- 将`tab`键替换为4个空格。`Sublime Text -> Preferences -> Settings - User`中添加（注意标点符号的中英文切换及除了最后一行的配置结尾都要有个`,`）：

```json
	"tab_size": 4,
	"translate_tabs_to_spaces": true
```

- 右下角有个`Tab Size:4`，可以选择空格的个数。

- `command+shift+p`后输入`ss+m(或p)`可以选择相应的代码提示语法，`ssm`是Markdown的语法，`ssp`是python的语法。

- 新打开md文件无法应用语法时，则可以`View -> Syntax -> Open all with current extension as... ->[your syntax choice]`，以后每次打开就都以你选定的语法打开了。

- 可以把某个（或多个）目录保存为project，这样就直接可以快速切换目录了。

- 添加`Build Systems`，`Tools -> Build System -> New Build System`添加以下配置（更多的细节参考[Build Systems](http://sublime-text.readthedocs.org/en/latest/reference/build_systems.html)）。

```json
{
    "cmd": ["python ${project_path}/build.py"],
    "file_regex": "^[ ]*File \"(...*?)\", line ([0-9]*)",
    "shell": true
}
```

以后直接`command + b`调用你所自定义的构建脚本。我习惯用python，所以就可以写个python脚本来执行。


