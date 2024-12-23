import { describe, it, expect } from 'vitest';
import { getNthAccountTrx, TronAddressUtils } from '../src';
import { TonKeychainRoot } from '@ton-keychain/core';

describe('Trx plugin tests', () => {
    it('Calculations are determined', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const acc0 = await getNthAccountTrx(rootAccount.mnemonic, 0);
        await getNthAccountTrx(rootAccount.mnemonic, 1);
        const acc0_2 = await getNthAccountTrx(rootAccount.mnemonic, 0);

        expect(acc0.address).toBe(acc0_2.address);
    });

    it('Address conversion', async () => {
        const hexAddress = '0x4b0e331652a8a76b2bd54ca816050a157e4c8faa';
        const base58Address = 'TGp4h3nxn39NxxAkjygMX63ydnhS9R69tm';

        expect(TronAddressUtils.base58ToHex(base58Address)).toBe(hexAddress);
        expect(TronAddressUtils.hexToBase58(hexAddress)).toBe(base58Address);
    });
});
