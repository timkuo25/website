---
title: "One-Time Pad and Many-Time Pad"
date: "2025-05-08"
excerpt: "Shh, this is our secret"
sections: ["tech"]
categories: ["ds-algo", "security"]
tags: ["one-time pad", "many-time pad", "symmetric-key algorithm", "stream cipher", "cryptography"]
---

## One-Time Pad

[Symmetric-key encryption](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) means there's only one key, used for both encryption and decryption. Its advantage is speed, plus a lot of derived applications. Depending on whether the plaintext is encrypted "as a whole" or "split into chunks", it can be classified into [Stream Cipher and Block Cipher](https://www.youtube.com/watch?v=3adBPqIB4Tw) — I'll go into more detail on both some other time.

One-Time Pad is a kind of Stream Cipher. Suppose the plaintext is $m$, the key is $k$, and the resulting ciphertext is $c$ — the whole operation is just two steps

Encrypt:

$$c = m \oplus k$$

Decrypt:

$$m = c \oplus k$$

That's it, pretty simple right?

Here, the key and the plaintext need to be the same length — it can be a string of binary, a piece of text, or an image.

There are also two things to watch out for when using it:
- The key must be randomly generated
- The key can only be used once, otherwise it may be vulnerable to a Many-Time Pad attack

## Perfect Secrecy

What makes One-Time Pad special is that it's one of the few encryption schemes that achieves **Perfect Secrecy**. Perfect Secrecy was introduced by Claude Shannon (yes, the Information Theory guy), and it's the strongest security definition in cryptography.

An encryption scheme has perfect secrecy if an attacker who sees the ciphertext $c$ gains absolutely no information about the plaintext $m$. Your probability estimate of what the plaintext is stays exactly the same before and after seeing the ciphertext:

$$P(M = m \mid C = c) = P(M = m)$$

