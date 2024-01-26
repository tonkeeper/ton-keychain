# Generate child ton, eth, trx, btc accounts from Root mnemonics

## Root account
1. Get menmonic (securely random 24 words/user's input)
2. Check that `pbkdf2_sha512(hmac_sha512('Ton Keychain', mnemonic), 'TON root seed version', 1, 64)` first byte is 0 (mnemonic is compatible with tonkeeper root)
    - If it is a mnemonic generation process and first byte check fails, go back to the step 1 and pick another random words
3. Calculate ID  
   - calculate root hash `hmac_sha256('Root ID', mnemonic)` and get first 16 bytes of it
   - ID = `base64url_encode(0x282d ++ root_hash)`

## TON child account
1. Calculate child entropy using `hmac_sha256` of the `"serial:<index>"` (utf-8 string) and parent's entropy
2. Iterate `seqno` from 0 to 2^32 - 1
3. Calculate hmac_sha512 hash `iteration_entropy` of the given seqno and entropy , stored as a 32bit be uint
4. Slice first 264 bits of the `iteration_entropy` and store as `iteration_seed`
5. Get mnemonic `iteration_mnemonic` by 264-bit `iteration_seed`
6. Check that `pbkdf2_sha512(hmac_sha512(child_seed, ''), 'TON fast seed version', 1, 64)` first byte is 0 (mnemonic is compatible with ton)
7. Break the cycle and return `iteration_mnemonic` (or `iteration_seed`) if check is passed


**For given TON child account we are calculating corresponding ETH, TRON and BTC accounts**. Thus, if there is a ton child account mnemonics,
- corresponding accounts for other chains can be deterministically computed;
- neither root account, nor other child ton accounts, or it's other chains accounts can be found; 
Schema:
```
root
├─ ton_child_1
│  ├─ eth
│  ├─ tron
│  ├─ btc
│
├─ ton_child_2
   ├─ eth
   ├─ tron
   ├─ btc

```

### ETH wallet
1. Calculate `child_entropy` calculating `hmac_sha256` of the key `'eth-0x1_root'` and current ton account's entropy and slicing first 128 bits
2. Calculate bip-39 english mnemonics from the `child_entropy`
3. Get bip-32 HD account using `"m/44'/60'/0'/0/0"` derivation path
4. Path `"m/44'/60'/0'/0/${index}"` might be used for child accounts generation

### TRON wallet
1. Calculate `child_entropy` calculating `hmac_sha256` of the key `'trx-0x2b6653dc_root'` and current ton account's entropy and slicing first 128 bits
2. Calculate bip-39 english mnemonics from the `child_entropy`
3. Get bip-32 HD account using `"m/44'/195'/0'/0/0"` derivation path
4. Convert address to tron format (prepend '0x41', append double sha256 32-bits checksum hash and convert the result to base58)
5. Path `"m/44'/195'/0'/0/${index}"` might be used for child accounts generation

### BTC wallet
1. Calculate `child_entropy` calculating `hmac_sha256` of the key `'btc_root'` and current ton account's entropy and slicing first 128 bits
2. Calculate bip-39 english mnemonics from the `child_entropy`
3. Get bip-44 HD accounts
4. Get Legacy or SegWit addresses for each account 
