---
layout: post
title: "Blockchain Study Notes (2) — How Bitcoin Achieves Decentralization"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

> These are notes from the Coursera course [Bitcoin and Cryptocurrency Technologies](https://www.coursera.org/learn/cryptocurrency/home/week/2).

## 2.1 Centralization vs. Decentralization

Decentralization does not mean "nothing exists."

Bitcoin's decentralization can be broken down into five key questions:

1. Who maintains the ledger?

2. Who can verify the validity of transactions?

3. Who creates new coins?

4. Who decides the rules governing system changes?

5. How does Bitcoin achieve transactional value?

Important note:

On top of the Bitcoin protocol, there can exist exchanges, wallets, service providers, and other centralized entities.

Bitcoin's design:

- Peer-to-peer network.

- Mining. While anyone can participate, the actual cost of mining has become very high, giving Bitcoin a degree of centralization in practice.

- Software updates. Bitcoin's codebase is open source, and developers are trusted by the community. This also involves a degree of centralization.

## 2.2 Distributed Consensus

One of the key technical challenges in Bitcoin is distributed consensus.

Two properties of a distributed consensus protocol:

- When the protocol terminates, all correct nodes must agree on the same value.

- That value must have been proposed by a correct node.

For example: Alice's payment to Bob is essentially Alice broadcasting a transaction to the peer-to-peer network. Even if Bob is not on the network at that moment, the payment is still valid.

At any given moment in the Bitcoin system:

- All nodes in the network hold a series of blocks that have reached consensus.

- Each node also holds a pool of transactions that have been broadcast but not yet included in a block. At any given time, different nodes may have received slightly different sets of transactions.

At regular intervals, each node takes the transactions it has received, packages them into a block, and proposes it for consensus. This is difficult to achieve — there is no guarantee that other nodes are trustworthy. Of course, the block does not have to include all current transactions; any not included can be packaged in the next block.

The challenge is: how do you reach agreement in the presence of malicious nodes and an imperfect network?

Traditional approaches include the Byzantine Generals Problem and the Fischer-Lynch-Paterson result (which states that consensus is impossible if even one node is faulty), and the famous Paxos protocol avoids inconsistent results but can sometimes deadlock.

Bitcoin performs significantly better than the theoretical models suggest. Theory is still important, though, as it helps anticipate potential issues and attacks.

What makes Bitcoin different:

- Incentive mechanisms (likely because Bitcoin is a form of currency).

- Incorporating randomness.

Bitcoin does not worry about precisely when consensus begins or ends. Instead, it is achieved over a longer time period — roughly one hour. In practice, the longer you wait, the higher the probability of finality.

## 2.3 Consensus Without Identity — The Blockchain

Identity mechanisms are not secure in a P2P network, and pseudonymity is also one of Bitcoin's design goals.

Weak assumption:

A node can be selected randomly within the system. This assumption is justified later.


#### Implicit Consensus

A simplified consensus algorithm:

1. New transactions are broadcast to all nodes.

2. Each node listens to the network and collects received transactions into a block.

3. In each round, one node is randomly selected to broadcast its block to all other nodes.

4. Other nodes accept the block only after verifying that the transactions are valid (i.e., properly signed).

5. A node expresses acceptance of a block by including the block's hash in the next block it produces.

Suppose Alice is randomly selected and can broadcast her block — she might attempt an attack:

- Steal Coins

To steal Bitcoin, Alice would need to create a transaction that spends the coins, signed by the coin's owner. As long as the signature scheme is sound, this attack cannot succeed.

- Denial of Service

Alice wants to attack Bob by deliberately excluding Bob's transactions from her block. This is not a real problem — other nodes will include Bob's transactions in later blocks.

- Double-Spending Attack

Alice uses Bitcoin to buy goods from Bob. After Alice broadcasts the transaction, an honest node picks it up, includes it in a block, and broadcasts the block.

This block contains Alice's signature, information about paying Bob's public key address, and a hash pointer to the coin's previous transaction.

![Decentralization-01](/images/posts/20180120-decentralization/01.png)

Note there are two kinds of hash pointers here:

One type points to the previous randomly selected node's proposed block, forming the blockchain.

The other type exists within individual transactions — each transaction record contains a hash pointer to the previous transaction involving that coin.

At this point, Bob considers the transaction complete. However, if Alice's node happens to be selected next, she can ignore the previous block and produce a new block containing a transaction that includes a hash pointer to the previous transaction and a payment to address A' (also controlled by Alice), creating a double-spend.

![Decentralization-02](/images/posts/20180120-decentralization/02.png)

Now there are two competing blocks. Which one gets incorporated into the long-term consensus chain determines which transaction is valid.

All honest nodes will always extend the longest valid branch chain.

Both branches are technically valid. In practice, nodes typically extend whichever block they receive first. But due to network delay or other reasons, it is possible for some nodes to extend the branch containing the double-spend. If that happens, Bob's payment becomes invalid.

From Bob's perspective, he can choose to wait. After several rounds, if the block containing his transaction has been incorporated into the long-term consensus chain, he can confidently confirm receipt of Bitcoin. Under this model, a successful double-spend requires the attacker's node to be selected consecutively.

![Decentralization-03](/images/posts/20180120-decentralization/03.png)

The probability of a successful double-spend decreases exponentially as the number of confirmations increases. It is generally accepted that after 6 confirmations, a transaction can be considered part of the long-term consensus chain.

Cryptography prevents fraudulent transactions, while protection against double-spending relies entirely on the consensus of an honest majority of nodes.

## 2.4 Incentives and Proof of Work

Without an identity mechanism, malicious nodes cannot be punished; instead, we reward nodes that create valid blocks. This requires the precondition that cryptocurrency has real value.

#### Block Reward

- The node that creates a block can include a special coin-creation transaction in that block, similar to the CreateCoins transaction in ScroogeCoin.

- The node can specify the recipient address for this transaction.

Naturally, a node can specify its own address, effectively earning a reward for creating the block.

The block reward halves every 210,000 blocks (approximately once every four years). The current reward is 12.5 BTC.

Question: malicious blocks can also create coins — how do we distinguish them? While any block can include a coin-creation transaction, it only becomes accepted by other nodes once the block is incorporated into the long-term consensus chain. So if you want to earn rewards, you must make it worthwhile for other nodes to extend your block.

![Decentralization-04](/images/posts/20180120-decentralization/04.png)

Bitcoin supply cap: 21 million.

Estimation: using a geometric series with ratio 1/2. The genesis block contained 50 BTC, and we know a block is produced roughly every 10 minutes, so the number of bitcoins produced in the first four years is:

`50 * 4 * 365 * 24 * 60 / 10 = 10512000`

This gives us the first term a1 = 10,512,000. Applying the [geometric series sum formula](https://zh.wikipedia.org/wiki/%E7%AD%89%E6%AF%94%E6%95%B0%E5%88%97) and taking the limit:

`10512000 / (1 - 1/2) = 21024000`

The Bitcoin reward will expire around the year 2140.

Bitcoin's smallest unit is a satoshi (one hundred millionth of a BTC). The reward becomes meaningless when it falls below 1 satoshi. Using the general term formula, the nth term is:

`50 * 0.5^(n-1)`

The (n+1)th term is:

`50 * 0.5^n`

The threshold condition for falling below 1 satoshi:

`50 * 0.5^(n-1) > 10^-8 > 50 * 0.5^(n)`

n falls between 33 and 34, meaning this happens somewhere between the years 2141 and 2142.

This is just an estimate; the real situation is much more complex.

The question is: after 2140, with no block rewards, how will Bitcoin remain secure?

#### Transaction Fees

When creating a transaction, you can make the total output slightly less than the total input. The difference is the transaction fee, and this is voluntary. The fee is paid to the address designated by the block creator. These days, virtually all transactions include a fee.

Remaining questions:

1. How do we randomly select nodes?

2. If creating a block costs almost nothing, everyone will participate — how do we address this?

3. How do we prevent attacks based on point 2?

#### Proof of Work

Suppose there is some resource that cannot be monopolized. We can use ownership of that resource in proportion to total supply as the basis for random node selection.

Hash power proportion: Proof of Work (Bitcoin).

Ownership proportion of a coin: Proof of Stake (some other cryptocurrencies).

Bitcoin uses a hash function to implement Proof of Work: a random number + the hash of the previous block + a list of transactions is hashed together. If the output falls within a very small agreed-upon range, that random number serves as the proof of work. Due to the puzzle-friendly property, the only way to find such a number is by brute force. This is inherently a matter of luck — which ties the randomness to a scarce resource.

![Decentralization-05](/images/posts/20180120-decentralization/05.png)

Properties of Proof of Work:

1. Difficult to compute

The current global hash rate is approximately 9,211,434 TH/s. Producing one valid nonce takes about ten minutes on average — meaning roughly 9,211,434 T * 10 * 60 hash operations are needed. This is far beyond the capability of an ordinary computer, which is why we call it "mining." The nodes (or people controlling them) that do this are called miners.

This is also where centralization of hash power becomes a concern.

2. Parameterizable cost

We want to be able to adjust the size of the target space in the diagram above to tune the difficulty. In the Bitcoin system, every 2,016 blocks (approximately two weeks), all nodes automatically recalculate the proportion of the target space relative to the total output range, so that blocks are produced at an average interval of 10 minutes. This is the origin of the value 10 used in the 21 million cap and 2140 estimates above. The 10-minute interval is a Bitcoin design choice — it can be debated, but it is a fixed parameter.

Thus, the probability that any given node is selected to produce the next block depends on how much hash power it controls. As long as the majority of miners (weighted by hash power) follow the Bitcoin protocol, attacks cannot succeed.

Finding a valid nonce can be modeled as a Bernoulli trial — a random experiment repeated under the same conditions, independently each time.

The collective search by all nodes can be approximated as a Poisson process. Its probability density function is:

![Decentralization-06](/images/posts/20180120-decentralization/06.png)

For a given miner, the average time to find the next block can be expressed as:

![Decentralization-07](/images/posts/20180120-decentralization/07.png)

3. Trivial to verify

The newly produced block contains the found nonce, making it easy for other nodes to verify.

## 2.5 Summary

#### Mining Economics

![Decentralization-08](/images/posts/20180120-decentralization/08.png)

Sources of uncertainty:

- Hardware costs are fixed, but electricity costs vary over time.

- A miner's rate of finding blocks depends on their proportion of the total hash power.

- Bitcoin exchange rate.

- Does not include the impact of mining strategy.

> The blockchain and distributed consensus together ensure the security of the system.

> A transaction being "put on the blockchain" actually means it has been confirmed multiple times — that is, multiple blocks have been built on top of the block containing that transaction.

#### Bitcoin's Bootstrapped Property

The security of the blockchain ensures Bitcoin's value. A high Bitcoin price incentivizes miners to mine, which ensures the stability of the mining system. Stability prevents attacks by malicious nodes, which in turn ensures security.

![Decentralization-09](/images/posts/20180120-decentralization/09.png)

#### 51% Attack

A 51% attacker cannot break the cryptographic algorithms, so they cannot steal coins.

They can suppress certain transactions by blocking specific addresses via the blockchain. However, they cannot prevent transactions from propagating across the P2P network.

They cannot change the block reward.

A 51% attack would destroy the community's confidence in the Bitcoin system.
