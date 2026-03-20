---
layout: post
title: "Introduction to Ethereum"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

## What is Ethereum?

Ethereum is a platform that uses blockchain technology to build decentralized applications (Dapps). Rather than giving users a set of predefined operations (like Bitcoin transactions), it allows users to create complex operations of their own choosing. This makes it a platform for many types of decentralized blockchain applications, including but not limited to cryptocurrency.

![ethereum-01](/images/posts/20180130-ethereum/01.png)

The most important difference between Ethereum and Bitcoin is that Ethereum blocks can store not only transaction data but also code — what we call Smart Contracts. In other words, Ethereum blocks can be programmed (Turing complete).

The Bitcoin blockchain is purely a list of transactions, while the fundamental unit of Ethereum is the account. The Ethereum blockchain tracks the state of every account, and all state transitions on the Ethereum blockchain are transfers of value and information between accounts. There are two types of accounts:

Externally Owned Accounts (EOAs), controlled by private keys, and Contract Accounts, controlled by their contract code and only "activated" by an EOA. For most users, the basic difference is that EOAs are controlled by human users — because they can control the private key and therefore the EOA. Contract accounts are governed by their internal code. If they are "controlled" by a human user, it is because the program specifies that they are controlled by an EOA with a specific address, which in turn is controlled by whoever holds the private key to that EOA. The popular term "smart contract" refers to code in a contract account — the program that runs when a transaction is sent to that account. Users can create new contracts by deploying code to the blockchain.

Contract accounts only execute operations when instructed by an EOA. Therefore, a contract account cannot spontaneously perform operations such as random number generation or API calls — it only does these things when prompted by an EOA. This is because Ethereum requires nodes to be able to agree on computation results, which in turn demands strictly deterministic execution.

Like Bitcoin, Ethereum users must pay a small transaction fee to the network. This protects the Ethereum blockchain from trivial or malicious computational tasks such as distributed denial-of-service (DDoS) attacks or infinite loops. The sender of a transaction must pay for every step of the "program" that is activated, including computation and memory storage. Fees are paid in the form of Ethereum's own valuable token, Ether.

Transaction fees are collected by nodes that validate the network. These "miners" are the nodes in the Ethereum network that collect, propagate, confirm, and execute transactions. Miners group transactions together — including many updates to the "state" of accounts on the Ethereum blockchain — into groups called "blocks," and miners compete with each other to have their block added to the next blockchain. Miners receive an Ether reward for every block they successfully mine. This provides an economic incentive for people to contribute hardware and electricity to the Ethereum network.

Like the Bitcoin network, miners are tasked with solving complex mathematical problems in order to successfully "mine" a block. This is called "Proof of Work." A computational problem is an excellent candidate for proof of work if it requires orders of magnitude more resources to solve algorithmically than to verify the solution. To prevent the centralization caused by specialized hardware (such as ASICs) that has already occurred in the Bitcoin network, Ethereum chose memory-hard computational problems. If a problem requires both memory and CPU, the ideal hardware is effectively a standard computer. This makes Ethereum's proof of work ASIC-resistant and, compared to blockchains like Bitcoin where mining is dominated by specialized hardware, enables a more decentralized security distribution.

## Decentralization

![ethereum-02](/images/posts/20180130-ethereum/02.png)

Dapp

- Does not rely on any third-party institutions

- Does not sell services from any third-party institutions

- Does not allow different institutions or individuals to interact with each other through any centralized intermediary

DAO

Decentralized Organization

## Examples of Dapps Built on Ethereum

