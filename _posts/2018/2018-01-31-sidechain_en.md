---
layout: post
title: "Notes on the Sidechain (Pegged Sidechains) White Paper"
description: ""
category: articles
tags: [Blockchain]
comments: true
---

## Introduction

#### Discussion of Bitcoin's Limitations

1. Trade-offs between scalability and decentralization.

    > For example, larger blocks can support higher transaction rates at the cost of increased burden on validators — the risk of centralization.

    > Similarly, there are trade-offs between security and cost. Bitcoin's historical record stores every transaction with the same level of irreversibility. This method is costly to maintain and may not be appropriate for low-value, low-risk transactions (for example, where all parties have agreed on a common legal framework for handling fraud).

    > Since the value and risk profile of different transactions vary widely, such trade-offs should be applied on a per-transaction basis. However, the Bitcoin system is built to address all problems with a single standard.

2. Further trade-offs exist in blockchain functionality.

    > For example, whether to make Bitcoin's scripting more powerful to support concise and useful contracts, or to reduce functionality to make auditing easier.

3. Some non-monetary assets can also be traded on the blockchain.

    > Such as IOUs, other contracts, and smart property.

4. There is a risk of monoculture: the Bitcoin system is composed of many cryptographic components, and a problem with any one of them could lead to a loss of value for the whole.

    > If possible, it would be more prudent not to protect every bitcoin with the same algorithm.

5. New technologies may bring new capabilities that were not anticipated when the Bitcoin system was created.

    > For example, using cryptographic accumulators, ring signatures, or Chaumian blind signatures to enhance privacy and censorship resistance.

6. Even where there is urgent need, there is no mechanism to safely upgrade the Bitcoin system, meaning any change requires coordinated execution by all participants. The Bitcoin developers have reached a consensus that changes to the Bitcoin system must be made slowly, carefully, and only with clear community agreement.

#### The Emergence of Sidechains

Problems with alternative chains (altchains):

Problem 1: Infrastructure Fragmentation

Because each altchain uses its own technology stack, there is often duplicated or missing work. As a result, the implementation of altchains may not have cleared the obstacles to Bitcoin's security-specific domain knowledge, and security issues are often replicated across altchains while their fixes do not address these issues. Large resources must be consumed or expert evaluation committees established to review new distributed cryptographic systems; without doing so, security vulnerabilities often go unnoticed until they are exploited. The result is a turbulent and unnavigable development environment, where most visible projects may be technically the least sound. As an analogy, imagine that on the internet, every website uses its own TCP implementation to broadcast packets with custom checksums and assembly algorithms to end users. This would not be a viable environment, and it is not a viable environment for altchains either.

Problem 2

Altchains, like Bitcoin, typically have their own native cryptocurrency with a floating price — often called an altcoin. To use an altchain, users must acquire this currency through a market, directly exposing them to the high risks and volatility of the new currency. Moreover, the need to independently solve the initial distribution and valuation problem while competing against poor network effects and a crowded market both hinders technological innovation and fosters market speculation. This endangers not just direct participants in these systems but the entire cryptocurrency industry. If the public perceives this space as too risky, cryptocurrency adoption may be hindered or may be completely abandoned (voluntarily or through legislation).

This suggests that we want an environment where interoperable altchains can be easily created and used, but without causing unnecessary market and development fragmentation. In this paper, we argue that these seemingly contradictory goals can be achieved simultaneously. The central insight is that the Bitcoin blockchain is conceptually independent from the bitcoin asset: if we can technically support the movement of assets between blockchains, we can develop new systems that users might adopt by simply reusing existing bitcoins.

#### Pegged Sidechains

Properties:

1. Assets moved between sidechains should be returnable by their current holder, but not by anyone else (including previous holders).

2. Asset transfers should be free of counterparty risk; that is, a dishonest party should not be able to prevent the transfer from occurring.

