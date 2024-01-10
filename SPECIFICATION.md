# Generate ton, eth, trx, btc accounts from ton mnemonics
Convert input ton mnemonics into 512-bit entropy

## TON child wallets
1. Calculate child entropy using `hmac_sha256` of the custom `label` (equals to child index as a utf-8 string) and parent's entropy
2. Iterate `seqno` from 0 to 2^32 - 1
3. Calculate hmac_sha512 hash `iteration_entropy` of the given seqno and entropy , stored as a 32bit be uint
4. Slice first 264 bits of the `iteration_entropy` and store as `iteration_seed`
5. Get mnemonic `iteration_mnemonic` by 264-bit `iteration_seed`
6. Check that `pbkdf2_sha512(hmac_sha512(child_seed, ''), 'TON fast seed version', 1, 64)` first byte is 0 (mnemonic is compatible with ton)
7. Break the cycle and return `iteration_mnemonic` (or `iteration_seed`) if check is passed

## ETH wallet
1. Calculate `child_entropy` calculating `hmac_sha256` of the key `'eth-0x1_root'` and parent's entropy and slicing first 128 bits
2. Calculate bip-39 english mnemonics from the `child_entropy`
3. Get bip-32 HD account using `"m/44'/60'/0'/0/0"` derivation path
4. Path `"m/44'/60'/0'/0/${index}"` might be used for child accounts generation

## TRON wallet
1. Calculate `child_entropy` calculating `hmac_sha256` of the key `'trx-0x2b6653dc_root'` and parent's entropy and slicing first 128 bits
2. Calculate bip-39 english mnemonics from the `child_entropy`
3. Get bip-32 HD account using `"m/44'/195'/0'/0/0"` derivation path
4. Convert address to tron format (prepend '0x41', append double sha256 32-bits checksum hash and convert the result to base58)
5. Path `"m/44'/195'/0'/0/${index}"` might be used for child accounts generation

## BTC wallet
1. Calculate `child_entropy` calculating `hmac_sha256` of the key `'btc_root'` and parent's entropy and slicing first 128 bits
2. Calculate bip-39 english mnemonics from the `child_entropy`
3. Get bip-44 HD accounts
4. Get Legacy or SegWit addresses for each account 
