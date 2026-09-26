---
title: "Approximate Membership Query: Bloom Filter and Quotient Filter"
date: "2025-05-02"
excerpt: "An evolved hash table"
sections: ["tech"]
categories: ["ds-algo"]
tags: ["Bloom Filter", "Quotient Filter", "Hash Table", "Probabilistic"]
---

## Bloom Filter

A Bloom Filter is a kind of hash table that's probabilistic. Its biggest characteristic, compared to a regular hash table, is that it has an advantage in both space and time.

A Bloom Filter can be represented as an array whose values are $0$ or $1$. When you query whether an element exists, a Bloom Filter can only give one of two answers: "no" or "maybe". In other words, the only kind of misjudgment possible is a False Positive.

This trait makes it well suited to scenarios that need a "first-pass filter":

- Filtering out unpopular pages that "only ever get clicked once" (a page only gets put into the cache once its access count hits a threshold or a second hit, to save bandwidth
- Chrome used to use a Bloom Filter to filter malicious URLs (ones that might be malicious get sent off to a separate server for further processing)
- Looking up elements that don't exist in a database, to avoid wasting a lot of time
- Filtering out content a user has already seen in a recommendation system

To implement a Bloom Filter, you need to pick a number $N$ as the size of the array, and initialize the array to $0$. Then pick $K$ hash functions, which map the input to $K$ positions in the array. When storing an element, run it through the hash functions and set the values at those $K$ positions in the array to $1$. When querying an element, only return True if all $K$ positions the hash functions map to are $1$, otherwise return False — this is how it achieves a query that can only ever be a False Positive.

![Bloom Filter](https://res.cloudinary.com/dazoegq66/image/upload/v1789965071/bloom_filter/bloom_filter_query_example.png)

**Notes**

- $N$ and $K$ can be decided by **1. the expected number of elements to store $n$** and **2. an acceptable false-positive rate $p$**

$$
N = - \frac{n \ln p}{(\ln 2)^2}
$$

$$
K = \frac{N}{n} \ln 2 = \frac{- \frac{n \ln p}{(\ln 2)^2}}{n} \ln 2 = - \frac{\ln p}{\ln 2}
$$

  - The more elements stored and the lower the required false-positive rate, the larger the array length
  - The lower the required false-positive rate, the more hash functions needed

- The values the $K$ hash functions map to should be evenly distributed, with no correlation between different positions — and designing $K$ hash functions gets harder as $K$ grows
- Compared to a regular data structure, a Bloom Filter doesn't need to store the element itself (since it only cares about the hash value), giving it an advantage in both storage and lookup ($O(K)$), and it can also satisfy certain confidentiality requirements
- An element already stored in a Bloom Filter can't be deleted. You could reset the hashed positions back to $0$, but that would affect other elements and lose the guarantee of no False Negatives
- The false-positive rate rises as more data is added, but for a sufficiently large $N$ this becomes negligible

## Quotient Filter

A Quotient Filter addresses the Bloom Filter's weakness of not being able to delete elements, and multiple Quotient Filters can be merged together.

A Quotient Filter's operations are similar to a Bloom Filter's — inserting and querying elements. There's only a single hash function, and once an element goes through it, the result gets split into two parts:

- The leading bits (MSB) are the **Quotient**, used to indicate the element's position in the array
- The remaining bits (LSB) are the **Remainder (Fingerprint)**, which get stored in the array

If we need an array of length $8$, the first three bits of the hash result ($\log_2 8$) become the Quotient, and the remaining bits (the Remainder) get stored in the array.

Besides the Remainder, each slot in the array also uses three bits as metadata:

- `is_occupied`: indicates this slot is some element's "original home" (**Canonical Location**) — note this isn't necessarily the home of the element actually stored here
- `is_continuation`: $0$ means the element in this slot is the head of a **Run**
- `is_shifted`: indicates the element in this slot is no longer at its Canonical Location, and has been shifted further down

![Soft collisions in quotient filter](https://res.cloudinary.com/dazoegq66/image/upload/v1789965024/bloom_filter/quotient_filter_insert_example.png)

When an element's position matches its quotient, that position is called its **Canonical Location**. When more than one element shares the same Quotient, we say they belong to the same **Run**.

Say we insert three elements $A$, $B$, $C$ in order, with quotients $2$, $2$, $3$ respectively. Then:

- $A$ gets inserted at slot $2$, with metadata $100$
- $B$ sees that slot $2$ is occupied, and its metadata is $100$, meaning it's the head of that Run. So it linear-probes into slot $3$, with metadata $011$, belonging to the same Run as $A$
- $C$ sees that slot $3$ is occupied, and its metadata is $011$, meaning **there's an element in this slot that belongs to neither this Run nor is the head of its own Run**. So it first sets slot $3$'s `is_occupied` to $1$, **marking slot $3$ as belonging to its own Run**, making it $111$, then linear-probes into slot $4$, setting `is_shifted` to $1$, with metadata $001$

So:
- When querying $A$, slot $2$'s metadata is $100$ and the remainder matches, so it's easy to tell that's its **Canonical Location**
- When querying $B$, slot $2$'s remainder doesn't match, so you keep searching forward, and you're guaranteed to find $B$ before hitting an `is_continuation` of $0$
- When querying $C$, you'll first see `is_occupied` is $1$, but the remainder doesn't match and `is_continuation` is $1$, so you can tell this slot belongs to a different Run. At this point you need another, more involved set of rules to dig further — it's a bit complicated, and nobody online seems to explain it clearly either, so check the original paper if you're curious. Still, as long as you remember that **Quotient, Remainder, and metadata** — these three things — let you implement an efficient AMQ that also supports deleting elements

Deleting is also fairly complex — it involves finding the element, removing the remainder, shifting things to fill the gap, and updating metadata — but it's guaranteed to be safe to delete.

Finally, imagine an element $Z$ that was never inserted, but whose remainder happens to be found in just the right spot — that's a Quotient Filter's false positive, coming from a remainder collision.

## Summary

When the data volume is huge and you need a first-pass-filter data structure, a Bloom Filter is still the go-to choice, because it's mature, simple, and easy to implement. A Quotient Filter, on the other hand, uses linear probing, which is friendly to hardware caches — its sequential-read speed often beats a Bloom Filter's — and it's well suited to scenarios that need dynamic deletion.

## Reference

- [Bloom Filters | Algorithms You Should Know #2 | Real-world Examples](https://www.youtube.com/watch?v=V3pzxngeLqw)
- [(counting) quotient filter](https://www.youtube.com/watch?v=t-BKYx3qfJQ) (this one's examples are decent, but there are enough typos that it gets distracting — still, it gives a rough feel for how a quotient filter works)
- [Quotient Filter Explained | Probabilistic Data Structure To Check Membership](https://systemdesign.one/quotient-filter-explained/)