3. Asset transfers should be atomic operations — that is, they either complete fully or do not happen at all. There should be no failure modes that cause assets to be lost or allow fraud to occur.

4. Sidechains should have firewalls: a bug that causes asset creation (or theft) on one chain should not cause asset creation or theft on any other chain.

5. Blockchain reorganizations should be handled cleanly, even during asset transfers; any damage should only affect the sidechain it occurred on. In general, ideally, sidechains should be fully independent, with all required data from other chains supplied by users. Validators of a sidechain should only need to track other chains when explicitly required to do so by the sidechain's own consensus rules.

6. Users should not be required to track sidechains they are not actively using.

An early "transfer" solution was to destroy bitcoins in a publicly identifiable way, allowing a new blockchain to detect this and permit the minting of new coins. This solved some of the above problems, but since this approach only allows one-way transfers, it is insufficient for our purposes.

Our proposed solution is for the transfer transaction itself to provide a proof of ownership, avoiding the need for nodes to track the sending chain. At a high level, when an asset moves from one blockchain to another, we create a transaction on the first blockchain to lock the asset, and then create a transaction on the second blockchain whose input contains a cryptographic proof that the lock was correctly completed. These inputs are tagged with a certain asset type, such as the genesis hash of the blockchain that originally created the asset.

We call the first blockchain the parent chain and the second simply the sidechain. In some models, both chains can be treated symmetrically, so this terminology should be considered relative. Conceptually, we intend to transfer assets from the (initial) parent chain to a sidechain, possibly to further sidechains, and ultimately back to the parent chain while preserving the original asset. Generally, we think of the parent chain as the Bitcoin system and the sidechain as one of the other blockchains. Of course, sidechain coins can also be passed between sidechains and not only to and from the Bitcoin system; however, since any coin originally moved from the Bitcoin system can be moved back, it remains a bitcoin regardless of what form it takes.

This allows us to solve the fragmentation problem mentioned in the previous section, which is good news for developers who want to focus solely on technical innovation.

Furthermore, since sidechains transfer existing assets from the parent chain rather than minting new ones, sidechains do not cause unauthorized coin creation; maintaining the security and scarcity of assets is achieved by the parent chain.

Going further, participants no longer need to worry about their holdings being locked up on an experimental altchain, because sidechain coins can be redeemed for an equivalent amount of parent chain coins. This provides an exit mechanism, reducing losses due to unmaintained software.

On the other hand, since sidechains are still independent blockchains separate from the Bitcoin system, they are free to experiment with new transaction designs, trust models, economic models, asset issuance semantics, or cryptographic features. We will explore some of the possibilities for sidechains further in Section 5.

An additional benefit of this infrastructure is that changes to the Bitcoin system itself are no longer so urgent: rather than orchestrating a fork that requires all parties to agree and implement simultaneously, a sidechain can be used to create a new "modified Bitcoin system." In the medium term, if there is widespread recognition that the new system represents an improvement, it will become obvious over time that more people are using the new system relative to the Bitcoin parent chain. Since the parent chain's rules are not changed in any way, anyone can switch over on their own timetable without any risk from consensus failure. In the long run, if and when the parent chain needs to change, the success of sidechains will provide the confidence needed for those parent chain changes.

> To implement the sidechain mechanism, a new address type will be added (this type of address contains information about the corresponding sidechain). After paying 1 bitcoin from address A to this type of address, the protocol specifies that the right to move this 1 bitcoin is transferred to the owner in the sidechain. The coin is locked on the main chain, and simultaneously the sidechain generates a transaction whose source is the main chain. The coin can circulate within the sidechain, and when the final holder moves the coin on the main chain, the coin returns to main chain circulation.

## Principles of Pegged Sidechains

#### Design Principles

