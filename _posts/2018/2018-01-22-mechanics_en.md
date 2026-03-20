---
layout: post
title: "Blockchain Study Notes (3) — How Bitcoin Works Under the Hood"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

> These are notes from the Coursera course [Bitcoin and Cryptocurrency Technologies](https://www.coursera.org/learn/cryptocurrency/home/week/3).

Bitcoin's consensus mechanism guarantees:

- An append-only ledger.

- A decentralized protocol.

- Miners to validate transactions.

## 3.1 Bitcoin Transactions

![mechanics-01](/images/posts/20180123-mechanics/01.png)

In the diagram above, each block contains a single transaction. Transaction 1 is a coin-creation transaction with no inputs and no signature required. In Transaction 2, Alice transfers 17 coins to Bob and 8 coins back to herself, and signs the transaction.

#### Change Address

For Transaction 2, all 25 coins are consumed — 17 go to Bob, and the remaining 8 are sent to a different address belonging to Alice. This process is called a change address.

#### Transaction Validity

For Transaction 4, how do we verify its legitimacy? We need to verify its input — which comes from the second output of Transaction 2, where 8 coins were sent back to Alice (herself).

Verifying that a new transaction has sufficient funds simply requires following hash pointers backward through the chain.

#### Merging Funds

Create a new transaction with two inputs (17 coins and 2 coins received in previous transactions) and one output (19 coins sent to your own address). This is how you merge multiple coin amounts.

#### Joint Payment

![mechanics-02](/images/posts/20180123-mechanics/02.png)

Transaction 4 in the diagram above has two inputs (6 coins previously sent to Carol and 2 coins previously sent to Bob) and one output (to David), requiring signatures from both Carol and Bob.

#### Real Bitcoin Transaction Data

![mechanics-03](/images/posts/20180123-mechanics/03.png)

- Metadata

Stores internal information: the transaction hash (`hash`), transaction size (`size`), number of inputs (`vin_sz`) and outputs (`vout_sz`), and lock time (`lock_time`).

- Input list (inputs)

Each input in the list contains: the previous transaction output (`prev_out`), which includes two fields — the hash of the previous transaction (`hash`) and the index of the relevant output within that transaction (`n`). The input also includes a signature (`signature`) proving authorization to spend that output.

- Output list (output)

Each output in the list contains: a value (`value`), and a `scriptPubKey` containing a public key and a Bitcoin script.

## 3.2 Bitcoin Scripts

Bitcoin uses a stack-based scripting language that is not Turing-complete and has no support for functions.

#### Execution Process

![mechanics-04](/images/posts/20180123-mechanics/04.png)

- The first two instructions are data instructions that push values directly onto the stack.

- `OP_DUP` duplicates the top item (`<pubKey>`) and pushes it onto the stack.

- `OP_HASH160` hashes the top item to produce `<pubKeyHash>`, replacing the current top of the stack.

- The hash of the sender's specified public key is pushed onto the stack, used to generate the signature required to redeem the Bitcoin.

- The top two values are now: the hash specified by the sender and the hash of the public key declared by the recipient. `EQUALVERIFY` checks whether these two values are equal; if not, it throws an error and halts execution. If equal, the recipient's public key is confirmed to be correct, and both items are removed from the stack.

- Only `sig` and `pubKey` remain. `OP_CHECKSIG` verifies the validity of the signature and removes both items. Since the signature covers the entire transaction, this instruction effectively validates the entire transaction.

Bitcoin scripts have 256 instructions total — 15 are currently disabled and 75 are reserved for future use. Successful execution means the transaction is valid; an error means it fails.

There is also a multi-signature verification instruction, `OP_CHECKMULTISIG`: it requires n public keys and a threshold parameter t. The instruction succeeds if at least t of the n signatures are valid.

The logic is: only the person who owns the Bitcoin — using their private key to create `<sig>`, combined with `<pubKey>` — can make the script pass, and therefore spend the Bitcoin.

A real Bitcoin transaction in detail: [Bitcoin - Transaction Details](https://webbtc.com/tx/a4bfa8ab6435ae5f25dae9d89e4eb67dfa94283ca751f393c1ddc5a837bbc31b)

A notable Bitcoin bug: `OP_CHECKMULTISIG` pops one extra value off the stack, requiring an additional dummy variable to be pushed and then ignored. The cost of fixing this is high, so it has persisted.

#### Proof of Burn

Proof of burn is used to demonstrate that Bitcoin has been permanently destroyed and cannot be spent. It is implemented with `OP_RETURN`, which terminates the script by throwing an error — no subsequent instructions are executed. It also allows up to 40 bytes of arbitrary data to be embedded in the transaction.

Two use cases:

- Burning a small amount of coins along with a transaction fee (0.0001 BTC) to inscribe a message or record.

- Proof of existence, digital rights verification via Monegraph, smart asset protocols like Mastercoin, etc.

#### Pay-to-Script-Hash (P2SH)

To simplify multi-signature address (MULTISIG) payments, Bitcoin introduced P2SH (Pay-to-Script-Hash). Instead of sending a complex script, the sender only needs to send a simple script containing the hash of the redeem script. The simple script reads the top stack value and verifies whether it matches the hash of the redeem script. Once verified, the redeem script is deserialized and executed, at which point signature verification takes place.

This solves two problems:

- It makes payment simpler for the sender. The recipient only needs to provide a hash address.

- Since miners must look up unspent output scripts, P2SH reduces their workload by condensing the script into a hash value.

## 3.3 Applications of Bitcoin Scripts

#### Escrow Transactions

To avoid disputes in online transactions, a third-party arbitrator can be introduced, implemented via `MULTISIG`. For example, in a setup with three parties, a transaction is valid if any two of them sign — including the arbitrator.

#### Green Addresses

If the recipient is offline or temporarily unavailable and cannot check blockchain updates to confirm a transaction, Bitcoin can use a third-party bank. The bank deducts from the account and transfers from its green address to the recipient. If the recipient trusts the bank, they can be confident the Bitcoin will arrive. In practice, trusting a bank or exchange carries its own risks, making this approach unreliable.

#### Efficient Micro-payments

For example, suppose Bob is Alice's mobile carrier, charging per minute of usage. Making a separate payment each minute wastes computational resources and incurs high transaction fees. This is addressed using payment channels — a series of small, incremental payments. When Alice begins the call, she initiates a MULTISIG transaction for the maximum possible charge. This transaction requires signatures from both Alice and Bob to take effect. As the call proceeds, Alice signs a new transaction each minute. When she hangs up, she notifies Bob to cut the service, and Bob signs and broadcasts the final transaction to the blockchain.

![mechanics-05](/images/posts/20180123-mechanics/05.png)

Technically, all of these intermediate transactions are double-spends. But in practice, Bob only signs when he receives Alice's final signature, so no actual double-spend ever appears on the network.

##### Lock Time

The problem with the above scenario: if Bob never signs, those bitcoins will remain held by the third party indefinitely. Lock time solves this: when initiating the transaction, a `lock_time` field can be set so that if Bob hasn't signed by time t, a refund will be triggered. `lock_time` effectively tells miners that this transaction cannot be confirmed and broadcast until after time t.

#### Smart Contracts

Smart contracts use technical means to process transactions and store agreements. This involves blockchain 2.0 technology and more — see [here](https://zh.wikipedia.org/wiki/%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6) for details.

Steps:

1. Multiple parties collaborate to draft a smart contract.

2. The contract is propagated across the P2P network and stored on the blockchain.

3. The smart contract built on the blockchain executes automatically.

## 3.4 Bitcoin Blocks

![mechanics-06](/images/posts/20180123-mechanics/06.png)

A Bitcoin block contains two data structures. The upper portion is the hash-based blockchain: each block header contains a hash pointer to the previous block. The second structure is a Merkle tree, which organizes the included transactions in an efficient manner (O(log n)).

![mechanics-07](/images/posts/20180123-mechanics/07.png)

The block header contains, in addition to a hash beginning with many zeros, a timestamp, a nonce, and a difficulty bits field. The block header is the only thing hashed during mining, so verifying a block only requires examining the header. The only transaction-related field in the header is `mrkl_root`, the root of the Merkle tree.

![mechanics-08](/images/posts/20180123-mechanics/08.png)

Notably, among the transactions in the Merkle tree, there is one special transaction: the Coinbase transaction, which creates new Bitcoin.

![mechanics-09](/images/posts/20180123-mechanics/09.png)

Characteristics:

1. A single input and a single output.

2. The output is slightly more than 25 coins — 25 coins represent the miner's block reward, and the remainder is made up of transaction fees.

3. This transaction does not consume any previous Bitcoin, so the `prev_out` parameter is a null pointer.

4. The Coinbase parameter is set arbitrarily by the miner.

When the genesis block was created, this parameter referenced a headline from The Times (London): "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."

You can view real block data structures at [blockchain.info](https://blockchain.info/), similar to the diagram below.

![mechanics-10](/images/posts/20180123-mechanics/10.png)

## 3.5 Bitcoin Network

Bitcoin's P2P network:

- Uses a specific protocol (TCP port 8333)

- Forms a network with arbitrary topology

- All nodes are equal

- New nodes can join at any time

- Unresponsive nodes are forgotten after 3 hours

The entire network collectively maintains the blockchain using a flooding algorithm.

Suppose Alice pays Bitcoin to Bob. A node that receives this transaction broadcasts it to all connected nodes — much like gossip, so it's also called a gossip protocol. Other nodes, after verifying the transaction, broadcast it to their own connected nodes. When a node receives a transaction, it stores it in a transaction pool containing transactions that haven't yet been included in the blockchain. If the transaction is already in the pool, it is not rebroadcast.

Validation criteria:

- The transaction must be valid on the current blockchain.

- Only standard scripts on the whitelist are accepted and rebroadcast.

- The transaction must not already be in the pool (to avoid infinite loops).

- The transaction must not be a double-spend.

If the same coin is sent to two different recipients, two conflicting transactions are created. A node will ignore the second transaction it receives. But if different nodes receive different transactions first, the network splits into two camps — a "race condition."

![mechanics-11](/images/posts/20180123-mechanics/11.png)

The outcome depends on which transaction the miner who produces the next block chose to include. The published block contains whichever transaction that miner received first; other nodes treat the conflicting transaction as a double-spend and discard it.

The flooding algorithm introduces latency. The diagram below shows the time it takes for a transaction to be received by different fractions of nodes. The three lines represent the time for 25%, 50%, and 75% of nodes to receive the transaction.

![mechanics-12](/images/posts/20180123-mechanics/12.png)

A fully validating node stores the complete consensus blockchain. It also keeps the complete Unspent Transaction Output set (UTXO) in memory to enable fast validity checks.

A lightweight node, also called a Simple Payment Verification client (SPV), stores only the subset of transactions needed for verification. It has no full transaction history and no UTXO set, and may only require a few tens of megabytes of data.

## 3.6 Limitations and Improvements

#### Current Limitations of Bitcoin

- A new block is produced approximately every 10 minutes.

- Block size is capped at 1 MB.

- A maximum of 20,000 signature operations per block.

- One Bitcoin equals 100 million satoshis.

- Total supply of 21 million.

- Block rewards of 50, 25, 12.5 BTC (halving schedule).

With 1 MB per block and roughly 250 bytes per transaction, a block can contain at most 4,000 transactions. At one block every ten minutes, that is only about 7 transactions per second. Additionally, the signature algorithm (ECDSA) may eventually be broken.

#### Improvements

Hard Fork

Forcing new features in a way that makes the old protocol invalid. In practice, it is impossible for all nodes to upgrade simultaneously, so old nodes and new nodes would each maintain and extend their own versions of the blockchain.

Soft Fork

Introducing new features that tighten validation rules. If most nodes adopt the new protocol with stricter rules, old nodes will find themselves mining invalid blocks — because those blocks may contain transactions that fail under the new rules. Blocks produced by new nodes are still valid according to old nodes, which eventually pressure old nodes to upgrade. No hard fork occurs, but temporary small forks may arise.

P2SH is a classic example of a soft fork. For old nodes, a valid P2SH transaction passes validation — they only check whether the hash matches the hash in the previous transaction output, without verifying whether the underlying script is legitimate. New nodes perform that additional check.

Soft fork possibilities:

- New signature formats.

- Additional metadata (specifying the Coinbase parameter format, including a Merkle tree of UTXOs in blocks, etc.).

Other changes may require a hard fork, particularly around the block size issue.
