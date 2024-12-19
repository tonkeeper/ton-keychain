import { describe, it, expect } from 'vitest';
import { getNthAccountTrx } from '../src';
import { TonKeychainRoot } from '@ton-keychain/core';

describe('Trx plugin tests', () => {
    it('Calculations are determined', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const acc0 = await getNthAccountTrx(rootAccount.mnemonic, 0);
        await getNthAccountTrx(rootAccount.mnemonic, 1);
        const acc0_2 = await getNthAccountTrx(rootAccount.mnemonic, 0);

        expect(acc0.address).toBe(acc0_2.address);
    });
});
