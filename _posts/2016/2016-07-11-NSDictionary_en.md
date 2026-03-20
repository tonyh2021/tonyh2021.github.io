---
layout: post
title: "About NSDictionary"
description: ""
category: articles
tags: [iOS]
comments: true
---

## Introduction

I came across this question in a conversation: when storing thousands of objects in a dictionary (NSDictionary in Objective-C), what could cause performance issues? I was completely lost at first, but later realized the key lies in the implementation of NSDictionary itself — specifically the hash algorithm and how collisions are resolved.

## Hash Algorithms and Collision Resolution

NSDictionary uses a hash table to implement the mapping and storage between keys and values. The basic idea behind hashing is: first establish a correspondence `f` between an element's key `k` and its storage position `p`, such that `p = f(k)`, where `f` is called the hash function. When creating a hash table, an element with key `k` is stored directly at address `f(k)`. Later, when searching for an element with key `k`, the hash function is used again to compute the storage position `p = f(k)`, achieving direct key-based element access.

When the key set is large, elements with different keys may map to the same address in the hash table — i.e., `k1 ≠ k2` but `H(k1) = H(k2)`. This is called a collision, and `k1` and `k2` are called synonyms. In practice, collisions are unavoidable; they can only be reduced by improving the hash function's quality.

In summary, hashing involves two main aspects:
1. How to construct the hash function
2. How to handle collisions

#### Methods for Constructing Hash Functions

The principles for constructing a hash function are: 1. The function itself should be easy to compute; 2. The computed addresses should be evenly distributed — for any key `k`, `f(k)` should have equal probability of mapping to any address, with the goal of minimizing collisions.

Here are five common methods for constructing hash functions:

**1. Digit Analysis Method**

If the key set is known in advance and each key has more digits than the hash table's address code, you can select the digits that are most evenly distributed among the keys to form the hash address. For example, with 80 records and 8-digit decimal integer keys d1d2d3…d7d8, if the hash table length is 100, the address space is 00–99. Suppose analysis shows that d4 and d7 are evenly distributed; then the hash function is: h(key) = h(d1d2d3…d7d8) = d4d7. For example, h(81346532) = 43, h(81301367) = 06. On the other hand, if d1 and d8 are extremely uneven (all d1 equal 5, all d8 equal 2), then using h(key) = d1d8 would give all keys the same address of 52, which is clearly unacceptable.

**2. Mid-Square Method**

When it's not clear which digits in the key are evenly distributed, you can first compute the square of the key, then take the middle few digits of the square as the hash address. This works because the middle digits of the square are related to every digit of the original key, so different keys are more likely to produce different hash addresses.

Example: Using the positional index of each letter in the alphabet as its internal code (e.g., K = 11, E = 05, Y = 25, A = 01, B = 02), the internal code for "KEYA" is 11052501. After squaring and taking digits 7–9 as the hash address:

![hash-01](/images/posts/20160711-NSDictionary/hash-01.png)

**3. Folding Method**

This method divides the key into parts of equal length (the last part may be shorter) based on the number of digits in the hash table address, then adds these parts together and discards the highest carry. The result is the hash address. There are two variants: the shift method (align the low-order digits of each part and add) and the folding method (fold back and forth along the division boundaries, with odd segments in order and even segments in reverse, then add). For example: key = 12360324711202065, hash table length = 1000; divide into 3-digit segments (drop the last two digits 65), apply both shift and fold methods to get hash addresses 105 and 907:

![hash-02](/images/posts/20160711-NSDictionary/hash-02.png)

**4. Division-Remainder Method**

Given hash table length `m`, let `p` be the largest prime number less than or equal to `m`. The hash function is `h(k) = k % p`.

For example, given elements (18, 75, 60, 43, 54, 90, 46), table length m = 10, p = 7:

    h(18)=18 % 7=4    h(75)=75 % 7=5    h(60)=60 % 7=4
    h(43)=43 % 7=1    h(54)=54 % 7=5    h(90)=90 % 7=6
    h(46)=46 % 7=4

There are many collisions here. Choosing larger values, m = p = 13:

    h(18)=18 % 13=5    h(75)=75 % 13=10    h(60)=60 % 13=8
    h(43)=43 % 13=4    h(54)=54 % 13=2     h(90)=90 % 13=12
    h(46)=46 % 13=7

No collisions this time:

![hash-03](/images/posts/20160711-NSDictionary/hash-03.png)

**5. Pseudo-Random Number Method**

Use a pseudo-random function as the hash function: h(key) = random(key).

In practice, the appropriate method should be chosen based on the specific situation and validated with actual data. Five factors to consider:

- Time required to compute the hash function (simplicity).
- Length of the keys.
- Size of the hash table.
- Distribution of keys.
- Frequency of lookups.

#### Handling Collisions

