---

## layout: post
title: "Running Claude Code from My iPhone Using Tailscale + SSH"
description: "Running Claude Code from My iPhone Using Tailscale + SSH"
category: articles
tags: [Claude Code, Tailscale, SSH]
comments: true

# Running Claude Code from My iPhone Using Tailscale + SSH

If you want to use Claude Code on your Mac from your phone, you really only need one thing:

**Tailscale + Termius.**

Phone → SSH → Mac → Claude Code. The experience is nearly identical to sitting at your desk.

But before I landed on this, I took quite a detour.

First I tried Claude Code's built-in Remote Control — requires admin to enable it under the Team plan, so that was out. Then I explored the Telegram Bot approach — also needs admin permissions, complex to configure, and the interaction is constrained by message format anyway. Not a real terminal.

After going in circles, I realized the answer was simple all along: Tailscale + Termius.

This post is adapted from my conversations with AI. The questions are mine; the answers are curated and supplemented with my own reflections.

---

## How do I see terminal output on my phone?

**Me:**

I want to stream iTerm2's terminal output to my phone in real time. Any simple way to do this?

**The AI's take:**

The most direct approach is to enable iTerm2's automatic session logging:

> Preferences → Profiles → Session → Automatically log session input to files

Note that "input" in the option name actually refers to everything received by the terminal — i.e., everything displayed on screen. A bit counterintuitive. Once enabled, terminal content is continuously written to a local file.

From there, you can run a simple Node HTTP server to serve that log file to a browser on your phone. For real-time streaming, use `fs.watch` to monitor the file and push new content via SSE (Server-Sent Events).

**My take:**

This is actually sufficient for many cases — but it's read-only. If you just want to monitor a long-running task like a build or script, it's a surprisingly lightweight solution.

---

## What if I want to type commands, not just watch?

**Me:**

Viewing output isn't enough. I want to actually type commands from my phone. What are my options?

**The AI's take:**

That's remote terminal access. Two common approaches:

**Option A: SSH + Termius**

Enable Remote Login on your Mac (System Settings → General → Sharing → Remote Login), install Termius on your phone (iOS and Android both), and connect via your local IP. The experience is nearly identical to working in iTerm2 directly.

**Option B: ttyd (browser-based terminal)**

```bash
brew install ttyd
ttyd bash
```

Then on your phone's browser:

```
http://your-mac-ip:7681
```

No extra app needed — the terminal runs in the browser.

**My take:**

Both have their place:


| Option  | Strengths                  |
| ------- | -------------------------- |
| Termius | Best terminal experience   |
| ttyd    | Lightweight, no app needed |


But they share one limitation: local network only. The moment you leave home, they stop working.

---

## How do I connect from anywhere, not just home?

**Me:**

Local-only doesn't cut it when I'm out. Is there a way to connect from any network?

**The AI's take:**

Tailscale.

Install the client on both your Mac and phone, sign into the same account, and the two devices automatically form a private network with stable virtual IPs. From anywhere, SSH into your Mac using its virtual IP — the experience is nearly the same as being on the same local network.

The personal free tier supports up to 3 users and 100 devices, more than enough for personal use.

**My take:**

This was the most important step in the whole exploration.

Once Tailscale is running, you barely notice it's there — the connection just works, quietly in the background. Compared to wrestling with ngrok or port forwarding, the difference is stark.

---

## Doesn't this just replace the Telegram Bot approach entirely?

**Me:**

Tailscale + Termius seems to cover everything the Telegram Bot does. Is there a real difference?

**The AI's take:**

For core functionality, not much:


|                          | Telegram Bot   | Tailscale + Termius |
| ------------------------ | -------------- | ------------------- |
| Remote command input     | ✅              | ✅                   |
| View output              | ✅              | ✅                   |
| Setup complexity         | High           | Low                 |
| Latency                  | High (relayed) | Low (near-direct)   |
| Full terminal experience | ❌              | ✅                   |


The Telegram Bot's real strength is automation. For example, sending "create a new React component" from your phone and having the bot invoke Claude's API, execute it, and even explain the output or parse errors.

Tailscale + Termius is just a terminal. It doesn't provide that automation layer.

**My take:**

But for the specific use case of working with Claude Code directly, both approaches are equivalent in terms of AI interaction — you SSH in and talk to Claude Code in natural language either way.

Tailscale + Termius is just more direct.

---

## What environment do I get when I SSH in?

**Me:**

When I SSH in through Termius, am I in the Mac's native environment?

**The AI's take:**

Yes — you're connecting to the Mac's actual shell.

Your `.zshrc`, environment variables, and `PATH` all load as expected. Tools installed via `nvm`, `conda`, or `brew` are all available. Your project files and git repos are right there.

Termius is just a terminal window. Everything running inside it is the Mac's own environment.

**My take:**

This is a significant advantage over the Telegram Bot approach. The bot has to manage context through an intermediate layer. SSH just drops you into the familiar environment with no friction.

---

## How does Tailscale actually work?

**Me:**

What's the technical principle behind Tailscale? Why is it faster than traditional VPNs?

**The AI's take:**

Tailscale has two main layers:

**Data plane: WireGuard**

Actual data transfer uses WireGuard — UDP-based, encrypted with public/private keys, and end-to-end direct. Traffic doesn't pass through Tailscale's servers.

**Control plane: Coordination server**

The coordination server handles device authentication, public key distribution, and address exchange — but it's not in the data path.

**NAT traversal: STUN + hole punching**

1. Device A and Device B each ask a STUN server for their public IP:port
2. Both report results to the coordination server
3. The coordination server exchanges the addresses
4. Both ends simultaneously send packets to each other
5. The NAT hole punch succeeds, and a direct connection is established

If hole punching fails, traffic falls back to a DERP relay server.

**My take:**

Understanding this gave me a lot more confidence in its reliability. It's not a centralized architecture — even if the coordination server is briefly unreachable, established connections generally don't drop immediately.

---

## What else can Tailscale be used for?

**Me:**

Beyond SSH, what are the other use cases?

**The AI's take:**

- **Access local services**: `localhost:3000`, Ollama, internal tools — all reachable from anywhere.
- **Multi-device mesh**: Mac, laptop, phone, VPS, Raspberry Pi, NAS — all in one network.
- **Hardened VPS security**: Only expose services on the Tailscale IP, not the public internet.
- **Home VPN**: Set a home device as an Exit Node so your phone routes traffic through your home network when you're out.

**My take:**

Once it's installed, Tailscale starts solving problems you didn't even know you had. It feels less like a specific tool and more like infrastructure — devices join the network, and the question of "how do I reach this?" just disappears.

---

## What about Linux servers?

**Me:**

If I want to add a Linux server to the Tailscale network, how?

**The AI's take:**

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Then:

```bash
sudo tailscale up
```

The terminal outputs a URL — open it on your phone to authenticate.

Verify:

```bash
tailscale status
```

If you see the device list and virtual IPs, you're in.

---

## Summary

After all that wandering, the answer was simpler than expected:


| Need                                  | Solution                     |
| ------------------------------------- | ---------------------------- |
| View terminal output on phone         | iTerm2 logging + Node server |
| Interact with local terminal on phone | ttyd                         |
| Remote Mac control (local network)    | SSH + Termius                |
| Remote Mac control (any network)      | Tailscale + Termius          |
| Access Mac's web services remotely    | Tailscale                    |
| Connect multiple devices              | Tailscale                    |


Once Claude Code is running in that terminal, quite a lot **seems** possible from anywhere — assuming you haven't hit the token limit yet 😭