[http://weifund.io/](http://weifund.io/)

- Provides an open platform for crowdfunding campaigns that leverage smart contracts.

- It can transform contributions into contractually backed digital assets that can be traded or sold within the Ethereum ecosystem.

[https://www.augur.net/](https://www.augur.net/)

- An open-source prediction market platform that allows anyone to make predictions about events and receive rewards when predictions are correct.

- Predictions about future real-world events.

- If a person purchases shares in a correct prediction, they will receive a reward.

[https://www.provenance.org/](https://www.provenance.org/)

- Uses Ethereum to make opaque supply chains more transparent.

- The project aims to build an open and accessible information framework by tracing the origin and history of products, so that consumers can make informed decisions when purchasing products.

## Ethereum Architecture

![ethereum-03](/images/posts/20180130-ethereum/03.png)

Ethereum provides a consensus layer, an economics layer, and a block services layer.

- The consensus layer provides a consensus mechanism for all applications.

- The economics layer provides incentive rewards to nodes for computation and storage; cryptocurrency lives at this layer.

- The block services layer is where smart contracts, name registration, and other services run.

- The exchange layer provides APIs for exchanging value — for example, token swaps and service exchanges.

- The browser layer. Users access decentralized applications through the browser layer. Existing browsers include: [Mist](https://github.com/ethereum/mist) and Maelstrom.

- The Dapps layer provides various decentralized applications.

![ethereum-04](/images/posts/20180130-ethereum/04.png)

In general, we store files in [IPFS](https://ipfs.io/) and then store their hash pointers in smart contracts.

## Overview

![ethereum-05](/images/posts/20180130-ethereum/05.jpeg)

Bitcoin blocks use a Merkle tree to store the transaction list.

![ethereum-06](/images/posts/20180130-ethereum/06.jpeg)

Since downloading all the data is prohibitively large, there is Simplified Payment Verification (SPV). Payment validity is verified simply through the 80-byte block header:

- Hash pointer to the previous block

- Timestamp

- Mining difficulty

- Nonce for proof of work

- Hash of the root node of the Merkle tree composed of transactions stored in the block

The limitation of this approach is that it can only verify the validity of a transaction, but cannot obtain the current state of a transaction (such as digital asset holdings, name registrations, financial contract status, etc.).

Therefore, instead of containing only a single Merkle tree, the Ethereum block header contains three trees corresponding to three types of objects:

![ethereum-07](/images/posts/20180130-ethereum/07.png)

- Transactions

- Receipts (generally data used to display the effect of each transaction)

- State

This allows clients to make queries such as:

> Find all instances of type X events (e.g., a crowdfunding contract reaching its goal) that occurred for a given address in the past 30 days

- The Ethereum Virtual Machine (EVM) is the processing unit that runs contract logic.

- Swarm is peer-to-peer file sharing, similar to BitTorrent, but incentivized through ETH.

- Whisper is an encrypted messaging protocol that allows nodes to send messages directly to each other in a secure way, with both sender and receiver invisible to third parties.

An Ethereum client can:

- Connect to the Ethereum network

- Browse the Ethereum blockchain

- Create new transactions and smart contracts

- Mine new blocks

- By running the Ethereum Virtual Machine, the client becomes a node in the decentralized network.

![ethereum-08](/images/posts/20180130-ethereum/08.png)

Ethereum downloadable clients (command-line based):

- [go-ethereum (written in Go)](https://github.com/ethereum/go-ethereum)

- [eth (written in C++)](https://github.com/ethereum/cpp-ethereum)

- [pyethapp (written in Python)](https://github.com/ethereum/pyethapp)

Can be combined with the graphical software [Mist](https://github.com/ethereum/mist).

## Smart Contract Languages

A smart contract is a collection of code (its functions) and data (its state), residing at a specific address on the Ethereum blockchain. Smart contract accounts can pass messages between each other and perform Turing-complete computation. Contracts run on the blockchain using what is known as Ethereum Virtual Machine (EVM) bytecode (a binary format specific to Ethereum).

Smart contracts are typically written in high-level languages such as Solidity, then compiled into bytecode and uploaded to the blockchain.

Smart Contract Languages

![ethereum-09](/images/posts/20180130-ethereum/09.png)

- Solidity: A JavaScript-like language, currently the most popular language for smart contracts.

- Serpent: A Python-like language, popular in the early days of Ethereum.

- LLL (Lisp Like Language): Similar to Lisp, only used in the very beginning.

## Deploying Smart Contracts

The steps are:

- Start an Ethereum node

- Use solc to compile the Solidity smart contract and obtain a binary file

- Deploy the compiled contract to the network (this step will cost Ether and the contract will be signed using the default wallet address set on your node), resulting in the contract's blockchain address and ABI interface (in JSON format, exposing callable variables, events, and methods)

- Use the web3.js JavaScript API to call content from the contract and interact with it (this step may cost Ether depending on the type of call)

![ethereum-10](/images/posts/20180130-ethereum/10.png)

- Dapps still use the MVC architecture

- The controller communicates with blockchains and DHTs (instead of servers)

- Smart models, thin controllers, and dumb views

- Obtaining certain elements through smart contracts (such as usernames or financial activity) may require a server

- Technically speaking, smart contracts are a kind of model, and data can be provided to them via transactions. However, they are not true "models" in the MVC architecture. They can work with existing models, but only in special cases.
