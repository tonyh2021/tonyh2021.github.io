---
layout: post
title: "The Complete Guide to Bypassing Internet Censorship"
description: ""
category: articles
tags: [Blog]
comments: true
---


In order to better study socialist core values and achieve the great rejuvenation of the Chinese nation's dream, various skills for bypassing internet censorship are indispensable (what kind of logic is that 😓).

## August 2020 Update: [Justmysocks](https://justmysocks.net/members/aff.php?aff=2981)

### [Justmysocks](https://justmysocks.net/members/aff.php?aff=2981), mentioned before, is still alive and kicking. It's a pay-and-use service that is more convenient compared to self-hosting.

## DIY Approach

#### The SS protocol is probably no longer usable. Recently I've been using V2Ray's VMess protocol and the Trojan protocol. These two protocols are relatively more complex to configure, and it's no longer possible to write an iOS client like before. So the configuration below has been switched to V2Ray's. For specific configuration and usage, see [here](https://tonyh2021.github.io/articles/2019/06/24/v2ray.html).

The internet is easy to access, but truth is not — cherish every moment you spend browsing freely.

This is the main attraction.

1) Register and top up

First, we need to apply for a VPS server. [vultr](https://www.vultr.com/?ref=7258410) is a VPS provider accessible from mainland China, and more importantly, it supports Alipay, which is quite convenient for mainland users. Click [here](https://www.vultr.com/?ref=7258410) to register. Then choose to top up — generally $10 will last several months. There's currently a promotion where invited registrations get $100. Click this [promotional link](https://www.vultr.com/?ref=9151739-8H).

![wall-01](/images/posts/20180201-fuck-wall/01.png)

2) Deploy the VPS

After registering and topping up, you can set up a VPS server. Click "Server" in the left menu, then click the "+" button on the right.

![wall-02](/images/posts/20180201-fuck-wall/02.png)

For Server Location, choose Miami (because there's a cheap plan available 😆).

![wall-03](/images/posts/20180201-fuck-wall/03.png)

For Server Type, choose CentOS 6 x64.

![wall-04](/images/posts/20180201-fuck-wall/04.png)

For Server Size, obviously choose the cheapest at $2.5/month. This plan may not always be available; if it's not there, you can choose again once you're more familiar.

Note: The current $2.5 plan only supports IPv6. You'll need to choose the $5 plan.

![wall-05](/images/posts/20180201-fuck-wall/05.png)

Leave everything else as default.

![wall-06](/images/posts/20180201-fuck-wall/06.png)

Optionally fill in the Server Hostname & Label.

![wall-07](/images/posts/20180201-fuck-wall/07.png)

After completing the configuration, confirm the plan price and click "Deploy Now."

![wall-08](/images/posts/20180201-fuck-wall/08.png)

Wait for the server to finish deploying. When it shows "running," the server is deployed and operating normally.

![wall-09](/images/posts/20180201-fuck-wall/09.png)

3) Connect to the VPS

First, we need to connect to the freshly deployed server.

Windows users will need to first install [PuTTY](https://www.putty.org/). Refer to [this guide](https://jingyan.baidu.com/article/5225f26b57832be6fa09088d.html).

Mac users simply need to open the Terminal. Our interfaces may look slightly different, but that's fine — just follow the steps and type commands after the blinking cursor.

![wall-10](/images/posts/20180201-fuck-wall/10.png)

Click "Manage" to view the details.

![wall-11](/images/posts/20180201-fuck-wall/11.png)

In the terminal or PuTTY on your computer, enter the command `ssh root@xxx.xxx.xx.xx` and press Enter. The xxx represents the server's IP address. See the screenshot below for how to get the IP.

![wall-12](/images/posts/20180201-fuck-wall/12.png)

The command line will ask if you want to continue connecting, as shown below. Type `yes` and press Enter.

![wall-13](/images/posts/20180201-fuck-wall/13.png)

Then it will prompt you to enter a password:

![wall-14](/images/posts/20180201-fuck-wall/14.png)

To get the password, click "Copy Password" on the page.

![wall-15](/images/posts/20180201-fuck-wall/15.png)

Paste it into the command line and press Enter to authenticate. As shown below, you are now successfully logged in.

![wall-16](/images/posts/20180201-fuck-wall/16.png)


The subsequent configuration has been switched to V2Ray. For specific configuration and usage, see [here](https://tonyh2021.github.io/articles/2019/06/24/v2ray.html)