"Trustless" refers to the property of being able to complete correct operations without relying on external trusted parties, generally meaning that all participants can verify information themselves. For example, in a cryptographic signature system, "trustless" is an implicit prerequisite (if an attacker can forge signatures, the signature system is considered completely broken). Although this is not generally required in distributed systems, Bitcoin provides "trustless" operation in most parts of its system.

A key goal of "pegged sidechains" is to minimize additional trust beyond the Bitcoin system model. The challenge is the secure transfer of coins between sidechains: the receiving chain must be able to learn that the sending chain's coins have been correctly locked. Following Bitcoin's lead, we propose using DMMS (Dynamic Membership Multiparty Signatures) to solve this problem. Although it is possible to use a simple trust-based scheme with a fixed number of signers to verify coin locking, there are many important reasons to avoid introducing this single point of failure:

- Trusting individual signers means not just expecting them to act honestly; they must also never be hacked, never leak critical secrets, never be coerced, and never stop participating in the network.

- Since digital signatures are long-lived, any trust requirements must also be long-lived. Experience tells us that even over a span of just a few months, trust requirements are a dangerous expectation — much less over the generational timescales we hope financial systems can endure.

- Before Bitcoin eliminated single points of failure, digital currencies had little appeal, and the community strongly opposes the reintroduction of such weaknesses. Financial events since 2007 have strengthened the community's distrust; public trust in financial systems and other public institutions is similarly at historic lows.

#### Two-Way Peg

The technical basis for pegged sidechains is called the two-way peg. In this section, we explain how it works, starting with some definitions.

Definitions:

- A coin (or asset) is a digital property whose controller can be identified cryptographically.

- A block is a collection of transactions describing changes in asset control.

- A blockchain is an ordered collection of blocks on which all users must (or eventually will) agree. This determines the history of asset control and provides a computationally unforgeable ordering of transactions.

- A reorganization, or reorg, occurs locally at the client when a previously accepted chain is replaced by a competing chain with more proof of work; blocks from the losing side of the fork are removed from the consensus history.

- A sidechain is a blockchain that validates data from other blockchains.

- A two-way peg refers to the mechanism that allows coins to be transferred in and out between sidechains at a fixed or deterministic exchange rate.

- A pegged sidechain is a sidechain into which assets can be imported from other chains and returned; that is, a sidechain that supports two-way pegged assets.

- A Simplified Payment Verification proof (or SPV proof) is a Dynamic Membership Multiparty Signature (DMMS) occurring on a Bitcoin-like proof-of-work blockchain.

Essentially, an SPV proof consists of (a) a sequence of block headers showing proof of work, and (b) a cryptographic proof showing that an output was created in one of those blocks.

This allows a verifier to check whether a certain amount of work has acknowledged the existence of a given output. When another proof shows a chain with more cumulative work and that chain does not include the block generating this output, the other proof invalidates this one.

Using SPV proofs to determine transaction history implicitly requires trusting that the longest blockchain is also the longest correct blockchain. In Bitcoin, this is implemented by clients called SPV clients. Since honest hash power will not work on an invalid chain, an SPV client can only be continuously deceived if more than 50% of the hash power collude (unless the client is under a sustained malicious attack preventing it from seeing the actual longest chain).

It is also possible to have any party with an SPV proof determine the state of the chain without downloading every block, by having each block header reference the set of unspent outputs on the blockchain. (In Bitcoin, full validation nodes do this kind of data download when they first start tracking the blockchain.)

By including some additional data in Bitcoin's block structure, we can generate proofs smaller than a complete list of block headers, improving scalability. However, such proofs are still much larger than regular Bitcoin transactions. Fortunately, for most asset transfers this is not necessary: coin holders on each chain can exchange directly using atomic swap (meta-exchange) operations.

> Bitcoins in circulation on sidechains are still bitcoins; the exchange rate between sidechain bitcoins and main chain bitcoins is typically 1:1, though a predetermined rate is also possible.

> Mining on sidechains cannot produce bitcoins. Sidechains may have their own coins or may not, existing solely for the circulation of bitcoins.

