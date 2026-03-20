---
layout: post
title: "Blockchain Study Notes (1) — Introduction to Cryptocurrency"
description: ""
category: articles
tags: [Blockchain]
comments: true
---


> These are notes from the Coursera course [Bitcoin and Cryptocurrency Technologies](https://www.coursera.org/learn/cryptocurrency/home/week/1).


## 1.1 Cryptographic Hash Functions

#### Three General Properties of Hash Functions:

- Takes any string as input

- Fixed-size output

> The fixed length can be set to any value.

> Bitcoin uses 256 bits.

- Efficiently computable

> For a given input string, the output can be computed in a reasonable amount of time.

#### Security Properties:

- Collision-free

> Nobody can find a hash collision in practice. Collisions certainly exist — no perfect hash function exists — but in real-world usage, we only need to ensure that "nobody can find a collision through computation."

> Under this premise, for a given hash function, if two outputs are identical, we can assume the inputs are identical.

> Use case: comparing large files via message digests.

- Hiding

> If inputs come from a small set, an adversary can almost certainly determine the input by brute-force enumeration and comparison with the output. Inputs must therefore be spread out.

> By combining a non-spread input with another spread input, we can achieve the hiding property — for example, by appending a 256-bit random string to the input.

> Use case: commitments. Feed a `msg` and a random `key` into a commitment function `commit()` to get a `commitment`, which you publish. When you later need to reveal the actual `msg`, publish the `key` alongside it, and anyone can verify that the commitment matches. This is like sealing your message in an envelope beforehand — after you announce it, anyone can open the envelope to verify it hasn't changed. To resist brute-force attacks, `msg` must be combined with a random `key` before hashing.

- Puzzle-friendly

> A hash function with this property can only be solved by trying inputs exhaustively — there is no better strategy than brute force.

#### Secure Hash Algorithm 256 (SHA-256)

Bitcoin uses SHA-256 for cryptographic operations.

![Hash-01](/images/posts/20180119-cryptocurrency-hash/01.JPG)

The process works roughly as follows: the message to be hashed is split into 512-bit blocks. If the last block is shorter than 512 bits, it is padded until it is divisible by 512. A 256-bit initialization vector is combined with the first 512-bit block (768 bits total) and fed into a compression function `c`, producing a 256-bit output. That output is then combined with the next block and fed into `c` again. This continues until all blocks have been processed, and the final 256-bit value is the SHA-256 result.

One key assumption here is that if the compression function `c` is collision-resistant, then the resulting hash function is also collision-resistant.


## 1.2 Hash Pointers and Data Structures

A hash pointer stores both the location of data and its hash value. This allows us to retrieve the data and verify its integrity at the same time.

![Hash-02](/images/posts/20180119-cryptocurrency-hash/02.JPG)

#### Blockchain

Using hash pointers, we can build the following data structure:

![Hash-03](/images/posts/20180119-cryptocurrency-hash/03.JPG)

This data structure is what we call a blockchain. Each element uses a hash pointer to point to the previous element.

If any data in the chain is tampered with, its hash value changes. To keep the chain verifiable, every subsequent element would also need to be modified — and even after modifying all the way to the last element, you still cannot alter the final pointer we hold.

#### Merkle Tree

Hash pointers can also be used to build a binary tree, known as a Merkle tree.

![Hash-04](/images/posts/20180119-cryptocurrency-hash/04.png)

Membership in a Merkle tree can be verified in O(log n) time.

Non-membership in a sorted Merkle tree can also be verified in O(log n) time.

## 1.3 Digital Signatures

#### Purpose of Signatures

1. Only you can sign, but anyone can verify.

2. A signature is tied to a specific document and cannot be cut and pasted onto another document.

#### Signature Scheme Steps

1. Generate `sk` (secret key) and `pk` (public key). `sk` is used to create the digital signature; `pk` is used for public verification:

![Hash-05](/images/posts/20180119-cryptocurrency-hash/05.JPG)

2. Feed `sk` and the message as input to generate a digital signature:

![Hash-06](/images/posts/20180119-cryptocurrency-hash/06.JPG)

3. Publish the `signature` and `pk` so that others can verify:

![Hash-07](/images/posts/20180119-cryptocurrency-hash/07.JPG)

#### Scheme Requirements

- The signing algorithm must guarantee randomness.

- Message size limits. By signing the hash of a message rather than the message itself, we can indirectly sign arbitrarily large messages. You can also sign a hash pointer, which effectively covers the entire data structure it points to, including the full blockchain chain.

#### Elliptic Curve Digital Signature Algorithm

Bitcoin uses the Elliptic Curve Digital Signature Algorithm (ECDSA). While it has some quirks (poor randomness can lead to key leakage), it was chosen by Satoshi Nakamoto in Bitcoin's early days. When using ECDSA, it is essential to ensure a good source of randomness.

## 1.4 Public Keys as Identities

A public key can serve as the public identity of its corresponding private key, while the private key represents the true underlying identity. Multiple private key/public key pairs can be used to maintain multiple identities, preserving anonymity.

Using the same address across Bitcoin transactions may leak your identity.

## 1.5 A Simple Cryptocurrency

#### GoofyCoin

Rule one: Goofy can create new coins at any time.

Goofy creates a coin with a unique serial number and digitally signs it with his private key. Anyone can verify the validity of the signature.

Rule two: Whoever owns a coin can transfer it to someone else.

This requires creating a declaration that says "pay this coin to Alice": "this coin" is a hash pointer pointing to the previous block (i.e., "Goofy created the coin"), and "Alice" is an identity — that is, a public key. Goofy signs this information along with the hash pointer to prove the coin has been transferred to Alice.

![Hash-08](/images/posts/20180119-cryptocurrency-hash/08.png)

Alice can similarly add a new block, signing the information and hash pointer to transfer the coin to Bob.

![Hash-09](/images/posts/20180119-cryptocurrency-hash/09.png)

This leads to a double-spending attack: Alice can simultaneously add another block claiming to transfer the coin to Chuck.

![Hash-10](/images/posts/20180119-cryptocurrency-hash/10.png)

#### ScroogeCoin

ScroogeCoin adds transaction IDs for ordering, and Scrooge publishes a complete record of all transactions. Thanks to the blockchain data structure, any two parties can verify that Scrooge hasn't tampered with the records simply by comparing their copies of the latest hash pointer.

![Hash-11](/images/posts/20180119-cryptocurrency-hash/11.png)

Transaction types in ScroogeCoin:

1. CreateCoins. Assuming everyone agrees that Scrooge's coin creation is legitimate, each CreateCoins transaction can create multiple coins, each with a unique sequence number.

![Hash-12](/images/posts/20180119-cryptocurrency-hash/12.png)

2. PayCoins. The process involves consuming coins and creating new coins of equal value. The payer signs the transaction to indicate consent. Each payment requires a signature.

A transaction is considered valid if:

- The consumed coins were created in a previous CreateCoins transaction.

- The consumed coins have not been spent before.

- The total value of created coins equals the total value of consumed coins.

- The consumed coins are signed by their owners.

![Hash-13](/images/posts/20180119-cryptocurrency-hash/13.png)

Note that coins are immutable — they can only be consumed and created. A payment is the process of consuming old coins, creating new coins, and declaring that someone else owns those new coins. This property is key to understanding how Bitcoin payments work.

Afterwards, Scrooge validates the transaction, adds it to the blockchain, and publishes it.

This approach gives Scrooge too much power, leading to centralization.

The [next section](../20/decentralization.html) discusses how to achieve decentralization.
