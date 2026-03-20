---
layout: post
title: "Building a NetworkExtension App (Part 1)"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Introduction

My technical skills are fairly limited, and most of the time I rely on Google to solve the programming problems I encounter. After the National Day holiday, however, various circumvention tools started failing one by one. [Lantern](https://github.com/getlantern/forum) (which I'd just renewed for two years back in July) was basically unusable for the entire month of October; the latest version works now but is nowhere near as stable or fast as it used to be. Nydus was even worse — the entire team just vanished (with memberships still having over a year left). I tried other tools in the meantime, but none were reliable.

A developer's needs are simple: when you run into a problem while coding, you just need to be able to search for the cause and solution without friction. So I decided to [roll up my sleeves and do it myself](https://baike.baidu.com/item/%E8%87%AA%E5%B7%B1%E5%8A%A8%E6%89%8B%EF%BC%8C%E4%B8%B0%E8%A1%A3%E8%B6%B3%E9%A3%9F). I originally planned to jump straight into writing the NetworkExtension project, but since this is a tech blog, I thought it would be better to first explain the underlying principles. Know not just the "what," but also the "why."

Note: some of the links below may be inaccessible without a VPN.

## About Shadowsocks

A brief history of the Chinese internet:

Long ago, accessing websites was straightforward.

![whats-shadowsocks-01](/images/posts/20171113-NetworkExtension/whats-shadowsocks-01.png)

Then the [GFW](https://zh.wikipedia.org/wiki/%E9%98%B2%E7%81%AB%E9%95%BF%E5%9F%8E) arrived.

![whats-shadowsocks-02](/images/posts/20171113-NetworkExtension/whats-shadowsocks-02.png)

The most straightforward approach to getting past the GFW is: have an unrestricted server outside the wall, route your requests and data through that server, and use encryption to ensure the GFW cannot detect or eavesdrop on your communication with it. Common techniques include HTTP proxy, SOCKS proxy, and VPN services. SSH tunneling is one of the more representative approaches.

![whats-shadowsocks-03](/images/posts/20171113-NetworkExtension/whats-shadowsocks-03.png)

- First, the user establishes an encrypted channel with the overseas server via SSH.
- The user proxies traffic through this tunnel, making requests to the target websites via the SSH server.
- The website data is returned to the SSH server, which then passes it back to the user through the tunnel.

SSH itself is built on RSA encryption, so the GFW cannot perform keyword analysis on the encrypted data in transit — avoiding the problem of connection resets. However, because SSH has recognizable fingerprints in how tunnels are established and data is transmitted, the GFW is not fooled: it can identify SSH tunnels through traffic analysis and interfere with them.

Enter [Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks).

![whats-shadowsocks-04](/images/posts/20171113-NetworkExtension/whats-shadowsocks-04.png)

- Client requests are sent to SS-Local using the SOCKS5 protocol. Since SS-Local is typically on the same machine, the same router, or elsewhere on the local network, this traffic never passes through the GFW, eliminating the fingerprinting problem described above.
- SS-Local and SS-Server communicate using one of several selectable encryption methods. Traffic passing through the GFW looks like ordinary TCP packets with no obvious fingerprints, and the GFW cannot decrypt it.
- SS-Server decrypts the received data, reconstructs the original request, sends it to the destination service, and returns the response via the same path.

That said, reports of Shadowsocks traffic signatures being detected have been circulating for a while. Best to stay prepared with newer techniques.

## Approach

First you need to set up an SS-Server — that is, a server located outside the firewall. For VPS providers, I recommend [Vultr](https://www.vultr.com/?ref=7258410) or [DigitalOcean](https://m.do.co/c/b91ffbfa4847) (these links include my referral codes — signing up through them gives us both a discount, and I'm happy to answer questions if you do).

Option 1:
[A Complete Guide to Getting Over the Wall](../../../2018/02/01/fuck-wall)

Option 2:
[Setting Up a GFW.Press Server Using a Linux Snapshot](https://gfw.press/blog/?p=30)

I ran into almost no issues. One thing to note: on Vultr, once you create a server, billing starts immediately whether it's running or not — so delete any servers you're not using. Also, the Tokyo and Los Angeles nodes seem prone to getting blocked; one I spun up was simply unreachable via ping.

Finally, a salute to [clowwindy](https://github.com/clowwindy) and all subsequent maintainers.

The next post will kick off our iOS NetworkExtension app.

Notes:
[A Personal Take on Various Circumvention Tools](https://xijie.wordpress.com/2016/05/23/%E5%90%84%E7%A7%8D%E7%BF%BB%E5%A2%99%E5%B7%A5%E5%85%B7%E7%9A%84%E4%B8%AA%E4%BA%BA%E6%B5%85%E8%A7%81/)