> Sidechains may be symmetric or asymmetric. Symmetric sidechains exist independently and can also become main chains. The designation of main/side is relative — if there is enough demand, bitcoin could become a sidechain of Litecoin. Asymmetric sidechains depend on the main chain for their existence.

> Decentralization is unchanged; any individual or company can create their own Bitcoin sidechain, and those that gain user and miner acceptance become mainstream.

> Of course, sidechains need sufficient hash power to ensure their reliability and security.

> The sidechain white paper proposes a clear sidechain framework; the specific implementation of sidechains is left to the designer's creativity.

#### Symmetric Two-Way Peg

We can use these ideas to peg one sidechain's SPV into another. This involves the following work: to transfer parent chain coins into sidechain coins, the parent chain coins are sent to a special output on the parent chain that can only be unlocked by an SPV proof held on the sidechain. To synchronize between the two chains, we need to define two waiting periods:

1. **The confirmation period for transfers between sidechains** is the period during which coins must be locked on the parent chain before being transferred to the sidechain. The purpose of this confirmation period is to generate sufficient proof of work to make denial-of-service attacks during the next waiting period more difficult. A typical confirmation period might be on the order of one or two days.

After the special output is generated on the parent chain, the user waits for the confirmation period to end, then generates a transaction on the sidechain referencing that output, providing an SPV proof that it has been created and sufficiently covered by work on the parent chain.

The confirmation period is a sidechain-specific security parameter representing a trade-off between cross-chain transaction speed and security.

2. Next, **the user must wait for a contest period**. During this period, the newly transferred coins cannot be spent on the sidechain. The purpose of the contest period is to prevent double-spending during reorganizations, where previously locked coins are moved away during a reorg. At any time during this delay period, if a new proof of work is published showing a chain with more cumulative work that does not include the block generating the locked output, the transfer will be retroactively invalidated. We call this a reorganization proof.

All users on all sidechains have an incentive to issue reorganization proofs whenever possible, since accepting a bad proof dilutes the value of all coins.

A typical contest period is also on the order of one or two days. To avoid these delays, users will likely conduct most transactions using atomic swaps (meta-exchanges) (described in Appendix C), as long as a liquid market is available.

When coins are locked on the parent chain, those coins can be freely transferred within the sidechain without requiring further interaction with the parent chain. However, they retain their identity as parent chain coins and can only be transferred back to the chain from which they originated.

When a user wants to transfer coins from the sidechain back to the parent chain, the process is the same as the original transfer: coins are sent on the sidechain to an SPV-locked output, an adequate SPV proof is produced showing that the output has been completed, and this proof is used to unlock the previously locked equivalent output on the parent chain.

Since pegged sidechains may carry assets from many chains and cannot assume anything about the security of those chains, it is very important that different assets are not interchangeable (except through an explicit declared transaction). Otherwise, a malicious user could steal by creating a worthless chain with worthless assets, moving such an asset to a sidechain, and then exchanging it for something else. To counter this, sidechains must effectively treat assets from different parent chains as different asset types.

In summary, we propose that the parent chain and sidechains mutually perform SPV verification of each other's data. Since parent chain clients cannot be expected to see every sidechain, users must import proof of work from the sidechain into the parent chain to prove ownership. In symmetric two-way pegging, the reverse operation works the same way.

For the Bitcoin system to serve as a parent chain, a script extension that can recognize and validate SPV proofs is needed. At a minimum, such proofs need to be small enough to fit inside a Bitcoin system transaction. However, this is only a soft fork and will not affect transactions that do not use the new feature.

#### Asymmetric Two-Way Peg

The previous section was titled "symmetric two-way peg" because the mechanism for transferring from the parent chain to the sidechain is the same as in the reverse direction: both have SPV security.

