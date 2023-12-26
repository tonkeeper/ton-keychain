## Convert entropy (pk, sha256(seed, label), ...) to ton compatible seed

1. Iterate `seqno` from 0 to 2^32 - 1
2. Calculate hmac_sha512 hash `iteration_entropy` of the given entropy and seqno, stored as a 32bit be uint
4. Slice first 264 bits of the `iteration_entropy` and store as `iteration_seed`
5. Get mnemonic `iteration_mnemonic` by 264-bit `iteration_seed`
6. Check that `pbkdf2_sha512(hmac_sha512(child_seed, ''), 'TON fast seed version', 1, 64)` first byte is 0 (mnemonic is compatible with ton)
7. Break the cycle and return `iteration_mnemonic` (or `iteration_seed`) if check is passed

