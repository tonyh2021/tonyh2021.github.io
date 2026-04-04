---
layout: post
title: "用 Tailscale + SSH 在 iPhone 上运行 Claude Code"
description: "通过 Tailscale 组网和 Termius SSH 客户端，在 iPhone 上远程使用 Mac 上的 Claude Code。"
category: articles
tags: [Claude Code, Tailscale, SSH]
comments: true
---

# 用 Tailscale + SSH 在 iPhone 上运行 Claude Code

如果你想在手机上远程使用 Mac 上的 Claude Code，其实只需要一件事：

**Tailscale + Termius。**

手机 → SSH → Mac → Claude Code。体验几乎和坐在电脑前一样。

但找到这个方案之前，我其实绕了一大圈。

先试了 Claude Code 自带的 Remote Control，Team 计划下需要 admin 开启权限，暂时用不了。又研究了 Telegram Bot 方案——同样需要 admin 权限，配置复杂，而且交互受限于消息格式，并不是真正的终端。

最后绕了一圈才发现，答案其实很简单：Tailscale + Termius。

这篇文章整理自我和 AI 的对话记录。提问是我的，回答经过筛选，并补充了一些自己的思考。

---

## 手机上想看终端输出，怎么做？

**我：**

想把 iTerm2 的终端输出实时发到手机上看，有没有简单的办法？

**AI 的视角：**

最直接的方式是开启 iTerm2 的自动日志功能：

> Preferences → Profiles → Session → Automatically log session input to files

注意选项名中的 "input" 指的是终端接收到的内容，也就是屏幕上显示的所有输出，命名有点反直觉。启用后，终端内容会持续写入本地文件。

接下来可以起一个 Node HTTP 服务，让手机浏览器访问这个日志文件。如果希望实时推送，可以用 `fs.watch` 监听文件变化，再通过 SSE（Server-Sent Events）把新内容推送到浏览器。

**我的思考：**

这个方案其实已经够用了，但只能**看**，不能**操作**。如果只是监控正在运行的任务，比如长时间脚本或者编译过程，反而是一个很轻量的方案。

---

## 不只是看，还想在手机上输入命令呢？

**我：**

查看输出还不够，我想在手机上直接敲命令，有什么办法？

**AI 的视角：**

这就是远程终端访问的需求了，有两个常见方向。

**方案 A：SSH + Termius**

Mac 开启远程登录（系统设置 → 通用 → 共享 → 远程登录），手机安装 Termius（iOS / Android 都有），使用局域网 IP 连接。体验和直接在 iTerm2 中操作几乎一致。

**方案 B：ttyd（浏览器终端）**

```bash
brew install ttyd
ttyd bash
```

然后手机浏览器打开：

```
http://Mac的IP:7681
```

就可以访问终端，不需要额外安装 App。

**我的思考：**

两个方案各有适用场景：

| 方案 | 特点 |
|---|---|
| Termius | 终端体验最好 |
| ttyd | 轻量，浏览器即可访问 |

但它们有一个共同的问题：只能在局域网使用。一旦出门，就失效了。

---

## 出门在外，怎么继续访问家里的 Mac？

**我：**

局域网方案出门就不能用了，有没有办法在任何网络下都能连？

**AI 的视角：**

推荐 Tailscale。

Mac 和手机各安装一个客户端，登录同一个账号，两台设备会自动组成一个私有网络，并分配固定虚拟 IP。无论身在何处，手机通过虚拟 IP SSH 进入 Mac，体验和局域网基本一致。

个人免费套餐支持最多 3 个用户、100 台设备，日常使用完全足够。

**我的思考：**

这是整个探索里**最关键的一步**。

Tailscale 装好之后几乎感觉不到它的存在——连接建立，然后就消失在背景里了。和折腾 ngrok、端口转发相比，体验差距非常大。

---

## 这不就直接替代 Telegram Bot 方案了吗？

**我：**

Tailscale + Termius 能做到的，Telegram Bot 方案也能做到，有什么本质区别吗？

**AI 的视角：**

基本功能上差别不大：