A well-designed hash function reduces collisions, but cannot eliminate them entirely. Collision resolution is therefore the other key problem in hashing. Both creating and searching a hash table encounter collisions, and the resolution method must be consistent in both cases. Here are four common collision resolution methods, illustrated using hash table creation:

**1. Open Addressing (Re-Hashing)**

When the hash address `p = H(key)` has a collision, use `p` as a base (not `key`) to generate another address `p1`. If `p1` also collides, use `p1` as a base to generate `p2`, and so on, until a collision-free address `pi` is found. The general re-hash formula is:

`Hi = (H(key) + di) % m   i = 1, 2, …, n`

where `H(key)` is the hash function, `m` is the table length, and `di` is the increment sequence. Different increment sequences yield different re-hashing strategies:

- **Linear Probing**: `di = 1, 2, 3, …, m-1`

  When a collision occurs, check the next slot in sequence until an empty slot is found or the entire table has been scanned.

- **Quadratic Probing**: `di = 1², -1², 2², -2², …, k², -k² (k ≤ m/2)`

  When a collision occurs, probe left and right in jumps, which is more flexible.

- **Pseudo-Random Probing**: `di = pseudo-random number sequence`

  Build a pseudo-random number generator (e.g., `i = (i + p) % m`) and use a fixed starting value.

Example: hash table length m = 11, hash function H(key) = key % 11. H(47) = 3, H(26) = 4, H(60) = 5. Next key is 69, H(69) = 3 — collision with 47.

Using linear probing: H1 = (3 + 1) % 11 = 4 (collision), H2 = (3 + 2) % 11 = 5 (collision), H3 = (3 + 3) % 11 = 6 (no collision), so 69 is placed in slot 6:

![hash-04](/images/posts/20160711-NSDictionary/hash-04.png)

Using quadratic probing: H1 = (3 + 1²) % 11 = 4 (collision), H2 = (3 - 1²) % 11 = 2 (no collision), so 69 is placed in slot 2:

![hash-05](/images/posts/20160711-NSDictionary/hash-05.png)

Using pseudo-random probing with sequence 2, 5, 9, …: H1 = (3 + 2) % 11 = 5 (collision), H2 = (3 + 5) % 11 = 8 (no collision), so 69 is placed in slot 8:

![hash-06](/images/posts/20160711-NSDictionary/hash-06.png)

As illustrated, linear probing tends to produce "secondary clustering" — when resolving collisions among synonyms, it creates new collisions among non-synonyms. For example, if slots i, i+1, and i+2 are all filled, any element whose hash address is i, i+1, i+2, or i+3 will all be placed in slot i+3, even though these four elements are not synonyms. The advantage of linear probing is that as long as the table isn't full, a collision-free address will always be found — unlike quadratic and pseudo-random probing, which offer no such guarantee.

**2. Double Hashing**

Construct multiple different hash functions: `Hi = RHi(key), i = 1, 2, …, k`. When `H1(key)` collides, compute `H2(key)`, and so on, until no collision occurs. This method avoids clustering but increases computation time.

**3. Chaining (Separate Chaining)**

All elements with the same hash address `i` are stored in a singly linked list called a synonym chain, and the head pointer of that list is stored in the i-th slot of the hash table. Lookups, insertions, and deletions are performed mainly within the synonym chain. Chaining is well-suited for situations with frequent insertions and deletions.

For example, given keys (32, 40, 36, 53, 16, 46, 71, 27, 42, 24, 49, 64), table length 13, hash function H(key) = key % 13:

![hash-07](/images/posts/20160711-NSDictionary/hash-07.png)

## Hashing in Objective-C

Apple's Objective-C runtime uses a collision resolution approach similar to chaining, as described in most data structures textbooks. However, instead of a linked list, the "chain" is implemented as an array. When a collision occurs, the original array is freed and a larger one is allocated to hold the new element. The downside is obvious: frequent `alloc` and `free` calls when there are many collisions. The upside is that no second-level pointer dereference is needed to locate elements. As a further optimization, a `oneOrMany` union structure is used for one or two elements, reducing the pointer indirection for single-element hash lookups — presumably because collisions are expected to be rare. The overall hash structure is one large array, with a base pointer called `buckets`. Each bucket can be thought of as a small array that stores a list of elements sharing the same hash value (i.e., colliding elements).

From this, we can deduce that performance issues with NSDictionary operations are most likely caused by:
1. Frequent resizing (reallocation)
2. Too many collisions

For more implementation details, refer to the links below:

## References

[Hash Tables and Collision Resolution Methods](http://blog.csdn.net/it_bloggers/article/details/21334123?utm_source=tuicool&utm_medium=referral)
[OC Classes and Objects — Part 4: Hash Structure](http://blog.csdn.net/lpstudy/article/details/22087713?utm_source=tuicool&utm_medium=referral)
[NSDictionary Class Reference](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSDictionary_Class/index.html#//apple_ref/doc/uid/TP40003648)