An alternative is the asymmetric two-way peg: in this approach, users on the sidechain fully validate the parent chain, and since all validators know the parent chain's state, transfers from the parent chain to the sidechain do not require an SPV proof. On the other hand, since the parent chain is unaware of the sidechain, returning to the parent chain does require an SPV proof.

This improves security: now even a 51% attacker cannot incorrectly transfer coins from the parent chain to the sidechain. However, the cost is forcing sidechain validators to track the parent chain, which also means that reorganizations on the parent chain can cause reorganizations on the sidechain. We will not explore this possibility in detail here, as the reorganization issues significantly increase complexity.

Sidechains provide solutions to many problems in the cryptocurrency space and bring countless opportunities for innovation in the Bitcoin system, but sidechains themselves are not without flaws. In this paper, we will examine some potential problems and explore possible solutions or workarounds.

## Problems Introduced by Sidechains

Sidechains provide solutions to many problems in the cryptocurrency space and bring countless opportunities for innovation in the Bitcoin system, but sidechains themselves are not without flaws. In this paper, we will examine some potential problems and explore possible solutions or workarounds.

#### Additional Complexity

Sidechains introduce additional complexity at several levels.

At the network level, we now have many independent, non-synchronized blockchains that support transfers between each other. They must support transaction scripts that can be declared invalid by later reorganization proofs. We also need software to automatically detect misbehavior and generate and publish relevant proofs.

At the asset level, the simple "one chain, one asset" principle no longer applies; a single chain can support any number of assets, including assets that did not exist when the chain was first created. Each of these assets must be tagged with its origin chain to ensure that asset transfers can be correctly parsed.

Simply enabling blockchain infrastructure to handle advanced features is not enough: user interfaces for managing wallets also need to be reconsidered. Currently, in the altcoin world, each chain has its own wallet to support transactions in that chain's coins. These wallets need to be rewritten to support multiple chains (potentially with different feature sets) and cross-chain asset transfers. Of course, if the user interface would become too complex, one can simply choose not to use certain features.

#### Fraudulent Transfers

In theory, reorganizations of any depth are possible, allowing an attacker to create a reorganization longer than the contest period of the sending chain and fully transfer coins between sidechains before the sending chain's side of the transfer is revoked. The result would be a mismatch between the number of coins on the receiving chain and the number of redeemable locked outputs on the sending chain. If the attacker is allowed to transfer coins back to the initial chain, they will increase their own coin count at the expense of other users on the sidechain.

Before discussing how to handle this, we note that this risk can be made arbitrarily small by simply extending the contest period of the transfer. The duration of the contest period can be determined by a function of the relative hash power of the two chains: the receiving chain can unlock coins only upon seeing an SPV proof equivalent to one day's worth of work on that chain, which might correspond to several days' worth of work on the sending chain. Such security parameters are sidechain-specific properties that can be optimized for each sidechain's application.

Regardless of how unlikely such an event is, it is important that the sidechain's responsibility does not cause catastrophic failure. An SPV proof witnessing such an event can be created, and the sidechain can accept such a proof. Sidechains can be designed to respond in one of the following ways:

Do nothing. The result would be that the sidechain operates as a "fractional reserve" bank, holding assets from other chains. For small amounts, this may be acceptable if people believe the loss is less than the sidechain coins lost, or if an underwriter promises to cover lost assets. However, beyond a certain threshold, a "bank run" withdrawal from the sidechain will likely occur, and someone will ultimately have to bear the loss. Indirect damage may include a general loss of confidence in sidechains, with the cost to the parent chain being the need to handle a sudden spike in transactions.

The peg and all related transactions could be rolled back. However, since coins tend to spread out and transaction histories become intertwined, even rolling back after a short period could have devastating consequences. This also limits asset fungibility, as recipients will prefer coins with a "clean" history (no recent pegs). We anticipate that this lack of fungibility could have catastrophic consequences.

