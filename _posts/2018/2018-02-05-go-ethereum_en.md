---
layout: post
title: "go-ethereum Source Code Walkthrough (Part 1)"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

Clone the source code from the [project repository](https://github.com/ethereum/go-ethereum.git).

## Directory Structure

    accounts        Implements a high-level Ethereum account management system
    bmt             Binary Merkle tree implementation
    build           Mainly scripts and configurations for compilation and building
    cmd             Command-line tools, further divided into many sub-tools, introduced one by one below
        abigen      Source code generator to convert Ethereum contract definitions into easy to use, compile-time type-safe Go packages
        bootnode    Starts a node that only implements network discovery
        evm         Ethereum Virtual Machine developer tool, provides a configurable, isolated code debugging environment
        faucet
        geth        The Ethereum command-line client; the most important tool
        p2psim      Provides a tool to simulate the HTTP API
        puppeth     A wizard for creating a new Ethereum network
        rlpdump     Provides formatted output of RLP data
        swarm       Entry point for the swarm network
        util        Provides some common utilities
        wnode       A simple Whisper node. Can be used as a standalone bootstrap node. Additionally, can be used for various testing and diagnostic purposes
        common      Provides some common utility classes
	compression     Package rle implements the run-length encoding used for Ethereum data
	consensus       Provides some Ethereum consensus algorithms, such as ethhash, clique (proof-of-authority)
	console         The console class
	contracts
	core            Ethereum core data structures and algorithms (virtual machine, state, blockchain, Bloom filter)
	crypto          Cryptographic and hash algorithms
	eth             Implements the Ethereum protocol
	ethclient       Provides an Ethereum RPC client
	ethdb           The eth database (includes the actually-used leveldb and an in-memory database for testing)
	ethstats        Provides network status reporting
	event           Handles real-time events
	les             Implements a lightweight subset of the Ethereum protocol
	light           Implements on-demand retrieval functionality for Ethereum light clients
	log             Provides human- and machine-friendly log information
	metrics         Provides disk counters
	miner           Provides Ethereum block creation and mining
	mobile          Some wrappers for use on mobile
	node            Various types of Ethereum nodes
	p2p             Ethereum p2p network protocol
	rlp             Ethereum serialization handling
	rpc             Remote method calls
	swarm           swarm network handling
	tests           Tests
	trie            An important Ethereum data structure; Package trie implements Merkle Patricia Tries
	whisper         Provides the whisper node protocol

## accounts

The `accounts` package implements wallet and account management for the Ethereum client. Ethereum wallets provide two modes: keyStore and USB. The ABI code for Ethereum contracts is also located in the `account/abi` directory. The ABI project doesn't seem to have much to do with account management. For now, only the account management interface is analyzed here. The specific implementations of keystore and USB are not covered at this time.