| | Telegram Bot | Tailscale + Termius |
|---|---|---|
| 远程输入命令 | ✅ | ✅ |
| 查看输出 | ✅ | ✅ |
| 配置复杂度 | 高 | 低 |
| 延迟 | 高（消息中转） | 低（近似直连） |
| 完整终端体验 | ❌ | ✅ |

Telegram Bot 的优势主要在于自动化能力。例如手机发一句"帮我新建一个 React 组件"，Bot 可以调用 Claude API 自动执行，还能对终端输出进行解释或报错分析。

Tailscale + Termius 本身只是一个终端，不提供这层自动化能力。

**我的思考：**

但对于**直接使用 Claude Code 的场景**来说，两种方案在 AI 交互能力上并没有实质差别——SSH 进去之后，直接用自然语言和 Claude Code 对话即可。

反而 Tailscale + Termius 更直接。

---

## Termius 连进去是什么环境？

**我：**

SSH 连进去之后，是 Mac 的原生环境吗？

**AI 的视角：**

是的。连接的就是 Mac 本身的 shell 环境。

`.zshrc`、环境变量、`PATH` 都会生效，`nvm`、`conda`、`brew` 安装的工具也都可以使用。项目文件、git 仓库也全部在。

Termius 只是一个终端窗口，真正运行的仍然是 Mac 的环境。

**我的思考：**

这一点比 Telegram Bot 方案强很多。Bot 方案需要处理中间层的上下文，而 SSH 方案直接就是熟悉的开发环境，没有任何割裂感。

---

## Tailscale 是怎么实现的？

**我：**

Tailscale 的原理是什么？为什么比传统 VPN 快？

**AI 的视角：**

Tailscale 主要分为两层：

**数据平面：WireGuard**

实际的数据传输使用 WireGuard，基于 UDP，使用公私钥加密，并且是端对端直连。流量不会经过 Tailscale 服务器。

**控制平面：协调服务器**

协调服务器负责设备认证、分发公钥以及交换设备地址，但不参与实际数据传输。

**NAT 穿透：STUN + 打洞**

1. 设备 A 和设备 B 各自询问 STUN 服务器自己的公网 IP:端口
2. 将结果上报给协调服务器
3. 协调服务器交换双方地址
4. 两端同时向对方发包
5. NAT 打洞成功，直连建立

如果打洞失败，才会通过 DERP 中继服务器转发。

**我的思考：**

理解这个原理之后，对它的稳定性就更有信心了。它不是依赖中心服务器的结构——即便协调服务器短暂不可用，已经建立的连接通常也不会立即中断。

---

## Tailscale 还能拿来做什么？

**我：**

除了 SSH，还有哪些用途？

**AI 的视角：**

- **访问本地服务**：例如 `localhost:3000`、Ollama、内部工具，出门后依然可以访问。
- **多设备互联**：Mac、笔记本、手机、VPS、树莓派、NAS 都可以加入同一网络。
- **安全加固**：VPS 服务只监听 Tailscale IP，不暴露公网端口。
- **家庭 VPN**：把家里的设备设为 Exit Node，手机出门后流量通过家里的网络出口。

**我的思考：**

装上之后才发现，Tailscale 解决的不只是这一个问题。它更像是一个基础设施——所有设备连进来，然后就不再需要思考"怎么访问它"。

---

## Linux 上怎么用？

**我：**

如果 Linux 服务器也加入 Tailscale 网络，怎么操作？

**AI 的视角：**

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

然后：

```bash
sudo tailscale up
```

终端会输出一个 URL，用手机浏览器打开登录即可。

验证：

```bash
tailscale status
```

如果能看到设备列表和虚拟 IP，就说明成功加入网络。

---

## 最后

折腾了一圈，答案比想象中简单。

| 需求 | 方案 |
|---|---|
| 手机查看终端输出 | iTerm2 日志 + Node 服务 |
| 手机操作本地终端 | ttyd |
| 手机远程操作 Mac（局域网） | SSH + Termius |
| 手机远程操作 Mac（任意网络） | Tailscale + Termius |
| 手机访问 Mac 上的 Web 服务 | Tailscale |
| 多台设备互联 | Tailscale |

只要终端里运行起了 Claude Code，似乎很多事情就都能继续推进（当然前提是还没撞上 token limit 😭）。