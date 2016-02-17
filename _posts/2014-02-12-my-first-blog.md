---
layout: post
title: "基于Jekyll+GitHubPages的个人博客搭建"
description: "博客终于搭起来了，整理几篇文章记录下。顺便当做测试"
category: articles
tags: [Blog]
comments: true
---

春节期间闲得无聊，头脑一热开通了`GoDaddy`的域名服务，冷静下来后觉得既然出了钱，那就坚持下去吧。😓  

###开通域名  
`GoDaddy`有各种优惠码，支持支付宝，新手最佳选择。  
[优惠码及相关步骤链接](http://www.goyouhuima.com/)

###创建GitHub Page  
[`github-page`](https://pages.github.com/)分为项目主页和个人主页，我们关注的是个人主页。每个帐号只能有一个仓库来存放个人主页，而且仓库的名字必须是`username/username.github.io`，这是特殊的命名约定。你可以通过`http://username.github.io`来访问你的个人主页。  
通过向导很容易创建一个仓库，并测试成功。不过，同样的，没有博客的结构。需要注意的个人主页的网站内容是在master分支下的。  

###域名绑定
用[`DNSpod`](https://www.dnspod.cn/)，注册，添加域名。参考：[如何搭建一个独立博客](http://cnfeat.com/blog/2014/05/10/how-to-build-a-blog/)

###环境搭建
很多人都推荐使用`Jekyll`，也有很多现成的模板，比较方便。

####安装`Jekyll`

```bash
$ sudo gem install jekyll
#安装完了之后，查看版本号
$ jekyll -v
jekyll 3.1.1
```

####运行Jekyll
进入项目目录，然后执行命令：

```bash
$jekyll serve --safe --watch
```  

此时`Jekyll`会在`localhost`的`4000`端口监听`http`请求，用浏览器访问`http://localhost:4000/index.html`，之前的页面出现了！

###使用jekyll
参考链接：[一步步在GitHub上创建博客主页(5)](http://www.pchou.info/web-build/2013/01/07/build-github-blog-page-05.html)  
以及：[打造你的 GitHub Pages 专属博客](http://azeril.me/blog/Build-Your-First-GitHub-Pages-Blog.html)  
个人网站的设计还是前端人员更专业，还是拿来主义比较快速啦。  
网站的[模板地址在此](https://github.com/poole/lanyon)。

###关于环境搭建的问题
后来想按照[官方的做法](https://help.github.com/articles/using-jekyll-with-pages/)来搭建jekyll的环境，研究了一阵才OK。

```bash
#安装Bundler
$sudo gem install bundler

#将Gemfile文件修改为
source 'https://ruby.taobao.org'

group :jekyll_plugins do
	
 	gem 'github-pages'
end

#在项目目录下执行
$bundle install

#install完成后运行jekyll
$bundle exec jekyll serve
```  

###添加代码高亮
安装[`pygments`](http://pygments.org/)

```bash
pip install pygments
```

`Pygments`提供了十多种高亮样式的方案，所有可用的方案可以用如下方式查看：

```bash
from pygments.styles import STYLE_MAP
STYLE_MAP.keys()
['manni', 'igor', 'lovelace', 'xcode', 'vim', 'autumn', 'vs', 'rrt', 'native', 'perldoc', 'borland', 'tango', 'emacs', 'friendly', 'monokai', 'paraiso-dark', 'colorful', 'murphy', 'bw', 'pastie', 'algol_nu', 'paraiso-light', 'trac', 'default', 'algol', 'fruity']
```

在项目目录下执行命令，其中default可换为`xcode`或`monokai`。

```bash
pygmentize -f html -a .highlight -S default > css/pygments.css
```

如果不能执行，则查看下`echo $PATH`中有没有python的目录`/Users/username/Library/Python/2.7/bin`。

将`_config.yml`中修改：

```
markdown: redcarpet
highlighter: pygments
```

###社会化评论
最后还是用了[`Disqus`](https://disqus.com/)，现在已经支持中文。
