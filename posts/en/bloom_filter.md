---
title: "Approximate Membership Query: Bloom Filter and Quotient Filter"
date: "2025-05-02"
excerpt: "An evolved hash table"
sections: ["tech"]
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
- An element already stored in a Bloom Filter can't be deleted. You could reset the hashed positions back to 0, but that would affect other elements and lose the guarantee of no False Negatives
- The false-positive rate rises as more data is added, but for a sufficiently large $N$ this becomes negligible

## Quotient Filter

A Quotient Filter addresses the Bloom Filter's weakness of not being able to delete elements, and multiple Quotient Filters can be merged together.

A Quotient Filter's operations are similar to a Bloom Filter's — inserting and querying elements. There's only a single hash function, and once an element goes through it, the result gets split into two parts:

- The leading bits are the **Quotient**, used to indicate the element's position in the array
- The remaining bits are the **Remainder / Fingerprint**, which get stored in the array

If we need an array of length 8, the first three bits of the hash result become the Quotient, and the remaining bits get stored in the array.

Besides the Remainder, each slot in the array also uses three bits as metadata:

- `is_occupied`: indicates this slot is the "original home" (**Canonical Location**) of some element(s)
- `is_continuation`: 0 means the element in this slot is the head of a **Run**
- `is_shifted`: indicates the element in this slot is no longer at its Canonical Location, and has been shifted further down

When an element's position matches its quotient, that position is called its **Canonical Location**. When more than one element shares the same Quotient, we say they belong to the same **Run**. The first element gets stored at the correct slot, with `is_occupied` set to $1$. For later elements, their remainder gets stored in the next slot (i.e. Linear Probing), with `is_continuation` and `is_shifted` set to $1$.

When inserting an element and that position is already occupied, **the element gets pushed further down according to its quotient's size** (I didn't dig into exactly which order — that probably depends on the implementation too — the important part is that **different Runs maintain an ordering relationship based on quotient**).

Say we insert three elements $A$, $B$, $C$ in order, with quotients $2$, $2$, $3$ respectively. Then:

- $A$ gets inserted at slot $2$, with metadata $100$
- $B$ sees that slot $2$ is occupied, so it linear-probes into slot $3$, with metadata $011$, belonging to the same Run as $A$
- $C$ sees that slot $3$ is occupied, so it linear-probes into slot $4$, with metadata $011$, and slot $3$'s `is_occupied` gets set to $1$, becoming $111$ — belonging to a different Run than $A$ and $B$

So:
- When querying $A$, looking at slot $2$'s metadata and remainder makes it easy to tell that's its **Canonical Location**
- When querying $B$, since slot $2$'s remainder doesn't match, you keep searching forward, and you're guaranteed to find $B$ before hitting an `is_continuation` of $0$
- When querying $C$, you'll first see `is_occupied` is $1$, but the remainder doesn't match and `is_continuation` is $1$ — you can tell it's probably been pushed out by another run, so you search further
  - Count leftward the number of slots where `is_occupied` is $1$, until you hit one where `is_shifted` is $0$
  - Count rightward the number of slots where `is_continuation` is $0$, until that count matches the `is_occupied` count from before
  - That way you can find where the start of $C$'s run has been pushed to

The rules are a bit complex, but as long as you remember that **Quotient, Remainder, and metadata** — these three things — let you implement an efficient AMQ that also supports deleting elements.

Deleting is also fairly complex — it involves finding the element, removing the remainder, shifting things to fill the gap, and updating metadata — but it's guaranteed to be safe to delete.

Finally, imagine an element $Z$ that was never inserted, but whose remainder happens to be found in just the right spot — that's a Quotient Filter's false positive, coming from a remainder collision.

## Summary

When the data volume is huge and you need a first-pass-filter data structure, a Bloom Filter is still the go-to choice, because it's mature, simple, and easy to implement. A Quotient Filter, on the other hand, uses linear probing, which is friendly to CPU hardware caches — its sequential-read speed often beats a Bloom Filter's — and it's well suited to scenarios that need dynamic deletion.

## Reference

- [Bloom Filters | Algorithms You Should Know #2 | Real-world Examples](https://www.youtube.com/watch?v=V3pzxngeLqw)
- [(counting) quotient filter](https://systemdesign.one/quotient-filter-explained/)
- [Quotient Filter Explained | Probabilistic Data Structure To Check Membership](https://systemdesign.one/quotient-filter-explained/)