The total coin supply could be reduced while maintaining the same exchange rate. Users who transferred coins to the sidechain before the attack occurs would be worse off compared to new users. This is equivalent to lowering the sidechain coin exchange rate.

Variations on these responses are also possible: for example, temporarily lowering the exchange rate to make it unprofitable for those who "run" the sidechain.

#### Risk of Mining Centralization

Another important concern is whether introducing sidechains with miner fees will put pressure on miner resources, creating a risk of centralization in Bitcoin mining.

Since miners are paid from block subsidies and transaction fees from each chain they work on, they will, for economic reasons, switch between different blockchains of roughly equal value based on difficulty changes and market value fluctuations, providing DMMSes for them.

Our response is that some blockchains have slightly modified their block header definitions to include a Bitcoin system DMMS, allowing miners to use the same DMMS submitted to the Bitcoin system for one or more other blockchains — this is called merge mining. Because merge mining allows work to be reused across multiple blockchains, miners can claim rewards from each blockchain for which they provide DMMSes.

As miners submit work to more blockchains, tracking and verifying all of them requires more resources. Miners who only submit work for a subset of blockchains receive fewer rewards than miners who submit work for all possible blockchains. Small-scale miners may not be able to afford the full cost of mining on every blockchain and will thus be at a disadvantage compared to larger organized miners who can claim more rewards from a larger set of blockchains.

However, we note that miners can delegate validation and transaction selection for any subset of blockchains they work on. Choosing to delegate can free miners from almost all the need for additional resources, or allow them to submit work for blockchains that are still in the process of verification. However, the cost of such delegation is the centralization of validation and transaction selection on those blockchains, even if work generation itself remains distributed. Miners can also choose not to work on blockchains still under verification, voluntarily forgoing some rewards in exchange for greater decentralization of the verification process.

#### Soft Fork Risk

In the Bitcoin system, a soft fork is an addition to the Bitcoin protocol that achieves backward compatibility by strictly reducing the set of valid transactions or blocks by design. Soft forks only require a majority of mining hash power to participate, not all full nodes. However, for soft-forked features, participants have only SPV-level security unless all full nodes upgrade. Soft forks have been used many times to deploy new features and fix security issues in the Bitcoin system.

The two-way peg implemented as described in this paper only has SPV security, so it temporarily relies more on miner honesty than the Bitcoin system. However, if all full nodes on both systems check each other and require mutual validity through a soft fork rule, the security of the two-way peg can be raised to the full equivalent of the Bitcoin system.

The downside of this approach is losing isolation from any sidechain that requires a soft fork. Since isolation is one of the goals of using pegged sidechains, this outcome would be undesirable unless a sidechain is already in almost universal use. However, without pegged sidechains, the next alternative would be to directly hard fork the Bitcoin system to deploy individual changes. This is more abrupt, provides no real mechanism to prove that new features are mature, and involves risking Bitcoin system consensus.

## Applications of Sidechains

Those who have been following this topic should notice that previous articles have already mentioned it multiple times. The most representative application is simply creating an altchain whose coin scarcity is provided by the Bitcoin system. By using a sidechain that carries bitcoin rather than a brand-new currency, the thorny problems of initial distribution, market fragility, and barriers to new user adoption are avoided — new users no longer need to seek a trustworthy market or invest in mining hardware to acquire altcoin assets.

#### Technical Experimentation

Since sidechains are technically fully independent chains, they can change features in the Bitcoin system such as block structure or transaction chaining. Here are some examples of such features:

By fixing undesirable transaction malleability — which can only be partially fixed in the Bitcoin system — protocols related to unconfirmed on-chain transactions can be executed more safely. Transaction malleability is a problem in the Bitcoin system that allows any user to slightly tweak transaction data in certain ways, breaking subsequent transactions that depend on them even though the actual content of the transaction has not changed. Probabilistic payments are one example of a protocol that can be broken by transaction malleability.