In other words, given any ciphertext, every possible plaintext is equally likely to be the real message (as long as there's a corresponding key), so the ciphertext alone gives you no way to narrow down the plaintext.

"Every plaintext being equally likely" here rests on two assumptions: **the key must be uniformly random**, and **the key space can't be smaller than the plaintext space**. Otherwise some plaintexts wouldn't have a matching key at all, and the probabilities wouldn't be uniform. OTP happens to satisfy both, which is why it actually achieves perfect secrecy.

OTP pulls this off thanks to the two conditions mentioned earlier:
- The key is generated completely at random
- The key is used only once, and is at least as long as the plaintext

That's exactly why perfect secrecy isn't practical to use: the key has to be as long as the plaintext and can never be reused, meaning you have to transmit and store a key just as long as whatever message you're encrypting — key management costs get enormous. And the moment you break the "use only once" rule and it becomes a Many-Time Pad, perfect secrecy is destroyed outright.

## Many-Time Pad

The Many-Time Pad attack, simply put: if two pieces of plaintext reuse the same key, XORing the two ciphertexts together gives you a result that leaks a lot of information about the original plaintexts.

![Many-Time Pad XOR attack diagram](https://res.cloudinary.com/dazoegq66/image/upload/v1790407821/otp/many_time_pad_xor_attack.png)

(I think this image captures it really well, though it was a little scary the first time I saw it)

It doesn't directly expose the plaintext, but for someone who already has some knowledge about it, it's still quite dangerous. If the plaintext is natural language, you can use [frequency analysis](https://ithelp.ithome.com.tw/articles/10225920) or [known-plaintext attacks (a.k.a. crib dragging)](https://www.gate.com/zh-tw/learn/articles/known-plaintext-attacks-explained/5310) to work backwards from high-frequency letters (like "e" and "i" in English) or words (like "the", "a", "is", "are") to recover the original text and the key. So remember: One-Time Pad really does mean only once.

Finally, here's a puzzle ([Source](https://sites.google.com/gapps.ntnu.edu.tw/neokent/about-me)) for you to try. Below are ten pieces of plaintext, all natural language, all encrypted with the same key. Can you use the Many-Time Pad attack to recover the original text? (Hint: try searching for " the ")

```
1.
68 C0 21 F4 F1 0A 75 6C 1F E3 87 FE 44 F8 D6 EA
55 E2 56 1B 4C D3 78 03 49 BD FF 70 10 A6 19 44
86 E1 19 AC 3F 26 7C 88 D8 C7 BF 06 5B B0 B8 4B
31 A7 DF A7 4F E8 74 21 01 9A 04 F9 0E B1 F4 1B
FF A3 C5 E0 B5 94 B4 FF 8F FF 5C DE 63 23 65 38
5C 80 C0 1C 4D FC 5D 32 DF 1C 17 67 0F EE 87 05
2F 08 EB 4E F0 61 38 3A 43 71 09

2.
74 DA 6D F8 F1 59 21 7D 15 B6 C5 ED 57 F4 98 A1
1A F9 5A 5E 0D CB 31 10 48 B4 E9 23 1E BA 1F 11
86 EB 08 E0 3A 26 7C 89 D9 93 E8 03 47 B0 B8 4B
2B BA DF A7 40 F8 6E 3B 46 C8 00 B5 13 FA A0 31
F2 B2 8C FB A5 C9

3.
74 D3 6D E4 A2 4B 72 24 09 AA 8B A0 05 F3 CD B2
55 E5 56 1B 4C D2 70 1C 58 A2 BA 38 12 A6 0B 58
CA E4 5C A6 36 39 28 C9 96 BE A7 1B 12 B2 B7 19
3B AC 85

4.
63 D1 62 FC F7 59 64 24 33 E3 84 E1 05 D9 DD B4
16 E3 52 1B 4C EF 7E 1E 4F BE EE 71 57 9D 58 59
C9 A2 12 AF 27 75 32 82 D3 83 E8 1A 5D F3 B2 0E
7E BD D5 EB 46 B3

5.
76 D1 21 FE E3 44 6F 6B 0E E3 86 ED 51 F2 D0 E6
14 B6 4A 0C 0D D6 7F 57 58 B0 E8 3C 1E B1 0A 1D
D2 EA 1D AE 73 21 34 82 96 93 A1 03 57 F3 A4 03
3F BD 9A EE 56 BD 6B 30 40 9E 04 E6 5B BF B5 3A
F5 E6 91 E2 E0 95 B5 B6 92 BA 56 DB 26 70 7E 7D
1F 98 DD 1D 51 F1 0E 65 C1 01 13 62 41 AD C5 1F
60 1E AE 19 ED 7D 35 75 5A 60 46 DF BF E2 AC E5
13 CE 49 C4 8A 85 A7 E8 10 2E 7D 3A 63 7B 7F 6D
3F 6D 3F 65 A4 D7 BE 77 31 9E 59 6E 14

6.
76 DC 64 EF E7 5C 64 76 5A B7 8D E9 57 F4 98 AF
06 B6 56 0B 01 DE 7F 57 53 B0 EE 25 05 B1 54 1D
D2 EA 19 B2 36 75 35 94 96 83 BA 0F 5F B2 FE

7.
75 DC 64 BD EB 47 71 6B 09 B0 8C EE 49 F4 98 A5
1A E3 52 1A 4C D1 7E 03 1D B9 FB 26 12 F4 10 5C
D6 F2 19 AE 36 31 70 C7 C2 8F AD 1C 57 B5 BF 19
3B E9 CE EF 47 BD 6E 38 51 87 12 E6 1E FD B8 31
B1 AB 90 FE B4 C7 A2 BA DC EA 56 C6 30 3E 6F 31
19 D4 DB 07 19 E7 0D 2C C2 0D 5F 61 07 E3 CB 1B
30 19 AA 4B F8 7B 33 30 45 2B

8.
55 DC 64 BD EF 45 73 61 5A B4 80 AC 49 F4 D9 B4
1B BA 1E 0A 04 DA 31 1B 58 A2 E9 70 16 BA 1C 1D
CA E7 0F B3 73 38 33 93 DF 91 AD 4E 45 B6 F0 0D
37 A7 DE A7 44 F2 75 75 52 9D 08 F6 1E FB B1 6B
B1 84 90 F9 E0 81 AF AD DC F7 4C C7 27 32 7F 71
5C 83 D7 49 5B F1 1A 2C D8 48 0B 61 41 AB CB 1D
25 5C AA 19 EA 60 22 25 44 6C 54 C5 A5 A5 E4 E3
10 D2 43 D4 85 D1 A7 E9 5E 7E 60 39 35 73 7E 6D
3F 75 3D 36 E4

9.
60 DA 21 FC F0 49 69 65 1F AC 89 E3 42 F8 CB B2
55 FF 4D 5E 18 D7 74 57 5F B4 E9 24 57 BC 0D 4E
C4 E3 12 A4 73 34 7C 90 D9 8A A9 00 12 B0 B1 05
7E A1 DB F1 47 B3 27 01 49 8D 41 FA 1B FB B1 26
B1 B5 8D E8 E0 80 A5 AB 8F BA 4D DD 26 77 60 32
0E 91 92 00 57 E0 18 37 D3 1B 0B 6B 05 E3 C2 0E
60 15 B8 19 F0 7B 70 3D 53 77 09

10.
75 DC 64 BD F6 58 74 70 12 EF C5 E4 4A E6 DD B0
10 E4 1E 0B 0B D3 68 57 54 BF BA 39 03 A7 1D 51
C0 AE 5C A9 20 75 3D 8B C1 86 B1 1D 12 B0 A5 19
37 A6 CF F4 02 FC 69 31 01 8A 04 F4 02 EB BD 32
E4 AA C5 F9 AF C7 B3 BA 99 F1 5C C7 30 77 6C 3B
08 91 C0 49 50 E0 53
```

Challenge Ciphertext:

```
68 DA 21 FE ED 44 77 61 08 B0 84 F8 4C FE D6 EA
55 E6 51 17 02 CB 62 57 5C A3 F3 23 12 F5 58 74
C0 A2 1D E0 3B 20 31 86 D8 C7 AA 0B 5B BD B7 4B
3D A6 D4 F1 47 EF 74 30 52 C8 0C E0 14 F7 F8 74
F8 B2 C5 E4 B3 C7 A9 B2 8C F5 4A C6 2A 35 61 38
5C 92 DD 1B 19 FC 14 28 96 1C 10 2E 00 B5 C5 02
24 5C BF 51 FC 35 24 27 43 71 4F 8D
```

## Reference

- [Taking advantage of one-time pad key reuse?](https://crypto.stackexchange.com/questions/59/taking-advantage-of-one-time-pad-key-reuse)
- [ACIS Lab](https://sites.google.com/gapps.ntnu.edu.tw/neokent/about-me)
