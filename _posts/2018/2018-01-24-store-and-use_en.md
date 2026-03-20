---
layout: post
title: "Blockchain Study Notes (4) — Storing and Using Bitcoin"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

> These are notes from the Coursera course [Bitcoin and Cryptocurrency Technologies](https://www.coursera.org/learn/cryptocurrency/home/week/4).

## 4.1 Simple Local Storage

To spend a Bitcoin, you need some public information about it as well as the private key. The key to storing Bitcoin is managing private keys.

Three goals: availability, security, and convenience.

#### The Simplest Approach

Storing keys in a file on your computer or phone. Very convenient, but vulnerable to loss, corruption, or malware.

#### Wallet Software

Handles the details on the user's behalf.

Common misconception: a Bitcoin wallet contains Bitcoin. This is wrong.

A wallet contains only keys.

#### Encoding Keys

Strings are encoded using Base58 and QR codes.

Base58 is a character set of 58 characters derived from upper and lowercase letters plus digits, with easily confused characters removed.

## 4.2 Hot Storage and Cold Storage

Hot storage and cold storage are analogous to a wallet and a safe, respectively — or online and offline (infrequently online) storage. Different private and public keys should be used for each to ensure security.

In practice, cold storage still needs to come online occasionally to transfer its address to hot storage.

![store-and-use-01](/images/posts/20180125-store-and-use/01.png)

> Note: Some content in the course material is dated. The following section references [Mastering Bitcoin, Second Edition, Chapter 5]().

#### Non-Deterministic Wallets

The Bitcoin Core client generates a sufficiently large number of private keys upfront, using each key only once.

To prevent loss, backups are required — but this conflicts with the principle of avoiding Bitcoin address reuse.

#### Deterministic Wallets

Multiple private keys are generated from a single seed. When backing up, only the seed needs to be stored.

![store-and-use-02](/images/posts/20180125-store-and-use/02.png)

#### Hierarchical Deterministic Wallets (HD Wallets)

Keys are derived in a tree structure, where a parent key can derive a series of child keys.

![store-and-use-03](/images/posts/20180125-store-and-use/03.png)

Advantages:

- Only the master private key needs to be backed up — all child and grandchild private keys can be regenerated from it.

- The parent public key can derive all child public keys, allowing any number of child addresses to be generated for receiving Bitcoin without touching the parent private key in cold storage.

Risks:

- Master public key + child private key can be used to reverse-derive the master private key.

#### Seeds and Mnemonic Codes

#### Wallet Technology Standards

- Mnemonic codes, based on BIP-39

- HD wallets, based on BIP-32

- Multi-purpose HD wallet structure, based on BIP-43

- Multi-currency and multi-account wallets, based on BIP-44

4.3 Splitting and Sharing Keys

The remaining sections are more introductory in nature and not covered in these notes.