Improving payer privacy, such as the ring signature scheme used in Monero (XMR), reduces the systemic risk of transactions by specific parties being censored and protects cryptocurrency fungibility. Improvements proposed by Maxwell, Poelstra, and Back allow for higher levels of privacy. Currently, ring signatures can be used with Monero coins but not Bitcoin; sidechains would avoid this exclusivity.

Script extensions proposed for the Bitcoin system (e.g., efficient support for colored coins). Such extensions have not been accepted in the Bitcoin system because, while useful only to a small subset of users, they require all users to deal with increased complexity and risk from hard-to-detect interactions.

Other proposed extensions include support for new cryptographic primitives. For example, Lamport signatures, which are large but secure against quantum computers.

Multiple ideas for extending the Bitcoin system in incompatible ways — since these changes affect only the transfer of coins, not their issuance, there is no need to create an independent currency for them. Using sidechains, users can safely and temporarily experiment with these changes. This encourages adoption of sidechains: compared to using a fully independent altcoin, participants face less risk when using sidechains.

> If a sidechain fails due to a design flaw or lack of maintenance, the biggest risk is: the bitcoins moved to the sidechain are lost, equivalent to sending bitcoins to an address whose private key has been lost. It will not affect the operation of the Bitcoin network.

> Initially, people may be skeptical of sidechains' reliability and trust the main chain more. If a sidechain with clearly superior design and reliability emerges — for example, with very fast payment verification times — and passes long-term testing, people will be more willing to move bitcoins to the sidechain. As bitcoins gradually move to sidechains, and when the main chain is no longer producing new coins, people will be transacting on sidechains, at which point the main chain has no transactions and no miners. The sidechain becomes mainstream, and Bitcoin achieves a natural upgrade.

#### Economic Experimentation

Bitcoin's reward mechanism distributes new coins to miners. This effectively causes monetary inflation, which gradually decreases over time following a stepped schedule. Using this inflation to subsidize mining is a successful complement to transaction fees in securing the network.

An alternative mechanism for obtaining block rewards on a sidechain is demurrage, an idea first applied to digital currencies by Freicoin. In a demurring cryptocurrency, all unspent outputs lose value over time, with the reduced value being recollected by miners. This maintains a stable money supply while still rewarding miners. Compared to inflation, this may be better aligned with user interests, because demurrage losses are uniform and immediate rather than the diffuse effect of inflation; it also alleviates the economic shock that could result from the reactivation of long-unused "lost" coins at current prices, a recognized risk in the Bitcoin system. Demurrage creates incentives for increasing money velocity and lowering interest rates, which is considered (by, for example, Freicoin advocates and other supporters of Silvio Gesell's interest theory) to be socially beneficial. In pegged sidechains, demurrage can be paid to miners using currency of existing value.

Other economically related changes include required miner fees, transaction reversibility, simply deleting outputs when they reach a certain coin age, or pegging inflation/demurrage rates to events outside the sidechain. All of these changes are difficult to implement safely, but since sidechains are easy to create and reduce risk, they provide the necessary viable environment for experimentation.

#### Asset Issuance

In most cases, we envision sidechains as not needing their own native currency: all coins on sidechains are initially locked until activated by an asset transfer from another sidechain. However, sidechains can also create their own tokens, or issue assets with their own semantics. These can be transferred to other sidechains in exchange for other assets and currencies, without requiring trust in any central party, even if there is a need for a trusted party upon future redemption.

Asset issuance chains have many applications, including traditional financial instruments such as stocks, bonds, certificates, and IOUs. This allows external protocols to delegate ownership and transfer record tracking to the sidechain that issued the owner's shares. Asset issuance chains can also support more innovative instruments such as smart property.

These technologies can also be used in complementary currencies. Examples of complementary currencies include: community currencies designed to prioritize local businesses; business barter associations supporting social programs like education or elder care; restricted-use tokens used within organizations, such as large multiplayer games, customer loyalty programs, and online communities.

An appropriate script extension system and asset-aware transactions can create useful transactions from well-audited components — for example, combining a bid and an offer into an exchange transaction — enabling fully trustless peer-to-peer markets for asset exchange and complex contracts like trustless options (FT13). These contracts could help, for example, reduce the volatility of bitcoin itself.

#### Future Directions

Some other ideas in sidechains worth exploring include:

**Assurance contracts**. Withhold sidechain transaction fees from miners until their hash power reaches at least a certain percentage — say, 66% — of the Bitcoin system's. Cryptocurrencies can easily implement such contracts, as long as they are designed from the start with the aim of increasing the cost of block transfers.

> If a miner's hash power threatens network security, their mining rewards will be withheld. For example, miners with more than 50% of the hash power would receive no rewards, which constrains miners to limit their hash power and prevents 51% attacks.

**Time-shifted transaction fees**. Part of miners' transaction fees would be received in some future block (or spread across many blocks), giving them an incentive to keep the chain running.

> A new type of time-dependent address would be introduced. Only at a specified future time can the coins in that address be used. Before that time, no one — including the owner — can access the coins. For example, people could send 10 coins to this type of address with a setting that they can be used 10 years from now.

**Incentivizing miners** to simply receive "out-of-band" transaction fees, avoiding the need to wait for future on-chain rewards. A variant of this scheme is to give miners a token allowing them to mine a future block at a lower difficulty; the effect is the same, but it more directly incentivizes its recipient to mine that chain.

> Currently, miners receive rewards and transaction fees immediately after mining a block. This arrangement defers payment of mining rewards. For example, mining rewards could be paid 100 blocks after the block is mined. This helps incentivize miners to maintain normal network operations.

**Demurrage**. Block subsidies can be paid to miners in the form of demurrage to incentivize honest mining. Since the amount that can be transferred into the Bitcoin system or other sidechains can only equal the amount transferred out, this redistribution of funds would be confined to the sidechain in which it occurs.

> That is, coins that have not moved for a long time will depreciate over time, with the deducted amount returned to miners. For example, coins that have not moved for more than one year depreciate by 10% per year. In the current Bitcoin network, it is common for large holders to lose their private keys, and their corresponding coins are also lost. This reduces the adequacy and liquidity of currency in the Bitcoin economy, which is considered a potential risk for Bitcoin. Through demurrage, currency circulation is encouraged, miners are incentivized, and some coins lost due to lost private keys can be recovered.

**Subsidies**. Sidechains can also issue their own independent native currency as a reward, effectively forming an altcoin. These coins would then have a freely floating value, with the result that they cannot solve the volatility and market fragmentation issues associated with altcoins.

**Federated SPV proofs**. Introduce a signer who must sign valid SPV proofs, monitoring for fraudulent proofs. This leads to a direct trade-off between centralization and security against high hash power attacks. There is considerable room for trade-offs here: signers could be required only for high-value transfers; only when the sidechain's hash power is very small relative to Bitcoin's; and so on. Appendix A contains further discussion of the practicality of such trade-offs.

**SNARKs**. An exciting recent development in academic cryptography is the invention of SNARKs. SNARKs are zero-knowledge cryptographic proofs that are space-efficient and quickly verifiable that certain computation work has been done. However, their current use is limited, because for most programs, generating these proofs is too slow on today's computers, and the existing constructions require a trusted setup, meaning the creator of the system has the ability to create false proofs.

A future idea for low-value or experimental sidechains is to employ a trusted authority whose sole task is to perform a trusted setup for a SNARK scheme. This would allow blocks to be constructed proving changes to the set of unspent inputs, but done in a way that achieves zero-knowledge for transactions. These blocks could also provide complete validation of all previous blocks, allowing new users to speed up by verifying only one latest block. By proving the validity of the sending chain according to some pre-defined rules, these proofs could also replace DMMSes for moving coins from one chain to another.
